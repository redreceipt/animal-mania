import { ANIMALS } from '../src/game.js'
import { analyzeRosterBalance, getBudgetTotal, validateRoster } from '../src/balance.js'

const errors = validateRoster(ANIMALS)

console.log(`Roster contract: ${ANIMALS.length} fighters`)
console.table(ANIMALS.map((animal) => ({
  fighter: animal.name,
  archetype: animal.archetype,
  budget: getBudgetTotal(animal.budget),
})))

if (errors.length) {
  console.error('\nRoster validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('Roster validation passed. Running seeded matchup audit…')
  const report = analyzeRosterBalance(ANIMALS, { matchesPerOrder: 600 })
  console.table(report.overall.map(({ name, winRate }) => ({
    fighter: name,
    'win rate': `${(winRate * 100).toFixed(2)}%`,
  })))
  console.log(`${report.games.toLocaleString()} matches · ${report.averageTurns.toFixed(2)} average turns`)

  if (report.outliers.length) {
    console.error('Overall win-rate outliers:')
    for (const animal of report.outliers) console.error(`- ${animal.name}: ${(animal.winRate * 100).toFixed(2)}%`)
  }

  if (report.hardCounters.length) {
    console.error('Hard-counter matchups:')
    for (const matchup of report.hardCounters) {
      console.error(`- ${matchup.animalA} vs ${matchup.animalB}: ${(matchup.animalAWinRate * 100).toFixed(2)}%`)
    }
  }

  if (report.outliers.length || report.hardCounters.length) process.exitCode = 1
  else console.log('Balance audit passed: no dominant fighter or hard-counter matchup.')
}
