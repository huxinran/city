import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith('--target='));
const suffixArg = args.find((a) => a.startsWith('--suffix='));
const targetCells = targetArg ? Number(targetArg.split('=')[1]) : 1819;
const suffix = suffixArg ? suffixArg.split('=')[1] : 'density-v1';
const files = args.filter((a) => !a.startsWith('--'));

const GRID = 64;
const ALPHA_MIN = 24;
const BG_TOLERANCE = 42;
const BG_TOLERANCE2 = BG_TOLERANCE * BG_TOLERANCE;
const MIN_BORDER_FRAC = 0.15;

function dist2(data, i, color) {
  const dr = data[i] - color[0];
  const dg = data[i + 1] - color[1];
  const db = data[i + 2] - color[2];
  return dr * dr + dg * dg + db * db;
}

function detectBgColors(data, width, height, channels) {
  const buckets = new Map();
  const q = 16;
  let borderTotal = 0;
  const add = (i) => {
    borderTotal++;
    if (data[i + 3] <= ALPHA_MIN) return;
    const key = `${(data[i] / q) | 0},${(data[i + 1] / q) | 0},${(data[i + 2] / q) | 0}`;
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
    bucket.n++;
    buckets.set(key, bucket);
  };
  for (let x = 0; x < width; x++) {
    add(x * channels);
    add(((height - 1) * width + x) * channels);
  }
  for (let y = 0; y < height; y++) {
    add((y * width) * channels);
    add((y * width + width - 1) * channels);
  }

  const min = borderTotal * MIN_BORDER_FRAC;
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .filter((b) => b.n >= min)
    .slice(0, 3)
    .map((b) => [b.r / b.n, b.g / b.n, b.b / b.n]);
}

function edgeBackgroundMask(data, width, height, channels, bgColors) {
  const isBg = (p) => {
    const i = p * channels;
    return data[i + 3] <= ALPHA_MIN || bgColors.some((color) => dist2(data, i, color) <= BG_TOLERANCE2);
  };
  const seen = new Uint8Array(width * height);
  const bg = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p]) return;
    seen[p] = 1;
    if (isBg(p)) stack.push(p);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    bg[p] = 1;
    const x = p % width;
    const y = (p / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return bg;
}

async function loadCutout(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let hasUsefulAlpha = false;
  for (let i = 3; i < data.length; i += channels) {
    if (data[i] < 250) {
      hasUsefulAlpha = true;
      break;
    }
  }

  if (!hasUsefulAlpha) {
    const bgColors = detectBgColors(data, width, height, channels);
    const bg = edgeBackgroundMask(data, width, height, channels, bgColors);
    for (let p = 0; p < width * height; p++) {
      if (bg[p]) data[p * channels + 3] = 0;
      else data[p * channels + 3] = 255;
    }
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const mask = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (data[p * channels + 3] <= ALPHA_MIN) continue;
      mask[p] = 255;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 1);
      maxY = Math.max(maxY, y + 1);
    }
  }

  if (maxX < 0) throw new Error(`No depicted pixels found: ${file}`);
  return { data, info, mask, bbox: { minX, minY, maxX, maxY } };
}

async function countCells(mask, width, height) {
  const { data, info } = await sharp(mask, { raw: { width, height, channels: 1 } })
    .resize(GRID, GRID, { kernel: 'nearest' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let cells = 0;
  for (let p = 0; p < info.width * info.height; p++) {
    let occupied = false;
    for (let c = 0; c < info.channels; c++) occupied ||= data[p * info.channels + c] > ALPHA_MIN;
    if (occupied) cells++;
  }
  return cells;
}

function nextOutput(file) {
  const dir = path.dirname(file);
  const stem = path.basename(file, '.png');
  let candidate = path.join(dir, `${stem}-${suffix}.png`);
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${stem}-${suffix}-${n}.png`);
    n++;
  }
  return candidate;
}

async function normalize(file) {
  const { data, info, mask, bbox } = await loadCutout(file);
  const { width, height, channels } = info;
  const cellsBefore = await countCells(mask, width, height);
  const cropW = bbox.maxX - bbox.minX;
  const cropH = bbox.maxY - bbox.minY;
  const scale = Math.max(0.62, Math.min(1.42, Math.sqrt(targetCells / cellsBefore)));
  const outW = Math.max(1, Math.min(width, Math.round(cropW * scale)));
  const outH = Math.max(1, Math.min(height, Math.round(cropH * scale)));
  const centerX = (bbox.minX + bbox.maxX) / 2;
  const centerY = (bbox.minY + bbox.maxY) / 2;
  const left = Math.max(0, Math.min(width - outW, Math.round(centerX - outW / 2)));
  const top = Math.max(0, Math.min(height - outH, Math.round(centerY - outH / 2)));

  const cropped = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: bbox.minX, top: bbox.minY, width: cropW, height: cropH })
    .resize(outW, outH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const output = nextOutput(file);
  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: cropped, left, top }]).png().toFile(output);

  const after = await loadCutout(output);
  const cellsAfter = await countCells(after.mask, after.info.width, after.info.height);
  console.log(`${path.relative(process.cwd(), file)} ${cellsBefore} -> ${cellsAfter} (${scale.toFixed(2)}x) => ${path.relative(process.cwd(), output)}`);
}

if (!files.length) {
  console.error('Usage: node tools/normalize-resource-density.mjs --target=1819 <png> [more.png]');
  process.exit(1);
}

for (const file of files) {
  await normalize(path.resolve(file));
}
