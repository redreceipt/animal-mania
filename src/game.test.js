import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import {
  ANIMALS, chooseCpuMove, createFighter, defenseMultiplier, getDamageRange, getLegalMoves,
  getOpeningActor, resolveAction,
} from './game.js'

test('animals have defined attributes and mechanically different move kits', () => {
  const profiles = ANIMALS.map((animal) => JSON.stringify(animal.moves.map((move) => ({
    type: move.type,
    minDamage: move.minDamage,
    maxDamage: move.maxDamage,
    accuracy: move.accuracy,
    hits: move.hits,
    guard: move.guard,
    focus: move.focus,
    focusGain: move.focusGain,
    evasionGain: move.evasionGain,
    guardPierce: move.guardPierce,
    bonusBelowHalf: move.bonusBelowHalf,
    bonusVsGuard: move.bonusVsGuard,
    heal: move.heal,
  }))))
  assert.equal(new Set(profiles).size, ANIMALS.length)
  assert.deepEqual(ANIMALS.map(({ strength }) => strength), [7, 10, 5, 8, 10, 11, 5, 9, 9, 8, 7, 8, 10, 7, 11, 8, 9, 5, 5, 8])
  assert.deepEqual(ANIMALS.map(({ defense }) => defense), [6, 7, 4, 10, 9, 8, 4, 8, 7, 6, 6, 10, 7, 6, 8, 6, 8, 4, 4, 9])
  assert.deepEqual(ANIMALS.map(({ speed }) => speed), [7, 4, 10, 5, 3, 3, 9, 5, 4, 6, 7, 5, 4, 7, 3, 6, 6, 10, 10, 5])
  assert.deepEqual(ANIMALS.map(({ health }) => health), [40, 48, 30, 44, 52, 56, 36, 60, 50, 46, 38, 45, 49, 42, 58, 47, 54, 34, 28, 41])
  assert.equal(new Set(ANIMALS.map(({ health }) => health)).size, ANIMALS.length)
})

test('every animal has a complete visual set and unique home arena', () => {
  assert.equal(new Set(ANIMALS.map(({ home }) => home)).size, ANIMALS.length)
  for (const animal of ANIMALS) {
    assert.ok(animal.home, `${animal.name} needs a home arena name`)
    assert.ok(existsSync(new URL(`../public/animals/${animal.id}-portrait.webp`, import.meta.url)), `${animal.name} needs a portrait image`)
    assert.ok(existsSync(new URL(`../public/animals/${animal.id}-fighter.webp`, import.meta.url)), `${animal.name} needs a fighter image`)
    assert.ok(existsSync(new URL(`../public/animals/arena-${animal.id}.webp`, import.meta.url)), `${animal.name} needs a home arena image`)
  }
})

test('expanded roster includes the requested fighters in display order', () => {
  assert.deepEqual(ANIMALS.slice(10).map(({ id }) => id), [
    'wolf', 'komodo-dragon', 'lion', 'anaconda', 'water-buffalo',
    'shark', 'orca', 'ostrich', 'falcon', 'octopus',
  ])
})

test('bear fighters have unique roster identities and sprite columns', () => {
  const grizzly = ANIMALS.find(({ id }) => id === 'grizzly-bear')
  const polar = ANIMALS.find(({ id }) => id === 'polar-bear')

  assert.deepEqual({ name: grizzly.name, col: grizzly.col }, { name: 'Grizzly Bear', col: 8 })
  assert.deepEqual({ name: polar.name, col: polar.col }, { name: 'Polar Bear', col: 9 })
  assert.notDeepEqual(grizzly.moves, polar.moves)
})

test('fighters start at their animal health cap and healing respects it', () => {
  const eagle = createFighter(ANIMALS[2])
  const crocodile = createFighter(ANIMALS[3])
  assert.equal(eagle.health, 30)
  assert.equal(crocodile.health, 44)

  const woundedCrocodile = { ...crocodile, health: 43 }
  const defense = resolveAction([woundedCrocodile, eagle], 0, ANIMALS[3].moves[3], () => 0)
  assert.equal(defense.players[0].health, 44)
})

test('size scaling keeps the wide health range from deciding damage races', () => {
  const tiger = createFighter(ANIMALS[0])
  const eagle = createFighter(ANIMALS[2])
  const elephant = createFighter(ANIMALS[7])
  const move = ANIMALS[0].moves[0]

  const eagleHit = resolveAction([tiger, { ...eagle, animal: { ...eagle.animal, defense: 6 } }], 0, move, () => 0)
  const elephantHit = resolveAction([tiger, { ...elephant, animal: { ...elephant.animal, defense: 6 } }], 0, move, () => 0)
  assert.equal(eagle.health - eagleHit.players[1].health, 3)
  assert.equal(elephant.health - elephantHit.players[1].health, 6)
})

