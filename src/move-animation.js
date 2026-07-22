export const MOVE_ANIMATION_MS = 520

const ATTACK_STYLES = ['quick', 'combo', 'power']
const GLYPHS = {
  quick: 'QUICK',
  combo: 'COMBO',
  power: 'POWER',
  guard: 'GUARD',
  miss: 'MISS!',
}

export function createMoveAnimation({ move, moveIndex, actor, damage = 0, outcome }) {
  if (!move || !Number.isInteger(moveIndex) || !Number.isInteger(actor)) return null

  const style = move.type === 'defend' ? 'guard' : ATTACK_STYLES[moveIndex] ?? 'power'
  const resolvedOutcome = outcome ?? (style === 'guard' ? 'guard' : damage > 0 ? 'hit' : 'miss')
  const animation = resolvedOutcome === 'miss' ? 'miss' : style
  return {
    actor,
    moveIndex,
    moveName: move.name,
    style,
    animation,
    glyph: GLYPHS[animation],
    outcome: resolvedOutcome,
  }
}
