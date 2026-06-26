import fs from 'fs';
import path from 'path';

const ASSETS = 'public/assets';
const USED = path.join(ASSETS, 'used');
const LIB = path.join(ASSETS, 'lib');

const [usedRel, libRel] = process.argv.slice(2);

if (!usedRel || !libRel) {
  console.error('Usage: node tools/swap-asset.mjs <used-relative-path> <lib-relative-path>');
  console.error('Example: node tools/swap-asset.mjs buildings/clinic.png buildings/clinic/v3-same-size.png');
  process.exit(1);
}

const usedPath = path.join(USED, usedRel);
const libPath = path.join(LIB, libRel);

if (!fs.existsSync(libPath)) {
  console.error(`Missing lib target: ${libPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(usedPath), { recursive: true });
fs.copyFileSync(libPath, usedPath);
console.log(`Copied ${libRel} -> ${usedRel}`);
