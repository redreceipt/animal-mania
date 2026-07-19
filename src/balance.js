import {
  createFighter, getLegalMoves, getOpeningActor, resolveAction,
} from './game.js'

export const BALANCE_AXES = Object.freeze([
  'strength', 'speed', 'defense', 'accuracy', 'utility', 'initiative',
])

export const BALANCE_TARGET = 30
export const BALANCE_TOLERANCE = 1
export const ARCHETYPE_DRIFT_LIMIT = 8

export const ARCHETYPES = Object.freeze({
  'all-rounder': Object.freeze({
    label: 'All-rounder',
    description: 'Flexible fundamentals with no extreme strength or weakness.',
    budget: Object.freeze({ strength: 5, speed: 5, defense: 5, accuracy: 5, utility: 5, initiative: 5 }),
  }),
  bruiser: Object.freeze({
    label: 'Bruiser',
    description: 'Power and durability traded for mobility and turn frequency.',
    budget: Object.freeze({ strength: 8, speed: 3, defense: 7, accuracy: 4, utility: 5, initiative: 3 }),
  }),
  skirmisher: Object.freeze({
    label: 'Skirmisher',
    description: 'Speed, precision, and evasion traded for raw damage and armor.',
    budget: Object.freeze({ strength: 3, speed: 8, defense: 3, accuracy: 7, utility: 5, initiative: 4 }),
  }),
  survivor: Object.freeze({
    label: 'Survivor',
    description: 'Defense and recovery traded for initiative and burst damage.',
    budget: Object.freeze({ strength: 5, speed: 3, defense: 8, accuracy: 4, utility: 7, initiative: 3 }),
  }),
  tactician: Object.freeze({
    label: 'Tactician',
    description: 'Setup tools and matchup flexibility traded for direct power.',
    budget: Object.freeze({ strength: 5, speed: 5, defense: 5, accuracy: 5, utility: 7, initiative: 3 }),
  }),
})

export function createBudget(archetype, adjustments = {}) {
  const template = ARCHETYPES[archetype]
  if (!template) throw new Error(`Unknown archetype: ${archetype}`)
  const unknownAxes = Object.keys(adjustments).filter((axis) => !BALANCE_AXES.includes(axis))
  if (unknownAxes.length) throw new Error(`Unknown balance axes: ${unknownAxes.join(', ')}`)
  return Object.fromEntries(BALANCE_AXES.map((axis) => [
    axis,
    template.budget[axis] + (adjustments[axis] ?? 0),
  ]))
}

export function getBudgetTotal(budget) {
  return BALANCE_AXES.reduce((total, axis) => total + (budget?.[axis] ?? 0), 0)
}

export function getArchetypeDrift(animal) {
  const template = ARCHETYPES[animal.archetype]
  if (!template) return Infinity
  return BALANCE_AXES.reduce((drift, axis) => (
    drift + Math.abs((animal.budget?.[axis] ?? 0) - template.budget[axis])
  ), 0)
}

export function validateRoster(animals) {
  const errors = []
  const ids = new Set()
  const columns = new Set()
  const homes = new Set()

  for (const animal of animals) {
    const label = animal.name ?? animal.id ?? 'Unnamed animal'
    if (!animal.id || ids.has(animal.id)) errors.push(`${label}: id must be present and unique`)
    if (!Number.isInteger(animal.col) || columns.has(animal.col)) errors.push(`${label}: col must be an integer and unique`)
    if (!animal.home || homes.has(animal.home)) errors.push(`${label}: home must be present and unique`)
    ids.add(animal.id)
    columns.add(animal.col)
    homes.add(animal.home)

    const archetype = ARCHETYPES[animal.archetype]
    if (!archetype) errors.push(`${label}: unknown archetype "${animal.archetype}"`)

    for (const stat of ['health', 'strength', 'defense', 'speed']) {
      if (!Number.isFinite(animal[stat]) || animal[stat] <= 0) errors.push(`${label}: ${stat} must be positive`)
    }

    for (const axis of BALANCE_AXES) {
      const value = animal.budget?.[axis]
      if (!Number.isInteger(value) || value < 1 || value > 9) {
        errors.push(`${label}: budget.${axis} must be an integer from 1 to 9`)
      }
    }

    const total = getBudgetTotal(animal.budget)
    if (Math.abs(total - BALANCE_TARGET) > BALANCE_TOLERANCE) {
      errors.push(`${label}: budget is ${total}; expected ${BALANCE_TARGET} ± ${BALANCE_TOLERANCE}`)
    }
    if (archetype && getArchetypeDrift(animal) > ARCHETYPE_DRIFT_LIMIT) {
      errors.push(`${label}: budget has drifted too far from the ${animal.archetype} archetype`)
    }

    if (!Array.isArray(animal.moves) || animal.moves.length !== 4) {
      errors.push(`${label}: move kit must contain four moves`)
      continue
    }

    const attacks = animal.moves.filter((move) => move.type === 'attack')
    const defenses = animal.moves.filter((move) => move.type === 'defend')
    if (attacks.length !== 3 || defenses.length !== 1) errors.push(`${label}: move kit must contain three attacks and one defense`)

    for (const move of attacks) {
      if (!move.name || !move.description) errors.push(`${label}: every attack needs a name and description`)
      if (!Number.isFinite(move.minDamage) || !Number.isFinite(move.maxDamage) || move.minDamage > move.maxDamage) {
        errors.push(`${label} / ${move.name}: invalid damage range`)
      }
      if (!Number.isFinite(move.accuracy) || move.accuracy < 0.25 || move.accuracy > 0.99) {
        errors.push(`${label} / ${move.name}: accuracy must be between 0.25 and 0.99`)
      }
      if (move.poison && (!Number.isInteger(move.poison.damage) || move.poison.damage < 1
        || !Number.isInteger(move.poison.turns) || move.poison.turns < 1)) {
        errors.push(`${label} / ${move.name}: poison needs positive integer damage and turns`)
      }
      if (move.expose !== undefined && (!Number.isInteger(move.expose) || move.expose < 1)) {
        errors.push(`${label} / ${move.name}: expose must be a positive integer`)
      }
      if (move.daze !== undefined && (!Number.isFinite(move.daze) || move.daze <= 0 || move.daze > 0.5)) {
        errors.push(`${label} / ${move.name}: daze must be between 0 and 0.5`)
      }
    }

    for (const move of defenses) {
      if (!move.name || !move.description) errors.push(`${label}: every defense needs a name and description`)
      if (!Number.isFinite(move.guard) || move.guard < 0 || move.guard > 0.75) {
        errors.push(`${label} / ${move.name}: guard must be between 0 and 0.75`)
      }
    }
  }

  return errors
}

