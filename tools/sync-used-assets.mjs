import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const mode = process.argv.includes('--write') ? 'write' : process.argv.includes('--check') ? 'check' : null;
if (!mode) {
  console.error('Usage: node tools/sync-used-assets.mjs --check|--write');
  process.exit(1);
}

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'public', 'assets');
const USED = path.join(ASSETS, 'used');
const LIB = path.join(ASSETS, 'lib');
const MANIFEST = path.join(ASSETS, 'active-assets.json');
const IMAGE_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.webp']);

const toPosix = (value) => value.split(path.sep).join('/');
const isImage = (file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase());
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const safePath = (root, relative, label) => {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) {
    throw new Error(`Invalid ${label} path: ${relative}`);
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(root, ...relative.split('/'));
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${label} path escapes its root: ${relative}`);
  }
  return resolved;
};

if (!fs.existsSync(MANIFEST)) {
  console.error('Missing public/assets/active-assets.json. Run npm run assets:manifest first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
if (manifest.version !== 1 || !manifest.assets || Array.isArray(manifest.assets)) {
  throw new Error('Unsupported active-assets.json format.');
}

let missingSources = 0;
let missingRuntime = 0;
let drifted = 0;
let copied = 0;

for (const [usedRelative, libRelative] of Object.entries(manifest.assets)) {
  const usedFile = safePath(USED, usedRelative, 'used');
  const libFile = safePath(LIB, libRelative, 'lib');
  if (!fs.existsSync(libFile)) {
    console.error(`Missing source: lib/${libRelative} (for used/${usedRelative})`);
    missingSources += 1;
    continue;
  }

  const exists = fs.existsSync(usedFile);
  const differs = !exists || hash(usedFile) !== hash(libFile);
  if (mode === 'write' && differs) {
    fs.mkdirSync(path.dirname(usedFile), { recursive: true });
    fs.copyFileSync(libFile, usedFile);
    copied += 1;
  } else if (!exists) {
    console.error(`Missing runtime copy: used/${usedRelative}`);
    missingRuntime += 1;
  } else if (differs) {
    console.error(`Drifted runtime copy: used/${usedRelative} != lib/${libRelative}`);
    drifted += 1;
  }
}

const tracked = new Set(Object.keys(manifest.assets));
const extras = walk(USED).filter(isImage)
  .map((file) => toPosix(path.relative(USED, file)))
  .filter((relative) => !tracked.has(relative))
  .sort();
for (const relative of extras) console.error(`Untracked runtime image: used/${relative}`);

if (mode === 'write') console.log(`Synced ${copied} runtime image${copied === 1 ? '' : 's'} from lib.`);
console.log(`Checked ${tracked.size} manifest entries; ${extras.length} untracked runtime images.`);

if (missingSources || missingRuntime || drifted || extras.length) process.exit(1);
