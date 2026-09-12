import assert from 'node:assert/strict'
import test from 'node:test'
import { createRoomBackend } from './room-backend.js'

test('Vercel never creates isolated in-memory rooms without Redis', async (t) => {
  const previous = process.env.VERCEL
  t.after(() => {
    if (previous === undefined) delete process.env.VERCEL
    else process.env.VERCEL = previous
  })
  process.env.VERCEL = '1'
  await assert.rejects(createRoomBackend(() => {}, ''), /REDIS_URL is required/)
})

for (const url of ['', process.env.TEST_REDIS_URL]) {
  test(`displaced connections cannot mutate ${url ? 'shared' : 'local'} rooms`, { skip: url === undefined }, async (t) => {
    const first = await createRoomBackend(() => {}, url)
    t.after(() => first.close())
    const second = url ? await createRoomBackend(() => {}, url) : first
    t.after(() => second.close())
    const host = await first.run('createRoom', 'old-connection')
    const restored = await second.run('joinRoom', 'new-connection', host.code, host.token)
    for (const action of ['selectAnimal', 'playMove', 'requestRematch', 'acceptRematch', 'declineRematch', 'changeFighters']) {
      await assert.rejects(first.run(action, 'old-connection', host.code, host.token, 'tiger'), { code: 'SESSION_REPLACED' })
    }
    assert.deepEqual(await first.snapshot(host.code), restored.room)
    assert.equal(await first.run('disconnect', 'old-connection', host.code, host.token), null)
    const selected = await second.run('selectAnimal', 'new-connection', host.code, host.token, 'tiger')
    assert.equal(selected.players[0].animalId, 'tiger')
    assert.equal(selected.players[0].connected, true)
  })
}
