import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const rootArg = args.find((a) => !a.startsWith('--')) ?? 'public/assets/lib/resources';
const outArg = args.find((a) => a.startsWith('--out='));
const thresholdArg = args.find((a) => a.startsWith('--threshold='));
const root = path.resolve(rootArg);
const outDir = path.resolve(outArg ? outArg.split('=')[1] : 'tmp/resource-density');
const threshold = thresholdArg ? Number(thresholdArg.split('=')[1]) : 0.25;

const GRID = 64;
const WHITE_BG_MIN = 242;
const WHITE_BG_CHROMA = 18;
const ALPHA_MIN = 24;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'old_versions') return [];
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return /\.png$/i.test(entry.name) ? [p] : [];
  });
}

function isWhiteBackground(r, g, b) {
  return (
    r > WHITE_BG_MIN &&
    g > WHITE_BG_MIN &&
    b > WHITE_BG_MIN &&
    Math.max(r, g, b) - Math.min(r, g, b) < WHITE_BG_CHROMA
  );
}

async function imageMask(file) {
  const image = sharp(file).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let hasUsefulAlpha = false;

  for (let i = 3; i < data.length; i += channels) {
    if (data[i] < 250) {
      hasUsefulAlpha = true;
      break;
    }
  }

  const mask = Buffer.alloc(width * height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * channels;
      const alpha = data[i + 3];
      const depicted = hasUsefulAlpha
        ? alpha > ALPHA_MIN
        : !isWhiteBackground(data[i], data[i + 1], data[i + 2]);
      if (!depicted) continue;
      mask[p] = 255;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 1);
      maxY = Math.max(maxY, y + 1);
    }
  }

  const { data: resized, info: resizedInfo } = await sharp(mask, { raw: { width, height, channels: 1 } })
    .resize(GRID, GRID, { kernel: 'nearest' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let cells = 0;
  for (let p = 0; p < resizedInfo.width * resizedInfo.height; p++) {
    const i = p * resizedInfo.channels;
    let occupied = false;
    for (let c = 0; c < resizedInfo.channels; c++) {
      occupied ||= resized[i + c] > ALPHA_MIN;
    }
    if (occupied) cells++;
  }

  return {
    width,
    height,
    hasUsefulAlpha,
    cells,
    bbox: maxX < 0 ? '' : `${minX},${minY},${maxX},${maxY}`,
  };
}

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdev(values, avg) {
  return Math.sqrt(values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length);
}

function csvValue(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

async function makeContactSheet(rows, file) {
  const cellW = 170;
  const cellH = 126;
  const cols = 5;
  const sheetW = cols * cellW;
  const sheetH = Math.ceil(rows.length / cols) * cellH;
  const composites = [];

  const svg = [`<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}">`];
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
    composites.push({ input: thumb, left: x + Math.floor((cellW - 64) / 2), top: y + 6 });
    const name = row.rel.replace(/\.png$/i, '').slice(0, 24);
    svg.push(`<text x="${x + 6}" y="${y + 88}" font-family="Arial" font-size="12" fill="#28231e">${name}</text>`);
    svg.push(`<text x="${x + 6}" y="${y + 108}" font-family="Arial" font-size="12" fill="#5a4b37">${row.cells} ${row.ratio.toFixed(2)}x</text>`);
  }

  svg.push('</svg>');
  composites.push({ input: Buffer.from(svg.join('')), left: 0, top: 0 });
  await sharp({
    create: { width: sheetW, height: sheetH, channels: 3, background: '#f5f4ef' },
  }).composite(composites).png().toFile(file);
}

async function main() {
  if (!fs.existsSync(root)) {
    throw new Error(`Resource directory does not exist: ${root}`);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const files = walk(root).sort();
  const rows = [];
  for (const file of files) {
    const metrics = await imageMask(file);
    rows.push({
      rel: path.relative(root, file).split(path.sep).join('/'),
      size: `${metrics.width}x${metrics.height}`,
      cells: metrics.cells,
      bbox: metrics.bbox,
      hasUsefulAlpha: metrics.hasUsefulAlpha,
    });
  }

  const commonSize = [...new Set(rows.map((r) => r.size))]
    .sort((a, b) => rows.filter((r) => r.size === b).length - rows.filter((r) => r.size === a).length)[0];
  const comparable = rows.filter((r) => r.size === commonSize);
  const avg = mean(comparable.map((r) => r.cells));
  const sigma = stdev(comparable.map((r) => r.cells), avg);
  const low = avg * (1 - threshold);
  const high = avg * (1 + threshold);

  for (const row of rows) {
    row.ratio = row.size === commonSize ? row.cells / avg : '';
    row.z = row.size === commonSize && sigma ? (row.cells - avg) / sigma : '';
    row.outlier = row.size === commonSize && (row.cells < low || row.cells > high) ? 'yes' : '';
  }

  const sorted = rows.toSorted((a, b) => {
    if (a.size !== commonSize && b.size === commonSize) return 1;
    if (a.size === commonSize && b.size !== commonSize) return -1;
    return a.cells - b.cells || a.rel.localeCompare(b.rel);
  });

  const csv = [
    ['rel', 'size', 'cells', 'ratio', 'z', 'outlier', 'bbox', 'hasUsefulAlpha'].join(','),
    ...sorted.map((r) => [
      r.rel,
      r.size,
      r.cells,
      typeof r.ratio === 'number' ? r.ratio.toFixed(4) : '',
      typeof r.z === 'number' ? r.z.toFixed(4) : '',
      r.outlier,
      r.bbox,
      r.hasUsefulAlpha,
    ].map(csvValue).join(',')),
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'density-report.csv'), csv + '\n');
  await makeContactSheet(sorted.filter((r) => r.size === commonSize), path.join(outDir, 'density-contact-sheet.png'));

  const outliers = sorted.filter((r) => r.outlier);
  console.log(`analyzed ${rows.length} pngs in ${rootArg}`);
  console.log(`common size: ${commonSize} (${comparable.length} files)`);
  console.log(`average depicted cells: ${avg.toFixed(2)}; stdev: ${sigma.toFixed(2)}`);
  console.log(`outlier threshold: ${(threshold * 100).toFixed(0)}% => <${low.toFixed(1)} or >${high.toFixed(1)}`);
  console.log(`outliers: ${outliers.length}`);
  console.log(`wrote ${path.join(outDir, 'density-report.csv')}`);
  console.log(`wrote ${path.join(outDir, 'density-contact-sheet.png')}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
