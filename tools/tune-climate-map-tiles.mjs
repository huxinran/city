import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 64;
const HEX = '0123456789ABCDEF';
const USED_ROOT = 'public/assets/used/map-tiles';
const LIB_ROOT = 'public/assets/lib/map-tiles';
const REVIEW = 'public/assets/review';
const DEFAULT_SEA = `${USED_ROOT}/surfaces/sea/main.png`;
const DEFAULT_SEA_ALT = `${USED_ROOT}/surfaces/sea/alternative-1.png`;
const DEFAULT_GRASS = `${USED_ROOT}/surfaces/grass/main.png`;
const DEFAULT_GRASS_ALT = `${USED_ROOT}/surfaces/grass/alternative-1.png`;

const THEMES = {
  'arctic-city': {
    title: 'Arctic City Map Tiles',
    grassLabel: 'snow',
    palettes: {
      grass: {
        low: [214, 234, 240],
        mid: [238, 248, 249],
        high: [255, 255, 255],
        feature: [105, 151, 168],
        flower: [185, 214, 225],
        dark: [142, 178, 190],
      },
    },
    seaPalette: {
      deep: [17, 78, 176],
      mid: [24, 140, 225],
      light: [116, 222, 255],
      foam: [220, 250, 255],
    },
    seam: [235, 250, 255, 255],
  },
  'africa-hot': {
    title: 'Hot African Climate Map Tiles',
    grassLabel: 'savanna grass',
    palettes: {
      grass: {
        low: [173, 126, 36],
        mid: [204, 159, 56],
        high: [232, 191, 82],
        feature: [78, 111, 49],
        flower: [226, 205, 112],
        dark: [115, 84, 34],
      },
    },
    seaPalette: {
      deep: [18, 98, 80],
      mid: [31, 160, 118],
      light: [91, 219, 167],
      foam: [205, 248, 221],
    },
    seam: [248, 223, 148, 255],
  },
  'asian-mild': {
    title: 'Spring Asian Climate Map Tiles',
    grassLabel: 'spring meadow',
    reuseDefaultSea: true,
    palettes: {
      grass: {
        low: [73, 131, 68],
        mid: [128, 185, 88],
        high: [196, 222, 122],
        feature: [72, 142, 72],
        flower: [246, 196, 212],
        dark: [61, 105, 57],
      },
    },
    seam: [225, 239, 196, 255],
  },
  'america-mild': {
    title: 'Autumn American Frontier Map Tiles',
    grassLabel: 'autumn prairie',
    reuseDefaultSea: true,
    palettes: {
      grass: {
        low: [118, 83, 36],
        mid: [169, 119, 45],
        high: [214, 161, 74],
        feature: [142, 73, 37],
        flower: [230, 188, 82],
        dark: [83, 61, 35],
      },
    },
    seam: [236, 196, 126, 255],
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

async function rawRgba(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: Uint8ClampedArray.from(data), width: info.width, height: info.height };
}

async function writeRawPng(file, pixels, width = SIZE, height = SIZE) {
  await ensureDir(path.dirname(file));
  await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

function lerpColor(a, b, t) {
  return [
    Math.round(mix(a[0], b[0], t)),
    Math.round(mix(a[1], b[1], t)),
    Math.round(mix(a[2], b[2], t)),
    255,
  ];
}

function sample(raw, x, y) {
  const sx = clamp(Math.round(x), 0, raw.width - 1);
  const sy = clamp(Math.round(y), 0, raw.height - 1);
  const idx = (sy * raw.width + sx) * 4;
  return [raw.data[idx], raw.data[idx + 1], raw.data[idx + 2], raw.data[idx + 3]];
}

async function recolorSea(file, palette) {
  const raw = await rawRgba(file);
  const pixels = new Uint8ClampedArray(raw.width * raw.height * 4);
  for (let y = 0; y < raw.height; y++) {
    for (let x = 0; x < raw.width; x++) {
      const idx = (y * raw.width + x) * 4;
      const r = raw.data[idx], g = raw.data[idx + 1], b = raw.data[idx + 2];
      const lum = (r * 0.25 + g * 0.50 + b * 0.25) / 255;
      const whitecap = Math.max(r, g, b) > 205 && Math.min(r, g, b) > 145;
      const n = (hash01(x, y, 819) - 0.5) * 0.06;
      let color = lum < 0.42
        ? lerpColor(palette.deep, palette.mid, lum / 0.42)
        : lerpColor(palette.mid, palette.light, (lum - 0.42) / 0.58);

      if (whitecap || lum > 0.82) {
        color = lerpColor(color, palette.foam, 0.55);
      }

      pixels[idx] = clamp(color[0] + n * 255);
      pixels[idx + 1] = clamp(color[1] + n * 255);
      pixels[idx + 2] = clamp(color[2] + n * 255);
      pixels[idx + 3] = 255;
    }
  }
  await writeRawPng(file, pixels, raw.width, raw.height);
}

async function recolorDefaultGrass(outFile, sourceFile, palette, salt) {
  const src = await rawRgba(sourceFile);
  const pixels = new Uint8ClampedArray(src.width * src.height * 4);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const idx = (y * src.width + x) * 4;
      const r = src.data[idx], g = src.data[idx + 1], b = src.data[idx + 2];
      const lum = (r * 0.28 + g * 0.55 + b * 0.17) / 255;
      const satHint = Math.max(r, g, b) - Math.min(r, g, b);
      const n = (hash01(x, y, salt) - 0.5) * 0.11;
      let color = lum < 0.42
        ? lerpColor(palette.low, palette.mid, lum / 0.42)
        : lerpColor(palette.mid, palette.high, (lum - 0.42) / 0.58);

      // Keep Anrelia's small, crisp feature pattern, but make each mark tiny and
      // theme-colored instead of large recognizable flowers/blobs.
      if (satHint > 55 && hash01(x, y, salt + 2) > 0.56) {
        color = lerpColor(color, palette.flower, 0.48);
      } else if (lum < 0.30 && hash01(x, y, salt + 3) > 0.36) {
        color = lerpColor(color, palette.feature, 0.56);
      } else if (hash01(x, y, salt + 4) > 0.985) {
        color = lerpColor(color, palette.dark, 0.35);
      }

      pixels[idx] = clamp(color[0] + n * 255);
      pixels[idx + 1] = clamp(color[1] + n * 255);
      pixels[idx + 2] = clamp(color[2] + n * 255);
      pixels[idx + 3] = 255;
    }
  }
  await writeRawPng(outFile, pixels, src.width, src.height);
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

async function writeBlendSet(dir, lowFile, highFile, bit1IsLow, title, lowName, highName, seamColor) {
  await ensureDir(dir);
  const low = await rawRgba(lowFile);
  const high = await rawRgba(highFile);
  for (let mask = 0; mask < 16; mask++) {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = maskValue(mask, x, y);
        const jitter = x < 2 || y < 2 || x > SIZE - 3 || y > SIZE - 3 ? 0 : (hash01(x, y, mask) - 0.5) * 0.12;
        const bitSide = v + jitter >= 0.5;
        const highSide = bit1IsLow ? !bitSide : bitSide;
        const base = sample(highSide ? high : low, x, y);
        const seam = Math.abs(v - 0.5);
        const color = seam < 0.06 ? lerpColor(base, seamColor, 0.16 + (0.06 - seam) * 2.1) : base;
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
    '- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`',
    `- Bit value: \`1\` means ${bit1IsLow ? lowName : highName}`,
    `- Bit value: \`0\` means ${bit1IsLow ? highName : lowName}`,
    '',
    'Tuned by `tools/tune-climate-map-tiles.mjs`.',
    '',
  ].join('\n'));
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
      <text x="28" y="74" fill="#a9bdc4" font-family="Arial" font-size="14">Tuned terrain surfaces and rebuilt blends</text>
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

async function copyMildSea(out) {
  await fs.copyFile(DEFAULT_SEA, `${out}/surfaces/sea/main.png`);
  await fs.copyFile(DEFAULT_SEA_ALT, `${out}/surfaces/sea/alternative-1.png`);
  await fs.copyFile(DEFAULT_SEA, `${out}/sea.png`);
}

async function tuneTheme(themeName, theme) {
  const out = `${USED_ROOT}/${themeName}`;
  await fs.access(`${out}/manifest.json`);

  if (theme.reuseDefaultSea) {
    await copyMildSea(out);
  } else if (theme.seaPalette) {
    await recolorSea(`${out}/surfaces/sea/main.png`, theme.seaPalette);
    await recolorSea(`${out}/surfaces/sea/alternative-1.png`, theme.seaPalette);
    await fs.copyFile(`${out}/surfaces/sea/main.png`, `${out}/sea.png`);
  }

  await recolorDefaultGrass(`${out}/surfaces/grass/main.png`, DEFAULT_GRASS, theme.palettes.grass, 101);
  await recolorDefaultGrass(`${out}/surfaces/grass/alternative-1.png`, DEFAULT_GRASS_ALT, theme.palettes.grass, 202);
  await fs.copyFile(`${out}/surfaces/grass/main.png`, `${out}/grass.png`);

  await writeBlendSet(`${out}/blend/sand-sea`, `${out}/surfaces/sea/main.png`, `${out}/surfaces/sand/main.png`, true, `${theme.title}: Sea To Shore`, theme.seaLabel ?? 'sea', theme.sandLabel ?? 'shore', theme.seam);
  await writeBlendSet(`${out}/blend/grass-sand`, `${out}/surfaces/sand/main.png`, `${out}/surfaces/grass/main.png`, false, `${theme.title}: Ground On Shore`, theme.sandLabel ?? 'shore', theme.grassLabel, theme.seam);
  await writeBlendSet(`${out}/blend/dirt-grass`, `${out}/surfaces/grass/main.png`, `${out}/surfaces/rock-grass/main.png`, false, `${theme.title}: Rock On Ground`, theme.grassLabel, theme.dirtLabel ?? 'rock', theme.seam);

  const manifestPath = `${out}/manifest.json`;
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  manifest.tuning = Array.from(new Set([
    ...(manifest.tuning ?? []),
    'sea/ground tuning applied by tools/tune-climate-map-tiles.mjs',
  ]));
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  await writeContactSheet(`${out}/_artifact.png`, theme.title, out, theme.labels);
  await writeContactSheet(`${REVIEW}/${themeName}-map-tiles-artifact.png`, theme.title, out, theme.labels);
  await ensureDir(`${LIB_ROOT}/${themeName}`);
  await fs.cp(out, `${LIB_ROOT}/${themeName}`, { recursive: true, force: true });
}

const labels = {
  'arctic-city': {
    sea: 'blue cold sea',
    sand: 'shore ice',
    grass: 'snow ground',
    dirt: 'frozen rock',
    sandSea: 'blue sea / shore ice',
    grassSand: 'snow / shore ice',
    dirtGrass: 'rock / snow',
  },
  'africa-hot': {
    sea: 'green warm sea',
    sand: 'golden shore',
    grass: 'savanna ground',
    dirt: 'laterite rock',
    sandSea: 'green sea / shore',
    grassSand: 'savanna / shore',
    dirtGrass: 'laterite / savanna',
  },
  'asian-mild': {
    sea: 'Anrelia sea',
    sand: 'riverbank silt',
    grass: 'spring meadow',
    dirt: 'mossy rock',
    sandSea: 'Anrelia sea / riverbank',
    grassSand: 'spring meadow / riverbank',
    dirtGrass: 'mossy rock / spring meadow',
  },
  'america-mild': {
    sea: 'Anrelia sea',
    sand: 'prairie bank',
    grass: 'autumn prairie',
    dirt: 'clay rock',
    sandSea: 'Anrelia sea / prairie bank',
    grassSand: 'autumn prairie / bank',
    dirtGrass: 'clay rock / autumn prairie',
  },
};

for (const [themeName, theme] of Object.entries(THEMES)) {
  await tuneTheme(themeName, {
    ...theme,
    labels: labels[themeName],
    seaLabel: labels[themeName].sea,
    sandLabel: labels[themeName].sand,
    dirtLabel: labels[themeName].dirt,
  });
  console.log(`Tuned ${themeName}`);
}
