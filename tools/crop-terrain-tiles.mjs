// Crops each terrain tile to the center 1/2 width x 1/2 height (1/4 area),
// then resizes to 64x64. Originals in sources/ are untouched.
import sharp from 'sharp'

const srcDir = 'public/assets/map-tiles-cute-64/sources'
const dstDir = 'public/assets/map-tiles-cute-64'
const files = ['grass.png', 'sand.png', 'sea.png', 'cobblestone-road.png']

for (const file of files) {
  const meta = await sharp(`${srcDir}/${file}`).metadata()
  const cropW = Math.floor(meta.width / 4)
  const cropH = Math.floor(meta.height / 4)
  const left  = Math.floor((meta.width  - cropW) / 2)
  const top   = Math.floor((meta.height - cropH) / 2)

  await sharp(`${srcDir}/${file}`)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(64, 64, { kernel: 'nearest' })
    .png()
    .toFile(`${dstDir}/${file}`)

  console.log(`✓ ${file}  (cropped ${cropW}x${cropH} -> 64x64)`)
}
console.log('Done.')
