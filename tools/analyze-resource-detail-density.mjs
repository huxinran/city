import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const rootArg = args.find((a) => !a.startsWith('--')) ?? 'public/assets/lib/resources';
const outArg = args.find((a) => a.startsWith('--out='));
const root = path.resolve(rootArg);
const outDir = path.resolve(outArg ? outArg.split('=')[1] : 'tmp/resource-detail-density');

const GRID = 64;
const ALPHA_MIN = 24;
const BG_TOL = 42;
const QUANT = 28;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'old_versions') return [];
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    if (!/\.png$/i.test(entry.name)) return [];
    if (/-density-v1\.png$/i.test(entry.name)) return [];
    return [p];
  });
}

function isWhiteBg(r, g, b) {
  return r > 242 && g > 242 && b > 242 && Math.max(r, g, b) - Math.min(r, g, b) < 18;
}

function dist2(data, i, color) {
  const dr = data[i] - color[0];
  const dg = data[i + 1] - color[1];
  const db = data[i + 2] - color[2];
  return dr * dr + dg * dg + db * db;
}

function detectBorderBackgrounds(data, width, height, channels) {
  const buckets = new Map();
  let borderTotal = 0;
  const add = (i) => {
    borderTotal++;
    if (data[i + 3] <= ALPHA_MIN) return;
    const key = `${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`;
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

  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .filter((b) => b.n >= borderTotal * 0.15)
    .slice(0, 3)
    .map((b) => [b.r / b.n, b.g / b.n, b.b / b.n]);
}

function makeForegroundMask(data, width, height, channels) {
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += channels) {
    if (data[i] < 250) {
      hasAlpha = true;
      break;
    }
  }

  const mask = new Uint8Array(width * height);
  if (hasAlpha) {
    for (let p = 0; p < width * height; p++) {
      if (data[p * channels + 3] > ALPHA_MIN) mask[p] = 1;
    }
    return mask;
  }

  const backgrounds = detectBorderBackgrounds(data, width, height, channels);
  const bgCandidate = new Uint8Array(width * height);
  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    bgCandidate[p] =
      isWhiteBg(data[i], data[i + 1], data[i + 2]) ||
      backgrounds.some((color) => dist2(data, i, color) < BG_TOL * BG_TOL)
        ? 1
        : 0;
  }

  const seen = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p] || !bgCandidate[p]) return;
    seen[p] = 1;
    stack.push(p);
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
    const x = p % width;
    const y = (p / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let p = 0; p < width * height; p++) mask[p] = seen[p] ? 0 : 1;
  return mask;
}

async function analyzeFile(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (width !== 1254 || height !== 1254) return null;

  const mask = makeForegroundMask(data, width, height, channels);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 1);
      maxY = Math.max(maxY, y + 1);
    }
  }
  if (maxX < 0) return null;

  const cropW = maxX - minX;
  const cropH = maxY - minY;
  const crop = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize(GRID, GRID, { kernel: 'nearest' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const maskCrop = Buffer.alloc(cropW * cropH);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      maskCrop[y * cropW + x] = mask[(minY + y) * width + minX + x] ? 255 : 0;
    }
  }
  const resizedMask = await sharp(maskCrop, { raw: { width: cropW, height: cropH, channels: 1 } })
    .resize(GRID, GRID, { kernel: 'nearest' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const gridMask = new Uint8Array(GRID * GRID);
  const colors = new Array(GRID * GRID);
  for (let p = 0; p < GRID * GRID; p++) {
    let maskValue = 0;
    for (let c = 0; c < resizedMask.info.channels; c++) {
      maskValue = Math.max(maskValue, resizedMask.data[p * resizedMask.info.channels + c]);
    }
    if (maskValue <= ALPHA_MIN) continue;
    const i = p * crop.info.channels;
    gridMask[p] = 1;
    colors[p] = `${Math.floor(crop.data[i] / QUANT)},${Math.floor(crop.data[i + 1] / QUANT)},${Math.floor(crop.data[i + 2] / QUANT)}`;
  }

  let components = 0;
  let smallComponents = 0;
  let area = 0;
  const seen = new Uint8Array(GRID * GRID);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const p = y * GRID + x;
      if (!gridMask[p] || seen[p]) continue;
      components++;
      let componentArea = 0;
      const color = colors[p];
      const stack = [p];
      seen[p] = 1;
      while (stack.length) {
        const current = stack.pop();
        const cx = current % GRID;
        const cy = (current / GRID) | 0;
        componentArea++;
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
          const next = ny * GRID + nx;
          if (!gridMask[next] || seen[next] || colors[next] !== color) continue;
          seen[next] = 1;
          stack.push(next);
        }
      }
      area += componentArea;
      if (componentArea <= 5) smallComponents++;
    }
  }

  let transitions = 0;
  let checks = 0;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const p = y * GRID + x;
      if (!gridMask[p]) continue;
      if (x + 1 < GRID && gridMask[p + 1]) {
        checks++;
        if (colors[p] !== colors[p + 1]) transitions++;
      }
      if (y + 1 < GRID && gridMask[p + GRID]) {
        checks++;
        if (colors[p] !== colors[p + GRID]) transitions++;
      }
    }
  }

  const componentDensity = components / (area / 1000);
  const smallDensity = smallComponents / (area / 1000);
  const transitionDensity = checks ? transitions / checks : 0;
  const detailScore = componentDensity * 0.65 + smallDensity * 0.20 + transitionDensity * 120;

  return {
    rel: path.relative(root, file).split(path.sep).join('/'),
    area,
    components,
    smallComponents,
    componentDensity,
    smallDensity,
    transitionDensity,
    detailScore,
  };
}

