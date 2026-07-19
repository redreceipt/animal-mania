import { WebSocket } from 'ws'
import { RoomError, RoomStore } from './room-store.js'

const rooms = new RoomStore()
const socketsByRoom = new Map()

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload))
}

function broadcast(code, room = rooms.snapshot(code)) {
  if (!room) return
  for (const socket of socketsByRoom.get(code) ?? []) {
    send(socket, { type: 'state', room, you: socket.playerIndex })
  }
}

function attach(socket, session) {
  if (socket.roomCode) socketsByRoom.get(socket.roomCode)?.delete(socket)
  socket.roomCode = session.code
  socket.token = session.token
  socket.playerIndex = session.playerIndex
  if (!socketsByRoom.has(session.code)) socketsByRoom.set(session.code, new Set())
  const roomSockets = socketsByRoom.get(session.code)
  for (const existing of roomSockets) {
    if (existing.token === session.token && existing !== socket) existing.close(4001, 'Session reconnected')
  }
  roomSockets.add(socket)
  send(socket, {
    type: 'joined',
    session: { code: session.code, token: session.token, playerIndex: session.playerIndex },
    room: session.room,
  })
  broadcast(session.code, session.room)
}

function requireSession(socket) {
  if (!socket.roomCode || !socket.token) throw new RoomError('NOT_JOINED', 'Join a room first.')
  return { code: socket.roomCode, token: socket.token }
}

export function attachOnlineSockets(webSockets) {
  webSockets.on('connection', (socket) => {
    socket.on('message', (raw) => {
      try {
        const message = JSON.parse(raw.toString())
        if (!message || typeof message.type !== 'string') throw new RoomError('BAD_REQUEST', 'Invalid message.')
        if (message.type === 'create') {
          attach(socket, rooms.createRoom())
          return
        }
        if (message.type === 'join') {
          attach(socket, rooms.joinRoom(message.code, message.token))
          return
        }
        const session = requireSession(socket)
        let room
        if (message.type === 'select') room = rooms.selectAnimal(session.code, session.token, message.animalId)
        else if (message.type === 'act') room = rooms.playMove(session.code, session.token, message.moveIndex, message.revision)
        else if (message.type === 'rematch' || message.type === 'rematch-request') {
          room = rooms.requestRematch(session.code, session.token)
        } else if (message.type === 'rematch-accept') {
          room = rooms.acceptRematch(session.code, session.token)
        } else if (message.type === 'rematch-decline') {
          room = rooms.declineRematch(session.code, session.token)
        }
        else throw new RoomError('BAD_REQUEST', 'Unknown room action.')
        broadcast(session.code, room)
      } catch (error) {
        const code = error instanceof RoomError ? error.code : 'BAD_REQUEST'
        const message = error instanceof RoomError ? error.message : 'The server could not read that action.'
        send(socket, { type: 'error', code, message })
      }
    })

    socket.on('close', () => {
      if (!socket.roomCode) return
      const roomSockets = socketsByRoom.get(socket.roomCode)
      roomSockets?.delete(socket)
      const sessionStillConnected = [...(roomSockets ?? [])]
        .some((candidate) => candidate.token === socket.token && candidate.readyState === WebSocket.OPEN)
      if (!sessionStillConnected) {
        const room = rooms.disconnect(socket.roomCode, socket.token)
        broadcast(socket.roomCode, room)
      }
      if (roomSockets?.size === 0) socketsByRoom.delete(socket.roomCode)
    })
  })
}

const cleanup = setInterval(() => {
  for (const code of rooms.cleanupExpired()) {
    for (const socket of socketsByRoom.get(code) ?? []) {
      send(socket, { type: 'error', code: 'ROOM_EXPIRED', message: 'This room expired after 30 minutes of inactivity.' })
      socket.close(4004, 'Room expired')
    }
    socketsByRoom.delete(code)
  }
}, 60_000)
cleanup.unref()
