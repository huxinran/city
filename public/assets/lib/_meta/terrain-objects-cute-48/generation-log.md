# Terrain Object Generation Log

## 2026-06-28 - Categorized terrain artifact names

- Request: organize rock, tree, and bush artifacts by category with clean names.
- Runtime copies:
  - `public/assets/used/terrain/rock/main.png`
  - `public/assets/used/terrain/rock/alternative-1.png`
  - `public/assets/used/terrain/rock/alternative-2.png`
  - `public/assets/used/terrain/rock/alternative-3.png`
  - `public/assets/used/terrain/tree/main.png`
  - `public/assets/used/terrain/tree/alternative-1.png` through `alternative-7.png`
  - `public/assets/used/terrain/bush/main.png`
  - `public/assets/used/terrain/bush/alternative-1.png` through `alternative-5.png`
- Library copies mirror the same names under `public/assets/lib/terrain/<rock|tree|bush>/...`.
- Notes: existing flat runtime files were preserved for compatibility.

## 2026-06-28 - Categorized decoration terrain artifacts

- Request: group the remaining decoration pieces into a new directory.
- Runtime copies:
  - `public/assets/used/terrain/decoration/main.png`
  - `public/assets/used/terrain/decoration/alternative-1.png` through `alternative-5.png`
- Library copies mirror the same names under `public/assets/lib/terrain/decoration/...`.
- Notes: source flat runtime files were preserved for compatibility.

## 2026-06-27 - Main tree tall three-tree revision

- Request: regenerate the active main tree as three trees of the same leafy species, replacing the odd narrow tree, and make the clump taller now that map z-sorting supports tile overhang.
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0aba-f7ba-7e50-bb1d-bf08ce2a7d3f/ig_0183c38c273c2799016a403230b8fc8190864a956d0d1ae4b9.png`
- Library asset: `public/assets/lib/terrain/tree/three-leafy-trees-tall-v2.png`
- Active runtime copy: `public/assets/used/terrain/tree.png`
- Notes: generated on magenta chroma-key, removed to alpha locally, resized to 96x160. The sprite keeps a compact one-tile root base while the canopy can extend above the tile.

## 2026-06-27 - Main tree pine revision

- Request: regenerate the active basic tree using a pine tree design.
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0aba-f7ba-7e50-bb1d-bf08ce2a7d3f/ig_0cf700a6e343f2aa016a40412bf0a0819391d453453c9422f7.png`
- Library asset: `public/assets/lib/terrain/tree/three-pine-trees-tall-v3.png`
- Active runtime copy: `public/assets/used/terrain/tree.png`
- Notes: generated on magenta chroma-key, removed to alpha locally, resized to 96x160. The sprite uses three matching pine trees with a compact shared root base.
