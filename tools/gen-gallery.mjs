// Generates a self-contained gallery page listing every image under
// public/assets, grouped by folder, with a live search filter. Opened from the
// in-game menu ("Image Directory") in a new browser tab.
//
//   node tools/gen-gallery.mjs public/assets
//
import fs from 'fs';
import path from 'path';

const ROOT = process.argv[2] || 'public/assets';

const IMG = /\.(png|jpg|jpeg|gif|webp|svg)$/i;
const SKIP_DIRS = new Set(['_meta', 'lib']);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
  if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) return [];
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

// Collect images relative to ROOT, grouped by their immediate parent folder.
const files = walk(ROOT).filter(f => IMG.test(f))
  .map(f => path.relative(ROOT, f).split(path.sep).join('/'))
  .sort();

const groups = new Map();
for (const rel of files) {
  const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '(root)';
  if (!groups.has(dir)) groups.set(dir, []);
  groups.get(dir).push(rel);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

let body = '';
for (const dir of [...groups.keys()].sort()) {
  const imgs = groups.get(dir);
  const cards = imgs.map(rel => {
    const name = rel.split('/').pop();
    return `<button class="pal-icon" data-q="${esc(rel.toLowerCase())}" title="${esc(rel)}">
      <div class="pal-icon-slot"><img loading="lazy" src="${esc(rel)}" alt="${esc(name)}"></div>
      <div class="name">${esc(name)}</div>
    </button>`;
  }).join('\n');
  body += `<section data-q="${esc(dir.toLowerCase())}">
    <div class="group-title">${esc(dir)} <span class="count">${imgs.length}</span></div>
    <div class="icons">${cards}</div>
  </section>\n`;
}

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Image Directory — ${files.length} assets</title>
<style>
  /* Theme values mirror src/styles.css so this standalone page matches the app. */
  :root {
    --bg: #f5f0e8; --panel: #fdf8f0; --panel-2: #f7f0e2; --elevated: #ede4d0;
    --border: rgba(120,90,50,0.12); --border-strong: rgba(120,90,50,0.25);
    --text: #2d2010; --text-dim: #7a6040; --text-mut: #a8906a; --accent: #5a9e3a;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 16px 20px; }
  h1 { font-size: 1.3rem; color: var(--text); }
  p.hint { font-size: .8rem; color: var(--text-mut); margin: 4px 0 12px; }
  .search { position: sticky; top: 0; padding: 10px 0; background: var(--bg); z-index: 5; }
  .search input { width: 100%; max-width: 420px; padding: 9px 13px; font-size: 14px;
    border-radius: 8px; border: 1px solid var(--border-strong); background: var(--panel); color: var(--text); }

  /* Section header — matches palette .group-title */
  .group-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-dim);
    margin: 22px 0 6px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
  .count { font-size: .68rem; color: var(--text-mut); font-weight: normal; }

  /* Icon grid — matches palette .icons / .pal-icon, scaled up (96px slot vs 58px) */
  .icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; }
  .pal-icon { display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 8px 6px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 6px;
    cursor: default; transition: transform 0.08s ease, border-color 0.12s ease, background 0.12s ease; }
  .pal-icon:hover { background: var(--elevated); border-color: var(--border-strong); transform: translateY(-1px); }
  .pal-icon-slot { display: flex; align-items: center; justify-content: center; width: 96px; height: 96px; }
  .pal-icon-slot img { max-width: 96px; max-height: 96px; object-fit: contain; image-rendering: pixelated; }
  .name { font-size: .64rem; color: var(--text-mut); word-break: break-all; text-align: center; line-height: 1.25; }
  .hidden { display: none !important; }
</style></head>
<body>
  <h1>Image Directory</h1>
  <p class="hint">${files.length} images across ${groups.size} folders · generated ${new Date().toISOString().slice(0,10)}</p>
  <div class="search"><input id="q" type="search" placeholder="Filter by name or path…" autofocus></div>
  ${body}
<script>
  const q = document.getElementById('q');
  q.addEventListener('input', () => {
    const t = q.value.trim().toLowerCase();
    for (const sec of document.querySelectorAll('section')) {
      let any = false;
      for (const c of sec.querySelectorAll('.pal-icon')) {
        const match = !t || c.dataset.q.includes(t) || sec.dataset.q.includes(t);
        c.classList.toggle('hidden', !match);
        any = any || match;
      }
      sec.classList.toggle('hidden', !any);
    }
  });
</script>
</body></html>`;

fs.writeFileSync(path.join(ROOT, 'gallery.html'), html);
console.log(`wrote ${ROOT}/gallery.html (${files.length} images, ${groups.size} folders)`);
