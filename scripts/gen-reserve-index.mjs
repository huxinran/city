import fs from 'fs';
import path from 'path';

// Generates public/assets/reserve-index.html. Driven by the USED (active)
// assets: each section shows the active file first, then every reserve version
// of that object. Reserve-only objects (no active) are listed at the end as
// candidates. Browse, then tell Claude e.g. "use clinic-v3 for clinic" to swap.

const ASSETS = 'public/assets';
const RESERVE = path.join(ASSETS, 'reserve');
const USED = path.join(ASSETS, 'used');
const IMG = /\.(png|jpe?g)$/i;

function objectKey(basename) {
  let n = basename.replace(IMG, '');
  const h = n.match(/^(housing-tier-\d+)/);
  if (h) return h[1];
  n = n.split('-before-')[0];
  n = n.replace(/-\d+x\d+.*$/, '');
  n = n.replace(/-v\d+.*$/, '');
  return n;
}

// Used assets, with their category (first folder under used/).
const usedFiles = [];
(function walk(dir, cat) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cat ?? e.name);
    else if (IMG.test(e.name))
      usedFiles.push({ src: path.relative(ASSETS, p).replace(/\\/g, '/'), key: objectKey(e.name), cat: cat ?? 'other' });
  }
})(USED, null);

// Reserve objects (folder -> sorted files), skipping _meta/_sheets.
const reserve = {};
for (const d of fs.readdirSync(RESERVE, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('_')) continue;
  const files = fs.readdirSync(path.join(RESERVE, d.name)).filter(f => IMG.test(f)).sort();
  if (files.length) reserve[d.name] = files;
}

const CAT_LABELS = { resources: 'Resources', buildings: 'Buildings', 'map-tiles': 'Map Tiles', terrain: 'Terrain', population: 'Population' };
const CAT_ORDER = ['resources', 'buildings', 'map-tiles', 'terrain', 'population'];

const card = (src, label, cls, badge) => `
        <div class="card ${cls}">
          <img loading="lazy" src="${src}" alt="${label}">
          <div class="name">${label}</div>
          ${badge ? `<div class="badge ${cls}">${badge}</div>` : ''}
        </div>`;

const usedKeys = new Set(usedFiles.map(u => u.key));

function section(name, usedCards, reserveFiles) {
  let cards = usedCards;
  for (const f of reserveFiles) cards += card(`reserve/${name}/${f}`, f, 'reserve', '');
  const n = reserveFiles.length;
  return `
      <section data-name="${name}">
        <h3>${name} <span class="count">${usedCards ? '1 active' : 'no active'} · ${n} reserve</span></h3>
        <div class="row">${cards || '<span class="empty">— active only, no reserve versions —</span>'}</div>
      </section>`;
}

let body = '';

// 1. Used-driven sections, grouped by category.
for (const cat of CAT_ORDER) {
  const files = usedFiles.filter(u => u.cat === cat);
  if (!files.length) continue;
  body += `<h2>${CAT_LABELS[cat] ?? cat}</h2>`;
  for (const u of files.sort((a, b) => a.key.localeCompare(b.key))) {
    const usedCard = card(u.src, u.src.split('/').pop(), 'active', 'ACTIVE');
    body += section(u.key, usedCard, reserve[u.key] ?? []);
  }
}

// 2. Reserve-only objects (no active counterpart) — candidate art.
const candidates = Object.keys(reserve).filter(k => !usedKeys.has(k)).sort();
if (candidates.length) {
  body += `<h2>Candidates <span class="count">(${candidates.length} objects with no active asset)</span></h2>`;
  for (const k of candidates) body += section(k, '', reserve[k]);
}

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Asset Index — pick &amp; swap</title>
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
  <h1>Asset Index — pick &amp; swap</h1>
  <p class="hint">Each object shows its <b style="color:#a0c4ff">ACTIVE</b> file first, then all reserve versions. To swap, tell Claude e.g. <b>"use clinic-v3 for clinic"</b>.</p>
  <div class="search"><input id="q" placeholder="filter objects… (e.g. clinic, wine, farm)" oninput="filter()"></div>
  <div id="list">${body}
  </div>
  <script>
    function filter(){const q=document.getElementById('q').value.toLowerCase();
      for(const s of document.querySelectorAll('section')){
        const hit=s.dataset.name.includes(q); s.style.display=hit?'':'none';}
      for(const h of document.querySelectorAll('h2')){ // hide empty category headers
        let n=h.nextElementSibling,any=false;
        while(n&&n.tagName!=='H2'){if(n.tagName==='SECTION'&&n.style.display!=='none')any=true;n=n.nextElementSibling;}
        h.style.display=any?'':'none';}}
  </script>
</body></html>
`;

const out = path.join(ASSETS, 'reserve-index.html');
fs.writeFileSync(out, html);
console.log(`Wrote ${out} — ${usedFiles.length} active assets, ${candidates.length} candidate objects.`);
