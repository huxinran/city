import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 64;
const LAST = SIZE - 1;
const EDGE_REACH = SIZE * 0.58;
const CORNER_REACH = SIZE * 0.85;
const FEATHER = 5;
const OUT_DIR = path.join('public', 'assets', 'used', 'map-tiles', 'blend');

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function edgeWave(axisCoord) {
  const u = axisCoord / LAST;
  return (
    1.7 * Math.sin(Math.PI * 2 * u + 0.55) +
    1.1 * Math.sin(Math.PI * 4 * u + 2.15) +
    0.7 * Math.sin(Math.PI * 6 * u + 4.1)
  );
}

function edgeSeam(axisCoord) {
  return EDGE_REACH + edgeWave(axisCoord);
}

function torusDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, SIZE - d);
}

function buildSpecks(axisName, seed, count) {
  const rng = makeRng(seed);
  const specks = [];
  for (let i = 0; i < count; i++) {
    const axis = rng() * SIZE;
    const seam = edgeSeam(Math.min(LAST, axis));
    specks.push({
      axis,
      dist: seam + 4 + rng() * 10,
      r: 0.6 + rng() * 1.25,
      a: 70 + rng() * 105,
      axisName,
    });
  }
  return specks;
}

function addEdgeSpecks(alpha, side, specks) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const axis = side === 'n' || side === 's' ? x : y;
      const dist = side === 'n' ? y
        : side === 's' ? LAST - y
        : side === 'e' ? LAST - x
        : x;
      let extra = 0;
      for (const s of specks) {
        const da = torusDistance(axis, s.axis);
        const dd = dist - s.dist;
        const d = Math.sqrt(da * da + dd * dd);
        if (d <= s.r + 1.7) {
          extra = Math.max(extra, s.a * (1 - smoothstep(s.r, s.r + 1.7, d)));
        }
      }
      alpha[y * SIZE + x] = Math.max(alpha[y * SIZE + x], clampByte(extra));
    }
  }
}

function makeEdge(side, seed) {
  const alpha = new Uint8Array(SIZE * SIZE);
  const half = FEATHER / 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const axis = side === 'n' || side === 's' ? x : y;
      const dist = side === 'n' ? y
        : side === 's' ? LAST - y
        : side === 'e' ? LAST - x
        : x;
      const seam = edgeSeam(axis);
      const falloff = smoothstep(seam - half, seam + half, dist);
      alpha[y * SIZE + x] = clampByte(255 * (1 - falloff));
    }
  }
  addEdgeSpecks(alpha, side, buildSpecks(side, seed, 9));
  if (side === 'n' || side === 's') {
    for (let y = 0; y < SIZE; y++) alpha[y * SIZE + LAST] = alpha[y * SIZE];
  } else {
    for (let x = 0; x < SIZE; x++) alpha[LAST * SIZE + x] = alpha[x];
  }
  return alpha;
}

function cornerRadius(theta) {
  return CORNER_REACH
    + 1.8 * Math.sin(2 * theta)
    - 1.0 * Math.sin(4 * theta)
    + 0.55 * Math.sin(6 * theta);
}

function localCornerDistance(corner, x, y) {
  return {
    dx: corner.includes('e') ? LAST - x : x,
    dy: corner.includes('s') ? LAST - y : y,
  };
}

function addCornerSpecks(alpha, corner, seed) {
  const rng = makeRng(seed);
  const specks = [];
  for (let i = 0; i < 6; i++) {
    const theta = 0.14 + rng() * (Math.PI / 2 - 0.28);
    const r = cornerRadius(theta) + 4 + rng() * 9;
    specks.push({
      dx: Math.cos(theta) * r,
      dy: Math.sin(theta) * r,
      radius: 0.65 + rng() * 1.15,
      alpha: 65 + rng() * 95,
    });
  }
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const { dx, dy } = localCornerDistance(corner, x, y);
      let extra = 0;
      for (const s of specks) {
        const d = Math.hypot(dx - s.dx, dy - s.dy);
        if (d <= s.radius + 1.7) {
          extra = Math.max(extra, s.alpha * (1 - smoothstep(s.radius, s.radius + 1.7, d)));
        }
      }
      alpha[y * SIZE + x] = Math.max(alpha[y * SIZE + x], clampByte(extra));
    }
  }
}

function makeCorner(corner, seed) {
  const alpha = new Uint8Array(SIZE * SIZE);
  const half = FEATHER / 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const { dx, dy } = localCornerDistance(corner, x, y);
      const r = Math.hypot(dx, dy);
      const theta = Math.atan2(dy, dx);
      const seam = cornerRadius(theta);
      const falloff = smoothstep(seam - half, seam + half, r);
      alpha[y * SIZE + x] = clampByte(255 * (1 - falloff));
    }
  }
  addCornerSpecks(alpha, corner, seed + 1000);
  return alpha;
}

async function writePng(name, alpha) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < alpha.length; i++) {
    rgba[i * 4] = 255;
    rgba[i * 4 + 1] = 255;
    rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = alpha[i];
  }
  await sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, name));
}

await fs.mkdir(OUT_DIR, { recursive: true });

const outputs = [
  ['edge-n.png', makeEdge('n', 0x4e)],
  ['edge-e.png', makeEdge('e', 0x45)],
  ['edge-s.png', makeEdge('s', 0x53)],
  ['edge-w.png', makeEdge('w', 0x57)],
  ['corner-ne.png', makeCorner('ne', 0x4e45)],
  ['corner-se.png', makeCorner('se', 0x5345)],
  ['corner-sw.png', makeCorner('sw', 0x5357)],
  ['corner-nw.png', makeCorner('nw', 0x4e57)],
];

for (const [name, alpha] of outputs) await writePng(name, alpha);

console.log(`Wrote ${outputs.length} organic blend masks to ${OUT_DIR}`);
