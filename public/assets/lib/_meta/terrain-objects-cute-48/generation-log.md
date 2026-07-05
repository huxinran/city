# Terrain Object Generation Log

## 2026-07-05 - Themed city tree and bush sets

- Request: generate four new themed sets of trees and bushes for the other cities, matching arctic, Africa, Asian, and America themes, with 20 different designs in each set.
- Source cache: `C:\Users\Xinran\.codex\generated_images\019f3311-2a42-7fe2-9787-06e40b4e95ba\`
- Themes and runtime folders:
  - Arctic/cold frontier: `public/assets/used/terrain/mintaka/tree/` and `public/assets/used/terrain/mintaka/bush/`
  - Africa/hot tropical savanna: `public/assets/used/terrain/solara/tree/` and `public/assets/used/terrain/solara/bush/`
  - Asian river delta: `public/assets/used/terrain/jinlin/tree/` and `public/assets/used/terrain/jinlin/bush/`
  - America/frontier plains: `public/assets/used/terrain/columbia/tree/` and `public/assets/used/terrain/columbia/bush/`
- Library copies: `public/assets/lib/terrain/<city>/<tree|bush>/themed-20260705/`
- Runtime count: each city/kind now has 20 designs, saved as `main.png` plus `alternative-1.png` through `alternative-19.png`.
- Runtime dimensions: tree sprites are `96x160`; bush sprites are `96x96`.
- App wiring: `src/app/city/map-canvas.component.ts` now samples 19 alternatives for both tree and bush features, so each set has 20 possible designs including `main.png`.
- Review sheets:
  - `tmp/asset-work/themed-terrain-overlays/generated-source-sheets-contact.png`
  - `tmp/asset-work/themed-terrain-overlays/final-20-design-runtime-contact-sheet-clean-v2.png`

## 2026-07-05 - Themed city rock sets

- Request: also generate a new rock set for each setting.
- Source cache: `C:\Users\Xinran\.codex\generated_images\019f3311-2a42-7fe2-9787-06e40b4e95ba\`
- Themes and runtime folders:
  - Temperate fallback: `public/assets/used/terrain/anrelia/rock/`
  - Arctic/cold frontier: `public/assets/used/terrain/mintaka/rock/`
  - Africa/hot tropical savanna: `public/assets/used/terrain/solara/rock/`
  - Asian river delta: `public/assets/used/terrain/jinlin/rock/`
  - America/frontier plains: `public/assets/used/terrain/columbia/rock/`
- Library copies: `public/assets/lib/terrain/<city>/rock/themed-20260705/`
- Runtime count: each city now has 20 rock designs, saved as `main.png` plus `alternative-1.png` through `alternative-19.png`.
- Runtime dimensions: rock sprites are `96x96`.
- App wiring: `src/app/city/map-canvas.component.ts` now samples 19 rock alternatives, so each rock set has 20 possible designs including `main.png`.
- Review sheets:
  - `tmp/asset-work/themed-terrain-overlays/generated-rock-source-sheets-contact.png`
  - `tmp/asset-work/themed-terrain-overlays/final-20-design-rock-contact-sheet.png`

## 2026-06-28 - Rock runtime resolution normalization

- Request: make rock alternatives similar to the main rock's resolution.
- Runtime cleanup: resized `public/assets/used/terrain/rock/alternative-4.png` through `alternative-6.png` to `96x96`, matching `main.png` and the older rock alternatives.
- Notes: library originals were preserved; only active runtime copies were normalized.

## 2026-06-28 - Runtime pruning probability update

- Request: after additional manual pruning, make sure deleted runtime files are not referenced; greatly reduce ambient decoration chance; replace 5% of tree/rock/bush feature tiles with decoration.
- Runtime cleanup:
  - Compacted surviving `public/assets/used/terrain/.../alternative-N.png` files.
  - Runtime counts now match renderer config: tree 10, bush 10, rock 6, decoration 16 alternatives.
- App wiring: feature tiles now reserve 5% for decoration; the remaining 95% keep a 65% main / 35% alternative split. Decoration no longer appears on empty land.

## 2026-06-28 - Promoted terrain alternatives to runtime

- Request: after manual pruning, rename the remaining files and make them used in the real app.
- Cleanup:
  - Compacted surviving `alternative-N.png` filenames so each terrain category has no numbering gaps.
  - Synced library copies into `public/assets/used/terrain/...`.
- Runtime counts:
  - Tree: `main.png` plus `alternative-1.png` through `alternative-10.png`
  - Bush: `main.png` plus `alternative-1.png` through `alternative-10.png`
  - Rock: `main.png` plus `alternative-1.png` through `alternative-9.png`
  - Decoration: `main.png` plus `alternative-1.png` through `alternative-19.png`
- App wiring: `src/app/city/map-canvas.component.ts` now references these runtime counts and uses a higher terrain-object variant rate.

## 2026-06-28 - Expanded terrain alternatives

- Request: create more alternatives for trees, bushes, rocks, and decoration pieces; target 10 alternatives each for tree/bush/rock and 20 decoration alternatives.
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f10-d101-75f0-8137-194d3853b686/`
- Library assets:
  - `public/assets/lib/terrain/tree/alternative-8.png` through `alternative-10.png`
  - `public/assets/lib/terrain/bush/alternative-6.png` through `alternative-10.png`
  - `public/assets/lib/terrain/rock/alternative-4.png` through `alternative-10.png`
  - `public/assets/lib/terrain/decoration/alternative-6.png` through `alternative-20.png`
- Notes: archived generated originals in the library only. Runtime copies under `public/assets/used/terrain/...` were not changed.

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