export function seededRandom(seed) {
  let state = seed >>> 0
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296)
}

export function simulateMatch(animalA, animalB, random, chooseMove = (players, active, roll) => {
  const legalMoves = getLegalMoves(players[active])
  return legalMoves[Math.floor(roll() * legalMoves.length)]
}) {
  let players = [createFighter(animalA), createFighter(animalB)]
  let active = getOpeningActor([animalA, animalB], random)

  for (let turn = 0; turn < 300; turn += 1) {
    const move = chooseMove(players, active, random)
    const result = resolveAction(players, active, move, random)
    players = result.players
    if (result.winner !== null) return { winner: result.winner, turns: turn + 1 }
    active = result.nextActive
  }

  throw new Error(`${animalA.name} vs ${animalB.name} stalled after 300 turns`)
}

export function analyzeRosterBalance(animals, {
  matchesPerOrder = 200,
  seed = 123456789,
  overallRange = [0.46, 0.54],
  matchupRange = [0.41, 0.59],
  chooseMove,
} = {}) {
  const random = seededRandom(seed)
  const wins = Object.fromEntries(animals.map((animal) => [animal.id, 0]))
  const games = Object.fromEntries(animals.map((animal) => [animal.id, 0]))
  const orderedResults = new Map()
  let totalTurns = 0
  let totalGames = 0

  for (const animalA of animals) {
    for (const animalB of animals) {
      if (animalA === animalB) continue
      let playerOneWins = 0
      for (let game = 0; game < matchesPerOrder; game += 1) {
        const result = simulateMatch(animalA, animalB, random, chooseMove)
        const winner = result.winner === 0 ? animalA : animalB
        wins[winner.id] += 1
        games[animalA.id] += 1
        games[animalB.id] += 1
        if (result.winner === 0) playerOneWins += 1
        totalTurns += result.turns
        totalGames += 1
      }
      orderedResults.set(`${animalA.id}:${animalB.id}`, playerOneWins / matchesPerOrder)
    }
  }

  const overall = animals.map((animal) => ({
    id: animal.id,
    name: animal.name,
    wins: wins[animal.id],
    games: games[animal.id],
    winRate: wins[animal.id] / games[animal.id],
  }))
  const outliers = overall.filter(({ winRate }) => winRate <= overallRange[0] || winRate >= overallRange[1])
  const hardCounters = []

  for (let first = 0; first < animals.length; first += 1) {
    for (let second = first + 1; second < animals.length; second += 1) {
      const animalA = animals[first]
      const animalB = animals[second]
      const aAsPlayerOne = orderedResults.get(`${animalA.id}:${animalB.id}`)
      const bAsPlayerOne = orderedResults.get(`${animalB.id}:${animalA.id}`)
      const animalAWinRate = (aAsPlayerOne + (1 - bAsPlayerOne)) / 2
      if (animalAWinRate <= matchupRange[0] || animalAWinRate >= matchupRange[1]) {
        hardCounters.push({ animalA: animalA.name, animalB: animalB.name, animalAWinRate })
      }
    }
  }

  return {
    averageTurns: totalTurns / totalGames,
    games: totalGames,
    hardCounters,
    outliers,
    overall,
  }
}
