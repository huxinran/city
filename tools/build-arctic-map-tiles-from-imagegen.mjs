import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'public/assets/used/map-tiles/arctic-city/imagegen-source-sheet.png';
const OUT = 'public/assets/used/map-tiles/arctic-city';
const LIB_OUT = 'public/assets/lib/map-tiles/arctic-city';
const REVIEW = 'public/assets/review';
const SIZE = 64;
const HEX = '0123456789ABCDEF';

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });
const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const hash01 = (x, y, salt = 0) => {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
};

const surfaceCrops = {
  sea: [
    { left: 80, top: 80, width: 220, height: 220 },
    { left: 40, top: 64, width: 220, height: 220 },
  ],
  ice: [
    { left: 430, top: 72, width: 220, height: 220 },
    { left: 490, top: 62, width: 220, height: 220 },
  ],
  snow: [
    { left: 790, top: 80, width: 220, height: 220 },
    { left: 830, top: 54, width: 220, height: 220 },
  ],
  rock: [
    { left: 1150, top: 88, width: 220, height: 220 },
    { left: 1120, top: 52, width: 220, height: 220 },
  ],
};

const roadCrops = {
  straight: { left: 62, top: 390, width: 255, height: 320 },
  corner: { left: 382, top: 390, width: 320, height: 320 },
  tee: { left: 738, top: 390, width: 320, height: 320 },
  cross: { left: 1094, top: 390, width: 320, height: 320 },
  end: { left: 382, top: 740, width: 320, height: 320 },
  isolated: { left: 1094, top: 740, width: 320, height: 320 },
};

async function writeSurface(crop, file) {
  await ensureDir(path.dirname(file));
  await sharp(SOURCE)
    .extract(crop)
    .resize(SIZE, SIZE, { fit: 'fill', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

async function rawRgba(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: Uint8ClampedArray.from(data), width: info.width, height: info.height };
}

async function writeRawPng(file, pixels, width = SIZE, height = SIZE) {
  await ensureDir(path.dirname(file));
  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

function sampleNearest(raw, x, y) {
  const sx = clamp(Math.round(x), 0, raw.width - 1);
  const sy = clamp(Math.round(y), 0, raw.height - 1);
  const idx = (sy * raw.width + sx) * 4;
  return [raw.data[idx], raw.data[idx + 1], raw.data[idx + 2], raw.data[idx + 3]];
}

function blendColor(a, b, t) {
  return [
    Math.round(mix(a[0], b[0], t)),
    Math.round(mix(a[1], b[1], t)),
    Math.round(mix(a[2], b[2], t)),
    255,
  ];
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

async function writeBlendSet(dir, lowFile, highFile, bit1IsLow, title, lowName, highName) {
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
        const color = seam < 0.075
          ? blendColor(base, [242, 252, 255, 255], 0.24 + (0.075 - seam) * 2.8)
          : base;
        pixels.set(color, (y * SIZE + x) * 4);
      }
    }
    await writeRawPng(`${dir}/${HEX[mask]}.png`, pixels);
  }
  await writePreview4x4(dir);
  await writeSampleMap(dir);
  await fs.writeFile(`${dir}/README.md`, [
    `# ${title}`,
    '',
    '- Tile size: `64x64`',
    '- Source: `imagegen-source-sheet.png`',
    '- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`',
    `- Bit value: \`1\` means ${bit1IsLow ? lowName : highName}`,
    `- Bit value: \`0\` means ${bit1IsLow ? highName : lowName}`,
    '',
    'Built by `tools/build-arctic-map-tiles-from-imagegen.mjs`.',
    '',
  ].join('\n'));
}

function distanceToSegment(x, y, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const t = clamp(((x - x1) * vx + (y - y1) * vy) / (vx * vx + vy * vy), 0, 1);
  return Math.hypot(x - (x1 + vx * t), y - (y1 + vy * t));
}

function roadMaskAlpha(kind, x, y) {
  const c = (SIZE - 1) / 2;
  const width = kind === 'isolated' ? 15.5 : 10.8;
  const segments = {
    straight: [[c, -4, c, SIZE + 3]],
    corner: [[c, c, c, -4], [c, c, SIZE + 3, c]],
    tee: [[c, -4, c, SIZE + 3], [c, c, SIZE + 3, c]],
    cross: [[c, -4, c, SIZE + 3], [-4, c, SIZE + 3, c]],
    end: [[c, c + 6, c, -4]],
    isolated: [],
  }[kind];
  let d = kind === 'isolated' ? Math.abs(Math.hypot(x - c, y - c) - 14) : Infinity;
  for (const [x1, y1, x2, y2] of segments) d = Math.min(d, distanceToSegment(x, y, x1, y1, x2, y2));
  if (kind === 'end') d = Math.min(d, Math.hypot(x - c, y - (c + 7)) - width);
  const feather = 2.5;
  return clamp(Math.round((1 - (d - width) / feather) * 255), 0, 255);
}

async function writeRoad(kind, crop) {
  const tmp = `${OUT}/road/.${kind}-crop.png`;
  await ensureDir(`${OUT}/road`);
  await sharp(SOURCE)
    .extract(crop)
    .resize(SIZE, SIZE, { fit: 'fill', kernel: 'lanczos3' })
    .ensureAlpha()
    .png()
    .toFile(tmp);
  const raw = await rawRgba(tmp);
  const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const alpha = roadMaskAlpha(kind, x, y);
      const shade = sampleNearest(raw, x, y);
      pixels[idx] = clamp(shade[0] * 0.95);
      pixels[idx + 1] = clamp(shade[1] * 0.98);
      pixels[idx + 2] = clamp(shade[2] * 1.02);
      pixels[idx + 3] = alpha;
    }
  }
  await writeRawPng(`${OUT}/road/${kind}.png`, pixels);
  await fs.rm(tmp, { force: true });
}

