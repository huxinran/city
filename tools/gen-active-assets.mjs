import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'public', 'assets');
const USED = path.join(ASSETS, 'used');
const LIB = path.join(ASSETS, 'lib');
const MANIFEST = path.join(ASSETS, 'active-assets.json');
const IMPORT_ROOT = '_runtime-source';
const IMAGE_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.webp']);

const toPosix = (value) => value.split(path.sep).join('/');
const isImage = (file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase());
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const previousAssets = fs.existsSync(MANIFEST)
  ? (JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).assets ?? {})
  : {};

const usedFiles = walk(USED).filter(isImage).sort();
const libFiles = walk(LIB).filter(isImage).sort();
const libByHash = new Map();

for (const file of libFiles) {
  const digest = hash(file);
  const relative = toPosix(path.relative(LIB, file));
  const candidates = libByHash.get(digest) ?? [];
  candidates.push(relative);
  libByHash.set(digest, candidates);
}

const scoreCandidate = (usedRelative, libRelative) => {
  if (usedRelative === libRelative) return 100000;

  const usedParts = usedRelative.toLowerCase().split('/');
  const libParts = libRelative.toLowerCase().split('/');
  const usedStem = path.posix.basename(usedRelative, path.posix.extname(usedRelative)).toLowerCase();
  const libStem = path.posix.basename(libRelative, path.posix.extname(libRelative)).toLowerCase();
  let score = 0;

  if (libParts[0] === usedParts[0]) score += 1000;
  if (libParts.includes(usedStem)) score += 500;
  if (libStem === usedStem) score += 250;
  for (let index = 0; index < Math.min(usedParts.length, libParts.length); index += 1) {
    if (usedParts[index] !== libParts[index]) break;
    score += 50;
  }
  if (libParts[0] === IMPORT_ROOT) score -= 10000;
  score -= libParts.length;
  return score;
};

const selectCandidate = (usedRelative, candidates) => [...candidates].sort((left, right) => {
  const scoreDifference = scoreCandidate(usedRelative, right) - scoreCandidate(usedRelative, left);
  return scoreDifference || left.localeCompare(right, undefined, { numeric: true });
})[0];

const assets = {};
let matched = 0;
let imported = 0;
let ambiguous = 0;

for (const usedFile of usedFiles) {
  const usedRelative = toPosix(path.relative(USED, usedFile));
  const digest = hash(usedFile);
  const candidates = libByHash.get(digest) ?? [];

  if (candidates.length) {
    const previous = previousAssets[usedRelative];
    assets[usedRelative] = previous && !previous.startsWith(`${IMPORT_ROOT}/`) && candidates.includes(previous)
      ? previous
      : selectCandidate(usedRelative, candidates);
    matched += 1;
    if (candidates.length > 1) ambiguous += 1;
    continue;
  }

  const libRelative = path.posix.join(IMPORT_ROOT, usedRelative);
  const destination = path.join(LIB, ...libRelative.split('/'));
  if (fs.existsSync(destination) && hash(destination) !== digest) {
    throw new Error(`Refusing to overwrite a different library source: ${libRelative}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (!fs.existsSync(destination)) fs.copyFileSync(usedFile, destination);
  assets[usedRelative] = libRelative;
  libByHash.set(digest, [libRelative]);
  imported += 1;
}

const sortedAssets = Object.fromEntries(Object.entries(assets)
  .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true })));
const manifest = {
  version: 1,
  description: 'Active runtime images. Keys are paths under used/; values are their source-of-truth paths under lib/.',
  assets: sortedAssets,
};

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${toPosix(path.relative(ROOT, MANIFEST))}`);
console.log(`${usedFiles.length} active images: ${matched} matched existing lib sources, ${imported} imported, ${ambiguous} had duplicate exact matches`);
