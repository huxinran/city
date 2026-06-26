import fs from 'fs';
import path from 'path';

const USED = 'public/assets/used';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return [p];
  });
}

let count = 0;
for (const f of walk(USED)) {
  if (fs.lstatSync(f).isSymbolicLink()) {
    const real = fs.realpathSync(f);
    fs.unlinkSync(f);
    fs.copyFileSync(real, f);
    count++;
  }
}
console.log(`Dereferenced ${count} symlinks in ${USED}.`);
