import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ASSETS = 'public/assets';
const USED = path.join(ASSETS, 'used');
const RESERVE = path.join(ASSETS, 'reserve');
const LIB = path.join(ASSETS, 'lib');
const IMG = /\.(png|jpe?g|gif|webp|svg)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return [p];
  });
}

function ensureParent(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function moveFile(src, dest) {
  ensureParent(dest);
  if (fs.existsSync(dest)) {
    throw new Error(`Refusing to overwrite ${dest}`);
  }
  fs.renameSync(src, dest);
}

function mergeMove(src, dest) {
  if (path.basename(src) === '.DS_Store') {
    fs.unlinkSync(src);
    return 0;
  }

  if (!fs.existsSync(dest)) {
    ensureParent(dest);
    fs.renameSync(src, dest);
    return 1;
  }

  const srcStat = fs.lstatSync(src);
  const destStat = fs.lstatSync(dest);
  if (srcStat.isFile() && destStat.isFile()) {
    const srcHash = crypto.createHash('sha1').update(fs.readFileSync(src)).digest('hex');
    const destHash = crypto.createHash('sha1').update(fs.readFileSync(dest)).digest('hex');
    if (srcHash === destHash) {
      fs.unlinkSync(src);
      return 0;
    }

    const parsed = path.parse(dest);
    let backup = path.join(parsed.dir, `${parsed.name}.before-lib-merge${parsed.ext}`);
    let n = 2;
    while (fs.existsSync(backup)) {
      backup = path.join(parsed.dir, `${parsed.name}.before-lib-merge-${n}${parsed.ext}`);
      n++;
    }
    fs.renameSync(dest, backup);
    fs.renameSync(src, dest);
    return 2;
  }

  if (!srcStat.isDirectory() || !destStat.isDirectory()) {
    throw new Error(`Refusing to merge ${src} over ${dest}`);
  }

  let moved = 0;
  for (const entry of fs.readdirSync(src)) {
    moved += mergeMove(path.join(src, entry), path.join(dest, entry));
  }
  fs.rmdirSync(src);
  return moved;
}

function linkRelative(target, linkPath) {
  const relTarget = path.relative(path.dirname(linkPath), target).split(path.sep).join('/');
  fs.symlinkSync(relTarget, linkPath);
}

fs.mkdirSync(LIB, { recursive: true });

let converted = 0;
for (const file of walk(USED).filter((f) => IMG.test(f) && !fs.lstatSync(f).isSymbolicLink())) {
  const rel = path.relative(USED, file);
  const target = path.join(LIB, rel);
  moveFile(file, target);
  linkRelative(target, file);
  converted++;
}

let movedReserve = 0;
if (fs.existsSync(RESERVE)) {
  for (const entry of fs.readdirSync(RESERVE)) {
    const src = path.join(RESERVE, entry);
    const dest = path.join(LIB, entry);
    movedReserve += mergeMove(src, dest);
  }
  fs.rmdirSync(RESERVE);
}

console.log(`Converted ${converted} used images to symlinks.`);
console.log(`Moved ${movedReserve} reserve entries into ${LIB}.`);
