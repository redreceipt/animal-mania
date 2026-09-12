import { setTimeout as delay } from 'node:timers/promises'
import { createClient } from '@redis/client'
import { RoomError, RoomStore, ROOM_TTL_MS, normalizeRoomCode } from './room-store.js'

const key = (code) => `animal-mania:room:${code}`
const saveRoom = `
  local current = redis.call('GET', KEYS[1])
  if (not current and ARGV[1] == '') or current == ARGV[1] then
    redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
    redis.call('PUBLISH', ARGV[4], ARGV[5])
    return 1
  end
  return 0
`

export async function createRoomBackend(onState, url = process.env.REDIS_URL) {
  const local = new RoomStore()
  let client
  let subscriber
  let channel
  let subscribed = false
  if (url) {
    client = createClient({ url, disableOfflineQueue: true })
    channel = `animal-mania:room-updates:${client.options.database ?? 0}`
    subscriber = client.duplicate({ name: `animal-mania-updates:${process.pid}` })
    // Pub/Sub cannot replay missed updates. Rejoin sockets after subscription recovery.
    subscriber.on('ready', () => onState(null))
    for (const connection of [client, subscriber]) connection.on('error', (error) => console.error('Room storage:', error.message))
    try {
      const connected = Promise.all([client.connect(), subscriber.connect()])
        .then(() => subscriber.subscribe(channel, (message) => onState(JSON.parse(message))))
        .then(() => { subscribed = true })
      // Bound startup waits; Redis keeps reconnecting in the background.
      await Promise.race([connected, delay(5000, undefined, { ref: false })])
    } catch (error) {
      for (const connection of [client, subscriber]) if (connection.isOpen) connection.destroy()
      throw error
    }
  } else if (process.env.VERCEL) {
    throw new Error('REDIS_URL is required for online rooms on Vercel.')
  }

  function update(store, result) {
    const room = result.room ?? result
    return {
      room,
      connections: store.rooms.get(room.code).players.map((player) => player?.connectionId ?? null),
    }
  }

  return {
    async run(action, connectionId, ...args) {
      const sessionAction = ['createRoom', 'joinRoom', 'disconnect'].includes(action)
      if (sessionAction) args.push(connectionId)
      function apply(store) {
        if (!sessionAction) store.requireConnection(args[0], args[1], connectionId)
        return store[action](...args)
      }
      if (!client) {
        const result = apply(local)
        if (result) onState(update(local, result))
        return result
      }
      if (!client.isReady || !subscriber.isReady || !subscribed) throw new Error('Room updates are unavailable.')
      // Concurrent joins and turns must commit against the exact state they read.
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const store = new RoomStore()
        const code = action === 'createRoom' ? null : normalizeRoomCode(args[0])
        const previous = code ? await client.get(key(code)) : null
        if (previous) store.rooms.set(code, JSON.parse(previous))
        const result = apply(store)
        if (!result) return null
        const room = result.room ?? result
        const saved = await client.eval(saveRoom, {
          keys: [key(room.code)],
          arguments: [previous ?? '', JSON.stringify(store.rooms.get(room.code)), String(ROOM_TTL_MS), channel, JSON.stringify(update(store, result))],
        })
        if (saved) return result
      }
      throw new RoomError('ROOM_BUSY', 'The room changed. Please try that action again.')
    },
    async snapshot(code) {
      if (!client) {
        local.cleanupExpired()
        return local.snapshot(code)
      }
      const room = await client.get(key(code))
      return room ? local.snapshot(JSON.parse(room)) : null
    },
    close() {
      for (const connection of [client, subscriber]) if (connection?.isOpen) connection.destroy()
    },
  }
}
