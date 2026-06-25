#!/usr/bin/env node
// Scans the reserve/ folder and generates reserve/index.html — a visual gallery
// of every subject and its versions. Re-run after adding icons:
//   node public/assets/reserve/_meta/build-index.mjs
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const META = dirname(fileURLToPath(import.meta.url));
const RESERVE = dirname(META);

// version rank: base name = 1, "-vN" = N. Highest = latest/preferred.
const rank = (f) => {
  const m = f.match(/-v(\d+)\.png$/i);
  return m ? Number(m[1]) : 1;
};

const subjects = readdirSync(RESERVE)
  .filter((n) => !n.startsWith('_') && n !== 'old_asset')
  .filter((n) => {
    try { return statSync(join(RESERVE, n)).isDirectory(); } catch { return false; }
  })
  .sort();

let cards = 0, total = 0;
const sections = [];

for (const subj of subjects) {
  const dir = join(RESERVE, subj);
  const pngs = readdirSync(dir).filter(
    (f) => f.toLowerCase().endsWith('.png') && !/before-white-bg-removal|before-chroma-key/i.test(f),
  );
  if (pngs.length === 0) continue;
  // sort newest version first
  pngs.sort((a, b) => rank(b) - rank(a) || a.localeCompare(b));
  const latest = pngs[0];
  total += pngs.length;
  cards++;

  const inner = pngs
    .map((f) => {
      const isLatest = f === latest;
      const badge = isLatest
        ? '<div class="badge latest">latest</div>'
        : '<div class="badge reserve">reserve</div>';
      return `    <div class="card${isLatest ? ' latest' : ''}">
      <img loading="lazy" src="${subj}/${f}" alt="${f}">
      <div class="name">${f.replace(/\.png$/i, '')}</div>
      ${badge}
    </div>`;
    })
    .join('\n');

  sections.push(`<h3>${subj} <span class="count">(${pngs.length})</span></h3>
<div class="row">
${inner}
</div>`);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reserve Asset Index</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: sans-serif; background: #1a1a2e; color: #eee; padding: 24px; }
  h1 { font-size: 1.4rem; margin-bottom: 6px; color: #a0c4ff; }
  .sub { font-size: 0.8rem; color: #888; margin-bottom: 20px; }
  .controls { margin-bottom: 24px; }
  #q { padding: 8px 12px; width: 280px; border-radius: 6px; border: 1px solid #2a2a4a;
       background: #16213e; color: #eee; font-size: 0.9rem; }
  label.bg { font-size: 0.8rem; color: #aaa; margin-left: 16px; cursor: pointer; }
  h3 { font-size: 0.95rem; margin: 24px 0 8px; color: #ffd6a5; text-transform: capitalize;
       border-bottom: 1px solid #2a2a4a; padding-bottom: 4px; }
  h3 .count { font-size: 0.7rem; color: #666; }
  .row { display: flex; flex-wrap: wrap; gap: 14px; }
  .card { background: #16213e; border: 1px solid #2a2a4a; border-radius: 8px; padding: 10px;
          display: flex; flex-direction: column; align-items: center; gap: 6px; width: 120px; }
  .card.latest { border-color: #caffbf; box-shadow: 0 0 0 1px #caffbf44; }
  .card img { width: 72px; height: 72px; object-fit: contain; image-rendering: pixelated;
              border-radius: 4px; padding: 4px; background:
              repeating-conic-gradient(#2a2a4a 0% 25%, #222238 0% 50%) 50% / 16px 16px; }
  body.white .card img { background: #fff; }
  .card .name { font-size: 0.65rem; text-align: center; color: #bbb; word-break: break-all; }
  .badge { font-size: 0.58rem; padding: 2px 6px; border-radius: 10px; }
  .badge.latest { background: #caffbf33; color: #caffbf; }
  .badge.reserve { background: #ffd6a522; color: #ffd6a5; }
  .hidden { display: none; }
</style>
</head>
<body>
<h1>Reserve Asset Index</h1>
<div class="sub">${cards} subjects &middot; ${total} images &middot; generated ${new Date().toISOString().slice(0, 10)} by _meta/build-index.mjs. "latest" = highest version per subject.</div>
<div class="controls">
  <input id="q" type="search" placeholder="Filter subjects…">
  <label class="bg"><input type="checkbox" id="bg"> white background</label>
</div>
<div id="gallery">
${sections.join('\n\n')}
</div>
<script>
  const q = document.getElementById('q');
  const groups = [...document.querySelectorAll('#gallery h3')].map((h) => ({ h, row: h.nextElementSibling }));
  q.addEventListener('input', () => {
    const t = q.value.trim().toLowerCase();
    for (const { h, row } of groups) {
      const match = h.textContent.toLowerCase().includes(t);
      h.classList.toggle('hidden', !match);
      row.classList.toggle('hidden', !match);
    }
  });
  document.getElementById('bg').addEventListener('change', (e) => {
    document.body.classList.toggle('white', e.target.checked);
  });
</script>
</body>
</html>
`;

writeFileSync(join(RESERVE, 'index.html'), html);
console.log(`Wrote reserve/index.html — ${cards} subjects, ${total} images.`);
