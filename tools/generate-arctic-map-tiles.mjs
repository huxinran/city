import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'public/assets/used/map-tiles';
const OUT = `${ROOT}/arctic-city`;
const LIB_OUT = 'public/assets/lib/map-tiles/arctic-city';
const REVIEW = 'public/assets/review';
const SIZE = 64;
const HEX = '0123456789ABCDEF';

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });
const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
const mix = (a, b, t) => a + (b - a) * t;
const lerpColor = (a, b, t) => a.map((v, i) => mix(v, b[i], t));

function hash01(x, y, salt = 0) {
  let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
}

function noise(x, y, salt = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const tx = x - xi, ty = y - yi;
  const smooth = (t) => t * t * (3 - 2 * t);
  const a = hash01(xi, yi, salt);
  const b = hash01(xi + 1, yi, salt);
  const c = hash01(xi, yi + 1, salt);
  const d = hash01(xi + 1, yi + 1, salt);
  return mix(mix(a, b, smooth(tx)), mix(c, d, smooth(tx)), smooth(ty));
}

function adjust(color, amount) {
  return [
    clamp(color[0] + amount),
    clamp(color[1] + amount),
    clamp(color[2] + amount),
    color[3] ?? 255,
  ];
}

function surfacePixel(kind, x, y, variant = 0) {
  const nx = x / SIZE;
  const ny = y / SIZE;
  const fine = noise(x / 3.5, y / 3.5, 11 + variant) - 0.5;
  const broad = noise(x / 14, y / 14, 41 + variant) - 0.5;
  const diagonal = Math.sin((x * 0.45 + y * 0.22 + variant * 1.7)) * 0.5 + 0.5;

  if (kind === 'sea') {
    let color = lerpColor([26, 83, 120, 255], [65, 154, 181, 255], 0.35 + broad * 0.5);
    color = adjust(color, fine * 16);
    const wave = Math.sin((x + y * 0.65 + variant * 9) / 5.2);
    if (wave > 0.72) color = lerpColor(color, [150, 229, 236, 255], 0.28);
    if (Math.abs(noise(x / 8, y / 8, 88 + variant) - 0.53) < 0.025 && diagonal > 0.44) {
      color = lerpColor(color, [195, 246, 249, 255], 0.48);
    }
    return color;
  }

  if (kind === 'ice') {
    let color = lerpColor([153, 211, 226, 255], [224, 246, 249, 255], 0.55 + broad * 0.45);
    color = adjust(color, fine * 12);
    const crack = Math.abs(Math.sin((x * 0.22 - y * 0.35 + variant * 2.1)));
    if (crack < 0.045 && noise(x / 6, y / 6, 73) > 0.45) color = lerpColor(color, [74, 155, 184, 255], 0.32);
    if (hash01(x, y, 510 + variant) > 0.987) color = [248, 255, 255, 255];
    return color;
  }

  if (kind === 'snow') {
    let color = lerpColor([205, 226, 237, 255], [248, 251, 249, 255], 0.72 + broad * 0.32);
    color = adjust(color, fine * 10);
    if (noise(x / 10, y / 10, 305 + variant) > 0.73) color = lerpColor(color, [185, 215, 226, 255], 0.22);
    if (hash01(x, y, 27 + variant) > 0.982) color = lerpColor(color, [82, 137, 113, 255], 0.33);
    if (hash01(x, y, 29 + variant) > 0.992) color = lerpColor(color, [122, 93, 64, 255], 0.22);
    return color;
  }

  if (kind === 'rock') {
    let color = lerpColor([78, 90, 98, 255], [142, 154, 157, 255], 0.45 + broad * 0.5);
    color = adjust(color, fine * 18);
    if (Math.abs(Math.sin(x * 0.19 + y * 0.34 + variant)) < 0.05 && noise(x / 7, y / 7, 612) > 0.34) {
      color = lerpColor(color, [48, 58, 65, 255], 0.45);
    }
    if (noise(x / 8, y / 8, 707 + variant) > 0.72) color = lerpColor(color, [226, 239, 242, 255], 0.52);
    return color;
  }

  throw new Error(`Unknown surface: ${kind}`);
}

