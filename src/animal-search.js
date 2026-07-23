function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isSubsequence(needle, candidate) {
  let needleIndex = 0
  for (const character of candidate) {
    if (character === needle[needleIndex]) needleIndex += 1
    if (needleIndex === needle.length) return true
  }
  return false
}

function editDistance(source, target) {
  let previousPrevious = null
  let previous = Array.from({ length: target.length + 1 }, (_, index) => index)

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    const current = [sourceIndex]
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1
      current[targetIndex] = Math.min(
        previous[targetIndex] + 1,
        current[targetIndex - 1] + 1,
        previous[targetIndex - 1] + substitutionCost,
      )

      const isTransposition = (
        sourceIndex > 1
        && targetIndex > 1
        && source[sourceIndex - 1] === target[targetIndex - 2]
        && source[sourceIndex - 2] === target[targetIndex - 1]
      )
      if (isTransposition) {
        current[targetIndex] = Math.min(current[targetIndex], previousPrevious[targetIndex - 2] + 1)
      }
    }
    previousPrevious = previous
    previous = current
  }

  return previous[target.length]
}

function matchesWord(term, word) {
  if (word.includes(term) || (term.length > 1 && isSubsequence(term, word))) return true
  const tolerance = term.length >= 8 ? 2 : term.length >= 4 ? 1 : 0
  return editDistance(term, word) <= tolerance
}

export function matchesAnimalSearch(animal, query) {
  const normalizedQuery = normalizeSearch(query)
  if (!normalizedQuery) return true

  const normalizedName = normalizeSearch(animal.name)
  if (normalizedName.includes(normalizedQuery)) return true

  const nameWords = normalizedName.split(' ')
  return normalizedQuery
    .split(' ')
    .every((term) => nameWords.some((word) => matchesWord(term, word)))
}

export function searchAnimals(animals, query) {
  if (!normalizeSearch(query)) return animals
  return animals.filter((animal) => matchesAnimalSearch(animal, query))
}
