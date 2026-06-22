// Removes near-white backgrounds from PNGs and saves results to a sibling
// folder so originals are never overwritten.
// Usage: node tools/remove-white-bg.mjs [input-dir] [output-dir]
// Defaults: public/assets/resource-icons-cute-64/sources -> public/assets/resource-icons-cute-64
import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join, basename } from 'path'

const inputDir  = process.argv[2] ?? 'public/assets/resource-icons-cute-64/sources'
const outputDir = process.argv[3] ?? 'public/assets/resource-icons-cute-64'

// How close to white a pixel must be to be erased (0-255 per channel).
const THRESHOLD = 30

const files = (await readdir(inputDir)).filter(f => f.endsWith('.png'))
console.log(`Processing ${files.length} files: ${inputDir} -> ${outputDir}`)

for (const file of files) {
  const src = join(inputDir, file)
  const dst = join(outputDir, basename(file))

  const image = sharp(src).ensureAlpha()
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info  // channels == 4 (RGBA)

  for (let i = 0; i < width * height; i++) {
    const idx = i * channels
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    if (r >= 255 - THRESHOLD && g >= 255 - THRESHOLD && b >= 255 - THRESHOLD) {
      data[idx + 3] = 0  // set alpha to transparent
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(dst)

  console.log(`  ✓ ${file}`)
}
console.log('Done.')
