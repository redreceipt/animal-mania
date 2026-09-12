import { randomUUID } from 'node:crypto'
import { WebSocket } from 'ws'
import { RoomError } from './room-store.js'
import { createRoomBackend } from './room-backend.js'

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload))
}

export function attachOnlineSockets(webSockets, { redisUrl = process.env.REDIS_URL } = {}) {
  const socketsByRoom = new Map()
  const disconnects = new Set()
  const ready = createRoomBackend((update) => {
    if (!update) {
      for (const sockets of socketsByRoom.values()) {
        for (const socket of sockets) socket.close(1012, 'Room updates reconnected')
      }
      return
    }
    const { room, connections } = update
    for (const socket of socketsByRoom.get(room.code) ?? []) {
      if (room.version < socket.roomVersion) continue
      socket.roomVersion = room.version
      if (connections[socket.playerIndex] !== socket.connectionId) socket.close(4001, 'Session reconnected')
      else send(socket, { type: 'state', room, you: socket.playerIndex })
    }
  }, redisUrl).catch((error) => {
    console.error('Online rooms unavailable:', error.message)
    return null
  })

  function attach(socket, session) {
    socket.roomCode = session.code
    socket.roomVersion = session.room.version
    socket.token = session.token
    socket.playerIndex = session.playerIndex
    if (!socketsByRoom.has(session.code)) socketsByRoom.set(session.code, new Set())
    socketsByRoom.get(session.code).add(socket)
    send(socket, {
      type: 'joined',
      session: { code: session.code, token: session.token, playerIndex: session.playerIndex },
      room: session.room,
    })
  }

  webSockets.on('connection', (socket) => {
    socket.connectionId = randomUUID()
    // Keep messages and close events ordered while storage calls are in flight.
    let pending = Promise.resolve()
    socket.on('message', (raw) => {
      pending = pending.then(async () => {
        try {
          const message = JSON.parse(raw.toString())
          if (!message || typeof message.type !== 'string') throw new RoomError('BAD_REQUEST', 'Invalid message.')
          const rooms = await ready
          if (!rooms) throw new Error('Room storage is unavailable.')
          if (message.type === 'create' || message.type === 'join') {
            if (socket.roomCode) throw new RoomError('ALREADY_JOINED', 'Leave the current room first.')
            const session = message.type === 'create'
              ? await rooms.run('createRoom', socket.connectionId)
              : await rooms.run('joinRoom', socket.connectionId, message.code, message.token)
            attach(socket, session)
            // Catch updates published between the join commit and socket attachment.
            const latest = await rooms.snapshot(session.code)
            if (latest && latest.version > socket.roomVersion) {
              socket.roomVersion = latest.version
              send(socket, { type: 'state', room: latest, you: socket.playerIndex })
            }
            return
          }
          if (!socket.roomCode || !socket.token) throw new RoomError('NOT_JOINED', 'Join a room first.')
          const args = [socket.connectionId, socket.roomCode, socket.token]
          if (message.type === 'select') await rooms.run('selectAnimal', ...args, message.animalId)
          else if (message.type === 'act') await rooms.run('playMove', ...args, message.moveIndex, message.revision)
          else if (message.type === 'rematch' || message.type === 'rematch-request') await rooms.run('requestRematch', ...args)
          else if (message.type === 'rematch-accept') await rooms.run('acceptRematch', ...args)
          else if (message.type === 'rematch-decline') await rooms.run('declineRematch', ...args)
          else if (message.type === 'change-fighters') await rooms.run('changeFighters', ...args)
          else throw new RoomError('BAD_REQUEST', 'Unknown room action.')
        } catch (error) {
          const invalid = error instanceof SyntaxError
          const code = error instanceof RoomError ? error.code : invalid ? 'BAD_REQUEST' : 'ONLINE_UNAVAILABLE'
          const message = error instanceof RoomError ? error.message
            : invalid ? 'The server could not read that action.' : 'Online rooms are temporarily unavailable. Please try again later.'
          if (code === 'ONLINE_UNAVAILABLE') console.error('Online room action failed:', error.message)
          send(socket, { type: 'error', code, message })
        }
      })
    })

    socket.on('error', (error) => console.error('Room connection:', error.message))
    socket.on('close', () => {
      pending = pending.then(async () => {
        if (!socket.roomCode) return
        const roomSockets = socketsByRoom.get(socket.roomCode)
        roomSockets?.delete(socket)
        if (roomSockets?.size === 0) socketsByRoom.delete(socket.roomCode)
        const rooms = await ready
        await rooms?.run('disconnect', socket.connectionId, socket.roomCode, socket.token)
      }).catch((error) => console.error('Room disconnect failed:', error.message))
      disconnects.add(pending)
      pending.finally(() => disconnects.delete(pending))
    })
  })

  const cleanup = setInterval(async () => {
    try {
      const rooms = await ready
      if (!rooms) return
      for (const [code, sockets] of socketsByRoom) {
        if (await rooms.snapshot(code)) continue
        for (const socket of sockets) {
          send(socket, { type: 'error', code: 'ROOM_EXPIRED', message: 'This room expired after 30 minutes of inactivity.' })
          socket.close(4004, 'Room expired')
        }
        socketsByRoom.delete(code)
      }
    } catch (error) {
      console.error('Room cleanup failed:', error.message)
    }
  }, 60_000)
  cleanup.unref()
  webSockets.on('close', async () => {
    clearInterval(cleanup)
    await Promise.all(disconnects)
    const rooms = await ready
    rooms?.close()
  })
}