async function writeBlendHelpers(dir) {
  await ensureDir(dir);
  const names = ['edge-mask.png', 'edge-n.png', 'edge-e.png', 'edge-s.png', 'edge-w.png', 'corner-mask.png', 'corner-nw.png', 'corner-ne.png', 'corner-se.png', 'corner-sw.png'];
  for (const name of names) {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    const horizontal = name.includes('edge-n') || name.includes('edge-mask');
    const vertical = name.includes('edge-e') || name.includes('edge-w');
    const corner = name.includes('corner');
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        let on = false;
        if (horizontal) on = y < SIZE / 2;
        if (vertical) on = x > SIZE / 2;
        if (corner) {
          if (name.includes('nw') || name.includes('mask')) on = x < SIZE / 2 && y < SIZE / 2;
          if (name.includes('ne')) on = x >= SIZE / 2 && y < SIZE / 2;
          if (name.includes('se')) on = x >= SIZE / 2 && y >= SIZE / 2;
          if (name.includes('sw')) on = x < SIZE / 2 && y >= SIZE / 2;
        }
        if (on) pixels.set([255, 255, 255, 180], (y * SIZE + x) * 4);
      }
    }
    await writeRawPng(`${dir}/${name}`, pixels);
  }
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
    .composite(composites)
    .png()
    .toFile(`${dir}/_preview-4x4.png`);
}

async function writeSampleMap(dir) {
  const layout = [
    'FFFFEEEE',
    'FFEECCCE',
    'FEECC88E',
    'EECC000C',
    'CC00000C',
    'E88000CC',
    'ECCC88EE',
    'EEEEFFFF',
  ];
  const composites = [];
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      composites.push({ input: `${dir}/${layout[y][x]}.png`, left: x * SIZE, top: y * SIZE });
    }
  }
  await sharp({ create: { width: 8 * SIZE, height: 8 * SIZE, channels: 4, background: '#101820ff' } })
    .composite(composites)
    .png()
    .toFile(`${dir}/_preview-sample-map.png`);
}

