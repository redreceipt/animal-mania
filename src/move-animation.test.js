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

test('missed attacks replace the successful move animation with miss feedback', () => {
  const [quick, , , guard] = ANIMALS[0].moves
  const missedAttackAnimations = ANIMALS[0].moves.slice(0, 3).map((move, moveIndex) => (
    createMoveAnimation({ move, moveIndex, actor: 0, damage: 0 }).animation
  ))
  const hit = createMoveAnimation({ move: quick, moveIndex: 0, actor: 0, damage: 4 })
  const miss = createMoveAnimation({ move: quick, moveIndex: 0, actor: 0, damage: 0 })
  const onlineMiss = createMoveAnimation({ move: quick, moveIndex: 0, actor: 0, damage: 4, outcome: 'miss' })
  const defense = createMoveAnimation({ move: guard, moveIndex: 3, actor: 1 })

  assert.deepEqual(missedAttackAnimations, ['miss', 'miss', 'miss'])
  assert.deepEqual(
    { style: hit.style, animation: hit.animation, glyph: hit.glyph, outcome: hit.outcome },
    { style: 'quick', animation: 'quick', glyph: 'QUICK', outcome: 'hit' },
  )
  assert.deepEqual(
    { style: miss.style, animation: miss.animation, glyph: miss.glyph, outcome: miss.outcome },
    { style: 'quick', animation: 'miss', glyph: 'MISS!', outcome: 'miss' },
  )
  assert.equal(onlineMiss.animation, 'miss')
  assert.equal(defense.animation, 'guard')
})

test('move effects use readable arcade callouts', () => {
  assert.deepEqual(ANIMALS[0].moves.map((move, moveIndex) => createMoveAnimation({
    move,
    moveIndex,
    actor: 0,
    damage: move.type === 'attack' ? 1 : 0,
  }).glyph), ['QUICK', 'COMBO', 'POWER', 'GUARD'])
})
