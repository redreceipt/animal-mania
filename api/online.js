import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { attachOnlineSockets } from '../server/online-sockets.js'

const server = createServer((_request, response) => {
  response.writeHead(426, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('This endpoint requires a WebSocket connection.')
})

attachOnlineSockets(new WebSocketServer({ server }))

export default server
