// Retint the normal (anrelia) sea texture to the cold/warm icon palettes and
// regenerate the blend sets of every city whose surface tiles changed.
// Blend-set logic ported from tools/build-themed-map-tiles-from-imagegen.mjs
// (and the mintaka seam parameters from tools/build-arctic-map-tiles-from-imagegen.mjs).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 64;
const HEX = '0123456789ABCDEF';
const USED = 'public/assets/used/map-tiles';
const LIB_TILES = 'public/assets/lib/tiles';

const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const hash01 = (x, y, salt = 0) => {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
};
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

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

// Build a 256-entry dark->light color ramp from the icon's interior pixels.
async function paletteRamp(iconFile) {
  const img = await sharp(iconFile).extract({ left: 200, top: 200, width: 854, height: 854 })
    .raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { data } = img;
  const px = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    px.push([data[i], data[i + 1], data[i + 2], lum(data[i], data[i + 1], data[i + 2])]);
  }
  px.sort((a, b) => a[3] - b[3]);
  const ramp = [];
  for (let k = 0; k < 256; k++) {
    const lo = Math.floor((k / 256) * px.length);
    const hi = Math.max(lo + 1, Math.floor(((k + 1) / 256) * px.length));
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = lo; i < hi && i < px.length; i++) { r += px[i][0]; g += px[i][1]; b += px[i][2]; n++; }
    ramp.push([r / n, g / n, b / n]);
  }
  // Light smoothing so quantile noise doesn't band.
  const sm = ramp.map((_, k) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let d = -3; d <= 3; d++) {
      const q = clamp(k + d, 0, 255);
      r += ramp[q][0]; g += ramp[q][1]; b += ramp[q][2]; n++;
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  });
  return sm;
}

// Rank-based luminance transfer: pixel's brightness percentile in the base
// texture picks the ramp color, so the wave structure is untouched.
async function recolor(baseFile, ramp, outFile) {
  const base = await rawRgba(baseFile);
  const n = base.width * base.height;
  const order = Array.from({ length: n }, (_, i) => i);
  const lums = new Float64Array(n);
  for (let i = 0; i < n; i++) lums[i] = lum(base.data[i * 4], base.data[i * 4 + 1], base.data[i * 4 + 2]);
  order.sort((a, b) => lums[a] - lums[b]);
  const pixels = new Uint8ClampedArray(n * 4);
  for (let rank = 0; rank < n; rank++) {
    const i = order[rank];
    const c = ramp[Math.min(255, Math.floor((rank / (n - 1)) * 256))];
    pixels[i * 4] = c[0];
    pixels[i * 4 + 1] = c[1];
    pixels[i * 4 + 2] = c[2];
    pixels[i * 4 + 3] = 255;
  }
  await writeRawPng(outFile, pixels, base.width, base.height);
}

function maskValue(mask, x, y) {
  const qNW = mask & 1 ? 1 : 0;
  const qNE = mask & 2 ? 1 : 0;
  const qSE = mask & 4 ? 1 : 0;
  const qSW = mask & 8 ? 1 : 0;
  const nx = x / (SIZE - 1);
  const ny = y / (SIZE - 1);
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
  await writePreview4x4(dir);
  await writeSampleMap(dir);
}

async function writePreview4x4(dir) {
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
}

async function writeSampleMap(dir) {
  const layout = ['FFFFEEEE', 'FFEECCCE', 'FEECC88E', 'EECC000C', 'CC00000C', 'E88000CC', 'ECCC88EE', 'EEEEFFFF'];
  const composites = [];
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      composites.push({ input: `${dir}/${layout[y][x]}.png`, left: x * SIZE, top: y * SIZE });
    }
  }
  await sharp({ create: { width: 8 * SIZE, height: 8 * SIZE, channels: 4, background: '#101820ff' } })
    .composite(composites).png().toFile(`${dir}/_preview-sample-map.png`);
}

// ---- 1. Retint seas from the normal (anrelia) texture ----
const seas = [
  { city: 'mintaka', icon: `${LIB_TILES}/sea/surface-icon-cold-v1.png` },
  { city: 'solara', icon: `${LIB_TILES}/sea/surface-icon-warm-v1.png` },
];
for (const { city, icon } of seas) {
  const ramp = await paletteRamp(icon);
  await recolor(`${USED}/anrelia/surfaces/sea/main.png`, ramp, `${USED}/${city}/surfaces/sea/main.png`);
  await recolor(`${USED}/anrelia/surfaces/sea/alternative-1.png`, ramp, `${USED}/${city}/surfaces/sea/alternative-1.png`);
  await fs.copyFile(`${USED}/${city}/surfaces/sea/main.png`, `${USED}/${city}/sea.png`);
  console.log(`retinted sea: ${city} <- ${path.basename(icon)}`);
}

// ---- 2. Regenerate blend sets from the current surface tiles ----
const SEAMS = {
  mintaka: { color: [242, 252, 255, 255], base: 0.24, mul: 2.8 },
  jinlin: { color: [220, 238, 192, 255], base: 0.18, mul: 2.3 },
  columbia: { color: [238, 218, 170, 255], base: 0.18, mul: 2.3 },
  solara: { color: [255, 230, 150, 255], base: 0.18, mul: 2.3 },
};
for (const city of ['mintaka', 'jinlin', 'columbia', 'solara']) {
  const out = `${USED}/${city}`;
  const seam = SEAMS[city];
  await writeBlendSet(`${out}/blend/sand-sea`, `${out}/surfaces/sea/main.png`, `${out}/surfaces/sand/main.png`, true, seam);
  await writeBlendSet(`${out}/blend/grass-sand`, `${out}/surfaces/sand/main.png`, `${out}/surfaces/grass/main.png`, false, seam);
  await writeBlendSet(`${out}/blend/dirt-grass`, `${out}/surfaces/grass/main.png`, `${out}/surfaces/rock-grass/main.png`, false, seam);
  console.log(`rebuilt blends: ${city}`);
}
console.log('done');
