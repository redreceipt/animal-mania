import assert from 'node:assert/strict'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import test from 'node:test'
import { createClient } from '@redis/client'
import { WebSocket } from 'ws'

for (const shared of [false, true]) {
  test(`online rooms synchronize ${shared ? 'across independent Redis-backed servers' : 'on a local server'}`, {
    skip: shared && !process.env.TEST_REDIS_URL,
    timeout: 20_000,
  }, async (t) => {
    const servers = []
    const clients = []
    t.after(async () => {
      for (const client of clients) client.socket.terminate()
      await Promise.all(servers.map(async (server) => {
        const exited = once(server, 'exit')
        server.kill()
        await exited
      }))
    })
    async function server() {
      const instance = spawn(process.execPath, ['--input-type=module', '-e', `
        import server from './api/online.js'
        server.listen(0, '127.0.0.1', () => console.log(server.address().port))
      `], {
        cwd: new URL('..', import.meta.url),
        env: { ...process.env, VERCEL: '', REDIS_URL: shared ? process.env.TEST_REDIS_URL : '' },
        stdio: ['ignore', 'pipe', 'inherit'],
      })
      servers.push(instance)
      const [port] = await once(instance.stdout, 'data')
      return `ws://127.0.0.1:${Number(port.toString().trim())}`
    }
    async function connect(url) {
      const socket = new WebSocket(url)
      const messages = []
      socket.on('message', (raw) => messages.push(JSON.parse(raw)))
      const client = {
        socket,
        send: (message) => socket.send(JSON.stringify(message)),
        async wait(predicate) {
          for (let attempt = 0; attempt < 500; attempt += 1) {
            const index = messages.findIndex(predicate)
            if (index !== -1) return messages.splice(index, 1)[0]
            await delay(10)
          }
          assert.fail(`Missing room update; received ${messages.map((message) => `${message.type}:${message.code ?? message.room?.phase}`).join(', ')}`)
        },
      }
      clients.push(client)
      await once(socket, 'open')
      return client
    }
    const firstUrl = await server()
    const secondUrl = shared ? await server() : firstUrl
    const host = await connect(firstUrl)
    host.send({ type: 'create' })
    const { session } = await host.wait((message) => message.type === 'joined')
    const guest = await connect(secondUrl)
    const rival = await connect(secondUrl)
    guest.send({ type: 'join', code: session.code })
    rival.send({ type: 'join', code: session.code })
    const results = await Promise.all([guest, rival].map((client) => client.wait((message) => ['joined', 'error'].includes(message.type))))
    assert.equal(results.filter((message) => message.type === 'joined').length, 1, results.map((message) => message.code ?? message.type).join(', '))
    assert.equal(results.find((message) => message.type === 'error').code, 'ROOM_FULL')
    const away = results[0].type === 'joined' ? guest : rival
    await host.wait((message) => message.room?.phase === 'selecting')
    host.send({ type: 'select', animalId: 'tiger' })
    away.send({ type: 'select', animalId: 'gorilla' })
    const battles = await Promise.all([host, away].map((client) => client.wait((message) => message.room?.phase === 'battle')))
    assert.deepEqual(battles[0].room, battles[1].room)
    assert.ok(!JSON.stringify(battles).includes(session.token), 'broadcasts must not expose session tokens')
    host.send({ type: 'act', moveIndex: 0, revision: 0 })
    host.send({ type: 'act', moveIndex: 0, revision: 0 })
    const turns = await Promise.all([host, away].map((client) => client.wait((message) => message.room?.battle?.revision === 1)))
    assert.deepEqual(turns[0].room, turns[1].room)
    await host.wait((message) => message.code === 'STALE_ACTION')

    const reconnected = await connect(secondUrl)
    const displaced = once(host.socket, 'close')
    reconnected.send({ type: 'join', code: session.code, token: session.token })
    const restored = await reconnected.wait((message) => message.type === 'joined')
    assert.equal(restored.session.playerIndex, 0)
    assert.equal(restored.room.battle.revision, 1)
    assert.equal((await displaced)[0], 4001)
    reconnected.socket.close()
    await away.wait((message) => message.room?.players[0]?.connected === false)
    const returned = await connect(firstUrl)
    returned.send({ type: 'join', code: session.code, token: session.token })
    const latest = await away.wait((message) => message.room?.players[0]?.connected && message.room.version > restored.room.version)
    assert.equal(latest.room.battle.revision, 1)

    if (shared) {
      const redis = createClient({ url: process.env.TEST_REDIS_URL })
      await redis.connect()
      try {
        const ttl = await redis.pTTL(`animal-mania:room:${session.code}`)
        assert.ok(ttl > 0 && ttl <= 30 * 60 * 1000)
        // A cold server must restore the same room without any local history.
        const cold = await connect(await server())
        cold.send({ type: 'join', code: session.code, token: session.token })
        const resumed = await cold.wait((message) => message.type === 'joined')
        assert.equal(resumed.room.battle.revision, 1)
        const recovering = once(cold.socket, 'close')
        const subscribers = await redis.clientList({ TYPE: 'PUBSUB' })
        const subscription = subscribers.find(({ name }) => name === `animal-mania-updates:${servers.at(-1).pid}`)
        assert.ok(subscription)
        await redis.sendCommand(['CLIENT', 'KILL', 'ID', String(subscription.id)])
        assert.equal((await recovering)[0], 1012, 'subscription recovery must make clients rejoin for a fresh snapshot')
        const refreshed = await connect(secondUrl)
        refreshed.send({ type: 'join', code: session.code, token: session.token })
        const current = await refreshed.wait((message) => message.type === 'joined')
        assert.equal(current.room.battle.revision, 1)
        await redis.del(`animal-mania:room:${session.code}`)
        const expired = await connect(secondUrl)
        expired.send({ type: 'join', code: session.code })
        await expired.wait((message) => message.code === 'ROOM_NOT_FOUND')
      } finally {
        redis.destroy()
      }
    }
  })
}
