import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Edge-connected background remover.
//
// Unlike a naive threshold cutout, this NEVER removes a pixel that is not
// connected to the image border. It flood-fills inward from every edge pixel
// and only clears pixels that (a) are reachable from the border and (b) match
// the background colour(s) sampled from the border. A white/coloured patch in
// the middle of the sprite stays put because it is walled off by the object.
//
// Background colour is auto-detected from the border, and MORE THAN ONE colour
// is supported, so two-tone checkerboard backdrops (and the two shades of an
// anti-aliased edge) are both handled.
//
// Usage:
//   node tools/remove-bg.mjs [opts] <file-or-dir> [more...]
//
//   (default)            write <name>.cutout.png next to each source (preview)
//   --write              overwrite sources in place; originals copied to old_versions/
//   --no-backup          with --write, skip the per-file old_versions/ backup
//                        (use when you already made a full-tree backup yourself)
//   --fill-holes         ALSO clear background-coloured pockets fully enclosed
//                        by the object (e.g. the gap in a wine glass). Off by
//                        default so interior art is never touched.
//   --tolerance=NN       colour-distance tolerance, 0-255 (default 42)
//   --max-bg=N           max distinct background colours to detect (default 3)
//   --min-hole=F         with --fill-holes, min hole size as fraction of image
//                        (default 0.0003); smaller bg pockets are kept
//
// Examples:
//   node tools/remove-bg.mjs public/assets/used/terrain/tree.png
//   node tools/remove-bg.mjs --write public/assets/used

const args = process.argv.slice(2);
const write = args.includes('--write');
const noBackup = args.includes('--no-backup');
const fillHoles = args.includes('--fill-holes');
const tolArg = args.find((a) => a.startsWith('--tolerance='));
const maxBgArg = args.find((a) => a.startsWith('--max-bg='));
const minHoleArg = args.find((a) => a.startsWith('--min-hole='));
const TOL = tolArg ? parseInt(tolArg.split('=')[1], 10) : 42;
const MAX_BG = maxBgArg ? parseInt(maxBgArg.split('=')[1], 10) : 3;
// With --fill-holes, an enclosed background-coloured region is only cleared if
// it is at least this fraction of the image. Protects small specular highlights
// (which the naive tool used to wrongly erase) while still clearing real holes.
const MIN_HOLE_FRAC = minHoleArg ? parseFloat(minHoleArg.split('=')[1]) : 0.0003;
const inputs = args.filter((a) => !a.startsWith('--'));

const TOL2 = TOL * TOL;          // squared, to skip sqrt in the hot loop
const ALPHA_TRANSPARENT = 16;    // alpha at/below this counts as already-background

function collectPngs(target, out) {
  const st = fs.statSync(target);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(target, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name === 'old_versions' || e.name === '_meta') continue;
        collectPngs(path.join(target, e.name), out);
      } else if (/\.png$/i.test(e.name) && !/\.cutout\.png$/i.test(e.name)) {
        out.push(path.join(target, e.name));
      }
    }
  } else if (/\.png$/i.test(target)) {
    out.push(target);
  }
}

// A colour cluster must cover at least this fraction of the WHOLE border
// (transparent pixels included) to count as background. This is the guard that
// stops us treating a few object pixels that merely overflow the edge of an
// already-cut-out sprite as "background". A solid backdrop scores ~1.0, each
// half of a checkerboard ~0.5, stray object pixels well under this.
const MIN_BORDER_FRAC = 0.15;

// Detect the dominant border colour(s). Quantises border pixels into coarse
// buckets and returns the centroids that dominate the border. One colour for a
// solid backdrop, two for a checkerboard. Returns [] when the border is mostly
// transparent / has no dominant colour (image is already cut out).
function detectBgColors(data, w, h, c) {
  const buckets = new Map(); // quantised key -> { r,g,b,n }
  const Q = 16;
  let borderTotal = 0;
  const add = (i) => {
    borderTotal++;
    if (data[i + 3] <= ALPHA_TRANSPARENT) return; // transparent border = bg, but no colour
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = `${(r / Q) | 0},${(g / Q) | 0},${(b / Q) | 0}`;
    const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    e.r += r; e.g += g; e.b += b; e.n++;
    buckets.set(key, e);
  };
  for (let x = 0; x < w; x++) { add((x) * c); add(((h - 1) * w + x) * c); }
  for (let y = 0; y < h; y++) { add((y * w) * c); add((y * w + (w - 1)) * c); }

  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const minN = (borderTotal || 1) * MIN_BORDER_FRAC;
  const colors = [];
  for (const e of sorted) {
    if (e.n < minN) break;                 // not dominant enough to be background
    colors.push([e.r / e.n, e.g / e.n, e.b / e.n]);
    if (colors.length >= MAX_BG) break;
  }
  return colors;
}

const dist2 = (data, i, col) => {
  const dr = data[i] - col[0], dg = data[i + 1] - col[1], db = data[i + 2] - col[2];
  return dr * dr + dg * dg + db * db;
};

