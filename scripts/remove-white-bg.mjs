import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Usage: node scripts/remove-white-bg.mjs [--write] file1.png file2.png ...
// Without --write it processes to <name>.cutout.png next to the source (preview).
// With --write it overwrites the source in place (originals backed up to old_versions/).

const args = process.argv.slice(2);
const write = args.includes('--write');
const thArg = args.find((a) => a.startsWith('--threshold='));
const files = args.filter((a) => !a.startsWith('--'));

// channel >= T_HARD AND connected to border => background. Lower it for art on
// an off-white/light-gray backdrop via --threshold=NNN.
const T_HARD = thArg ? parseInt(thArg.split('=')[1], 10) : 240;
const T_FRINGE = T_HARD - 16; // soften near-white pixels touching transparency up to here

async function processFile(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const idx = (x, y) => (y * w + x) * c;
  const isBgWhite = (i) => data[i] >= T_HARD && data[i + 1] >= T_HARD && data[i + 2] >= T_HARD && data[i + 3] >= 200;

  const visited = new Uint8Array(w * h);
  const stack = [];
  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    visited[p] = 1;
    if (isBgWhite(p * c)) stack.push(x, y);
  };
  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
  for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y); }
  const bg = new Uint8Array(w * h); // 1 = background (to be cleared)
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    bg[y * w + x] = 1;
    tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
  }

  // Clear background to transparent
  for (let p = 0; p < w * h; p++) if (bg[p]) data[p * c + 3] = 0;

  // De-fringe: soften light pixels that border the cleared region (kills white halo)
  let cleared = 0, softened = 0;
  for (let p = 0; p < w * h; p++) if (bg[p]) cleared++;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (bg[p]) continue;
      const i = p * c;
      if (data[i + 3] === 0) continue;
      let touch = false;
      if (x + 1 < w && bg[p + 1]) touch = true;
      else if (x - 1 >= 0 && bg[p - 1]) touch = true;
      else if (y + 1 < h && bg[p + w]) touch = true;
      else if (y - 1 >= 0 && bg[p - w]) touch = true;
      if (!touch) continue;
      const lum = Math.min(data[i], data[i + 1], data[i + 2]);
      if (lum >= T_FRINGE) {
        const a = Math.round((255 * (255 - lum)) / (255 - T_FRINGE));
        if (a < data[i + 3]) { data[i + 3] = a; softened++; }
      }
    }
  }

  const outBuf = await sharp(data, { raw: { width: w, height: h, channels: c } }).png().toBuffer();
  let out;
  if (write) {
    const dir = path.join(path.dirname(file), 'old_versions');
    fs.mkdirSync(dir, { recursive: true });
    const ts = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    const base = path.basename(file, '.png');
    fs.copyFileSync(file, path.join(dir, `${base}-before-white-bg-removal-${ts}.png`));
    out = file;
  } else {
    out = path.join(path.dirname(file), `${path.basename(file, '.png')}.cutout.png`);
  }
  fs.writeFileSync(out, outBuf);
  console.log(`${path.basename(file).padEnd(24)} cleared=${cleared} softened=${softened} -> ${out.replace(/\\/g, '/')}`);
}

for (const f of files) await processFile(f);
