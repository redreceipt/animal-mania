import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocket, WebSocketServer } from 'ws'
import { RoomError, RoomStore } from './room-store.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const production = process.env.NODE_ENV === 'production'
const args = process.argv.slice(2)

function argument(name, fallback) {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

const host = argument('--host', process.env.HOST ?? '0.0.0.0')
const port = Number(argument('--port', process.env.PORT ?? 5173))
const rooms = new RoomStore()
const socketsByRoom = new Map()

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

let vite
if (!production) {
  const { createServer: createViteServer } = await import('vite')
  vite = await createViteServer({
    root,
    appType: 'spa',
    server: { middlewareMode: true },
  })
}

async function serveProduction(request, response) {
  const pathname = new URL(request.url, 'http://localhost').pathname
  const candidate = normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(root, 'dist', candidate === '/' ? 'index.html' : candidate)
  try {
    if (!(await stat(filePath)).isFile()) throw new Error('not a file')
  } catch {
    filePath = join(root, 'dist', 'index.html')
  }
  try {
    const content = await readFile(filePath)
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream' })
    response.end(content)
  } catch {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Build unavailable. Run npm run build before npm start.')
  }
}

const server = createServer((request, response) => {
  if (production) serveProduction(request, response)
  else vite.middlewares(request, response)
})

const webSockets = new WebSocketServer({ noServer: true })

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  if (pathname !== '/online') return
  webSockets.handleUpgrade(request, socket, head, (webSocket) => {
    webSockets.emit('connection', webSocket)
  })
})

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
      else if (message.type === 'rematch') room = rooms.requestRematch(session.code, session.token)
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

server.listen(port, host, () => {
  console.log(`Animal Mania listening on http://${host}:${port}`)
})

async function shutdown() {
  clearInterval(cleanup)
  webSockets.close()
  await vite?.close()
  server.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