test('defense persistently scales damage separately from temporary guard', () => {
  assert.equal(defenseMultiplier(3), 1.03)
  assert.equal(defenseMultiplier(6), 1)
  assert.equal(defenseMultiplier(10), 0.96)

  const tiger = createFighter(ANIMALS[0])
  const fragileTarget = { ...createFighter(ANIMALS[0]), animal: { ...ANIMALS[0], defense: 3 } }
  const armoredTarget = { ...createFighter(ANIMALS[0]), animal: { ...ANIMALS[0], defense: 10 } }
  const move = ANIMALS[0].moves[2]
  const fragileHit = resolveAction([tiger, fragileTarget], 0, move, () => 0)
  const armoredHit = resolveAction([tiger, armoredTarget], 0, move, () => 0)
  assert.equal(fragileTarget.health - fragileHit.players[1].health, 15)
  assert.equal(armoredTarget.health - armoredHit.players[1].health, 14)

  const guardedTarget = { ...armoredTarget, guard: 0.45 }
  const piercedHit = resolveAction([createFighter(ANIMALS[1]), guardedTarget], 0, ANIMALS[1].moves[1], () => 0)
  assert.equal(guardedTarget.health - piercedHit.players[1].health, 9)
})

test('strength changes displayed and resolved damage ranges', () => {
  const tigerRange = getDamageRange(ANIMALS[0], ANIMALS[0].moves[0])
  const gorillaRange = getDamageRange(ANIMALS[1], ANIMALS[1].moves[0])
  assert.deepEqual(tigerRange, { min: 4, max: 6, hits: 1 })
  assert.deepEqual(gorillaRange, { min: 7, max: 9, hits: 1 })
})

test('speed controls initiative and can earn the faster animal another move', () => {
  let players = [createFighter(ANIMALS[2]), createFighter(ANIMALS[1])]
  let active = getOpeningActor([ANIMALS[2], ANIMALS[1]], () => 0)
  const turns = []

  for (let turn = 0; turn < 12; turn += 1) {
    turns.push(active)
    const result = resolveAction(players, active, players[active].animal.moves[0], () => 0.999)
    players = result.players
    active = result.nextActive
  }

  assert.equal(turns[0], 0)
  assert.ok(turns.some((actor, index) => index > 0 && actor === turns[index - 1]), 'faster Eagle should eventually act twice in succession')
})

test('unique defensive and attack effects resolve correctly', () => {
  let players = [createFighter(ANIMALS[0]), createFighter(ANIMALS[1])]
  const defense = resolveAction(players, 0, ANIMALS[0].moves[3], () => 0)
  players = defense.players
  assert.equal(players[0].guard, 0.45)
  assert.equal(players[0].focus, 0.18)
  assert.equal(players[0].defenseReady, false)

  const guardPiercingHit = resolveAction(players, 1, ANIMALS[1].moves[1], () => 0)
  players = guardPiercingHit.players
  assert.equal(players[0].health, ANIMALS[0].health - 9)
  assert.equal(players[0].guard, 0)

  const tigerFocusBuilder = resolveAction(players, 0, ANIMALS[0].moves[0], () => 0)
  assert.equal(tigerFocusBuilder.players[0].focus, 0.12)

  const eagle = createFighter(ANIMALS[2])
  const target = createFighter(ANIMALS[3])
  const eagleDodge = resolveAction([eagle, target], 0, ANIMALS[2].moves[0], () => 0)
  assert.equal(eagleDodge.players[0].evasion, 0.15)
})

test('CPU only chooses legal moves and waits for defense to recharge', () => {
  const cpu = createFighter(ANIMALS[0])
  const opponent = createFighter(ANIMALS[1])
  cpu.defenseReady = false

  assert.equal(getLegalMoves(cpu).length, 3)
  for (let roll = 0; roll <= 10; roll += 1) {
    const move = chooseCpuMove([opponent, cpu], 1, () => roll / 10)
    assert.equal(move.type, 'attack')
  }

  const attack = resolveAction([opponent, cpu], 1, cpu.animal.moves[0], () => 0)
  assert.equal(attack.players[1].defenseReady, true)
  assert.equal(getLegalMoves(attack.players[1]).length, 4)
})

test('CPU choices respond to battle state and retain tactical variety', () => {
  const healthyCpu = createFighter(ANIMALS[1])
  const opponent = createFighter(ANIMALS[0])
  const finishingTarget = { ...opponent, health: 7 }
  const reliableChoice = chooseCpuMove([finishingTarget, healthyCpu], 1, () => 0)
  assert.equal(reliableChoice.name, 'Knuckle Jab')

  const pressuredCpu = { ...healthyCpu, health: 5 }
  const defensiveChoice = chooseCpuMove([opponent, pressuredCpu], 1, () => 0.99)
  assert.equal(defensiveChoice.type, 'defend')

  const variedChoices = new Set()
  let state = 987654321
  const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296)
  for (let turn = 0; turn < 100; turn += 1) {
    variedChoices.add(chooseCpuMove([opponent, healthyCpu], 1, random).name)
  }
  assert.ok(variedChoices.size >= 2, `expected varied choices, got ${[...variedChoices].join(', ')}`)
})

