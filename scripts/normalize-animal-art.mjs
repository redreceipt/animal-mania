import { mkdir } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'

import sharp from 'sharp'

import {
  CHARACTER_PIXEL_SCALE,
  CHARACTER_SIZE,
  LOGICAL_CHARACTER_SIZE,
  MAX_CHARACTER_COLORS,
} from './animal-art-spec.mjs'

const [inputArgument, outputArgument] = process.argv.slice(2)

if (!inputArgument || !outputArgument || process.argv.length !== 4) {
  console.error('Usage: npm run art:normalize -- <transparent-source> <output.webp>')
  process.exit(1)
}

const input = resolve(inputArgument)
const output = resolve(outputArgument)

if (extname(output).toLowerCase() !== '.webp') {
  console.error('The normalized output path must end in .webp')
  process.exit(1)
}

const source = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
let hasTransparentPixel = false
let hasVisiblePixel = false

for (let index = 3; index < source.data.length; index += 4) {
  if (source.data[index] === 0) hasTransparentPixel = true
  if (source.data[index] > 0) hasVisiblePixel = true
}

if (!hasTransparentPixel || !hasVisiblePixel) {
  console.error('Source must contain both a visible subject and a transparent background')
  process.exit(1)
}

const logical = await sharp(source.data, { raw: source.info })
  .resize(LOGICAL_CHARACTER_SIZE, LOGICAL_CHARACTER_SIZE, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3,
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

for (let index = 0; index < logical.data.length; index += 4) {
  if (logical.data[index + 3] < 128) {
    logical.data[index] = 0
    logical.data[index + 1] = 0
    logical.data[index + 2] = 0
    logical.data[index + 3] = 0
  } else {
    logical.data[index + 3] = 255
  }
}

const indexed = await sharp(logical.data, { raw: logical.info })
  .png({ palette: true, colors: MAX_CHARACTER_COLORS, dither: 0 })
  .toBuffer()

await mkdir(dirname(output), { recursive: true })
await sharp(indexed)
  .resize(CHARACTER_SIZE, CHARACTER_SIZE, {
    fit: 'fill',
    kernel: sharp.kernel.nearest,
  })
  .webp({ lossless: true, alphaQuality: 100 })
  .toFile(output)

console.log(
  `Normalized ${inputArgument} to ${outputArgument} `
  + `(${LOGICAL_CHARACTER_SIZE}px logical canvas, ${CHARACTER_PIXEL_SCALE}x pixels, `
  + `${MAX_CHARACTER_COLORS}-color maximum).`,
)
