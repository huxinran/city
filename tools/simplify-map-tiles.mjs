// Simplify the per-city map tile sets to three surfaces: sea, sand, grass
// (where the "grass" slot holds grass / snow / dirt art depending on the city).
// The dirt-grass blend layer and rock-grass surfaces are removed everywhere;
// map generation never produces Terrain.DIRT, so nothing is lost on the map.
//
//   anrelia / jinlin / columbia  — share anrelia's original set unchanged
//   mintaka (arctic)             — blue sea + COLD sand remap + snow
//   solara  (africa)             — green sea + HOT sand remap + original dirt
//
// Cold/hot sand tiles are HSV remaps of anrelia's sand, using the exact same
// transforms as lib/tiles/sand/surface-icon-{cold,hot}-v1.png. Blend sets are
// regenerated with the same corner-Wang builder as
// tools/build-themed-map-tiles-from-imagegen.mjs.
//
// Usage: node tools/simplify-map-tiles.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 64;
const HEX = '0123456789ABCDEF';
const USED = 'public/assets/used/map-tiles';
const ARCHIVE = 'public/assets/lib/map-tiles/archive-2026-07-05-pre-simplify';

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });
const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const hash01 = (x, y, salt = 0) => {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
};

// ---- HSV remaps (must match the lib/tiles/sand icon variants) --------------

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const [r, g, b] = [
    [v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q],
  ][i % 6];
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const COLD = (h, s, v) => [0.575, Math.min(1, s * 0.22 + 0.02), v + (1 - v) * 0.45];
const HOT = (h, s, v) => [Math.max(h - 0.033, 0), s * 0.88, v + (1 - v) * 0.16];

async function remapFile(src, dst, fn) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    const [nh, ns, nv] = fn(h, s, v);
    const [r, g, b] = hsvToRgb(nh, Math.min(Math.max(ns, 0), 1), Math.min(Math.max(nv, 0), 1));
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
  await ensureDir(path.dirname(dst));
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(dst);
}

// ---- blend set builder (same construction as the themed builder) -----------