function simulateMatch(animalA, animalB, random, chooseMove = (players, active) => {
  const legalMoves = getLegalMoves(players[active])
  return legalMoves[Math.floor(random() * legalMoves.length)]
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
  throw new Error('match stalled')
}

test('all ordered matchups finish under common move strategies', () => {
  let state = 975318642
  const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296)
  const strategies = [
    ['reliable attacks', (players, active) => getLegalMoves(players[active]).find((move) => move.type === 'attack')],
    ['power attacks', (players, active) => getLegalMoves(players[active]).findLast((move) => move.type === 'attack')],
    ['tactical CPU', (players, active, roll) => chooseCpuMove(players, active, roll)],
  ]

  for (const [name, chooseMove] of strategies) {
    let totalTurns = 0
    let matches = 0
    for (const animalA of ANIMALS) {
      for (const animalB of ANIMALS) {
        if (animalA === animalB) continue
        for (let game = 0; game < 30; game += 1) {
          const result = simulateMatch(animalA, animalB, random, chooseMove)
          totalTurns += result.turns
          matches += 1
        }
      }
    }
    const averageTurns = totalTurns / matches
    assert.ok(averageTurns > 7 && averageTurns < 20, `${name} averaged ${averageTurns} turns`)
  }
})

test('seeded matchup simulation has no dominant animal or hard-counter matchup', () => {
  let state = 123456789
  const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296)
  const wins = Object.fromEntries(ANIMALS.map((animal) => [animal.id, 0]))
  const games = Object.fromEntries(ANIMALS.map((animal) => [animal.id, 0]))
  const pairResults = new Map()
  let totalTurns = 0
  let totalGames = 0

  for (const animalA of ANIMALS) {
    for (const animalB of ANIMALS) {
      if (animalA === animalB) continue
      let playerOneWins = 0
      for (let game = 0; game < 600; game += 1) {
        const result = simulateMatch(animalA, animalB, random)
        const { winner } = result
        const winningAnimal = winner === 0 ? animalA : animalB
        wins[winningAnimal.id] += 1
        games[animalA.id] += 1
        games[animalB.id] += 1
        if (winner === 0) playerOneWins += 1
        totalTurns += result.turns
        totalGames += 1
      }
      pairResults.set(`${animalA.id}:${animalB.id}`, playerOneWins / 600)
    }
  }

  const balanceFailures = []
  for (const animal of ANIMALS) {
    const winRate = wins[animal.id] / games[animal.id]
    if (winRate <= 0.46 || winRate >= 0.54) balanceFailures.push(`${animal.name} overall win rate was ${winRate}`)
  }

  for (let first = 0; first < ANIMALS.length; first += 1) {
    for (let second = first + 1; second < ANIMALS.length; second += 1) {
      const animalA = ANIMALS[first]
      const animalB = ANIMALS[second]
      const aAsPlayerOne = pairResults.get(`${animalA.id}:${animalB.id}`)
      const bAsPlayerOne = pairResults.get(`${animalB.id}:${animalA.id}`)
      const animalAWinRate = (aAsPlayerOne + (1 - bAsPlayerOne)) / 2
      if (animalAWinRate <= 0.41 || animalAWinRate >= 0.59) balanceFailures.push(`${animalA.name} vs ${animalB.name} was ${animalAWinRate}`)
    }
  }

  assert.deepEqual(balanceFailures, [])

  const averageTurns = totalTurns / totalGames
  assert.ok(averageTurns > 12 && averageTurns < 14, `random-strategy matches averaged ${averageTurns} turns`)
})

test('CPU turn progression can complete full matches with every animal', () => {
  let state = 246813579
  const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296)

  for (const cpuAnimal of ANIMALS) {
    const humanAnimal = ANIMALS.find((animal) => animal !== cpuAnimal)
    let players = [createFighter(humanAnimal), createFighter(cpuAnimal)]
    let active = getOpeningActor([humanAnimal, cpuAnimal], random)
    let winner = null

    for (let turn = 0; turn < 300 && winner === null; turn += 1) {
      const move = active === 1
        ? chooseCpuMove(players, active, random)
        : getLegalMoves(players[active])[0]
      assert.ok(getLegalMoves(players[active]).includes(move))
      const result = resolveAction(players, active, move, random)
      players = result.players
      winner = result.winner
      if (winner === null) active = result.nextActive
    }

    assert.notEqual(winner, null, `${cpuAnimal.name} match should finish`)
  }
})
