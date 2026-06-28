# Cursor Generation Log

## 2026-06-27 - upgrade and downgrade arrow cursors

Created 40x40 transparent cursor derivatives from the simplified arrow button assets.

| Cursor | Library source | Library cursor | Runtime cursor | Note |
|--------|----------------|----------------|----------------|------|
| upgrade-arrow | `public/assets/lib/cursors/upgrade-arrow/v1-source.png` | `public/assets/lib/cursors/upgrade-arrow/v1.png` | `public/assets/used/cursors/upgrade-arrow.png` | small green up-arrow cursor derived from `public/assets/lib/ui/upgrade-button/v1.png` |
| downgrade-arrow | `public/assets/lib/cursors/downgrade-arrow/v1-source.png` | `public/assets/lib/cursors/downgrade-arrow/v1.png` | `public/assets/used/cursors/downgrade-arrow.png` | small red-orange down-arrow cursor derived from `public/assets/lib/ui/downgrade-button/v1.png` |

Notes: cursor PNGs are 40x40 RGBA. The button source art has a baked checkerboard-style background; the cursor derivatives remove the neutral light checker pixels to alpha.

## 2026-06-27 - clean arrow cursors and simple move arrows

Replaced the small upgrade/downgrade cursor PNGs with purpose-built transparent arrow art to avoid stray generated edge pixels, and added a simple four-yellow-arrow move cursor.

| Cursor | Library cursor | Runtime cursor | Note |
|--------|----------------|----------------|------|
| upgrade-arrow | `public/assets/lib/cursors/upgrade-arrow/v2.png` | `public/assets/used/cursors/upgrade-arrow.png` | clean green up arrow, transparent background |
| downgrade-arrow | `public/assets/lib/cursors/downgrade-arrow/v2.png` | `public/assets/used/cursors/downgrade-arrow.png` | clean red-orange down arrow, transparent background |
| move-arrows | `public/assets/lib/cursors/move-arrows/v2.png` | `public/assets/used/cursors/move-arrows.png` | four simple yellow arrows, transparent background |

Also archived the larger simple move source as `public/assets/lib/ui/move-button/v2-simple-arrows.png`.

Follow-up: shrank the move arrows slightly to leave a fully transparent cursor border. Final move files are `public/assets/lib/cursors/move-arrows/v3.png`, `public/assets/used/cursors/move-arrows.png`, and `public/assets/lib/ui/move-button/v3-simple-arrows.png`.

## 2026-06-27 - chunky generated action cursor set

Regenerated upgrade, downgrade, and move as larger chunky image-generated UI sources, then downscaled them into the active 40x40 cursor files. Each cursor keeps a warm dark outline, beveled color fill, and fully transparent outer edge.

| Cursor | Library cursor | Runtime cursor | Note |
|--------|----------------|----------------|------|
| upgrade-arrow | `public/assets/lib/cursors/upgrade-arrow/v3-imagegen-chunky.png` | `public/assets/used/cursors/upgrade-arrow.png` | downscaled from the larger chunky green upgrade button source |
| downgrade-arrow | `public/assets/lib/cursors/downgrade-arrow/v3-imagegen-chunky.png` | `public/assets/used/cursors/downgrade-arrow.png` | downscaled from the larger chunky red-orange downgrade button source |
| move-arrows | `public/assets/lib/cursors/move-arrows/v7-imagegen-chunky.png` | `public/assets/used/cursors/move-arrows.png` | downscaled from the larger chunky yellow move button source |
