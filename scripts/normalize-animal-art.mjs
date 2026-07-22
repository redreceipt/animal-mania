import { mkdir } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'

import sharp from 'sharp'

import {
  CHARACTER_PIXEL_SCALE,
  CHARACTER_SIZE,
  DEPRECATED_CHARACTER_PIXEL_SCALE,
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

const pixelsMatch = (data, first, second) => (
  data[first] === data[second]
  && data[first + 1] === data[second + 1]
  && data[first + 2] === data[second + 2]
  && data[first + 3] === data[second + 3]
)

const followsGrid = ({ data, info }, scale) => {
  if (info.width % scale !== 0 || info.height % scale !== 0) return false

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (x % scale === 0 && y % scale === 0) continue
      const pixel = (y * info.width + x) * 4
      const anchorX = x - (x % scale)
      const anchorY = y - (y % scale)
      const anchor = (anchorY * info.width + anchorX) * 4
      if (!pixelsMatch(data, pixel, anchor)) return false
    }
  }

  return true
}

const scale2x = ({ data, info }) => {
  const width = info.width * 2
  const height = info.height * 2
  const output = Buffer.alloc(width * height * 4)
  const sourceIndex = (x, y) => (
    (Math.max(0, Math.min(info.height - 1, y)) * info.width
      + Math.max(0, Math.min(info.width - 1, x))) * 4
  )

  const writePixel = (x, y, pixel) => {
    data.copy(output, (y * width + x) * 4, pixel, pixel + 4)
  }

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const center = sourceIndex(x, y)
      const above = sourceIndex(x, y - 1)
      const left = sourceIndex(x - 1, y)
      const right = sourceIndex(x + 1, y)
      const below = sourceIndex(x, y + 1)
      const canRefine = !pixelsMatch(data, above, below) && !pixelsMatch(data, left, right)

      writePixel(x * 2, y * 2, canRefine && pixelsMatch(data, left, above) ? left : center)
      writePixel(x * 2 + 1, y * 2, canRefine && pixelsMatch(data, above, right) ? right : center)
      writePixel(x * 2, y * 2 + 1, canRefine && pixelsMatch(data, left, below) ? left : center)
      writePixel(x * 2 + 1, y * 2 + 1, canRefine && pixelsMatch(data, below, right) ? right : center)
    }
  }

  return { data: output, info: { width, height, channels: 4 } }
}

const isDeprecatedGridSource = (
  source.info.width === CHARACTER_SIZE
  && source.info.height === CHARACTER_SIZE
  && followsGrid(source, DEPRECATED_CHARACTER_PIXEL_SCALE)
)
const isCurrentGridSource = (
  source.info.width === CHARACTER_SIZE
  && source.info.height === CHARACTER_SIZE
  && followsGrid(source, CHARACTER_PIXEL_SCALE)
)

const logical = isDeprecatedGridSource
  ? scale2x(await sharp(source.data, { raw: source.info })
      .resize(
        CHARACTER_SIZE / DEPRECATED_CHARACTER_PIXEL_SCALE,
        CHARACTER_SIZE / DEPRECATED_CHARACTER_PIXEL_SCALE,
        { kernel: sharp.kernel.nearest },
      )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }))
  : await sharp(source.data, { raw: source.info })
      .resize(LOGICAL_CHARACTER_SIZE, LOGICAL_CHARACTER_SIZE, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: isCurrentGridSource ? sharp.kernel.nearest : sharp.kernel.lanczos3,
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
  + `${MAX_CHARACTER_COLORS}-color maximum${isDeprecatedGridSource ? ', refined deprecated 4x source' : isCurrentGridSource ? ', preserved current grid' : ''}).`,
)
