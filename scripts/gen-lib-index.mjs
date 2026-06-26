import fs from 'fs';
import path from 'path';

// Generates public/assets/lib-index.html. Driven by the USED app-facing
// symlinks: each section shows the active pointer first, then every real image
// file in the matching lib category/subject folder. Swap by repointing the used
// symlink with tools/swap-asset.mjs.

const ASSETS = 'public/assets';
const LIB = path.join(ASSETS, 'lib');
const USED = path.join(ASSETS, 'used');
const IMG = /\.(png|jpe?g|gif|webp|svg)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return [p];
  });
}

function objectKey(basename) {
  let n = basename.replace(IMG, '');
  const h = n.match(/^(housing-tier-\d+)/);
  if (h) return h[1];
  n = n.split('-before-')[0];
  n = n.replace(/-\d+x\d+.*$/, '');
  n = n.replace(/-v\d+.*$/, '');
  return n;
}

function subjectFromUsed(rel) {
  const parts = rel.split('/');
  const file = parts.at(-1);
  const key = objectKey(file);

  if (parts[0] === 'population' && parts[1] === 'busts') return { cat: 'population', subject: key };
  if (parts[0] === 'map-tiles' && parts[1] === 'blend' && parts.length >= 4) {
    return { cat: 'map-tiles/blend', subject: parts[2] };
  }
  if (parts[0] === 'map-tiles' && parts[1] === 'road') return { cat: 'map-tiles', subject: 'road' };
  if (parts.length === 2) return { cat: parts[0], subject: key };
  return { cat: parts.slice(0, -1).join('/'), subject: key };
}

function libFiles(cat, subject) {
  const dir = path.join(LIB, cat, subject);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => IMG.test(f))
    .sort()
    .map((f) => `${cat}/${subject}/${f}`);
}

const usedFiles = walk(USED)
  .filter((f) => IMG.test(f))
  .map((f) => path.relative(USED, f).split(path.sep).join('/'))
  .sort();

const activeKeys = new Set();
const byCat = new Map();
for (const rel of usedFiles) {
  const subj = subjectFromUsed(rel);
  const key = `${subj.cat}/${subj.subject}`;
  activeKeys.add(key);
  if (!byCat.has(subj.cat)) byCat.set(subj.cat, []);
  byCat.get(subj.cat).push({ ...subj, rel, key });
}

const card = (src, label, cls, badge) => `
        <div class="card ${cls}">
          <img loading="lazy" src="${src}" alt="${label}">
          <div class="name">${label}</div>
          ${badge ? `<div class="badge ${cls}">${badge}</div>` : ''}
        </div>`;

function section(name, activeRel, files) {
  let cards = activeRel ? card(`used/${activeRel}`, activeRel.split('/').pop(), 'active', 'ACTIVE') : '';
  for (const rel of files) cards += card(`lib/${rel}`, rel.split('/').pop(), 'lib', '');
  return `
      <section data-name="${name}">
        <h3>${name} <span class="count">${activeRel ? '1 active pointer' : 'no active pointer'} · ${files.length} lib files</span></h3>
        <div class="row">${cards || '<span class="empty">— no images —</span>'}</div>
      </section>`;
}

const catOrder = ['resources', 'buildings', 'map-tiles', 'map-tiles/blend', 'terrain', 'population', 'coat-of-arms', 'cursors', 'ui'];
const cats = [...byCat.keys()].sort((a, b) => {
  const ia = catOrder.indexOf(a);
  const ib = catOrder.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
});

let body = '';
for (const cat of cats) {
  body += `<h2>${cat}</h2>`;
  const subjects = byCat.get(cat).sort((a, b) => a.subject.localeCompare(b.subject));
  for (const subj of subjects) body += section(subj.key, subj.rel, libFiles(subj.cat, subj.subject));
}

