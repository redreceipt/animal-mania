import assert from 'node:assert/strict'
import test from 'node:test'
import { RoomError, RoomStore, normalizeRoomCode } from './room-store.js'

function makeStore(options = {}) {
  let token = 0
  return new RoomStore({
    random: () => 0,
    tokenFactory: () => `token-${token += 1}`,
    ...options,
  })
}

function expectRoomError(code, action) {
  assert.throws(action, (error) => error instanceof RoomError && error.code === code)
}

function startMatch(store) {
  const host = store.createRoom()
  const guest = store.joinRoom(host.code)
  store.selectAnimal(host.code, host.token, 'tiger')
  const room = store.selectAnimal(host.code, guest.token, 'gorilla')
  return { host, guest, room }
}

test('room codes are memorable, normalized, and rooms accept exactly two anonymous players', () => {
  const store = makeStore()
  const host = store.createRoom()
  assert.match(host.code, /^[a-z]+-[a-z]+-[a-z]+$/)
  assert.equal(normalizeRoomCode(`  ${host.code.replaceAll('-', ' ')}  `), host.code)

  const guest = store.joinRoom(host.code.toUpperCase())
  assert.equal(guest.playerIndex, 1)
  assert.notEqual(guest.token, host.token)
  expectRoomError('ROOM_FULL', () => store.joinRoom(host.code))
  expectRoomError('ROOM_NOT_FOUND', () => store.joinRoom('missing-room-code'))
})

test('the server starts a match only after both players select valid fighters', () => {
  const store = makeStore()
  const host = store.createRoom()
  const guest = store.joinRoom(host.code)
  let room = store.selectAnimal(host.code, host.token, 'tiger')
  assert.equal(room.phase, 'selecting')
  assert.equal(room.battle, null)
  expectRoomError('INVALID_ANIMAL', () => store.selectAnimal(host.code, guest.token, 'dragon'))

  room = store.selectAnimal(host.code, guest.token, 'gorilla')
  assert.equal(room.phase, 'battle')
  assert.equal(room.round, 1)
  assert.deepEqual(room.battle.players.map(({ animalId }) => animalId), ['tiger', 'gorilla'])
  assert.equal(room.battle.active, 0)
})

test('authoritative actions reject out-of-turn, invalid, and client-modified battle state', () => {
  const store = makeStore()
  const { host, guest, room } = startMatch(store)
  expectRoomError('OUT_OF_TURN', () => store.playMove(host.code, guest.token, 0, 0))
  expectRoomError('INVALID_MOVE', () => store.playMove(host.code, host.token, 99, 0))

  room.battle.players[1].health = 0
  const unchanged = store.snapshot(host.code)
  assert.equal(unchanged.battle.players[1].health, 48)

  const resolved = store.playMove(host.code, host.token, 0, 0)
  assert.ok(resolved.battle.players[1].health < 48)
  assert.equal(resolved.battle.revision, 1)
  assert.match(resolved.battle.message, /Tiger used Quick Pounce/)
  expectRoomError('STALE_ACTION', () => store.playMove(host.code, host.token, 0, 0))
})

test('authoritative online battles serialize move statuses', () => {
  const store = makeStore()
  const host = store.createRoom()
  const guest = store.joinRoom(host.code)
  store.selectAnimal(host.code, host.token, 'komodo-dragon')
  const room = store.selectAnimal(host.code, guest.token, 'gorilla')

  assert.equal(room.battle.active, 0)
  const resolved = store.playMove(host.code, host.token, 1, 0)
  assert.deepEqual(resolved.battle.players[1].poisoned, { damage: 1, turns: 3 })
})

test('disconnects pause play and reconnect tokens restore the same player seat', () => {
  const store = makeStore()
  const { host, guest } = startMatch(store)
  let room = store.disconnect(host.code, guest.token)
  assert.equal(room.players[1].connected, false)
  expectRoomError('PLAYER_DISCONNECTED', () => store.playMove(host.code, host.token, 0, 0))

  const rejoined = store.joinRoom(host.code, guest.token)
  assert.equal(rejoined.playerIndex, 1)
  assert.equal(rejoined.room.players[1].connected, true)
  room = store.playMove(host.code, host.token, 0, 0)
  assert.equal(room.battle.revision, 1)
})

test('a rematch starts only after the receiving player explicitly accepts', () => {
  const store = makeStore()
  const { host, guest } = startMatch(store)
  const tokens = [host.token, guest.token]
  let room = store.snapshot(host.code)

  for (let turn = 0; turn < 100 && room.phase !== 'finished'; turn += 1) {
    room = store.playMove(host.code, tokens[room.battle.active], 0, room.battle.revision)
  }
  assert.equal(room.phase, 'finished')

  room = store.requestRematch(host.code, host.token)
  assert.deepEqual(room.rematch, { requester: 0, status: 'pending' })
  assert.equal(room.phase, 'finished')
  expectRoomError('REMATCH_REQUESTER', () => store.acceptRematch(host.code, host.token))
  expectRoomError('REMATCH_REQUESTER', () => store.declineRematch(host.code, host.token))
  expectRoomError('REMATCH_ALREADY_PENDING', () => store.requestRematch(host.code, guest.token))

  room = store.declineRematch(host.code, guest.token)
  assert.deepEqual(room.rematch, { requester: 0, status: 'declined' })
  assert.equal(room.phase, 'finished')

  room = store.requestRematch(host.code, host.token)
  assert.deepEqual(room.rematch, { requester: 0, status: 'pending' })
  room = store.acceptRematch(host.code, guest.token)
  assert.equal(room.phase, 'battle')
  assert.equal(room.round, 2)
  assert.deepEqual(room.battle.players.map(({ health }) => health), [40, 48])
  assert.equal(room.rematch, null)
})

test('inactive private rooms expire and can no longer be joined', () => {
  let now = 1_000
  const store = makeStore({ now: () => now, ttlMs: 500 })
  const host = store.createRoom()
  now += 501
  assert.deepEqual(store.cleanupExpired(), [host.code])
  expectRoomError('ROOM_NOT_FOUND', () => store.joinRoom(host.code, host.token))
})
