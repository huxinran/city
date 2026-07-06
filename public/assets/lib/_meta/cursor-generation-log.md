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

## 2026-06-28 - cropped side-bar artifacts from hand and hammer cursors

Removed full-height side artifact strips from the active hand and build hammer cursor PNGs. Earlier recolor attempts turned the artifact grey; the final fix trims those columns to transparent and keeps the cursor canvas at 40x40.

| Cursor | Library cursor | Runtime cursor | Note |
|--------|----------------|----------------|------|
| build-hammer | `public/assets/lib/cursors/build-hammer/build-hammer-v4-cropped-side-bars.png` | `public/assets/used/cursors/build-hammer.png` | cropped bad side columns while preserving 40x40 cursor canvas |
| white-glove-pointer | `public/assets/lib/cursors/white-glove-pointer/v4-cropped-side-bars.png` | `public/assets/used/cursors/white-glove-pointer.png` | cropped bad side columns while preserving 40x40 cursor canvas |

## 2026-06-28 - upgrade-style downgrade and move cursors

Regenerated downgrade and move to match the visual language of the accepted upgrade icon: chunky dark-brown outline, glossy beveled arrow fill, and golden rim/highlights. The generated UI sources had checkerboard-style backgrounds, so the project background remover was run on the archived library copies before downscaling to the active 40x40 runtime cursors.

| Cursor | Library UI source | Library cursor | Runtime cursor | Source cache | Note |
|--------|-------------------|----------------|----------------|--------------|------|
| downgrade-arrow | `public/assets/lib/ui/downgrade-button/v3-upgrade-style-source.png` | `public/assets/lib/cursors/downgrade-arrow/v4-upgrade-style.png` | `public/assets/used/cursors/downgrade-arrow.png` | `/Users/xinranhu/.codex/generated_images/019f101a-d683-76f1-bc9c-b0b765ab639e/ig_025b2d2353b3ebdb016a4190acd0dc8197bd6a5206386bb2fc.png` | red-orange down arrow using the upgrade icon's chunky golden-rim style |
| move-arrows | `public/assets/lib/ui/move-button/v8-upgrade-style-source.png` | `public/assets/lib/cursors/move-arrows/v8-upgrade-style.png` | `public/assets/used/cursors/move-arrows.png` | `/Users/xinranhu/.codex/generated_images/019f101a-d683-76f1-bc9c-b0b765ab639e/ig_025b2d2353b3ebdb016a4190df1a3c81978145a42b60b715eb.png` | four chunky golden arrows, enlarged for better palette/cursor readability |

Follow-up: enlarged the active upgrade cursor from the accepted upgrade UI source so it visually matches the new downgrade and move scale. The cleaned source is `public/assets/lib/ui/upgrade-button/v2-clean-source.png`, the archived cursor is `public/assets/lib/cursors/upgrade-arrow/v4-upgrade-style.png`, and the runtime cursor is `public/assets/used/cursors/upgrade-arrow.png`.

## 2026-06-28 - matched-shape generated action cursor set

Generated a fresh up arrow and move icon, then derived the down arrow directly from the up arrow by vertical flip and green-to-red recolor. This keeps upgrade and downgrade as the exact same silhouette while preserving different action colors. The runtime up/down alpha masks were verified to match after flipping.

| Cursor | Library UI source | Library cursor | Runtime cursor | Source cache | Note |
|--------|-------------------|----------------|----------------|--------------|------|
| upgrade-arrow | `public/assets/lib/ui/upgrade-button/v5-matched-shape-source.png` | `public/assets/lib/cursors/upgrade-arrow/v5-matched-shape.png` | `public/assets/used/cursors/upgrade-arrow.png` | `/Users/xinranhu/.codex/generated_images/019f101a-d683-76f1-bc9c-b0b765ab639e/ig_0aa56810eb8370f1016a41a0051f888194871ca3a0519bd4ba.png` | green up arrow; master silhouette for the matched pair |
| downgrade-arrow | `public/assets/lib/ui/downgrade-button/v5-matched-shape-source.png` | `public/assets/lib/cursors/downgrade-arrow/v5-matched-shape.png` | `public/assets/used/cursors/downgrade-arrow.png` | derived from upgrade source | red-orange down arrow made by flipping and recoloring the upgrade source |
| move-arrows | `public/assets/lib/ui/move-button/v9-matched-set-source.png` | `public/assets/lib/cursors/move-arrows/v9-matched-set.png` | `public/assets/used/cursors/move-arrows.png` | `/Users/xinranhu/.codex/generated_images/019f101a-d683-76f1-bc9c-b0b765ab639e/ig_0aa56810eb8370f1016a41a07aaca4819499265a8cdda2aa6c.png` | four golden arrows generated for the same cursor family |

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v6-matched-shape-light-fixed.png`. This keeps the exact matched alpha silhouette from v5, but transfers the natural top-left lighting from the separately generated down-arrow reference `public/assets/lib/ui/downgrade-button/v6-lighting-reference-source.png` into `public/assets/lib/ui/downgrade-button/v6-matched-shape-light-fixed-source.png`, avoiding the vertically flipped highlight artifact.

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v7-matched-shape-bright.png` from `public/assets/lib/ui/downgrade-button/v7-matched-shape-bright-source.png`. This keeps the exact matched alpha silhouette while removing the heavy black shading from v6 and restoring a brighter red-orange body.

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v8-yellow-layer.png` from `public/assets/lib/ui/downgrade-button/v8-yellow-layer-source.png`. This keeps the red-orange body but copies the upgrade arrow's yellow/gold outer layer treatment so the pair reads as the same icon family.

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v9-top-lit.png` from `public/assets/lib/ui/downgrade-button/v9-top-lit-source.png`. This keeps the v8 yellow outer layer but brightens the top-facing rim/body highlights so the down arrow reads as lit from above like the upgrade arrow.

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v10-very-yellow.png` from `public/assets/lib/ui/downgrade-button/v10-very-yellow-source.png`. This pushes the downgrade arrow's outer/top rim much brighter and yellower, closer to the upgrade arrow's gold lighting, while keeping the red-orange body and exact matched silhouette.

Follow-up: restored the active upgrade cursor to `public/assets/lib/cursors/upgrade-arrow/v5-matched-shape.png` and replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v11-red.png`. This keeps the v10 silhouette but removes the yellow/orange cast so the down arrow reads as a clear red cursor.

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v12-red-body-yellow-ring.png`, making the body deeper red and restoring a brighter yellow outer ring.

Follow-up: replaced the active downgrade cursor with `public/assets/lib/cursors/downgrade-arrow/v13-up-ring-red-body.png`. This version is derived directly from the active upgrade arrow by flipping it vertically, keeping the upgrade arrow's gold outer ring and dark outline unchanged, and recoloring only the green body pixels to red.

## 2026-07-06 - cute default white arrow cursor

Added a normal-arrow-style default cursor with a softer rounded silhouette, white fill, warm dark outline, small blush marks, and tiny sparkle detail. The SVG source is archived for future edits, and the active runtime PNG keeps the project-standard 40x40 transparent cursor canvas.

| Cursor | Library source | Library cursor | Runtime cursor | Hotspot | Note |
|--------|----------------|----------------|----------------|---------|------|
| cute-white-arrow | `public/assets/lib/cursors/cute-white-arrow/v1-source.svg` | `public/assets/lib/cursors/cute-white-arrow/v1.png` | `public/assets/used/cursors/cute-white-arrow.png` | `4 3` | inherited as the app default cursor via `--cursor-default` |
