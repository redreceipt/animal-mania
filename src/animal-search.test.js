import assert from 'node:assert/strict'
import test from 'node:test'
import { searchAnimals } from './animal-search.js'
import { ANIMALS } from './game.js'

const namesFor = (query) => searchAnimals(ANIMALS, query).map(({ name }) => name)

test('blank animal searches preserve the full roster and display order', () => {
  assert.equal(searchAnimals(ANIMALS, '   '), ANIMALS)
})

test('animal search matches names without case or whitespace sensitivity', () => {
  assert.deepEqual(namesFor('  GREAT white SHARK  '), ['Great White Shark'])
  assert.deepEqual(namesFor('dragon'), ['Komodo Dragon'])
})

test('animal search tolerates missing letters and small typos', () => {
  assert.deepEqual(namesFor('plr ber'), ['Polar Bear'])
  assert.deepEqual(namesFor('gerat wite shrak'), ['Great White Shark'])
})

test('animal search returns matching fighters in roster order', () => {
  assert.deepEqual(namesFor('bear'), ['Grizzly Bear', 'Polar Bear'])
  assert.deepEqual(namesFor('not-an-animal'), [])
})