async function writeRawPng(file, pixels) {
  await ensureDir(path.dirname(file));
  await sharp(Buffer.from(pixels), { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

async function writeSurface(file, kind, variant = 0) {
  const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const color = surfacePixel(kind, x, y, variant);
      pixels.set(color.map(Math.round), (y * SIZE + x) * 4);
    }
  }
  await writeRawPng(file, pixels);
}

function blendSide(mask, x, y, bit1IsLow) {
  const qNW = mask & 1 ? 1 : 0;
  const qNE = mask & 2 ? 1 : 0;
  const qSE = mask & 4 ? 1 : 0;
  const qSW = mask & 8 ? 1 : 0;
  const nx = x / (SIZE - 1);
  const ny = y / (SIZE - 1);
  const v = qNW * (1 - nx) * (1 - ny) + qNE * nx * (1 - ny) + qSE * nx * ny + qSW * (1 - nx) * ny;
  const safeBorder = x < 2 || y < 2 || x > SIZE - 3 || y > SIZE - 3;
  const jitter = safeBorder ? 0 : (noise(x / 5.5, y / 5.5, 901) - 0.5) * 0.18;
  const bitSide = v + jitter >= 0.5;
  return bit1IsLow ? !bitSide : bitSide;
}

async function writeBlendSet(dir, low, high, bit1IsLow, title, lowName, highName) {
  await ensureDir(dir);
  for (let mask = 0; mask < 16; mask++) {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const highSide = blendSide(mask, x, y, bit1IsLow);
        const v = (() => {
          const qNW = mask & 1 ? 1 : 0;
          const qNE = mask & 2 ? 1 : 0;
          const qSE = mask & 4 ? 1 : 0;
          const qSW = mask & 8 ? 1 : 0;
          const nx = x / (SIZE - 1);
          const ny = y / (SIZE - 1);
          return qNW * (1 - nx) * (1 - ny) + qNE * nx * (1 - ny) + qSE * nx * ny + qSW * (1 - nx) * ny;
        })();
        let color = surfacePixel(highSide ? high : low, x, y, mask);
        if (Math.abs(v - 0.5) < 0.065) {
          const rim = high === 'snow' || low === 'snow' ? [247, 252, 253, 255] : [183, 236, 241, 255];
          color = lerpColor(color, rim, 0.34 + noise(x / 3, y / 3, 444) * 0.2);
        }
        pixels.set(color.map(Math.round), (y * SIZE + x) * 4);
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
    'Generated by `tools/generate-arctic-map-tiles.mjs`.',
    '',
  ].join('\n'));
}

function drawRoadShape(kind) {
  const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
  const c = (SIZE - 1) / 2;
  const width = 8.5;
  const connections = {
    isolated: [],
    end: [[c, c, c, -2]],
    straight: [[c, -2, c, SIZE + 1]],
    corner: [[c, c, c, -2], [c, c, SIZE + 1, c]],
    tee: [[c, -2, c, SIZE + 1], [c, c, SIZE + 1, c]],
    cross: [[c, -2, c, SIZE + 1], [-2, c, SIZE + 1, c]],
  }[kind];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let d = kind === 'isolated' ? Math.hypot(x - c, y - c) : Infinity;
      for (const [x1, y1, x2, y2] of connections) {
        const vx = x2 - x1;
        const vy = y2 - y1;
        const t = clamp(((x - x1) * vx + (y - y1) * vy) / (vx * vx + vy * vy), 0, 1);
        d = Math.min(d, Math.hypot(x - (x1 + vx * t), y - (y1 + vy * t)));
      }
      if (d > width + 3) continue;
      const edge = d > width - 1.4;
      const stoneLine = (Math.floor((x + y * 0.55) / 9) + Math.floor((y - x * 0.22) / 11)) % 2 === 0;
      let color = edge
        ? [232, 244, 246, 205]
        : stoneLine ? [114, 132, 142, 230] : [93, 111, 124, 232];
      color = adjust(color, (noise(x / 3, y / 3, 230) - 0.5) * 22);
      color[3] = edge ? 205 : 232;
      if (hash01(x, y, 242) > 0.982) color = [244, 252, 252, 220];
      pixels.set(color.map(Math.round), (y * SIZE + x) * 4);
    }
  }
  return pixels;
}

