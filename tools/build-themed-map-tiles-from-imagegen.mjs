import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 64;
const HEX = '0123456789ABCDEF';
const USED_ROOT = 'public/assets/used/map-tiles';
const LIB_ROOT = 'public/assets/lib/map-tiles';
const REVIEW = 'public/assets/review';

const THEMES = {
  'africa-hot': {
    title: 'Hot African Climate Map Tiles',
    city: 'Solara',
    surfaceLabels: {
      sea: 'warm coastal sea',
      sand: 'golden savanna shore',
      grass: 'dry savanna grass',
      dirt: 'red laterite rock',
      road: 'sun-baked stone road',
    },
    blendLabels: {
      sandSea: 'coastal sea / savanna shore',
      grassSand: 'savanna grass / shore',
      dirtGrass: 'laterite rock / savanna grass',
    },
    seam: [255, 230, 150, 255],
  },
  'asian-mild': {
    title: 'Mild Asian Climate Map Tiles',
    city: 'Jinlin',
    surfaceLabels: {
      sea: 'jade water',
      sand: 'riverbank silt',
      grass: 'lush meadow',
      dirt: 'mossy rock',
      road: 'mossy stone road',
    },
    blendLabels: {
      sandSea: 'jade water / riverbank silt',
      grassSand: 'meadow / riverbank',
      dirtGrass: 'mossy rock / meadow',
    },
    seam: [220, 238, 192, 255],
  },
  'america-mild': {
    title: 'Mild American Frontier Map Tiles',
    city: 'Columbia',
    surfaceLabels: {
      sea: 'blue river water',
      sand: 'prairie riverbank',
      grass: 'prairie grassland',
      dirt: 'brown clay rock',
      road: 'frontier fieldstone road',
    },
    blendLabels: {
      sandSea: 'river water / prairie bank',
      grassSand: 'prairie grass / riverbank',
      dirtGrass: 'clay rock / prairie grass',
    },
    seam: [238, 218, 170, 255],
  },
};

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });
const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const hash01 = (x, y, salt = 0) => {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
};

function squareCrop(meta, col, row, scale = 0.55, dx = 0, dy = 0) {
  const cellW = meta.width / 4;
  const cellH = meta.height / 3;
  const size = Math.round(Math.min(cellW, cellH) * scale);
  const cx = (col + 0.5 + dx) * cellW;
  const cy = (row + 0.5 + dy) * cellH;
  return {
    left: clamp(Math.round(cx - size / 2), 0, meta.width - size),
    top: clamp(Math.round(cy - size / 2), 0, meta.height - size),
    width: size,
    height: size,
  };
}

async function quietSurface(file, strength = 0.45) {
  const original = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const blurred = await sharp(file)
    .blur(2.2)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Uint8ClampedArray.from(original.data);
  const avg = [0, 0, 0];
  const count = original.data.length / 4;
  for (let i = 0; i < original.data.length; i += 4) {
    avg[0] += original.data[i];
    avg[1] += original.data[i + 1];
    avg[2] += original.data[i + 2];
  }
  avg[0] /= count;
  avg[1] /= count;
  avg[2] /= count;
  const flatten = Math.min(0.68, strength * 0.45);
  for (let i = 0; i < pixels.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const o = original.data[i + c];
      const b = blurred.data[i + c];
      const diff = Math.abs(o - b);
      const pull = Math.min(1, strength * Math.min(1, diff / 38));
      const local = mix(o, b, pull);
      pixels[i + c] = Math.round(mix(local, avg[c], flatten));
    }
  }
  await writeRawPng(file, pixels, original.info.width, original.info.height);
}

