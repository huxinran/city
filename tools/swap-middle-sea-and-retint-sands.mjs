// One-shot session tool:
// 1. Swap the middle city's (anrelia) sea tiles with mintaka's cold blue sea.
// 2. Retint the normal (anrelia) sand texture to the cold/hot sand icon
//    palettes for mintaka / solara.
// 3. Rebuild mintaka + solara generated blend sets from the updated surfaces.
// 4. Recolor only the sea-hued pixels of anrelia's hand-crafted sand-sea blend
//    set to the cold blue palette (the set is reference-sampled art, not
//    generator output, so it must not be regenerated).
// Shares its ramp/blend logic with tools/retint-seas-and-rebuild-blends.mjs.
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
  return ramp.map((_, k) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let d = -3; d <= 3; d++) {
      const q = clamp(k + d, 0, 255);
      r += ramp[q][0]; g += ramp[q][1]; b += ramp[q][2]; n++;
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  });
}

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
    pixels.set([c[0], c[1], c[2], 255], i * 4);
  }
  await writeRawPng(outFile, pixels, base.width, base.height);
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

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, max === 0 ? 0 : d / max, max / 255];
}

// ---- 1. Swap anrelia (middle) sea <-> mintaka (cold blue) sea ----
// Read the teal sea into memory FIRST: the hand-crafted blend recolor below
// needs its luminance distribution, and step 4 runs after the files swap.
const tealSeaMain = await rawRgba(`${USED}/anrelia/surfaces/sea/main.png`);
for (const name of ['main.png', 'alternative-1.png']) {
  const a = await fs.readFile(`${USED}/anrelia/surfaces/sea/${name}`);
  const m = await fs.readFile(`${USED}/mintaka/surfaces/sea/${name}`);
  await fs.writeFile(`${USED}/anrelia/surfaces/sea/${name}`, m);
  await fs.writeFile(`${USED}/mintaka/surfaces/sea/${name}`, a);
}
await fs.copyFile(`${USED}/anrelia/surfaces/sea/main.png`, `${USED}/anrelia/sea.png`);
await fs.copyFile(`${USED}/mintaka/surfaces/sea/main.png`, `${USED}/mintaka/sea.png`);
console.log('swapped seas: anrelia <-> mintaka');

// ---- 2. Retint sands from the normal (anrelia) sand texture ----
const sands = [
  { city: 'mintaka', icon: `${LIB_TILES}/sand/surface-icon-cold-v1.png` },
  { city: 'solara', icon: `${LIB_TILES}/sand/surface-icon-hot-v1.png` },
];
for (const { city, icon } of sands) {
  const ramp = await paletteRamp(icon);
  await recolor(`${USED}/anrelia/surfaces/sand/main.png`, ramp, `${USED}/${city}/surfaces/sand/main.png`);
  await recolor(`${USED}/anrelia/surfaces/sand/alternative-1.png`, ramp, `${USED}/${city}/surfaces/sand/alternative-1.png`);
  await fs.copyFile(`${USED}/${city}/surfaces/sand/main.png`, `${USED}/${city}/sand.png`);
  console.log(`retinted sand: ${city} <- ${path.basename(icon)}`);
}

// ---- 3. Rebuild mintaka + solara generated blends ----
const SEAMS = {
  mintaka: { color: [242, 252, 255, 255], base: 0.24, mul: 2.8 },
  solara: { color: [255, 230, 150, 255], base: 0.18, mul: 2.3 },
};
for (const city of ['mintaka', 'solara']) {
  const out = `${USED}/${city}`;
  const seam = SEAMS[city];
  await writeBlendSet(`${out}/blend/sand-sea`, `${out}/surfaces/sea/main.png`, `${out}/surfaces/sand/main.png`, true, seam);
  await writeBlendSet(`${out}/blend/grass-sand`, `${out}/surfaces/sand/main.png`, `${out}/surfaces/grass/main.png`, false, seam);
  await writeBlendSet(`${out}/blend/dirt-grass`, `${out}/surfaces/grass/main.png`, `${out}/surfaces/rock-grass/main.png`, false, seam);
  console.log(`rebuilt blends: ${city}`);
}

// ---- 4. Recolor sea pixels of anrelia's hand-crafted sand-sea blend ----
// Sea-hued pixels (teal/cyan) get the cold blue palette by luminance
// percentile within the old teal sea; sand, foam and pebbles stay untouched.
const coldRamp = await paletteRamp(`${LIB_TILES}/sea/surface-icon-cold-v1.png`);
const tealLums = [];
for (let i = 0; i < tealSeaMain.width * tealSeaMain.height; i++) {
  tealLums.push(lum(tealSeaMain.data[i * 4], tealSeaMain.data[i * 4 + 1], tealSeaMain.data[i * 4 + 2]));
}
tealLums.sort((a, b) => a - b);
const percentile = (L) => {
  let lo = 0, hi = tealLums.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (tealLums[mid] < L) lo = mid + 1; else hi = mid; }
  return lo / tealLums.length;
};
const blendDir = `${USED}/anrelia/blend/sand-sea`;
for (const mask of HEX) {
  const tile = await rawRgba(`${blendDir}/${mask}.png`);
  const pixels = Uint8ClampedArray.from(tile.data);
  for (let i = 0; i < tile.width * tile.height; i++) {
    const r = pixels[i * 4], g = pixels[i * 4 + 1], b = pixels[i * 4 + 2];
    const [h, s, v] = rgbToHsv(r, g, b);
    if (h < 150 || h > 240 || s < 0.18 || v < 0.12) continue;
    const c = coldRamp[Math.min(255, Math.floor(percentile(lum(r, g, b)) * 256))];
    // Fade the remap in with saturation so shallow-water tints stay soft.
    const t = Math.min(1, (s - 0.18) / 0.14);
    pixels[i * 4] = Math.round(mix(r, c[0], t));
    pixels[i * 4 + 1] = Math.round(mix(g, c[1], t));
    pixels[i * 4 + 2] = Math.round(mix(b, c[2], t));
  }
  await writeRawPng(`${blendDir}/${mask}.png`, pixels, tile.width, tile.height);
}
await writePreviews(blendDir);
console.log('recolored anrelia hand-crafted sand-sea blend to cold blue');
console.log('done');