const candidates = walk(LIB)
  .filter((f) => IMG.test(f))
  .map((f) => path.relative(LIB, f).split(path.sep).join('/'))
  .map((rel) => {
    const parts = rel.split('/');
    if (parts.length < 3) return null;
    return { key: `${parts[0]}/${parts[1]}`, cat: parts[0], subject: parts[1] };
  })
  .filter(Boolean)
  .filter((item, index, arr) => arr.findIndex((other) => other.key === item.key) === index)
  .filter((item) => !activeKeys.has(item.key))
  .sort((a, b) => a.key.localeCompare(b.key));

if (candidates.length) {
  body += `<h2>Candidates <span class="count">(${candidates.length} lib subjects with no used pointer)</span></h2>`;
  for (const item of candidates) body += section(item.key, '', libFiles(item.cat, item.subject));
}

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Asset Lib Index</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: sans-serif; background: #14141f; color: #eee; padding: 20px; }
  h1 { font-size: 1.35rem; color: #a0c4ff; margin-bottom: 4px; }
  p.hint { font-size: .8rem; color: #8a8; margin-bottom: 14px; }
  .search { position: sticky; top: 0; padding: 10px 0; background: #14141f; z-index: 5; }
  .search input { width: 100%; max-width: 420px; padding: 8px 12px; font-size: 14px;
    border-radius: 8px; border: 1px solid #333; background: #1e1e2e; color: #eee; }
  h2 { font-size: 1.05rem; color: #ffd6a5; margin: 26px 0 6px; border-bottom: 1px solid #333; padding-bottom: 6px; }
  h2 .count { font-size: .7rem; color: #777; font-weight: normal; }
  section { margin: 12px 0; }
  h3 { font-size: .85rem; color: #caffbf; }
  .count { font-size: .68rem; color: #777; font-weight: normal; }
  .row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
  .empty { font-size: .72rem; color: #666; font-style: italic; }
  .card { width: 116px; background: #1b1b2b; border: 1px solid #2a2a3e; border-radius: 8px;
    padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .card.active { border-color: #a0c4ff; box-shadow: 0 0 0 1px #a0c4ff55; }
  .card img { width: 88px; height: 88px; object-fit: contain; image-rendering: pixelated; border-radius: 4px;
    background:
      linear-gradient(45deg,#333 25%,transparent 25%),linear-gradient(-45deg,#333 25%,transparent 25%),
      linear-gradient(45deg,transparent 75%,#333 75%),linear-gradient(-45deg,transparent 75%,#333 75%);
    background-size: 12px 12px; background-position: 0 0,0 6px,6px -6px,-6px 0; background-color: #222; }
  .card .name { font-size: .62rem; color: #bbb; text-align: center; word-break: break-all; }
  .card .badge { font-size: .55rem; padding: 1px 6px; border-radius: 8px; }
  .card .badge.active { background: #a0c4ff33; color: #a0c4ff; }
</style></head>
<body>
  <h1>Asset Lib Index</h1>
  <p class="hint">Each subject shows the active <code>used/</code> pointer first, then real files from <code>lib/</code>. Swap with <code>node tools/swap-asset.mjs buildings/clinic.png buildings/clinic/v3-same-size.png</code>.</p>
  <div class="search"><input id="q" placeholder="filter objects..." oninput="filter()"></div>
  <div id="list">${body}
  </div>
  <script>
    function filter(){const q=document.getElementById('q').value.toLowerCase();
      for(const s of document.querySelectorAll('section')){
        const hit=s.dataset.name.includes(q); s.style.display=hit?'':'none';}
      for(const h of document.querySelectorAll('h2')){
        let n=h.nextElementSibling,any=false;
        while(n&&n.tagName!=='H2'){if(n.tagName==='SECTION'&&n.style.display!=='none')any=true;n=n.nextElementSibling;}
        h.style.display=any?'':'none';}}
  </script>
</body></html>
`;

const out = path.join(ASSETS, 'lib-index.html');
fs.writeFileSync(out, html);
console.log(`Wrote ${out} — ${usedFiles.length} used pointers, ${candidates.length} candidate subjects.`);
