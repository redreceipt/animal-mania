import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'
import { attachOnlineSockets } from './online-sockets.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const production = process.env.NODE_ENV === 'production'
const args = process.argv.slice(2)

function argument(name, fallback) {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

const host = argument('--host', process.env.HOST ?? '0.0.0.0')
const port = Number(argument('--port', process.env.PORT ?? 5173))

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
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
attachOnlineSockets(webSockets)

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  if (pathname !== '/api/online') return
  webSockets.handleUpgrade(request, socket, head, (webSocket) => {
    webSockets.emit('connection', webSocket)
  })
})

server.listen(port, host, () => {
  console.log(`Animal Mania listening on http://${host}:${port}`)
})

async function shutdown() {
  webSockets.close()
  await vite?.close()
  server.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
