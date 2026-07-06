// Regenerates the two TypeScript asset catalogs from what's on disk:
//
//   src/app/asset-index.ts      — every preloadable PNG under public/assets/used/
//   src/app/lib-asset-index.ts  — every PNG in the public/assets/lib/ archive
//
//   node tools/gen-ts-asset-index.mjs
//
// Rules (matching the hand-established format):
//   - used/: cursors/ excluded (CSS url() strings), _preview* excluded
//   - lib/:  _meta/ excluded, _preview* excluded
//   - one exported const per top-level category dir, numeric-aware sort
import fs from 'fs';
import path from 'path';

const ASSETS = 'public/assets';

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const collect = (tree, skipDirs) => {
  const byCat = new Map();
  for (const e of fs.readdirSync(path.join(ASSETS, tree), { withFileTypes: true })) {
    if (!e.isDirectory() || skipDirs.has(e.name)) continue;
    const files = walk(path.join(ASSETS, tree, e.name))
      .filter(f => f.endsWith('.png') && !path.basename(f).startsWith('_preview'))
      .map(f => path.relative(ASSETS, f).split(path.sep).join('/'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (files.length) byCat.set(e.name, files);
  }
  return new Map([...byCat].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
};

// 'coat-of-arms' → 'COAT_OF_ARMS_ASSETS'; leading-underscore dirs drop the suffix
// ('_artistic-examples' → 'ARTISTIC_EXAMPLES').
const constName = (dir, prefix) =>
  prefix + dir.replace(/^_/, '').replace(/-/g, '_').toUpperCase() + (dir.startsWith('_') ? '' : '_ASSETS');

const emit = (byCat, prefix, header, allName) => {
  let out = header + '\n';
  const names = [];
  for (const [cat, files] of byCat) {
    const name = constName(cat, prefix);
    names.push(name);
    out += '\nexport const ' + name + ' = [\n';
    out += files.map(f => "  'assets/" + f + "',\n").join('');
    out += '] as const;\n';
  }
  out += '\nexport const ' + allName + ': readonly string[] = [\n';
  out += names.map(n => '  ...' + n + ',\n').join('');
  out += '];\n';
  return out;
};

const usedHeader = `// Complete index of every preloadable image asset under assets/used/.
// Cursors are CSS url() strings managed by the browser and are excluded.
// Preview/meta PNGs (_preview*) are never loaded at runtime and are excluded.
//
// Use ALL_ASSETS to preload everything at startup:
//   for (const src of ALL_ASSETS) { const img = new Image(); img.src = src; }`;

const libHeader = `// Complete catalog of every PNG in assets/lib/ (the versioned design archive).
// These are NOT loaded at runtime — the active copies live in assets/used/.
// Use this file to browse what versions exist and pick candidates to promote.`;

const used = collect('used', new Set(['cursors']));
const lib = collect('lib', new Set(['_meta']));

fs.writeFileSync('src/app/asset-index.ts', emit(used, '', usedHeader, 'ALL_ASSETS'));
fs.writeFileSync('src/app/lib-asset-index.ts', emit(lib, 'LIB_', libHeader, 'ALL_LIB_ASSETS'));

const count = (m) => [...m.values()].reduce((n, f) => n + f.length, 0);
console.log('asset-index.ts: ' + count(used) + ' used assets in ' + used.size + ' categories');
console.log('lib-asset-index.ts: ' + count(lib) + ' lib assets in ' + lib.size + ' categories');
