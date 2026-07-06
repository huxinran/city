// Give jinlin (east) and columbia (west) the main city's (anrelia) sand tiles,
// then rebuild their sand-involving blend sets from the updated surfaces.
// Blend logic shared with tools/retint-seas-and-rebuild-blends.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 64;
const HEX = '0123456789ABCDEF';
const USED = 'public/assets/used/map-tiles';

const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const hash01 = (x, y, salt = 0) => {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
};

async function rawRgba(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: Uint8ClampedArray.from(data), width: info.width, height: info.height };
}

async function writeRawPng(file, pixels, width = SIZE, height = SIZE) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

function maskValue(mask, x, y) {
  const qNW = mask & 1 ? 1 : 0, qNE = mask & 2 ? 1 : 0, qSE = mask & 4 ? 1 : 0, qSW = mask & 8 ? 1 : 0;
  const nx = x / (SIZE - 1), ny = y / (SIZE - 1);
  return qNW * (1 - nx) * (1 - ny) + qNE * nx * (1 - ny) + qSE * nx * ny + qSW * (1 - nx) * ny;
}

function sampleNearest(raw, x, y) {
  const sx = clamp(Math.round(x), 0, raw.width - 1);
  const sy = clamp(Math.round(y), 0, raw.height - 1);
  const idx = (sy * raw.width + sx) * 4;
  return [raw.data[idx], raw.data[idx + 1], raw.data[idx + 2], raw.data[idx + 3]];
}

function blendColor(a, b, t) {
  return [Math.round(mix(a[0], b[0], t)), Math.round(mix(a[1], b[1], t)), Math.round(mix(a[2], b[2], t)), 255];
}

async function writeBlendSet(dir, lowFile, highFile, bit1IsLow, seam) {
  const low = await rawRgba(lowFile);
  const high = await rawRgba(highFile);
  for (let mask = 0; mask < 16; mask++) {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = maskValue(mask, x, y);
        const jitter = x < 2 || y < 2 || x > SIZE - 3 || y > SIZE - 3 ? 0 : (hash01(x, y, mask) - 0.5) * 0.14;
        const bitSide = v + jitter >= 0.5;
        const highSide = bit1IsLow ? !bitSide : bitSide;
        const base = sampleNearest(highSide ? high : low, x, y);
        const s = Math.abs(v - 0.5);
        const color = s < 0.075 ? blendColor(base, seam.color, seam.base + (0.075 - s) * seam.mul) : base;
        pixels.set(color, (y * SIZE + x) * 4);
      }
    }
    await writeRawPng(`${dir}/${HEX[mask]}.png`, pixels);
  }
  await writePreviews(dir);
}

async function writePreviews(dir) {
  const composites = [];
  for (let mask = 0; mask < 16; mask++) {
    composites.push({
      input: await sharp(`${dir}/${HEX[mask]}.png`).resize(96, 96, { kernel: 'nearest' }).toBuffer(),
      left: (mask % 4) * 96,
      top: Math.floor(mask / 4) * 96,
    });
  }
  await sharp({ create: { width: 384, height: 384, channels: 4, background: '#101820ff' } })
    .composite(composites).png().toFile(`${dir}/_preview-4x4.png`);
  const layout = ['FFFFEEEE', 'FFEECCCE', 'FEECC88E', 'EECC000C', 'CC00000C', 'E88000CC', 'ECCC88EE', 'EEEEFFFF'];
  const mapComposites = [];
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      mapComposites.push({ input: `${dir}/${layout[y][x]}.png`, left: x * SIZE, top: y * SIZE });
    }
  }
  await sharp({ create: { width: 8 * SIZE, height: 8 * SIZE, channels: 4, background: '#101820ff' } })
    .composite(mapComposites).png().toFile(`${dir}/_preview-sample-map.png`);
}

const SEAMS = {
  jinlin: { color: [220, 238, 192, 255], base: 0.18, mul: 2.3 },
  columbia: { color: [238, 218, 170, 255], base: 0.18, mul: 2.3 },
};
for (const city of ['jinlin', 'columbia']) {
  for (const name of ['main.png', 'alternative-1.png']) {
    await fs.copyFile(`${USED}/anrelia/surfaces/sand/${name}`, `${USED}/${city}/surfaces/sand/${name}`);
  }
  await fs.copyFile(`${USED}/${city}/surfaces/sand/main.png`, `${USED}/${city}/sand.png`);
  const out = `${USED}/${city}`;
  const seam = SEAMS[city];
  await writeBlendSet(`${out}/blend/sand-sea`, `${out}/surfaces/sea/main.png`, `${out}/surfaces/sand/main.png`, true, seam);
  await writeBlendSet(`${out}/blend/grass-sand`, `${out}/surfaces/sand/main.png`, `${out}/surfaces/grass/main.png`, false, seam);
  console.log(`sand copied + blends rebuilt: ${city}`);
}
console.log('done');
