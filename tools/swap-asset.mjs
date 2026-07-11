import fs from 'fs';
import path from 'path';

const ASSETS = 'public/assets';
const USED = path.join(ASSETS, 'used');
const LIB = path.join(ASSETS, 'lib');
const MANIFEST = path.join(ASSETS, 'active-assets.json');

const [usedRel, libRel] = process.argv.slice(2);

if (!usedRel || !libRel) {
  console.error('Usage: node tools/swap-asset.mjs <used-relative-path> <lib-relative-path>');
  console.error('Example: node tools/swap-asset.mjs buildings/clinic.png buildings/clinic/v3-same-size.png');
  process.exit(1);
}

const safePath = (root, relative, label) => {
  if (path.isAbsolute(relative)) throw new Error(`${label} path must be relative: ${relative}`);
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(root, ...relative.split('/'));
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${label} path escapes its root: ${relative}`);
  }
  return resolved;
};

const usedPath = safePath(USED, usedRel, 'used');
const libPath = safePath(LIB, libRel, 'lib');

if (!fs.existsSync(libPath)) {
  console.error(`Missing lib target: ${libPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(usedPath), { recursive: true });
fs.copyFileSync(libPath, usedPath);

const manifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  : { version: 1, description: 'Active runtime images. Keys are paths under used/; values are their source-of-truth paths under lib/.', assets: {} };
manifest.assets[usedRel.split(path.sep).join('/')] = libRel.split(path.sep).join('/');
manifest.assets = Object.fromEntries(Object.entries(manifest.assets).sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true })));

const temporaryManifest = `${MANIFEST}.tmp`;
fs.writeFileSync(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`);
fs.renameSync(temporaryManifest, MANIFEST);
console.log(`Activated lib/${libRel} -> used/${usedRel} and updated active-assets.json`);
