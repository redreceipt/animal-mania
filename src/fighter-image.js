const fighterGroundOffsets = new Map()

export const FIGHTER_GROUND_INSET_RATIO = 0.16

export function getGroundOffsetPercent(rgba, width, height, alphaThreshold = 8) {
  if (!width || !height) return 0

  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] > alphaThreshold) {
        const bottomInsetRatio = (height - 1 - y) / height
        return Math.max(0, bottomInsetRatio - FIGHTER_GROUND_INSET_RATIO) * 100
      }
    }
  }

  return 0
}

export function measureFighterGroundOffset(image) {
  const source = image.currentSrc || image.src
  if (fighterGroundOffsets.has(source)) return fighterGroundOffsets.get(source)

  let offset = 0
  try {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (context) {
      context.drawImage(image, 0, 0)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
      offset = getGroundOffsetPercent(pixels.data, canvas.width, canvas.height)
    }
  } catch {
    // Keep the asset's authored position if its pixels cannot be inspected.
  }

  fighterGroundOffsets.set(source, offset)
  return offset
}