async function writeSurface(source, crop, file, quietStrength = 0.45) {
  await ensureDir(path.dirname(file));
  await sharp(source)
    .extract(crop)
    .resize(SIZE, SIZE, { fit: 'fill', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(file);
  await quietSurface(file, quietStrength);
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

async function writeBlendSet(dir, lowFile, highFile, bit1IsLow, title, lowName, highName, seamColor, toolName) {
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
          ? blendColor(base, seamColor, 0.18 + (0.075 - seam) * 2.3)
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
    `Built by \`${toolName}\` from a built-in image_gen source sheet.`,
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
  return clamp(Math.round((1 - (d - width) / 2.5) * 255), 0, 255);
}

async function writeRoads(source, out, meta) {
  const textureCrop = squareCrop(meta, 0, 1, 0.34, 0, 0);
  const textureFile = `${out}/road/.road-texture.png`;
  await writeSurface(source, textureCrop, textureFile, 0.16);
  const texture = await rawRgba(textureFile);
  for (const kind of ['isolated', 'end', 'straight', 'corner', 'tee', 'cross']) {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const idx = (y * SIZE + x) * 4;
        const shade = sampleNearest(texture, (x + hash01(y, x, 7) * 2) % SIZE, (y + hash01(x, y, 9) * 2) % SIZE);
        pixels[idx] = shade[0];
        pixels[idx + 1] = shade[1];
        pixels[idx + 2] = shade[2];
        pixels[idx + 3] = roadMaskAlpha(kind, x, y);
      }
    }
    await writeRawPng(`${out}/road/${kind}.png`, pixels);
  }
  await fs.rm(textureFile, { force: true });
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
  const layout = ['FFFFEEEE', 'FFEECCCE', 'FEECC88E', 'EECC000C', 'CC00000C', 'E88000CC', 'ECCC88EE', 'EEEEFFFF'];
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

async function writeContactSheet(output, title, assetRoot, labels) {
  await ensureDir(path.dirname(output));
  const width = 900;
  const height = 780;
  const tile = 72;
  const entries = [
    [labels.sea, `${assetRoot}/surfaces/sea/main.png`],
    [`${labels.sea} alt`, `${assetRoot}/surfaces/sea/alternative-1.png`],
    [labels.sand, `${assetRoot}/surfaces/sand/main.png`],
    [`${labels.sand} alt`, `${assetRoot}/surfaces/sand/alternative-1.png`],
    [labels.grass, `${assetRoot}/surfaces/grass/main.png`],
    [`${labels.grass} alt`, `${assetRoot}/surfaces/grass/alternative-1.png`],
    [labels.dirt, `${assetRoot}/surfaces/rock-grass/main.png`],
    [`${labels.dirt} alt`, `${assetRoot}/surfaces/rock-grass/alternative-1.png`],
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
    [labels.sandSea, `${assetRoot}/blend/sand-sea/_preview-4x4.png`],
    [labels.grassSand, `${assetRoot}/blend/grass-sand/_preview-4x4.png`],
    [labels.dirtGrass, `${assetRoot}/blend/dirt-grass/_preview-4x4.png`],
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

async function writeDocs(out, themeName, theme, toolName) {
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
  await fs.writeFile(`${out}/manifest.json`, JSON.stringify({
    name: themeName,
    city: theme.city,
    tileSize: SIZE,
    source: 'imagegen-source-sheet.png',
    sourceMode: 'built-in image_gen, original generated raster sheet',
    runtimeContract: 'Drop-in themed equivalent of public/assets/used/map-tiles',
    semanticMapping: theme.surfaceLabels,
    files,
  }, null, 2) + '\n');
  await fs.writeFile(`${out}/README.md`, [
    `# ${theme.title}`,
    '',
    `Complete drop-in themed equivalent of \`public/assets/used/map-tiles\` for ${theme.city}.`,
    '',
    'This set is built from the preserved AI-generated raster source sheet `imagegen-source-sheet.png`, then cropped and masked into the runtime `64x64` tile contract.',
    '',
    `- \`sea\` is ${theme.surfaceLabels.sea}.`,
    `- \`sand\` is ${theme.surfaceLabels.sand}.`,
    `- \`grass\` is ${theme.surfaceLabels.grass}.`,
    `- \`dirt\` is ${theme.surfaceLabels.dirt}.`,
    `- \`road\` is ${theme.surfaceLabels.road}.`,
    '- `blend/*` contains full `0.png` through `F.png` corner-Wang sets built from generated terrain textures.',
    '',
    `Built by \`${toolName}\` using the built-in image generation tool.`,
    '',
  ].join('\n'));
}

async function buildTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) throw new Error(`Unknown theme: ${themeName}`);
  const out = `${USED_ROOT}/${themeName}`;
  const source = `${out}/imagegen-source-sheet.png`;
  const libOut = `${LIB_ROOT}/${themeName}`;
  await fs.access(source);
  const meta = await sharp(source).metadata();
  await ensureDir(`${out}/surfaces/sea`);
  await ensureDir(`${out}/surfaces/sand`);
  await ensureDir(`${out}/surfaces/grass`);
  await ensureDir(`${out}/surfaces/rock-grass`);

  await writeSurface(source, squareCrop(meta, 0, 0, 0.68, 0, 0), `${out}/surfaces/sea/main.png`, 0.22);
  await writeSurface(source, squareCrop(meta, 0, 0, 0.68, -0.09, 0.06), `${out}/surfaces/sea/alternative-1.png`, 0.22);
  await writeSurface(source, squareCrop(meta, 1, 0, 0.70, 0.16, -0.07), `${out}/surfaces/sand/main.png`, 0.48);
  await writeSurface(source, squareCrop(meta, 1, 0, 0.70, 0.08, 0.09), `${out}/surfaces/sand/alternative-1.png`, 0.48);
  const grassMainCrop = themeName === 'africa-hot'
    ? squareCrop(meta, 2, 0, 0.42, -0.08, 0.25)
    : squareCrop(meta, 2, 0, 0.72, 0, 0);
  const grassAltCrop = themeName === 'africa-hot'
    ? squareCrop(meta, 2, 0, 0.42, 0.15, 0.22)
    : squareCrop(meta, 2, 0, 0.72, -0.08, 0.08);
  await writeSurface(source, grassMainCrop, `${out}/surfaces/grass/main.png`, 1.25);
  await writeSurface(source, grassAltCrop, `${out}/surfaces/grass/alternative-1.png`, 1.25);
  await writeSurface(source, squareCrop(meta, 3, 0, 0.70, 0, 0), `${out}/surfaces/rock-grass/main.png`, 0.54);
  await writeSurface(source, squareCrop(meta, 3, 0, 0.70, 0.09, -0.05), `${out}/surfaces/rock-grass/alternative-1.png`, 0.54);

  await fs.copyFile(`${out}/surfaces/sea/main.png`, `${out}/sea.png`);
  await fs.copyFile(`${out}/surfaces/sand/main.png`, `${out}/sand.png`);
  await fs.copyFile(`${out}/surfaces/grass/main.png`, `${out}/grass.png`);
  await fs.copyFile(`${out}/surfaces/rock-grass/main.png`, `${out}/dirt.png`);
  await ensureDir(`${out}/road`);
  await writeRoads(source, out, meta);
  await writeBlendHelpers(`${out}/blend`);
  await writeBlendSet(`${out}/blend/sand-sea`, `${out}/surfaces/sea/main.png`, `${out}/surfaces/sand/main.png`, true, `${theme.title}: Sea To Shore`, theme.surfaceLabels.sea, theme.surfaceLabels.sand, theme.seam, 'tools/build-themed-map-tiles-from-imagegen.mjs');
  await writeBlendSet(`${out}/blend/grass-sand`, `${out}/surfaces/sand/main.png`, `${out}/surfaces/grass/main.png`, false, `${theme.title}: Grass On Shore`, theme.surfaceLabels.sand, theme.surfaceLabels.grass, theme.seam, 'tools/build-themed-map-tiles-from-imagegen.mjs');
  await writeBlendSet(`${out}/blend/dirt-grass`, `${out}/surfaces/grass/main.png`, `${out}/surfaces/rock-grass/main.png`, false, `${theme.title}: Rock On Grass`, theme.surfaceLabels.grass, theme.surfaceLabels.dirt, theme.seam, 'tools/build-themed-map-tiles-from-imagegen.mjs');
  await writeDocs(out, themeName, theme, 'tools/build-themed-map-tiles-from-imagegen.mjs');
  await writeContactSheet(`${out}/_artifact.png`, theme.title, out, {
    ...theme.surfaceLabels,
    ...theme.blendLabels,
  });
  await writeContactSheet(`${REVIEW}/${themeName}-map-tiles-artifact.png`, theme.title, out, {
    ...theme.surfaceLabels,
    ...theme.blendLabels,
  });
  await ensureDir(path.dirname(libOut));
  await fs.cp(out, libOut, { recursive: true, force: true });
  console.log(`Built ${themeName} from ${source}`);
}

const requested = process.argv.slice(2);
const themes = requested.length ? requested : Object.keys(THEMES);
for (const themeName of themes) await buildTheme(themeName);
