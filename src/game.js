export const MAX_HEALTH = 40

const attack = (name, minDamage, maxDamage, accuracy, description, effects = {}) => ({
  type: 'attack', name, minDamage, maxDamage, accuracy, description, ...effects,
})

const defend = (name, guard, focus, description, effects = {}) => ({
  type: 'defend', name, guard, focus, description, ...effects,
})

export const ANIMALS = [
  {
    id: 'tiger', name: 'Tiger', color: '#ee7b24', detail: 'Balanced hunter', col: 0, strength: 7, speed: 7,
    moves: [
      attack('Quick Pounce', 4, 6, 0.96, 'Reliable. Builds +12% focus.', { focusGain: 0.12 }),
      attack('Raking Claws', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Wild Ambush', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Battle Roar', 0.45, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'gorilla', name: 'Gorilla', color: '#6f7781', detail: 'Heavy bruiser', col: 1, strength: 10, speed: 4,
    moves: [
      attack('Knuckle Jab', 5, 7, 0.92, 'Heavy and dependable.'),
      attack('Rock Hurler', 9, 12, 0.72, 'Ignores 25% of guard.', { guardPierce: 0.25 }),
      attack('Ground Breaker', 15, 20, 0.46, 'Massive, guard-breaking hit.', { guardPierce: 0.45 }),
      defend('Iron Chest', 0.7, 0.05, 'The strongest guard in the wild.'),
    ],
  },
  {
    id: 'eagle', name: 'Eagle', color: '#f5d78a', detail: 'Swift trickster', col: 2, strength: 5, speed: 10,
    moves: [
      attack('Wing Flick', 4, 6, 0.99, 'Reliable. Gain 15% evasion.', { evasionGain: 0.15 }),
      attack('Talon Rush', 4, 5, 0.84, 'Two separate chances to hit.', { hits: 2 }),
      attack('Skyfall Dive', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Keen Winds', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'crocodile', name: 'Crocodile', color: '#54a84b', detail: 'Armored survivor', col: 3, strength: 8, speed: 5,
    moves: [
      attack('Tail Snap', 4, 6, 0.94, 'Reliable pressure attack.'),
      attack('Death Roll', 8, 11, 0.78, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Marsh Lunge', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Scaled Stance', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
]

export const strengthBonus = (strength) => Math.round((strength - 7) * 0.5)
export const turnDelay = (speed) => 1 + (10 - speed) * 0.06

export function getDamageRange(animal, move) {
  if (move.type !== 'attack') return null
  const bonus = strengthBonus(animal.strength)
  return {
    min: Math.max(1, move.minDamage + bonus),
    max: Math.max(1, move.maxDamage + bonus),
    hits: move.hits ?? 1,
  }
}

export function getOpeningActor(animals, random = Math.random) {
  if (animals[0].speed === animals[1].speed) return random() < 0.5 ? 0 : 1
  return animals[0].speed > animals[1].speed ? 0 : 1
}

export function createFighter(animal) {
  return {
    animal,
    health: MAX_HEALTH,
    guard: 0,
    focus: 0,
    evasion: 0,
    defenseReady: true,
    initiative: 0,
  }
}

function rollDamage(animal, move, random) {
  const range = getDamageRange(animal, move)
  return Math.floor(random() * (range.max - range.min + 1)) + range.min
}

function nextActor(players, acting) {
  players[acting].initiative += turnDelay(players[acting].animal.speed)
  const other = 1 - acting
  if (players[acting].initiative < players[other].initiative) return acting
  if (players[acting].initiative > players[other].initiative) return other
  return players[acting].animal.speed >= players[other].animal.speed ? acting : other
}

const clampAccuracy = (value) => Math.max(0.25, Math.min(0.99, value))

export function resolveAction(players, active, move, random = Math.random) {
  const nextPlayers = players.map((player) => ({ ...player }))
  const attacker = nextPlayers[active]
  const defender = nextPlayers[1 - active]
  const attackerName = attacker.animal.name
  const defenderName = defender.animal.name

  if (move.type === 'defend') {
    if (!attacker.defenseReady) {
      return { players, message: `${move.name} needs an attack to recharge.`, log: null, winner: null, nextActive: active }
    }
    attacker.guard = move.guard
    attacker.focus = move.focus
    attacker.evasion = Math.max(attacker.evasion, move.evasionGain ?? 0)
    attacker.health = Math.min(MAX_HEALTH, attacker.health + (move.heal ?? 0))
    attacker.defenseReady = false
    const effects = [`${Math.round(move.guard * 100)}% guard`]
    if (move.focus) effects.push(`+${Math.round(move.focus * 100)}% focus`)
    if (move.evasionGain) effects.push(`+${Math.round(move.evasionGain * 100)}% evasion`)
    if (move.heal) effects.push(`healed ${move.heal}`)
    const message = `${attackerName} used ${move.name}: ${effects.join(', ')}.`
    return { players: nextPlayers, message, log: message, winner: null, nextActive: nextActor(nextPlayers, active) }
  }

  const guardValue = defender.guard
  const guarded = guardValue > 0
  const targetWasWounded = defender.health <= MAX_HEALTH / 2
  const accuracy = clampAccuracy(move.accuracy + attacker.focus - defender.evasion)
  const focused = attacker.focus > 0
  const evasive = defender.evasion > 0
  const hitCount = move.hits ?? 1
  let landedHits = 0
  let totalDamage = 0

  attacker.focus = 0
  attacker.defenseReady = true
  defender.guard = 0
  defender.evasion = 0

  for (let hit = 0; hit < hitCount; hit += 1) {
    if (random() >= accuracy) continue
    landedHits += 1
    let damage = rollDamage(attacker.animal, move, random)
    if (targetWasWounded) damage += move.bonusBelowHalf ?? 0
    if (guarded) damage += move.bonusVsGuard ?? 0
    const guardReduction = Math.max(0, guardValue - (move.guardPierce ?? 0))
    totalDamage += Math.max(1, Math.ceil(damage * (1 - guardReduction)))
  }

  if (landedHits === 0) {
    const details = [evasive ? `${defenderName} evaded` : 'it missed', guarded ? 'guard expired' : null].filter(Boolean).join(', ')
    const message = `${attackerName} used ${move.name} — ${details}!`
    return { players: nextPlayers, message, log: message, winner: null, nextActive: nextActor(nextPlayers, active) }
  }

  defender.health = Math.max(0, defender.health - totalDamage)
  attacker.health = Math.min(MAX_HEALTH, attacker.health + (move.heal ?? 0))
  attacker.focus = Math.max(attacker.focus, move.focusGain ?? 0)
  attacker.evasion = Math.max(attacker.evasion, move.evasionGain ?? 0)

  const effects = []
  if (hitCount > 1) effects.push(`${landedHits}/${hitCount} hits`)
  if (guarded) effects.push(move.guardPierce ? 'pierced guard' : 'guard softened it')
  if (focused) effects.push('focus boosted accuracy')
  if (move.heal) effects.push(`healed ${move.heal}`)
  if (move.focusGain) effects.push(`gained ${Math.round(move.focusGain * 100)}% focus`)
  if (move.evasionGain) effects.push(`gained ${Math.round(move.evasionGain * 100)}% evasion`)
  const effectText = effects.length ? ` (${effects.join(', ')})` : ''
  const message = `${attackerName} used ${move.name} for ${totalDamage} damage${effectText}!`
  const winner = defender.health === 0 ? active : null
  return { players: nextPlayers, message, log: message, winner, nextActive: winner === null ? nextActor(nextPlayers, active) : active }
}
