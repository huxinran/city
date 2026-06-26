import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.argv[2]; // public/assets
process.chdir(ROOT);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => { const p = path.join(d, e.name); return e.isDirectory() ? walk(p) : [p]; });
const dim = async (f) => { try { const m = await sharp(f).metadata(); return m.width + '×' + m.height; } catch { return '?'; } };

const usedFiles = walk('used').filter(f => f.endsWith('.png')).map(f => f.split(path.sep).join('/'));
const groups = {};
for (const f of usedFiles) {
  const rel = f.slice('used/'.length);
  const cat = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '(root)';
  (groups[cat] ??= []).push(rel.split('/').pop());
}

let md = '# Asset Index\n\n';
md += 'Auto-generated map of `public/assets/`. Two trees:\n\n';
md += '- **`used/`** — the live set referenced by the app (' + usedFiles.length + ' files). Editing here changes the game.\n';
md += '- **`reserve/`** — staging library of generated source art (one folder per item). Not referenced by code; promote into `used/` when needed.\n\n';
md += '> Regenerate: `node tools/gen-asset-index.mjs`\n\n';
md += '---\n\n## `used/` — live assets\n\n';

const order = ['map-tiles', 'map-tiles/road', 'buildings', 'resources', 'terrain', 'population/busts', 'coat-of-arms', 'cursors'];
const cats = Object.keys(groups).sort((a, b) => {
  const ia = order.indexOf(a), ib = order.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
});

for (const cat of cats) {
  if (cat.startsWith('map-tiles/blend')) continue;
  const files = groups[cat].sort();
  const sizes = new Set();
  for (const fn of files) sizes.add(await dim('used/' + cat + '/' + fn));
  md += '### `' + cat + '/`  ·  ' + files.length + ' files  ·  ' + [...sizes].join(', ') + '\n\n';
  md += files.map(f => '`' + f.replace(/\.png$/, '') + '`').join(', ') + '\n\n';
}

md += '### `map-tiles/blend/`  ·  terrain auto-tiling (dual-grid corner-Wang)\n\n';
md += 'Three 16-tile sets, one per layer boundary. Files are `0.png`–`F.png` = the 4-corner mask (`NW=1, NE=2, SE=4, SW=8`). See each folder’s `README.md` for source/version.\n\n';
md += '| folder | boundary | bit 1 = |\n|---|---|---|\n';
md += '| `sand-sea/` | sand ↔ sea | sea |\n| `grass-sand/` | grass ↔ sand | grass |\n| `dirt-grass/` | dirt ↔ grass | dirt |\n\n';

const reserveDirs = fs.readdirSync('reserve', { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('_')).map(e => e.name).sort();
md += '---\n\n## `reserve/` — staging library\n\n';
md += reserveDirs.length + ' item folders (plus `_meta/`, `_sheets/`). Each holds variants of one icon/sprite.\n\n';
md += '<details><summary>All ' + reserveDirs.length + ' items</summary>\n\n';
md += reserveDirs.map(d => '`' + d + '`').join(', ') + '\n\n</details>\n';

fs.writeFileSync('INDEX.md', md);
console.log('wrote ' + ROOT + '/INDEX.md (' + md.length + ' bytes, ' + usedFiles.length + ' used files, ' + reserveDirs.length + ' reserve items)');