async function writeRoads(dir) {
  await ensureDir(dir);
  for (const kind of ['isolated', 'end', 'straight', 'corner', 'tee', 'cross']) {
    await writeRawPng(`${dir}/${kind}.png`, drawRoadShape(kind));
  }
}

async function writeBlendHelpers(dir) {
  await ensureDir(dir);
  const helpers = {
    'edge-mask.png': [[0, 0], [63, 0], [63, 31], [0, 31]],
    'edge-n.png': [[0, 0], [63, 0], [63, 31], [0, 31]],
    'edge-e.png': [[32, 0], [63, 0], [63, 63], [32, 63]],
    'edge-s.png': [[0, 32], [63, 32], [63, 63], [0, 63]],
    'edge-w.png': [[0, 0], [31, 0], [31, 63], [0, 63]],
    'corner-mask.png': [[0, 0], [31, 0], [31, 31], [0, 31]],
    'corner-nw.png': [[0, 0], [31, 0], [31, 31], [0, 31]],
    'corner-ne.png': [[32, 0], [63, 0], [63, 31], [32, 31]],
    'corner-se.png': [[32, 32], [63, 32], [63, 63], [32, 63]],
    'corner-sw.png': [[0, 32], [31, 32], [31, 63], [0, 63]],
  };
  for (const [name, rect] of Object.entries(helpers)) {
    const pixels = new Uint8ClampedArray(SIZE * SIZE * 4);
    const [a, , c] = rect;
    for (let y = a[1]; y <= c[1]; y++) {
      for (let x = a[0]; x <= c[0]; x++) {
        pixels.set([255, 255, 255, 180], (y * SIZE + x) * 4);
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
      const ch = layout[y][x];
      composites.push({ input: `${dir}/${ch}.png`, left: x * SIZE, top: y * SIZE });
    }
  }
  await sharp({ create: { width: 8 * SIZE, height: 8 * SIZE, channels: 4, background: '#101820ff' } })
    .composite(composites)
    .png()
    .toFile(`${dir}/_preview-sample-map.png`);
}

async function writeContactSheet(output, title, assetRoot, labels) {
  await ensureDir(path.dirname(output));
  const tile = 72;
  const gap = 14;
  const width = 900;
  const height = 760;
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
      <text x="28" y="74" fill="#a9bdc4" font-family="Arial" font-size="14">Complete terrain, blend, and road tile artifact</text>
    </svg>`),
    left: 0,
    top: 0,
  }];

  for (let i = 0; i < entries.length; i++) {
    const [label, file] = entries[i];
    const col = i % 7;
    const row = Math.floor(i / 7);
    const left = 28 + col * (tile + gap + 35);
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

async function writeManifest() {
  const files = [
    'sea.png', 'sand.png', 'grass.png', 'dirt.png',
    ...['sea', 'sand', 'grass', 'rock-grass'].flatMap((surface) => [
      `surfaces/${surface}/main.png`,
      `surfaces/${surface}/alternative-1.png`,
    ]),
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
    runtimeContract: 'Drop-in themed equivalent of public/assets/used/map-tiles',
    semanticMapping: {
      sea: 'cold open water with ice glints',
      sand: 'shore-fast ice and pale frozen beach',
      grass: 'snowfield with sparse tundra flecks',
      dirt: 'dark frozen rock with snow crust',
      road: 'icy stone road overlay with transparent background',
    },
    files,
  }, null, 2) + '\n');
}

async function main() {
  await ensureDir(OUT);
  await ensureDir(REVIEW);
  await writeSurface(`${OUT}/surfaces/sea/main.png`, 'sea', 0);
  await writeSurface(`${OUT}/surfaces/sea/alternative-1.png`, 'sea', 1);
  await writeSurface(`${OUT}/surfaces/sand/main.png`, 'ice', 0);
  await writeSurface(`${OUT}/surfaces/sand/alternative-1.png`, 'ice', 1);
  await writeSurface(`${OUT}/surfaces/grass/main.png`, 'snow', 0);
  await writeSurface(`${OUT}/surfaces/grass/alternative-1.png`, 'snow', 1);
  await writeSurface(`${OUT}/surfaces/rock-grass/main.png`, 'rock', 0);
  await writeSurface(`${OUT}/surfaces/rock-grass/alternative-1.png`, 'rock', 1);

  await fs.copyFile(`${OUT}/surfaces/sea/main.png`, `${OUT}/sea.png`);
  await fs.copyFile(`${OUT}/surfaces/sand/main.png`, `${OUT}/sand.png`);
  await fs.copyFile(`${OUT}/surfaces/grass/main.png`, `${OUT}/grass.png`);
  await fs.copyFile(`${OUT}/surfaces/rock-grass/main.png`, `${OUT}/dirt.png`);

  await writeRoads(`${OUT}/road`);
  await writeBlendHelpers(`${OUT}/blend`);
  await writeBlendSet(`${OUT}/blend/sand-sea`, 'sea', 'ice', true, 'Cold Sea To Shore Ice 64px Corner-Wang Tiles', 'cold sea', 'shore ice');
  await writeBlendSet(`${OUT}/blend/grass-sand`, 'ice', 'snow', false, 'Snow On Shore Ice 64px Corner-Wang Tiles', 'shore ice', 'snow');
  await writeBlendSet(`${OUT}/blend/dirt-grass`, 'snow', 'rock', false, 'Frozen Rock On Snow 64px Corner-Wang Tiles', 'snow', 'frozen rock');

  const arcticLabels = {
    sea: 'sea',
    sand: 'shore ice',
    grass: 'snow',
    dirt: 'rock',
    sandSea: 'cold sea / shore ice',
    grassSand: 'snow / shore ice',
    dirtGrass: 'rock / snow',
  };
  const currentLabels = {
    sea: 'sea',
    sand: 'sand',
    grass: 'grass',
    dirt: 'dirt',
    sandSea: 'sand / sea',
    grassSand: 'grass / sand',
    dirtGrass: 'dirt / grass',
  };
  await writeContactSheet(`${OUT}/_artifact.png`, 'Arctic City Map Tiles', OUT, arcticLabels);
  await writeContactSheet(`${REVIEW}/current-map-tiles-artifact.png`, 'Current Map Tiles', ROOT, currentLabels);
  await writeContactSheet(`${REVIEW}/arctic-city-map-tiles-artifact.png`, 'Arctic City Map Tiles', OUT, arcticLabels);
  await fs.writeFile(`${OUT}/README.md`, [
    '# Arctic City Map Tile Set',
    '',
    'Complete drop-in themed equivalent of `public/assets/used/map-tiles`.',
    '',
    '- `sea` is cold open water with ice glints.',
    '- `sand` is shore-fast ice / frozen beach.',
    '- `grass` is snowfield with sparse tundra flecks.',
    '- `dirt` is dark frozen rock with snow crust.',
    '- `road` is a transparent icy stone overlay using the six runtime auto-tile shapes.',
    '- `blend/*` contains full `0.png` through `F.png` corner-Wang sets plus previews.',
    '',
    'Generated by `tools/generate-arctic-map-tiles.mjs`.',
    '',
  ].join('\n'));
  await writeManifest();
  await ensureDir(path.dirname(LIB_OUT));
  await fs.cp(OUT, LIB_OUT, { recursive: true, force: true });
  console.log(`Generated ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
