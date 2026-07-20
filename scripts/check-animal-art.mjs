import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import sharp from 'sharp'

import { ANIMALS } from '../src/game.js'
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  CHARACTER_PIXEL_SCALE,
  CHARACTER_SIZE,
  CHARACTER_VARIANTS,
  FIGHTER_STYLE_ANCHOR_IDS,
  LEGACY_CHARACTER_IDS,
  MAX_CHARACTER_COLORS,
  arenaAssetPath,
  characterAssetPath,
} from './animal-art-spec.mjs'

const failures = []
const hashes = new Map()
const legacyIds = new Set(LEGACY_CHARACTER_IDS)
const animalIds = new Set(ANIMALS.map(({ id }) => id))
const legacyBaseline = JSON.parse(
  await readFile(new URL('./legacy-animal-art-baseline.json', import.meta.url), 'utf8'),
)

const fail = (path, message) => failures.push(`${path}: ${message}`)

for (const id of FIGHTER_STYLE_ANCHOR_IDS) {
  if (!animalIds.has(id)) {
    fail('scripts/animal-art-spec.mjs', `fighter style anchor ${id} is not in the roster`)
  }
  if (!legacyIds.has(id)) {
    fail(
      'scripts/animal-art-spec.mjs',
      `fighter style anchor ${id} must remain a frozen legacy asset until a full-roster direction change`,
    )
  }
}

const recordUniqueAsset = async (path, family) => {
  const digest = createHash('sha256').update(await readFile(path)).digest('hex')
  const key = `${family}:${digest}`
  const previous = hashes.get(key)
  if (previous) fail(path, `duplicates ${previous}`)
  else hashes.set(key, path)
  return digest
}

const inspectPixels = async (path) => {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const colors = new Set()
  const alphas = new Set()
  let hotMagentaPixels = 0
  let visiblePixels = 0
  let left = info.width
  let right = -1
  let top = info.height
  let bottom = -1
  let followsLogicalGrid = true

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * 4
      const red = data[index]
      const green = data[index + 1]
      const blue = data[index + 2]
      const alpha = data[index + 3]

      colors.add(`${red},${green},${blue},${alpha}`)
      alphas.add(alpha)

      if (alpha > 0) {
        visiblePixels += 1
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }

      if (alpha > 0 && red >= 180 && blue >= 160 && green <= 60 && Math.abs(red - blue) <= 100) {
        hotMagentaPixels += 1
      }

      if (x % CHARACTER_PIXEL_SCALE !== 0 || y % CHARACTER_PIXEL_SCALE !== 0) {
        const anchorX = x - (x % CHARACTER_PIXEL_SCALE)
        const anchorY = y - (y % CHARACTER_PIXEL_SCALE)
        const anchor = (anchorY * info.width + anchorX) * 4
        if (
          red !== data[anchor]
          || green !== data[anchor + 1]
          || blue !== data[anchor + 2]
          || alpha !== data[anchor + 3]
        ) followsLogicalGrid = false
      }
    }
  }

  return {
    alphas,
    colors: colors.size,
    followsLogicalGrid,
    hotMagentaPixels,
    visiblePixels,
    bounds: { left, right, top, bottom },
    width: info.width,
    height: info.height,
  }
}

