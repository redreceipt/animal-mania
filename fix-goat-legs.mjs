import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// Load goat fighter sprite
const goatBuffer = await sharp('./public/animals/goat-fighter.webp')
  .raw()
  .toBuffer({resolveWithObject: true});

const width = goatBuffer.info.width;
const height = goatBuffer.info.height;
const data = Uint8ClampedArray.from(goatBuffer.data); // Make mutable copy

// Find the bounding box of the visible character
let left = width, right = 0, top = height, bottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const alpha = data[(y * width + x) * 4 + 3];
    if (alpha > 0) {
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
}

console.log('Character bounds:', left, top, right, bottom);
console.log('Sprite size:', width, 'x', height);

// Detect leg-like structures: vertical connected components at the bottom
// Group visible pixels by column and find clusters
const columns = new Map();
for (let y = top; y <= bottom; y++) {
  for (let x = left; x <= right; x++) {
    if (data[(y * width + x) * 4 + 3] > 0) {
      if (!columns.has(x)) columns.set(x, []);
      columns.get(x).push(y);
    }
  }
}

// Find bottom edges of each column (approximate ground level per column)
const legColumns = [];
for (const [x, ys] of columns) {
  const sortedYs = ys.sort((a, b) => a - b);
  if (sortedYs.length > height * 0.1) { // tall vertical structures
    legColumns.push(x);
  }
}

// Count distinct "legs" by grouping nearby columns
const LEG_GAP_THRESHOLD = 8;
const legs = [];
let currentLeg = [];
legColumns.sort((a, b) => a - b).forEach(x => {
  if (currentLeg.length === 0 || x - currentLeg[currentLeg.length - 1] > LEG_GAP_THRESHOLD) {
    currentLeg = [x];
    legs.push(currentLeg);
  } else {
    currentLeg.push(x);
  }
});

console.log('Detected', legs.length, 'leg structures');
console.log('Leg widths:', legs.map(l => l.length));

// For a quadruped goat, we should have exactly 4 legs.
// If there are more, merge the closest pair of legs together.
if (legs.length > 4) {
  // Find the two legs that are closest together
  let minDist = Infinity;
  let closestPair = [0, 1];
  
  for (let i = 0; i < legs.length - 1; i++) {
    const dist = legs[i + 1][0] - legs[i][legs[i].length - 1];
    if (dist < minDist) {
      minDist = dist;
      closestPair = [i, i + 1];
    }
  }
  
  console.log('Merging legs at indices', closestPair);
  
  // Merge the two closest legs by filling in between them
  const legStartX = legs[closestPair[0]][legs[closestPair[0]].length - 1];
  const legEndX = legs[closestPair[1]][0];
  
  for (let x = legStartX; x <= legEndX; x++) {
    // Extend the upper leg down to ground
    for (let y = top; y <= bottom; y++) {
      if (data[(y * width + x) * 4 + 3] === 0) {
        // Pick a color from nearby columns
        const refCol = legs[closestPair[0]].includes(x) ? x : 
                       closestPair[0] < closestPair[1] ? legs[closestPair[0]][Math.floor(legs[closestPair[0]].length/2)] : legs[closestPair[1]][Math.floor(legs[closestPair[1]].length/2)];
        // Find nearest non-alpha pixel in this column
        for (let y2 = top; y2 <= bottom; y2++) {
          const idx = (y2 * width + x) * 4 + 3;
          if (data[idx] > 0) {
            // Copy color from nearby
            const refY = legs[closestPair[0]].includes(x) ? legStartX : legEndX;
            const refIdx = (y2 * width + refCol) * 4;
            data[(y * width + x) * 4] = data[refIdx];
            data[(y * width + x) * 4 + 1] = data[refIdx + 1];
            data[(y * width + x) * 4 + 2] = data[refIdx + 2];
            data[(y * width + x) * 4 + 3] = 255;
            break;
          }
        }
      }
    }
  }
  
  // Also add vertical fill between legs for a cleaner merge
  for (let y = bottom - 20; y <= bottom; y++) {
    for (let x = legStartX; x <= legEndX; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] === 0) {
        // Fill with nearest neighbor color
        let bestColor = null, bestDist = Infinity;
        for (let dy = -10; dy <= 10; dy++) {
          const ny = y + dy;
          if (ny < top || ny > bottom) continue;
          for (let dx = -5; dx <= 5; dx++) {
            const nx = x + dx;
            if (nx < left || nx > right) continue;
            const nidx = (ny * width + nx) * 4 + 3;
            if (data[nidx] > 0) {
              const d = Math.abs(dy) + Math.abs(dx);
              if (d < bestDist) {
                bestDist = d;
                bestColor = [data[nidx-3], data[nidx-2], data[nidx-1]];
              }
            }
          }
        }
        if (bestColor) {
          data[idx] = bestColor[0];
          data[idx + 1] = bestColor[1];
          data[idx + 2] = bestColor[2];
          data[idx + 3] = 255;
        }
      }
    }
  }
}

console.log('Fixed goat fighter saved.');
await sharp(data, {raw: {width, height, channels: 4}})
  .png()
  .toFile('./public/animals/goat-fighter-fixed.png');