function csvValue(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

async function makeContactSheet(rows, mean) {
  const cellW = 190;
  const cellH = 126;
  const cols = 5;
  const width = cols * cellW;
  const height = Math.ceil(rows.length / cols) * cellH;
  const composites = [];
  const svg = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`];
  svg.push('<rect width="100%" height="100%" fill="#f5f4ef"/>');
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const x = (i % cols) * cellW;
    const y = Math.floor(i / cols) * cellH;
    const thumb = await sharp(path.join(root, row.rel))
      .resize(64, 64, { fit: 'contain', background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .png()
      .toBuffer();
    composites.push({ input: thumb, left: x + 63, top: y + 6 });
    svg.push(`<text x="${x + 6}" y="${y + 88}" font-family="Arial" font-size="12" fill="#28231e">${row.rel.replace(/\.png$/i, '').slice(0, 26)}</text>`);
    svg.push(`<text x="${x + 6}" y="${y + 108}" font-family="Arial" font-size="12" fill="#5a4b37">score ${row.detailScore.toFixed(0)} ${(row.detailScore / mean).toFixed(2)}x</text>`);
  }
  svg.push('</svg>');
  composites.push({ input: Buffer.from(svg.join('')), left: 0, top: 0 });
  await sharp({ create: { width, height, channels: 3, background: '#f5f4ef' } })
    .composite(composites)
    .png()
    .toFile(path.join(outDir, 'detail-density-contact-sheet.png'));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const rows = (await Promise.all(walk(root).map(analyzeFile))).filter(Boolean);
  rows.sort((a, b) => a.detailScore - b.detailScore);
  const scores = rows.map((r) => r.detailScore);
  const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const stdev = Math.sqrt(scores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / scores.length);
  const low = mean - stdev * 1.25;
  const high = mean + stdev * 1.25;

  const fields = [
    'rel',
    'area',
    'components',
    'small_components',
    'component_density',
    'small_density',
    'transition_density',
    'detail_score',
    'ratio',
    'z',
    'outlier',
  ];
  const csv = [
    fields.join(','),
    ...rows.map((row) => {
      const values = {
        rel: row.rel,
        area: row.area,
        components: row.components,
        small_components: row.smallComponents,
        component_density: row.componentDensity,
        small_density: row.smallDensity,
        transition_density: row.transitionDensity,
        detail_score: row.detailScore,
        ratio: row.detailScore / mean,
        z: stdev ? (row.detailScore - mean) / stdev : 0,
        outlier: row.detailScore < low || row.detailScore > high ? 'yes' : '',
      };
      return fields.map((field) => csvValue(typeof values[field] === 'number' ? values[field].toFixed(6) : values[field])).join(',');
    }),
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'detail-density-report.csv'), csv + '\n');
  await makeContactSheet(rows, mean);
  console.log(`analyzed ${rows.length} source pngs in ${rootArg}`);
  console.log(`detail score average: ${mean.toFixed(2)}; stdev: ${stdev.toFixed(2)}`);
  console.log(`outlier threshold: <${low.toFixed(2)} or >${high.toFixed(2)}`);
  console.log(`wrote ${path.join(outDir, 'detail-density-report.csv')}`);
  console.log(`wrote ${path.join(outDir, 'detail-density-contact-sheet.png')}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
