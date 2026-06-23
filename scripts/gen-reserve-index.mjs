import fs from 'fs';
import path from 'path';

// Generates public/assets/reserve-index.html: every object with all its
// reserve versions + the currently-active "used" file marked. Browse, then
// tell Claude e.g. "use clinic-v3 for clinic" to swap it into used/.

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

// Map object-key -> active used file path (relative to assets/).
const usedByKey = {};
(function walkUsed(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkUsed(p);
    else if (IMG.test(e.name)) usedByKey[objectKey(e.name)] = path.relative(ASSETS, p).replace(/\\/g, '/');
  }
})(USED);

// Collect reserve objects (folders) -> sorted file list. Skip _meta/_sheets.
const objects = {};
for (const d of fs.readdirSync(RESERVE, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('_')) continue;
  const files = fs.readdirSync(path.join(RESERVE, d.name)).filter(f => IMG.test(f)).sort();
  if (files.length) objects[d.name] = files;
}

const names = Object.keys(objects).sort();
const card = (src, label, cls = '', badge = '') => `
      <div class="card ${cls}">
        <img loading="lazy" src="${src}" alt="${label}">
        <div class="name">${label}</div>
        ${badge ? `<div class="badge">${badge}</div>` : ''}
      </div>`;

let sections = '';
for (const obj of names) {
  const used = usedByKey[obj];
  let cards = '';
  if (used) cards += card(used, used.split('/').pop(), 'active', 'ACTIVE');
  for (const f of objects[obj]) cards += card(`reserve/${obj}/${f}`, f, '', '');
  sections += `
    <section data-name="${obj}">
      <h2>${obj} <span class="count">${objects[obj].length} version${objects[obj].length > 1 ? 's' : ''}${used ? '' : ' · no active'}</span></h2>
      <div class="row">${cards}</div>
    </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Reserve Index — pick & swap</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: sans-serif; background: #14141f; color: #eee; padding: 20px; }
  h1 { font-size: 1.3rem; color: #a0c4ff; margin-bottom: 4px; }
  p.hint { font-size: .8rem; color: #8a8; margin-bottom: 16px; }
  .search { position: sticky; top: 0; padding: 10px 0; background: #14141f; z-index: 5; }
  .search input { width: 100%; max-width: 420px; padding: 8px 12px; font-size: 14px;
    border-radius: 8px; border: 1px solid #333; background: #1e1e2e; color: #eee; }
  section { margin: 22px 0; border-top: 1px solid #262636; padding-top: 12px; }
  h2 { font-size: .95rem; color: #ffd6a5; }
  .count { font-size: .7rem; color: #777; font-weight: normal; }
  .row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
  .card { width: 116px; background: #1b1b2b; border: 1px solid #2a2a3e; border-radius: 8px;
    padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .card.active { border-color: #a0c4ff; box-shadow: 0 0 0 1px #a0c4ff55; }
  .card img { width: 88px; height: 88px; object-fit: contain; image-rendering: pixelated; border-radius: 4px;
    background:
      linear-gradient(45deg,#333 25%,transparent 25%),linear-gradient(-45deg,#333 25%,transparent 25%),
      linear-gradient(45deg,transparent 75%,#333 75%),linear-gradient(-45deg,transparent 75%,#333 75%);
    background-size: 12px 12px; background-position: 0 0,0 6px,6px -6px,-6px 0; background-color: #222; }
  .card .name { font-size: .62rem; color: #bbb; text-align: center; word-break: break-all; }
  .card .badge { font-size: .55rem; padding: 1px 6px; border-radius: 8px; background: #a0c4ff33; color: #a0c4ff; }
</style></head>
<body>
  <h1>Reserve Index — pick &amp; swap</h1>
  <p class="hint">Browse every object's versions. Blue = currently active. To swap, tell Claude e.g. <b>"use clinic-v3 for clinic"</b>.</p>
  <div class="search"><input id="q" placeholder="filter objects… (e.g. clinic, wine, farm)" oninput="filter()"></div>
  <div id="list">${sections}
  </div>
  <script>
    function filter(){const q=document.getElementById('q').value.toLowerCase();
      for(const s of document.querySelectorAll('section'))
        s.style.display=s.dataset.name.includes(q)?'':'none';}
  </script>
</body></html>
`;

const out = path.join(ASSETS, 'reserve-index.html');
fs.writeFileSync(out, html);
console.log(`Wrote ${out} — ${names.length} objects, active art linked where present.`);