async function rawRgba(file) {
  const { data, info } = await sharp(file)
    .resize(SIZE, SIZE, { fit: 'fill', kernel: 'nearest' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: Uint8ClampedArray.from(data), width: info.width, height: info.height };
}

function sampleNearest(raw, x, y) {
  const idx = (clamp(Math.round(y), 0, raw.height - 1) * raw.width + clamp(Math.round(x), 0, raw.width - 1)) * 4;
  return [raw.data[idx], raw.data[idx + 1], raw.data[idx + 2], raw.data[idx + 3]];
}

function blendColor(a, b, t) {
  return [Math.round(mix(a[0], b[0], t)), Math.round(mix(a[1], b[1], t)), Math.round(mix(a[2], b[2], t)), 255];
}

function maskValue(mask, x, y) {
  const nx = x / (SIZE - 1), ny = y / (SIZE - 1);
  return (mask & 1 ? 1 : 0) * (1 - nx) * (1 - ny)
       + (mask & 2 ? 1 : 0) * nx * (1 - ny)
       + (mask & 4 ? 1 : 0) * nx * ny
       + (mask & 8 ? 1 : 0) * (1 - nx) * ny;
}

async function writeRawPng(file, pixels) {
  await ensureDir(path.dirname(file));
  await sharp(Buffer.from(pixels), { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

async function writeBlendSet(dir, lowFile, highFile, bit1IsLow, title, lowName, highName, seamColor) {
  await fs.rm(dir, { recursive: true, force: true });
  await ensureDir(dir);
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
        const seam = Math.abs(v - 0.5);
        const color = seam < 0.075 ? blendColor(base, seamColor, 0.18 + (0.075 - seam) * 2.3) : base;
        pixels.set(color, (y * SIZE + x) * 4);
      }
    }
    await writeRawPng(`${dir}/${HEX[mask]}.png`, pixels);
  }
  await fs.writeFile(`${dir}/README.md`, [
    `# ${title}`,
    '',
    '- Tile size: `64x64`',
    '- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`',
    `- Bit value: \`1\` means ${bit1IsLow ? lowName : highName}`,
    `- Bit value: \`0\` means ${bit1IsLow ? highName : lowName}`,
    '',
    'Built by `tools/simplify-map-tiles.mjs` from the city surface tiles.',
    '',
  ].join('\n'));
}

// ---- per-city work ----------------------------------------------------------

const exists = (p) => fs.access(p).then(() => true, () => false);

async function archiveCity(city) {
  const dst = `${ARCHIVE}/${city}`;
  if (await exists(dst)) return; // idempotent re-runs keep the first archive
  await ensureDir(path.dirname(dst));
  await fs.cp(`${USED}/${city}`, dst, { recursive: true });
}

async function dropDirtLayer(city) {
  await fs.rm(`${USED}/${city}/surfaces/rock-grass`, { recursive: true, force: true });
  await fs.rm(`${USED}/${city}/blend/dirt-grass`, { recursive: true, force: true });
}

async function averageHex(file) {
  const { data } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const sum = [0, 0, 0];
  const n = data.length / (data.length % 3 === 0 ? 3 : 4);
  const ch = data.length / n;
  for (let i = 0; i < data.length; i += ch) { sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; }
  return '#' + sum.map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
}

async function main() {
  for (const city of ['anrelia', 'jinlin', 'columbia', 'mintaka', 'solara']) await archiveCity(city);

  // Main / Asia / America: one shared set — anrelia's original art, minus dirt.
  for (const city of ['jinlin', 'columbia']) {
    await fs.rm(`${USED}/${city}`, { recursive: true, force: true });
    await fs.cp(`${USED}/anrelia`, `${USED}/${city}`, { recursive: true });
  }

  // Arctic (mintaka): keep blue sea + snow, swap in COLD sand, rebuild blends.
  const A = `${USED}/anrelia`, M = `${USED}/mintaka`, S = `${USED}/solara`;
  await remapFile(`${A}/surfaces/sand/main.png`, `${M}/surfaces/sand/main.png`, COLD);
  await remapFile(`${A}/surfaces/sand/alternative-1.png`, `${M}/surfaces/sand/alternative-1.png`, COLD);
  await writeBlendSet(`${M}/blend/sand-sea`, `${M}/surfaces/sea/main.png`, `${M}/surfaces/sand/main.png`, true,
    'Arctic Simplified: Sea To Shore', 'arctic blue sea', 'cold sand', [214, 233, 244, 255]);
  await writeBlendSet(`${M}/blend/grass-sand`, `${M}/surfaces/sand/main.png`, `${M}/surfaces/grass/main.png`, false,
    'Arctic Simplified: Snow On Shore', 'cold sand', 'snow', [235, 244, 250, 255]);

  // Africa (solara): keep green sea, swap in HOT sand, land = the original
  // map's dirt (anrelia rock-grass), rebuild blends.
  await remapFile(`${A}/surfaces/sand/main.png`, `${S}/surfaces/sand/main.png`, HOT);
  await remapFile(`${A}/surfaces/sand/alternative-1.png`, `${S}/surfaces/sand/alternative-1.png`, HOT);
  await fs.rm(`${S}/surfaces/grass`, { recursive: true, force: true });
  await ensureDir(`${S}/surfaces/grass`);
  await fs.copyFile(`${ARCHIVE}/anrelia/surfaces/rock-grass/main.png`, `${S}/surfaces/grass/main.png`);
  await fs.copyFile(`${ARCHIVE}/anrelia/surfaces/rock-grass/alternative-1.png`, `${S}/surfaces/grass/alternative-1.png`);
  await writeBlendSet(`${S}/blend/sand-sea`, `${S}/surfaces/sea/main.png`, `${S}/surfaces/sand/main.png`, true,
    'Africa Simplified: Sea To Shore', 'green sea', 'warm sand', [255, 230, 150, 255]);
  await writeBlendSet(`${S}/blend/grass-sand`, `${S}/surfaces/sand/main.png`, `${S}/surfaces/grass/main.png`, false,
    'Africa Simplified: Dirt On Shore', 'warm sand', 'dirt', [255, 230, 150, 255]);

  for (const city of ['anrelia', 'jinlin', 'columbia', 'mintaka', 'solara']) await dropDirtLayer(city);

  // Placeholder colours for map-canvas CITY_TERRAIN_COLOR.
  for (const [label, file] of [
    ['mintaka sand', `${M}/surfaces/sand/main.png`],
    ['solara sand', `${S}/surfaces/sand/main.png`],
    ['solara grass(dirt)', `${S}/surfaces/grass/main.png`],
  ]) console.log(label, 'avg', await averageHex(file));

  console.log('done — archived originals in', ARCHIVE);
}

await main();
