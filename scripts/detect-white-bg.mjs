import sharp from 'sharp';
import { globSync } from 'fs';
import fs from 'fs';
import path from 'path';

// Candidate dirs (exclude archives + version backups)
const roots = [
  'public/assets/resource-icons-cute-64',
  'public/assets/population',
  'public/assets/building-icons-cute-64',
  'public/assets/terrain-objects-cute-48',
  'public/assets/map-tiles-cute-64',
  'public/assets/map-tiles-cute-48',
  'public/assets/icons',
];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'old_versions') continue;
      walk(p, out);
    } else if (/\.png$/i.test(e.name)) {
      out.push(p);
    }
  }
}

const files = [];
for (const r of roots) walk(r, files);

for (const f of files) {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
  let whiteCorners = 0, opaque = 0;
  for (const [x, y] of corners) {
    const i = (y * w + x) * c;
    if (data[i + 3] >= 250) opaque++;
    if (data[i] >= 240 && data[i + 1] >= 240 && data[i + 2] >= 240 && data[i + 3] >= 240) whiteCorners++;
  }
  const tag = whiteCorners === 4 ? 'WHITE-BG ' : whiteCorners > 0 ? 'partial  ' : (opaque === 0 ? 'transp   ' : 'opaque   ');
  console.log(`${tag} ${w}x${h}  ${f.replace(/\\/g, '/')}`);
}