const checkCharacter = async (animal, variant) => {
  const path = characterAssetPath(animal.id, variant)
  let metadata

  try {
    metadata = await sharp(path).metadata()
  } catch (error) {
    fail(path, error.message)
    return
  }

  if (metadata.format !== 'webp') fail(path, 'must be a WebP image')
  if (metadata.width !== CHARACTER_SIZE || metadata.height !== CHARACTER_SIZE) {
    fail(path, `must be ${CHARACTER_SIZE} x ${CHARACTER_SIZE}`)
  }
  if (!metadata.hasAlpha) fail(path, 'must include transparency')

  const pixels = await inspectPixels(path)
  if (!pixels.alphas.has(0)) fail(path, 'must include transparent background pixels')
  if (!pixels.alphas.has(255)) fail(path, 'must include fully opaque subject pixels')
  if (pixels.hotMagentaPixels > 0) {
    fail(path, `contains ${pixels.hotMagentaPixels} visible hot-magenta key pixels`)
  }

  if (!legacyIds.has(animal.id)) {
    if (pixels.alphas.size !== 2 || !pixels.alphas.has(0) || !pixels.alphas.has(255)) {
      fail(path, 'must use binary alpha with only fully transparent or fully opaque pixels')
    }
    if (!pixels.followsLogicalGrid) {
      fail(path, `${CHARACTER_PIXEL_SCALE} x ${CHARACTER_PIXEL_SCALE} logical-pixel grid is broken`)
    }
    if (pixels.colors > MAX_CHARACTER_COLORS) {
      fail(path, `uses ${pixels.colors} RGBA colors; maximum is ${MAX_CHARACTER_COLORS}`)
    }

    const coverage = pixels.visiblePixels / (pixels.width * pixels.height)
    if (variant === 'fighter') {
      const margins = {
        left: pixels.bounds.left,
        right: pixels.width - 1 - pixels.bounds.right,
        top: pixels.bounds.top,
        bottom: pixels.height - 1 - pixels.bounds.bottom,
      }
      if (coverage < 0.15 || coverage > 0.55) {
        fail(path, `fighter coverage ${(coverage * 100).toFixed(1)}% must stay between 15% and 55%`)
      }
      for (const [side, margin] of Object.entries(margins)) {
        if (margin < CHARACTER_PIXEL_SCALE) fail(path, `fighter needs at least one logical pixel of ${side} margin`)
      }
    } else {
      if (coverage < 0.35 || coverage > 0.75) {
        fail(path, `portrait coverage ${(coverage * 100).toFixed(1)}% must stay between 35% and 75%`)
      }
      if (pixels.bounds.top < CHARACTER_PIXEL_SCALE) {
        fail(path, 'portrait needs at least one logical pixel of top margin')
      }
    }
  }

  const digest = await recordUniqueAsset(path, variant)
  if (legacyIds.has(animal.id)) {
    const baselineKey = `${animal.id}-${variant}`
    const expectedDigest = legacyBaseline[baselineKey]
    if (!expectedDigest) {
      fail(path, `has no frozen legacy baseline for ${baselineKey}`)
    } else if (digest !== expectedDigest) {
      fail(
        path,
        'changed a frozen legacy reference; normalize the pair and remove its id from LEGACY_CHARACTER_IDS',
      )
    }
  }
}

const checkArena = async (animal) => {
  const path = arenaAssetPath(animal.id)
  let metadata

  try {
    metadata = await sharp(path).metadata()
  } catch (error) {
    fail(path, error.message)
    return
  }

  if (metadata.format !== 'webp') fail(path, 'must be a WebP image')
  if (metadata.width !== ARENA_WIDTH || metadata.height !== ARENA_HEIGHT) {
    fail(path, `must be ${ARENA_WIDTH} x ${ARENA_HEIGHT}`)
  }
  if (metadata.hasAlpha) fail(path, 'must be an opaque image')

  await recordUniqueAsset(path, 'arena')
}

for (const animal of ANIMALS) {
  for (const variant of CHARACTER_VARIANTS) await checkCharacter(animal, variant)
  await checkArena(animal)
}

if (failures.length > 0) {
  console.error(`Animal art contract failed with ${failures.length} problem${failures.length === 1 ? '' : 's'}:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  const strictPairs = ANIMALS.filter(({ id }) => !legacyIds.has(id)).length
  console.log(
    `Animal art contract passed for ${ANIMALS.length} animals: `
    + `${ANIMALS.length * CHARACTER_VARIANTS.length} character assets, ${ANIMALS.length} arenas, `
    + `${strictPairs} grid-enforced character pairs.`,
  )
}
