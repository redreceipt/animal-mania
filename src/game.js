export const ANIMALS = [
  { id: 'tiger', name: 'Tiger', color: '#ee7b24', detail: 'Claw & courage', col: 0 },
  { id: 'gorilla', name: 'Gorilla', color: '#6f7781', detail: 'Might & grit', col: 1 },
  { id: 'eagle', name: 'Eagle', color: '#f5d78a', detail: 'Focus & flight', col: 2 },
  { id: 'crocodile', name: 'Crocodile', color: '#54a84b', detail: 'Bite & patience', col: 3 },
]

export const MAX_HEALTH = 30
export const ATTACK_DAMAGE = 10
export const START_POSITIONS = [{ x: 0, y: 1 }, { x: 4, y: 1 }]

export const isAdjacent = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1

export function movePlayer(players, active, dx, dy) {
  const next = { x: players[active].x + dx, y: players[active].y + dy }
  if (next.x < 0 || next.x > 4 || next.y < 0 || next.y > 2) return players
  if (next.x === players[1 - active].x && next.y === players[1 - active].y) return players
  return players.map((player, index) => index === active ? { ...player, ...next } : player)
}