async function writeContactSheet(output, title, assetRoot) {
  await ensureDir(path.dirname(output));
  const width = 900;
  const height = 780;
  const tile = 72;
  const entries = [
    ['sea', `${assetRoot}/surfaces/sea/main.png`],
    ['sea alt', `${assetRoot}/surfaces/sea/alternative-1.png`],
    ['shore ice', `${assetRoot}/surfaces/sand/main.png`],
    ['shore ice alt', `${assetRoot}/surfaces/sand/alternative-1.png`],
    ['snow', `${assetRoot}/surfaces/grass/main.png`],
    ['snow alt', `${assetRoot}/surfaces/grass/alternative-1.png`],
    ['rock', `${assetRoot}/surfaces/rock-grass/main.png`],
    ['rock alt', `${assetRoot}/surfaces/rock-grass/alternative-1.png`],
    ['road end', `${assetRoot}/road/end.png`],
    ['road straight', `${assetRoot}/road/straight.png`],
    ['road corner', `${assetRoot}/road/corner.png`],
    ['road tee', `${assetRoot}/road/tee.png`],
    ['road cross', `${assetRoot}/road/cross.png`],
    ['road isolated', `${assetRoot}/road/isolated.png`],
  ];
  const composites = [{
    input: Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#152026"/>
      <text x="28" y="46" fill="#edf7f8" font-family="Arial" font-size="28" font-weight="700">${title}</text>
      <text x="28" y="74" fill="#a9bdc4" font-family="Arial" font-size="14">AI-generated source sheet cropped into runtime tiles</text>
    </svg>`),
    left: 0,
    top: 0,
  }];
  for (let i = 0; i < entries.length; i++) {
    const [label, file] = entries[i];
    const col = i % 7;
    const row = Math.floor(i / 7);
    const left = 28 + col * 121;
    const top = 104 + row * 116;
    composites.push({ input: await sharp(file).resize(tile, tile, { kernel: 'nearest' }).toBuffer(), left, top });
    composites.push({
      input: Buffer.from(`<svg width="112" height="22" xmlns="http://www.w3.org/2000/svg"><text x="0" y="15" fill="#dce9ec" font-family="Arial" font-size="12">${label}</text></svg>`),
      left,
      top: top + tile + 6,
    });
  }
  const previewEntries = [
    ['cold sea / shore ice', `${assetRoot}/blend/sand-sea/_preview-4x4.png`],
    ['snow / shore ice', `${assetRoot}/blend/grass-sand/_preview-4x4.png`],
    ['rock / snow', `${assetRoot}/blend/dirt-grass/_preview-4x4.png`],
  ];
  for (let i = 0; i < previewEntries.length; i++) {
    const [label, file] = previewEntries[i];
    const left = 28 + i * 288;
    const top = 370;
    composites.push({ input: await sharp(file).resize(248, 248, { kernel: 'nearest' }).toBuffer(), left, top });
    composites.push({
      input: Buffer.from(`<svg width="248" height="24" xmlns="http://www.w3.org/2000/svg"><text x="0" y="16" fill="#dce9ec" font-family="Arial" font-size="14">${label}</text></svg>`),
      left,
      top: top + 258,
    });
  }
  await sharp({ create: { width, height, channels: 4, background: '#152026ff' } })
    .composite(composites)
    .png()
    .toFile(output);
}

async function writeDocs() {
  const files = [
    'imagegen-source-sheet.png',
    'sea.png', 'sand.png', 'grass.png', 'dirt.png',
    ...['sea', 'sand', 'grass', 'rock-grass'].flatMap((surface) => [`surfaces/${surface}/main.png`, `surfaces/${surface}/alternative-1.png`]),
    ...['isolated', 'end', 'straight', 'corner', 'tee', 'cross'].map((shape) => `road/${shape}.png`),
    ...['sand-sea', 'grass-sand', 'dirt-grass'].flatMap((set) => [
      ...HEX.split('').map((mask) => `blend/${set}/${mask}.png`),
      `blend/${set}/_preview-4x4.png`,
      `blend/${set}/_preview-sample-map.png`,
      `blend/${set}/README.md`,
    ]),
    ...['edge-mask.png', 'edge-n.png', 'edge-e.png', 'edge-s.png', 'edge-w.png', 'corner-mask.png', 'corner-nw.png', 'corner-ne.png', 'corner-se.png', 'corner-sw.png'].map((file) => `blend/${file}`),
    '_artifact.png',
    'README.md',
  ];
  await fs.writeFile(`${OUT}/manifest.json`, JSON.stringify({
    name: 'arctic-city',
    tileSize: SIZE,
    source: 'imagegen-source-sheet.png',
    sourceMode: 'built-in image_gen, original generated raster sheet',
    runtimeContract: 'Drop-in themed equivalent of public/assets/used/map-tiles',
    semanticMapping: {
      sea: 'AI-generated cold open water with ice chunks',
      sand: 'AI-generated shore-fast cracked ice / frozen beach',
      grass: 'AI-generated snowfield with tundra flecks',
      dirt: 'AI-generated dark frozen rock with snow crust',
      road: 'AI-generated icy stone pavers masked into runtime auto-tile overlays',
    },
    files,
  }, null, 2) + '\n');
  await fs.writeFile(`${OUT}/README.md`, [
    '# Arctic City Map Tile Set',
    '',
    'Complete drop-in themed equivalent of `public/assets/used/map-tiles` for Mintaka.',
    '',
    'This set is built from the preserved AI-generated raster source sheet `imagegen-source-sheet.png`, then cropped and masked into the runtime `64x64` tile contract.',
    '',
    '- `sea` is cold open water with ice chunks.',
    '- `sand` is shore-fast cracked ice / frozen beach.',
    '- `grass` is snowfield with sparse tundra flecks.',
    '- `dirt` is dark frozen rock with snow crust.',
    '- `road` uses AI-generated icy stone paver texture with transparent auto-tile masks.',
    '- `blend/*` contains full `0.png` through `F.png` corner-Wang sets built from the generated terrain textures.',
    '',
    'Built by `tools/build-arctic-map-tiles-from-imagegen.mjs` using the built-in image generation tool.',
    '',
  ].join('\n'));
}

async function main() {
  await fs.access(SOURCE);
  await ensureDir(OUT);
  await ensureDir(`${OUT}/surfaces/sea`);
  await ensureDir(`${OUT}/surfaces/sand`);
  await ensureDir(`${OUT}/surfaces/grass`);
  await ensureDir(`${OUT}/surfaces/rock-grass`);
  await writeSurface(surfaceCrops.sea[0], `${OUT}/surfaces/sea/main.png`);
  await writeSurface(surfaceCrops.sea[1], `${OUT}/surfaces/sea/alternative-1.png`);
  await writeSurface(surfaceCrops.ice[0], `${OUT}/surfaces/sand/main.png`);
  await writeSurface(surfaceCrops.ice[1], `${OUT}/surfaces/sand/alternative-1.png`);
  await writeSurface(surfaceCrops.snow[0], `${OUT}/surfaces/grass/main.png`);
  await writeSurface(surfaceCrops.snow[1], `${OUT}/surfaces/grass/alternative-1.png`);
  await writeSurface(surfaceCrops.rock[0], `${OUT}/surfaces/rock-grass/main.png`);
  await writeSurface(surfaceCrops.rock[1], `${OUT}/surfaces/rock-grass/alternative-1.png`);
  await fs.copyFile(`${OUT}/surfaces/sea/main.png`, `${OUT}/sea.png`);
  await fs.copyFile(`${OUT}/surfaces/sand/main.png`, `${OUT}/sand.png`);
  await fs.copyFile(`${OUT}/surfaces/grass/main.png`, `${OUT}/grass.png`);
  await fs.copyFile(`${OUT}/surfaces/rock-grass/main.png`, `${OUT}/dirt.png`);
  for (const [kind, crop] of Object.entries(roadCrops)) await writeRoad(kind, crop);
  await writeBlendHelpers(`${OUT}/blend`);
  await writeBlendSet(`${OUT}/blend/sand-sea`, `${OUT}/surfaces/sea/main.png`, `${OUT}/surfaces/sand/main.png`, true, 'AI Generated Cold Sea To Shore Ice Tiles', 'cold sea', 'shore ice');
  await writeBlendSet(`${OUT}/blend/grass-sand`, `${OUT}/surfaces/sand/main.png`, `${OUT}/surfaces/grass/main.png`, false, 'AI Generated Snow On Shore Ice Tiles', 'shore ice', 'snow');
  await writeBlendSet(`${OUT}/blend/dirt-grass`, `${OUT}/surfaces/grass/main.png`, `${OUT}/surfaces/rock-grass/main.png`, false, 'AI Generated Frozen Rock On Snow Tiles', 'snow', 'frozen rock');
  await writeDocs();
  await writeContactSheet(`${OUT}/_artifact.png`, 'Arctic City Map Tiles', OUT);
  await writeContactSheet(`${REVIEW}/arctic-city-map-tiles-artifact.png`, 'Arctic City Map Tiles', OUT);
  await ensureDir(path.dirname(LIB_OUT));
  await fs.cp(OUT, LIB_OUT, { recursive: true, force: true });
  console.log(`Built image-generated arctic tiles from ${SOURCE}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
