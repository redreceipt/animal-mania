import assert from 'node:assert/strict'
import test from 'node:test'
import { ANIMALS } from './game.js'
import { createMoveAnimation, MOVE_ANIMATION_MS } from './move-animation.js'

test('every move slot has a distinct, brief arcade animation', () => {
  for (const animal of ANIMALS) {
    const styles = animal.moves.map((move, moveIndex) => createMoveAnimation({
      move,
      moveIndex,
      actor: 0,
      damage: move.type === 'attack' ? 1 : 0,
    }).style)

    assert.deepEqual(styles, ['quick', 'combo', 'power', 'guard'], animal.name)
  }

  assert.ok(MOVE_ANIMATION_MS <= 600)
})

test('attack reactions distinguish hits from misses while defense braces', () => {
  const [quick, , , guard] = ANIMALS[0].moves
  assert.equal(createMoveAnimation({ move: quick, moveIndex: 0, actor: 0, damage: 4 }).outcome, 'hit')
  assert.equal(createMoveAnimation({ move: quick, moveIndex: 0, actor: 0, damage: 0 }).outcome, 'miss')
  assert.equal(createMoveAnimation({ move: guard, moveIndex: 3, actor: 1 }).outcome, 'guard')
})