async function processFile(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;

  const bgColors = detectBgColors(data, w, h, c);
  const isBg = (i) =>
    data[i + 3] <= ALPHA_TRANSPARENT || bgColors.some((col) => dist2(data, i, col) <= TOL2);

  // Flood fill (4-connected) from every border pixel.
  const visited = new Uint8Array(w * h);
  const bg = new Uint8Array(w * h); // 1 = edge-connected background, to be cleared
  const stack = [];
  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    visited[p] = 1;
    if (isBg(p * c)) stack.push(x, y);
  };
  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
  for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    bg[y * w + x] = 1;
    tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
  }

  // Clear edge-connected background.
  let cleared = 0;
  for (let p = 0; p < w * h; p++) if (bg[p]) { data[p * c + 3] = 0; cleared++; }

  // Optional: clear background-coloured pockets fully enclosed by the object
  // (e.g. the gap inside a wine glass). Only regions >= MIN_HOLE_FRAC of the
  // image are filled, so small specular highlights are preserved.
  let holes = 0, holePx = 0;
  if (fillHoles && bgColors.length) {
    const minArea = Math.max(16, Math.round(w * h * MIN_HOLE_FRAC));
    const seen = new Uint8Array(w * h);
    for (let p0 = 0; p0 < w * h; p0++) {
      if (seen[p0] || bg[p0]) continue;
      if (data[p0 * c + 3] === 0 || !isBg(p0 * c)) { seen[p0] = 1; continue; }
      // Flood the connected bg-coloured region (it is enclosed: bg[] never set).
      const region = [];
      const s = [p0]; seen[p0] = 1;
      while (s.length) {
        const p = s.pop(); region.push(p);
        const x = p % w, y = (p / w) | 0;
        const nb = [];
        if (x + 1 < w) nb.push(p + 1);
        if (x - 1 >= 0) nb.push(p - 1);
        if (y + 1 < h) nb.push(p + w);
        if (y - 1 >= 0) nb.push(p - w);
        for (const q of nb) {
          if (seen[q] || bg[q]) continue;
          if (data[q * c + 3] === 0 || isBg(q * c)) { seen[q] = 1; s.push(q); }
        }
      }
      if (region.length >= minArea) {
        for (const p of region) { data[p * c + 3] = 0; bg[p] = 1; }
        holes++; holePx += region.length;
      }
    }
  }

  // De-fringe: soften kept pixels that border the cleared region and are close
  // to a background colour (kills the leftover halo) without erasing them.
  let softened = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (bg[p]) continue;
      const i = p * c;
      if (data[i + 3] === 0) continue;
      const touch =
        (x + 1 < w && bg[p + 1]) || (x - 1 >= 0 && bg[p - 1]) ||
        (y + 1 < h && bg[p + w]) || (y - 1 >= 0 && bg[p - w]);
      if (!touch) continue;
      let nearest = Infinity;
      for (const col of bgColors) nearest = Math.min(nearest, dist2(data, i, col));
      const d = Math.sqrt(nearest);
      if (d < TOL) {
        const a = Math.round((data[i + 3] * d) / TOL); // closer to bg => more transparent
        if (a < data[i + 3]) { data[i + 3] = a; softened++; }
      }
    }
  }

  const outBuf = await sharp(data, { raw: { width: w, height: h, channels: c } }).png().toBuffer();
  let out;
  if (write) {
    if (cleared === 0 && softened === 0) {
      console.log(`${path.basename(file).padEnd(28)} no edge background found, left unchanged`);
      return;
    }
    if (!noBackup) {
      const dir = path.join(path.dirname(file), 'old_versions');
      fs.mkdirSync(dir, { recursive: true });
      const ts = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
      const base = path.basename(file, '.png');
      fs.copyFileSync(file, path.join(dir, `${base}-before-bg-removal-${ts}.png`));
    }
    out = file;
  } else {
    out = path.join(path.dirname(file), `${path.basename(file, '.png')}.cutout.png`);
  }
  fs.writeFileSync(out, outBuf);
  const bgStr = bgColors.map((c) => c.map((v) => Math.round(v)).join('/')).join(' ');
  const holeStr = fillHoles ? ` holes=${holes}(${holePx}px)` : '';
  console.log(`${path.basename(file).padEnd(28)} bg=[${bgStr}] cleared=${cleared} softened=${softened}${holeStr} -> ${out.replace(/\\/g, '/')}`);
}

if (inputs.length === 0) {
  console.error('No input files/dirs. Usage: node tools/remove-bg.mjs [--write] <file-or-dir>...');
  process.exit(1);
}
const files = [];
for (const t of inputs) collectPngs(t, files);
console.log(`Processing ${files.length} file(s)  tolerance=${TOL}  mode=${write ? 'WRITE (in place)' : 'preview (.cutout.png)'}`);
for (const f of files) await processFile(f);
console.log('Done.');
