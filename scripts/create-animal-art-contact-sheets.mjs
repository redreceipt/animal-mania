import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import sharp from 'sharp'

import { ANIMALS } from '../src/game.js'
import {
  CHARACTER_VARIANTS,
  LEGACY_CHARACTER_IDS,
  arenaAssetPath,
  characterAssetPath,
} from './animal-art-spec.mjs'

const outputFlagIndex = process.argv.indexOf('--output-dir')
const outputArgument = outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : '.art-review'

if (!outputArgument) {
  console.error('Usage: npm run art:sheet -- [--output-dir <directory>]')
  process.exit(1)
}

const outputDirectory = resolve(outputArgument)

const legacyIds = new Set(LEGACY_CHARACTER_IDS)
const background = '#111827'
const textColor = '#f8fafc'
const strictColor = '#facc15'

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const labelSvg = (width, height, animal) => Buffer.from(`
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${background}"/>
    <text x="50%" y="18" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="13" fill="${legacyIds.has(animal.id) ? textColor : strictColor}">
      ${escapeXml(animal.name)}
    </text>
  </svg>
`)

const headerSvg = (width, title, legend) => Buffer.from(`
  <svg width="${width}" height="52" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#07111f"/>
    <text x="16" y="23" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="${textColor}">
      ${escapeXml(title)}
    </text>
    <text x="16" y="42" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8">
      ${escapeXml(legend)}
    </text>
  </svg>
`)

const createSheet = async ({ title, legend, output, columns, tileWidth, tileHeight, renderTile }) => {
  const rows = Math.ceil(ANIMALS.length / columns)
  const width = columns * tileWidth
  const tiles = await Promise.all(ANIMALS.map(renderTile))
  const composites = [
    { input: headerSvg(width, title, legend), left: 0, top: 0 },
    ...tiles.map((input, index) => ({
      input,
      left: (index % columns) * tileWidth,
      top: 52 + Math.floor(index / columns) * tileHeight,
    })),
  ]

  await sharp({
    create: {
      width,
      height: 52 + rows * tileHeight,
      channels: 4,
      background,
    },
  }).composite(composites).png().toFile(output)
}

const createCharacterTile = (variant, tileWidth, tileHeight) => async (animal) => {
  const image = await sharp(characterAssetPath(animal.id, variant))
    .resize(tileWidth - 16, tileHeight - 36, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.nearest,
    })
    .png()
    .toBuffer()

  return sharp({
    create: { width: tileWidth, height: tileHeight, channels: 4, background },
  }).composite([
    { input: image, left: 8, top: 2 },
    { input: labelSvg(tileWidth, 28, animal), left: 0, top: tileHeight - 30 },
  ]).png().toBuffer()
}

const createArenaTile = (tileWidth, tileHeight) => async (animal) => {
  const image = await sharp(arenaAssetPath(animal.id))
    .resize(tileWidth - 16, tileHeight - 38, { fit: 'cover', kernel: sharp.kernel.nearest })
    .png()
    .toBuffer()

  return sharp({
    create: { width: tileWidth, height: tileHeight, channels: 4, background },
  }).composite([
    { input: image, left: 8, top: 4 },
    { input: labelSvg(tileWidth, 28, animal), left: 0, top: tileHeight - 30 },
  ]).png().toBuffer()
}

await mkdir(outputDirectory, { recursive: true })

for (const variant of CHARACTER_VARIANTS) {
  const tileWidth = 176
  const tileHeight = 196
  await createSheet({
    title: `${variant[0].toUpperCase()}${variant.slice(1)} roster`,
    legend: 'Cream: frozen legacy reference  |  Gold: exact character grid contract',
    output: resolve(outputDirectory, `${variant}s.png`),
    columns: 7,
    tileWidth,
    tileHeight,
    renderTile: createCharacterTile(variant, tileWidth, tileHeight),
  })
}

await createSheet({
  title: 'Arena roster',
  legend: 'Cream: original roster  |  Gold: recent roster additions',
  output: resolve(outputDirectory, 'arenas.png'),
  columns: 4,
  tileWidth: 324,
  tileHeight: 170,
  renderTile: createArenaTile(324, 170),
})

console.log(`Wrote animal art review sheets to ${outputDirectory}`)
