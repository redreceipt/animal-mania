const attack = (name, minDamage, maxDamage, accuracy, description, effects = {}) => ({
  type: 'attack', name, minDamage, maxDamage, accuracy, description, ...effects,
})

const defend = (name, guard, focus, description, effects = {}) => ({
  type: 'defend', name, guard, focus, description, ...effects,
})

export const ANIMALS = [
  {
    id: 'tiger', name: 'Tiger', color: '#ee7b24', detail: 'Balanced hunter', archetype: 'all-rounder', col: 0, health: 40, strength: 7, defense: 6, speed: 7, home: 'Sunstripe Jungle',
    budget: { strength: 5, speed: 5, defense: 5, accuracy: 5, utility: 5, initiative: 5 },
    moves: [
      attack('Quick Pounce', 4, 6, 0.96, 'Reliable. Builds +12% focus.', { focusGain: 0.12 }),
      attack('Raking Claws', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Wild Ambush', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Battle Roar', 0.45, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'gorilla', name: 'Gorilla', color: '#6f7781', detail: 'Heavy bruiser', archetype: 'bruiser', col: 1, health: 48, strength: 10, defense: 7, speed: 4, home: 'Mistpeak Rainforest',
    budget: { strength: 8, speed: 2, defense: 7, accuracy: 4, utility: 5, initiative: 4 },
    moves: [
      attack('Knuckle Jab', 5, 7, 0.92, 'Heavy and dependable.'),
      attack('Rock Hurler', 9, 12, 0.72, 'Ignores 25% of guard.', { guardPierce: 0.25 }),
      attack('Ground Breaker', 15, 20, 0.46, 'Massive, guard-breaking hit.', { guardPierce: 0.45 }),
      defend('Iron Chest', 0.7, 0.05, 'The strongest guard in the wild.'),
    ],
  },
  {
    id: 'eagle', name: 'Eagle', color: '#f5d78a', detail: 'Swift trickster', archetype: 'skirmisher', col: 2, health: 30, strength: 5, defense: 4, speed: 10, home: 'Skyreach Cliffs',
    budget: { strength: 2, speed: 8, defense: 2, accuracy: 8, utility: 6, initiative: 4 },
    moves: [
      attack('Wing Flick', 4, 6, 0.99, 'Reliable. Gain 15% evasion.', { evasionGain: 0.15 }),
      attack('Talon Rush', 4, 5, 0.84, 'Two separate chances to hit.', { hits: 2 }),
      attack('Skyfall Dive', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Keen Winds', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'crocodile', name: 'Crocodile', color: '#54a84b', detail: 'Armored survivor', archetype: 'survivor', col: 3, health: 44, strength: 8, defense: 10, speed: 5, home: 'Blackwater Mangroves',
    budget: { strength: 5, speed: 3, defense: 8, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Tail Snap', 4, 7, 0.94, 'Reliable pressure attack.'),
      attack('Death Roll', 8, 11, 0.78, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Marsh Lunge', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Scaled Stance', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'rhino', name: 'Rhino', color: '#8d98a5', detail: 'Relentless charger', archetype: 'bruiser', col: 4, health: 52, strength: 10, defense: 9, speed: 3, home: 'Sunstone Savanna',
    budget: { strength: 8, speed: 2, defense: 8, accuracy: 4, utility: 6, initiative: 2 },
    moves: [
      attack('Horn Feint', 5, 8, 0.93, 'Reliable. Slips through 15% of guard.', { guardPierce: 0.15 }),
      attack('Stampede', 9, 11, 0.78, 'Deals +2 through any guard.', { bonusVsGuard: 2 }),
      attack('Horn Charge', 13, 17, 0.6, 'Heavy charge that pierces 35% of guard.', { guardPierce: 0.35 }),
      defend('Thick Hide', 0.66, 0.06, 'Powerful guard with a little focus.'),
    ],
  },
  {
    id: 'hippo', name: 'Hippo', color: '#80708f', detail: 'River powerhouse', archetype: 'bruiser', col: 5, health: 56, strength: 11, defense: 8, speed: 3, home: 'Sunset Riverbank',
    budget: { strength: 9, speed: 2, defense: 8, accuracy: 5, utility: 4, initiative: 2 },
    moves: [
      attack('Jaw Jab', 5, 7, 0.95, 'Short-range, dependable bite.'),
      attack('River Rush', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Crushing Bite', 12, 16, 0.64, 'A fearsome all-or-nothing chomp.'),
      defend('Mud Wall', 0.675, 0.03, 'Heavy guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'horse', name: 'Horse', color: '#c56c2d', detail: 'Fleet combo fighter', archetype: 'skirmisher', col: 6, health: 36, strength: 5, defense: 4, speed: 9, home: 'Wildflower Prairie',
    budget: { strength: 3, speed: 8, defense: 3, accuracy: 7, utility: 5, initiative: 4 },
    moves: [
      attack('Hoof Flick', 6, 9, 0.97, 'Reliable. Builds +10% focus.', { focusGain: 0.1 }),
      attack('Gallop Combo', 4, 5, 0.8, 'Two separate chances to connect.', { hits: 2 }),
      attack('Rear Kick', 11, 15, 0.7, 'Strong. Gain 12% evasion.', { evasionGain: 0.12 }),
      defend('Second Wind', 0.35, 0.2, 'Light guard with focus and evasion.', { evasionGain: 0.1 }),
    ],
  },
  {
    id: 'elephant', name: 'Elephant', color: '#718da2', detail: 'Steady tactician', archetype: 'survivor', col: 7, health: 60, strength: 9, defense: 8, speed: 5, home: 'Baobab Floodplain',
    budget: { strength: 7, speed: 3, defense: 8, accuracy: 5, utility: 4, initiative: 3 },
    moves: [
      attack('Trunk Tap', 4, 6, 0.96, 'Reliable pressure attack.'),
      attack('Tusk Sweep', 8, 11, 0.82, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Earthshaker', 13, 17, 0.62, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Memory Guard', 0.62, 0.1, 'Strong guard with measured focus.'),
    ],
  },
  {
    id: 'grizzly-bear', name: 'Grizzly Bear', color: '#9a582d', detail: 'Savage grappler', archetype: 'bruiser', col: 8, health: 50, strength: 9, defense: 7, speed: 4, home: 'Cedar Run',
    budget: { strength: 7, speed: 3, defense: 6, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Paw Swipe', 5, 7, 0.95, 'Reliable. Builds +8% focus.', { focusGain: 0.08 }),
      attack('Mauling Rush', 4, 5, 0.82, 'Two separate chances to hit.', { hits: 2 }),
      attack('Bear Hug', 12, 16, 0.58, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      defend('Den Up', 0.64, 0.05, 'Strong guard, 10% evasion, and recover 2 HP.', { evasionGain: 0.1, heal: 2 }),
    ],
  },
  {
    id: 'polar-bear', name: 'Polar Bear', color: '#dbe8ef', detail: 'Cold opportunist', archetype: 'all-rounder', col: 9, health: 46, strength: 8, defense: 6, speed: 6, home: 'Aurora Ice Shelf',
    budget: { strength: 6, speed: 5, defense: 5, accuracy: 6, utility: 5, initiative: 3 },
    moves: [
      attack('Frost Feint', 4, 6, 0.97, 'Reliable. Gain 10% evasion.', { evasionGain: 0.1 }),
      attack('Ice Claws', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Glacier Crash', 12, 15, 0.64, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Snowdrift Guard', 0.55, 0.14, 'Guard, focus, and recover 1 HP.', { heal: 1 }),
    ],
  },
  {
    id: 'wolf', name: 'Wolf', color: '#7f8995', detail: 'Pack tactician', archetype: 'all-rounder', col: 10, health: 38, strength: 7, defense: 6, speed: 7, home: 'Moonpine Valley',
    budget: { strength: 5, speed: 6, defense: 5, accuracy: 6, utility: 5, initiative: 3 },
    moves: [
      attack('Driving Bite', 4, 6, 0.96, 'Reliable. Builds +13% focus.', { focusGain: 0.13 }),
      attack('Pack Feint', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Hamstring Rush', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Circle Up', 0.45, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'komodo-dragon', name: 'Komodo Dragon', color: '#76694f', detail: 'Patient predator', archetype: 'survivor', col: 11, health: 45, strength: 8, defense: 10, speed: 5, home: 'Sundown Scrubland',
    budget: { strength: 6, speed: 3, defense: 8, accuracy: 4, utility: 6, initiative: 3 },
    moves: [
      attack('Claw Rake', 4, 7, 0.95, 'Reliable pressure attack.'),
      attack('Tail Sweep', 8, 11, 0.78, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Ambush Bite', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Burrow Brace', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'lion', name: 'Lion', color: '#d39235', detail: 'Regal finisher', archetype: 'bruiser', col: 12, health: 49, strength: 10, defense: 7, speed: 4, home: 'Golden Grasslands',
    budget: { strength: 8, speed: 2, defense: 7, accuracy: 4, utility: 5, initiative: 4 },
    moves: [
      attack('Paw Strike', 5, 7, 0.92, 'Heavy and dependable.'),
      attack('Mane Rush', 9, 12, 0.72, 'Ignores 25% of guard.', { guardPierce: 0.25 }),
      attack('Throat Lunge', 15, 20, 0.46, 'Massive, guard-breaking hit.', { guardPierce: 0.45 }),
      defend('Pride Stance', 0.69, 0.05, 'A commanding guard with a little focus.'),
    ],
  },
  {
    id: 'anaconda', name: 'Anaconda', color: '#768c3a', detail: 'Coiling controller', archetype: 'tactician', col: 13, health: 42, strength: 7, defense: 6, speed: 7, home: 'Emerald Backwater',
    budget: { strength: 5, speed: 6, defense: 5, accuracy: 5, utility: 6, initiative: 3 },
    moves: [
      attack('Snap Bite', 4, 6, 0.96, 'Reliable. Builds +12% focus.', { focusGain: 0.12 }),
      attack('Coil Crush', 8, 11, 0.82, 'Deals +3 to wounded foes.', { bonusBelowHalf: 3 }),
      attack('Constrict', 14, 18, 0.56, 'Deals +4 to wounded foes.', { bonusBelowHalf: 4 }),
      defend('Tight Coil', 0.46, 0.18, 'Guard and line up the next strike.'),
    ],
  },
  {
    id: 'water-buffalo', name: 'Water Buffalo', color: '#665e56', detail: 'Marsh juggernaut', archetype: 'bruiser', col: 14, health: 58, strength: 11, defense: 8, speed: 3, home: 'Monsoon Wetlands',
    budget: { strength: 9, speed: 2, defense: 8, accuracy: 5, utility: 4, initiative: 2 },
    moves: [
      attack('Horn Jab', 5, 7, 0.95, 'Short-range, dependable strike.'),
      attack('Marsh Trample', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Floodplain Charge', 12, 16, 0.64, 'A fearsome all-or-nothing charge.'),
      defend('Mud Brace', 0.67, 0.03, 'Heavy guard and recover 2 HP.', { heal: 2 }),
    ],
  },
  {
    id: 'shark', name: 'Shark', color: '#507f9b', detail: 'Relentless striker', archetype: 'all-rounder', col: 15, health: 47, strength: 8, defense: 6, speed: 6, home: 'Bluewater Reef',
    budget: { strength: 6, speed: 5, defense: 4, accuracy: 6, utility: 5, initiative: 4 },
    moves: [
      attack('Bite Feint', 4, 6, 0.97, 'Reliable. Gain 4% evasion.', { evasionGain: 0.04 }),
      attack('Ramming Strike', 7, 10, 0.84, 'Deals +2 to wounded foes.', { bonusBelowHalf: 2 }),
      attack('Breach Attack', 12, 15, 0.64, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Countercurrent', 0.55, 0.14, 'Guard, focus, and recover 1 HP.', { heal: 1 }),
    ],
  },
  {
    id: 'orca', name: 'Orca', color: '#394b61', detail: 'Ocean powerhouse', archetype: 'all-rounder', col: 16, health: 54, strength: 9, defense: 8, speed: 6, home: 'Kelp Channel',
    budget: { strength: 7, speed: 5, defense: 7, accuracy: 5, utility: 3, initiative: 3 },
    moves: [
      attack('Tail Slap', 3, 5, 0.96, 'Reliable pressure attack.'),
      attack('Wave Ram', 9, 12, 0.82, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Surge Breach', 12, 16, 0.62, 'Powerful hit that pierces 30% of guard.', { guardPierce: 0.3 }),
      defend('Pod Circle', 0.62, 0.11, 'Strong guard with measured focus.'),
    ],
  },
  {
    id: 'ostrich', name: 'Ostrich', color: '#d6c2a1', detail: 'Fleet kicker', archetype: 'skirmisher', col: 17, health: 34, strength: 5, defense: 4, speed: 10, home: 'Acacia Flats',
    budget: { strength: 3, speed: 8, defense: 3, accuracy: 7, utility: 5, initiative: 4 },
    moves: [
      attack('Beak Jab', 4, 6, 0.99, 'Reliable. Gain 16% evasion.', { evasionGain: 0.16 }),
      attack('Double Kick', 4, 5, 0.84, 'Two separate chances to connect.', { hits: 2 }),
      attack('Sprint Kick', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Wing Screen', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'falcon', name: 'Falcon', color: '#9c8062', detail: 'Aerial daredevil', archetype: 'skirmisher', col: 18, health: 28, strength: 5, defense: 4, speed: 10, home: 'Redstone Aerie',
    budget: { strength: 2, speed: 8, defense: 2, accuracy: 8, utility: 6, initiative: 4 },
    moves: [
      attack('Beak Strike', 4, 6, 0.98, 'Reliable. Gain 15% evasion.', { evasionGain: 0.15 }),
      attack('Talon Flurry', 4, 5, 0.84, 'Two separate chances to hit.', { hits: 2 }),
      attack('Stooping Dive', 10, 14, 0.68, 'Strong. Gain 18% evasion.', { evasionGain: 0.18 }),
      defend('Thermal Ride', 0.3, 0.28, 'Light guard, high focus and evasion.', { evasionGain: 0.15 }),
    ],
  },
  {
    id: 'octopus', name: 'Octopus', color: '#b65f48', detail: 'Elusive grappler', archetype: 'tactician', col: 19, health: 41, strength: 8, defense: 9, speed: 5, home: 'Tidepool Grotto',
    budget: { strength: 5, speed: 3, defense: 8, accuracy: 4, utility: 7, initiative: 3 },
    moves: [
      attack('Arm Snap', 4, 6, 0.92, 'Reliable pressure attack.'),
      attack('Sucker Grip', 8, 11, 0.78, 'Deals +3 through any guard.', { bonusVsGuard: 3 }),
      attack('Beak Bite', 11, 15, 0.62, 'Recover 3 HP on a hit.', { heal: 3 }),
      defend('Ink Screen', 0.6, 0.08, 'Guard and recover 2 HP.', { heal: 2 }),
    ],
  },
]

export const strengthBonus = (strength) => Math.round((strength - 7) * 0.5)
export const defenseMultiplier = (defense) => 1 - (defense - 6) * 0.01
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
    health: animal.health,
    guard: 0,
    focus: 0,
    evasion: 0,
    defenseReady: true,
    initiative: 0,
  }
}

export function getLegalMoves(player) {
  return player.animal.moves.filter((move) => move.type !== 'defend' || player.defenseReady)
}

const damageTakenMultiplier = (animal) => animal.health / 40

const resolvedHitDamage = (damage, defender, guardReduction) => Math.max(1, Math.ceil(
  damage * (1 - guardReduction) * damageTakenMultiplier(defender.animal) * defenseMultiplier(defender.animal.defense),
))

function expectedAttackDamage(attacker, defender, move) {
  const range = getDamageRange(attacker.animal, move)
  const accuracy = clampAccuracy(move.accuracy + attacker.focus - defender.evasion)
  const guarded = defender.guard > 0
  const bonus = (defender.health <= defender.animal.health / 2 ? move.bonusBelowHalf ?? 0 : 0)
    + (guarded ? move.bonusVsGuard ?? 0 : 0)
  const averageHit = (range.min + range.max) / 2 + bonus
  const guardReduction = guarded ? Math.max(0, defender.guard - (move.guardPierce ?? 0)) : 0
  return resolvedHitDamage(averageHit, defender, guardReduction) * range.hits * accuracy
}

export function chooseCpuMove(players, active, random = Math.random) {
  const attacker = players[active]
  const defender = players[1 - active]
  const legalMoves = getLegalMoves(attacker)
  let bestMove = legalMoves[0]
  let bestScore = -Infinity

  for (const move of legalMoves) {
    let score
    if (move.type === 'attack') {
      const expectedDamage = expectedAttackDamage(attacker, defender, move)
      const reliableFinish = defender.health <= expectedDamage && move.accuracy >= 0.8 ? 5 : 0
      const utility = (move.heal ?? 0) * (attacker.health < attacker.animal.health ? 0.7 : 0)
        + (move.focusGain ?? 0) * 8
        + (move.evasionGain ?? 0) * 7
      score = expectedDamage + reliableFinish + utility
    } else {
      const missingHealth = attacker.animal.health - attacker.health
      const healthPressure = (1 - attacker.health / attacker.animal.health) * 10
      const incomingThreat = expectedAttackDamage(defender, attacker, defender.animal.moves[1])
      score = healthPressure + move.guard * incomingThreat + move.focus * 9
        + (move.evasionGain ?? 0) * 8 + Math.min(missingHealth, move.heal ?? 0)
      if (attacker.health === attacker.animal.health && !defender.guard) score -= 3
    }

    // A small independent preference roll keeps equally sound turns from becoming scripted.
    score += random() * 4
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
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
  return players[acting].animal.speed > players[other].animal.speed ? acting : other
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
    attacker.health = Math.min(attacker.animal.health, attacker.health + (move.heal ?? 0))
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
  const targetWasWounded = defender.health <= defender.animal.health / 2
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
    totalDamage += resolvedHitDamage(damage, defender, guardReduction)
  }

  if (landedHits === 0) {
    const details = [evasive ? `${defenderName} evaded` : 'it missed', guarded ? 'guard expired' : null].filter(Boolean).join(', ')
    const message = `${attackerName} used ${move.name} — ${details}!`
    return { players: nextPlayers, message, log: message, winner: null, nextActive: nextActor(nextPlayers, active) }
  }

  defender.health = Math.max(0, defender.health - totalDamage)
  attacker.health = Math.min(attacker.animal.health, attacker.health + (move.heal ?? 0))
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
