# Map Tiles Cute 48 Generation Log

## 2026-06-28 - surface tile categories

Grouped homogeneous base map tiles under `public/assets/used/map-tiles/surfaces/<category>/` and mirrored them in `public/assets/lib/map-tiles/surfaces/<category>/`.

| Category | Runtime files |
|----------|---------------|
| sea | `main.png`, `alternative-1.png` |
| sand | `main.png`, `alternative-1.png` |
| grass | `main.png`, `alternative-1.png` |
| rock-grass | `main.png`, `alternative-1.png` |

Notes: `alternative-1.png` currently matches `main.png` for every category. The renderer can deterministically choose alternates later without visual changes today.

## 2026-06-23 - cute light terrain tile refresh

Created exact 48x48 PNG terrain tiles with light, low-saturation cute pixel styling and small readable features:

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v2.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v2.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v2.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v2.png` |

Notes: v1 preview was busier; v2 softened the base texture so repeated grid rendering stays calm while preserving visible waves, grass tufts, sand dimples, and dirt stones/cracks.

## 2026-06-23 - granular terrain revision

Created a more detailed active v4 pass that uses the full 48x48 area with subtle per-pixel texture instead of large flat color blocks.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v4-granular.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v4-granular.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v4-granular.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v4-granular.png` |

Notes: v3 was very granular but too speckled for repeated grid rendering. v4 lowers the contrast, keeps a soft cute palette, and preserves readable terrain features: grass tufts, sand dimples/shell flecks, sea wave highlights, and dirt pebbles/cracks/sprouts.

## 2026-06-23 - one-feature cartoon terrain revision

Created active v6 tiles following the cute icon style more closely for map terrain: soft cartoon color fields, warm highlights, and exactly one small cute feature per tile.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v6-one-feature.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v6-one-feature.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v6-one-feature.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v6-one-feature.png` |

Notes: v6 intentionally removes scattered accents. Each tile has one feature only: a grass tuft, a small sand shell/dimple, one wave crest, and a dirt pebble with a tiny sprout.

## 2026-06-23 - farm-detail one-feature revision

Created active v7 tiles using the small field-detail style from `public/assets/reserve/animal-farm/animal-farm-before-v3-swap-20260622.png`: one larger, shaded mini feature per tile on a softly textured full 48x48 terrain base.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v7-farm-detail.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v7-farm-detail.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v7-farm-detail.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v7-farm-detail.png` |

Notes: the feature is still singular per tile, but it now uses more canvas area and includes darker base shadows plus warm highlights, similar to the grass clumps and small path stones in the animal-farm reference.

## 2026-06-23 - subtle offset feature revision

Created active v8 tiles after grid-repeat review. Each tile keeps one cute feature, but the feature is smaller, softer, and intentionally offset from center so repeated maps feel less stamped.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v8-subtle-offset.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v8-subtle-offset.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v8-subtle-offset.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v8-subtle-offset.png` |

Notes: v8 reduces the visual weight from v7. Feature anchors vary by terrain type: grass lower-left, sand upper-right, sea lower-left, dirt upper-left.

## 2026-06-23 - tiny shade feature revision

Created active v9 tiles with the feature reduced to mostly a soft shade patch plus a tiny tile-specific hint. This is intended for heavy repeated grid use.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v9-tiny-shade.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v9-tiny-shade.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v9-tiny-shade.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v9-tiny-shade.png` |

Notes: grass has two tiny leaves, sand has a tiny dimple/shell line, sea has a tiny foam/wave mark, and dirt has a tiny sprout. The accents are intentionally less object-like than v8.

## 2026-06-23 - seam-safe micro accent revision

Created active v11 tiles with uniform same-color outer edges to avoid visible seams in repeated rendering. Shading and micro accents are kept inside the tile away from the perimeter.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v11-seam-safe.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v11-seam-safe.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v11-seam-safe.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v11-seam-safe.png` |

Notes: all perimeter pixels are uniform per tile. Accents are very small: tiny leaves, tiny sand glint, tiny foam pixels, and tiny sprout.

## 2026-06-23 - muted visible feature revision

Created active v12 tiles with less saturated colors, uniform same-color outer edges, more visible soft variation in the middle, and one modest tile-specific feature.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v12-muted-visible.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v12-muted-visible.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v12-muted-visible.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v12-muted-visible.png` |

Notes: v12 keeps the seam-safe perimeter from v11, restores a little more interior shading, and makes the single accent more visible while keeping it small and offset.

## 2026-06-23 - anime feature revision

Created active v13 tiles with a more obvious anime-style feature while preserving muted base colors and seam-safe edges.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-tile-48-cute-v13-anime-feature.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-tile-48-cute-v13-anime-feature.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-tile-48-cute-v13-anime-feature.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-tile-48-cute-v13-anime-feature.png` |

Notes: v13 uses brighter feature highlights and small soft shadows to make the single accent more readable: a glossy grass tuft, shell/dimple, foam crest, and sprout pebble. Outer perimeter remains uniform for repeat rendering.

## 2026-06-23 - generated surface icon sources

Created four decorative surface icon source variants with the built-in image generator. These are saved as reserve/source art only and are not wired into runtime map tile mappings.

| Surface | Reserve path | Generated source |
|---------|--------------|------------------|
| grass | `public/assets/reserve/grass/grass-surface-icon-v1.png` | `C:/Users/Xinran/.codex/generated_images/019ef6c1-0ddf-7791-b4d7-4307924d1c83/ig_0ab9c7169155c4d2016a3b13001d7081968f05c838ceaef1c4.png` |
| dirt | `public/assets/reserve/dirt/dirt-surface-icon-v1.png` | `C:/Users/Xinran/.codex/generated_images/019ef6c1-0ddf-7791-b4d7-4307924d1c83/ig_0ab9c7169155c4d2016a3b131580c08196ba8e2199e83b06a5.png` |
| sand | `public/assets/reserve/sand/sand-surface-icon-v1.png` | `C:/Users/Xinran/.codex/generated_images/019ef6c1-0ddf-7791-b4d7-4307924d1c83/ig_0ab9c7169155c4d2016a3b132db0348196933ce28b84302c08.png` |
| sea | `public/assets/reserve/sea/sea-surface-icon-v1.png` | `C:/Users/Xinran/.codex/generated_images/019ef6c1-0ddf-7791-b4d7-4307924d1c83/ig_0ab9c7169155c4d2016a3b136dc75081968693c3aebc073cec.png` |

Notes: generated on clean white backgrounds as square pixel-art surface icons. They are more decorative than the active exact 48x48 seamless tiles, so they remain reserve variants.

## 2026-06-23 - exact 48x48 crop surface tiles

Created active map-ready tiles by taking exact 48x48 crops from the generated surface icons with no resizing. Each tile is filled edge to edge for main map rendering.

| Tile | Active path | Reserve source | Crop source |
|------|-------------|----------------|-------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-surface-tile-48-crop-v2.png` | `public/assets/reserve/grass/grass-surface-icon-v1.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-surface-tile-48-crop-v2.png` | `public/assets/reserve/dirt/dirt-surface-icon-v1.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-surface-tile-48-crop-v2.png` | `public/assets/reserve/sand/sand-surface-icon-v1.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-surface-tile-48-crop-v2.png` | `public/assets/reserve/sea/sea-surface-icon-v1.png` |

Notes: v1 resized interior crops were preserved as reserve variants, but v2 is the active version requested here: an exact 48x48 crop from the generated art.

## 2026-06-23 - recreated 48x48 surface patch tiles

Replaced the exact crop attempt with hand-authored 48x48 terrain patches inspired by the generated surface icons. These are designed directly at tile scale, filled edge to edge, with sparse pixel accents and no white padding.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-surface-tile-48-recreated-v3.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-surface-tile-48-recreated-v3.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-surface-tile-48-recreated-v3.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-surface-tile-48-recreated-v3.png` |

Preview files:

- `public/assets/reserve/_meta/map-tiles-cute-48/terrain-preview-v14-recreated-48.png`
- `public/assets/reserve/_meta/map-tiles-cute-48/terrain-grid-preview-v14-recreated-48.png`

Notes: v2 exact crops were too small-scale and visually flat/noisy in the wrong way, so v3 recreates the visual language instead of using direct source crops.

## 2026-06-23 - lighter one-feature 48x48 surface tiles

Updated the active terrain tiles with lighter base colors and one larger readable feature per tile.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-surface-tile-48-light-feature-v4.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-surface-tile-48-light-feature-v4.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-surface-tile-48-light-feature-v4.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-surface-tile-48-light-feature-v4.png` |

Preview files:

- `public/assets/reserve/_meta/map-tiles-cute-48/terrain-preview-v15-light-feature.png`
- `public/assets/reserve/_meta/map-tiles-cute-48/terrain-grid-preview-v15-light-feature.png`

Notes: each tile now has one prominent feature: grass tuft, dirt clod, sand shell/dune mark, and sea foam crest.

## 2026-06-23 - lighter base-only 48x48 surface tiles

Removed the large single features from v4 while keeping the lighter base textures.

| Tile | Active path | Reserve source |
|------|-------------|----------------|
| grass | `public/assets/used/map-tiles/grass.png` | `public/assets/reserve/grass/grass-surface-tile-48-base-only-v5.png` |
| dirt | `public/assets/used/map-tiles/dirt.png` | `public/assets/reserve/dirt/dirt-surface-tile-48-base-only-v5.png` |
| sand | `public/assets/used/map-tiles/sand.png` | `public/assets/reserve/sand/sand-surface-tile-48-base-only-v5.png` |
| sea | `public/assets/used/map-tiles/sea.png` | `public/assets/reserve/sea/sea-surface-tile-48-base-only-v5.png` |

Preview files:

- `public/assets/reserve/_meta/map-tiles-cute-48/terrain-preview-v16-base-only.png`
- `public/assets/reserve/_meta/map-tiles-cute-48/terrain-grid-preview-v16-base-only.png`

Notes: these are feature-free terrain fields intended for cleaner repeated map rendering.

## 2026-06-25 - 32px sand/sea shoreline blend Wang set

Created a smaller 32x32 marching-squares / corner-Wang blend set for natural sand-to-sea shorelines.

| Asset | Path |
|------|------|
| v1 blend set | `public/assets/used/map-tiles/blend/sand-sea-32/` |
| v2 blend set | `public/assets/used/map-tiles/blend/sand-sea-32-v2/` |
| v2 manifest | `public/assets/used/map-tiles/blend/sand-sea-32-v2/manifest.json` |
| v2 usage notes | `public/assets/used/map-tiles/blend/sand-sea-32-v2/README.md` |
| v2 tile sheet preview | `public/assets/used/map-tiles/blend/sand-sea-32-v2/_preview-4x4.png` |
| v2 sample map preview | `public/assets/used/map-tiles/blend/sand-sea-32-v2/_preview-sample-map.png` |

Notes: the v2 set uses mask bit order `NW=1`, `NE=2`, `SE=4`, `SW=8`, where bit value `1` means sea and `0` means sand. It adds a soft wet-sand / shallow-water band and cream foam pixels along the shore. Compatible Wang/marching-squares edges were checked pixel-for-pixel and match exactly. These assets are not wired into runtime code yet.

## 2026-06-25 - style-matched 32px sand/sea shoreline blend set

Created a revised 32x32 sand/sea marching-squares set matched to the large reserve references instead of the simplified active 48px base tiles.

| Asset | Path |
|------|------|
| Source sand style reference | `public/assets/reserve/sand/sand-2.png` |
| Source sea style reference | `public/assets/reserve/sea/sea-2.png` |
| v4 style-match attempt | `public/assets/used/map-tiles/blend/sand-sea-32-v4-stylematch/` |
| v5 style-match candidate | `public/assets/used/map-tiles/blend/sand-sea-32-v5-stylematch/` |
| v5 manifest | `public/assets/used/map-tiles/blend/sand-sea-32-v5-stylematch/manifest.json` |
| v5 usage notes | `public/assets/used/map-tiles/blend/sand-sea-32-v5-stylematch/README.md` |
| v5 tile sheet preview | `public/assets/used/map-tiles/blend/sand-sea-32-v5-stylematch/_preview-4x4.png` |
| v5 sample map preview | `public/assets/used/map-tiles/blend/sand-sea-32-v5-stylematch/_preview-sample-map.png` |

Notes: v5 keeps the same mask bit order as v2: `NW=1`, `NE=2`, `SE=4`, `SW=8`, where bit value `1` means sea and `0` means sand. The style target is golden dappled sand, dark teal sea with small turquoise wave/glint accents, and a soft wet-sand / shallow-water / cream-foam shoreline. High-contrast border accents were muted after v4 showed visible vertical tile-boundary stripes. Compatible Wang/marching-squares edges were checked pixel-for-pixel and match exactly. These assets are not wired into runtime code yet.

## 2026-06-25 - reference-sampled 64px grass/sand and dirt/grass blend sets

Created two 64x64 corner-Wang transition sets by sampling the large reserve texture references directly. This version is intended to match the actual cozy pixel-art detail level more closely than the earlier procedural 32px attempts.

| Asset | Path |
|------|------|
| Grass on sand final set | `public/assets/used/map-tiles/blend/grass-sand-64-v4-reference-sampled-edgefixed/` |
| Grass on sand preview | `public/assets/used/map-tiles/blend/grass-sand-64-v4-reference-sampled-edgefixed/_preview-sample-map.png` |
| Dirt on grass final set | `public/assets/used/map-tiles/blend/dirt-grass-64-v4-reference-sampled-edgefixed/` |
| Dirt on grass preview | `public/assets/used/map-tiles/blend/dirt-grass-64-v4-reference-sampled-edgefixed/_preview-sample-map.png` |

Notes: both sets use mask bit order `NW=1`, `NE=2`, `SE=4`, `SW=8`, where bit value `1` means the patch terrain (`grass` for grass/sand, `dirt` for dirt/grass). Interiors are sampled from the large reserve references, then the outermost borders are normalized for exact Wang compatibility. Compatible edges were checked pixel-for-pixel and match exactly. These assets are not wired into runtime code yet.

## 2026-06-25 - edge-detail 64px terrain blend sets

Revised the terrain transition sets to make the boundaries more visually interesting while keeping the reference-sampled texture style.

| Asset | Path |
|------|------|
| Grass on sand edge-detail set | `public/assets/used/map-tiles/blend/grass-sand-64-v7-edge-detail-bold-edgefixed/` |
| Dirt on grass edge-detail set | `public/assets/used/map-tiles/blend/dirt-grass-64-v7-edge-detail-bold-edgefixed/` |
| Sand/sea edge-detail set | `public/assets/used/map-tiles/blend/sand-sea-64-v7-edge-detail-edgefixed/` |

Notes: all three sets are 64x64 corner-Wang/marching-squares tile sets using mask bit order `NW=1`, `NE=2`, `SE=4`, `SW=8`. Edge details include grass tufts/leaves, dirt clods, pebbles, foam, shallow-water tint, and small wave glints depending on the terrain pair. Final v7 copies preserve the interior decoration and normalize the outermost borders so compatible edges match pixel-for-pixel. These assets are not wired into runtime code yet.

## 2026-06-25 - high-resolution feature-forward terrain source sheet

Generated a high-resolution 2x2 terrain source sheet using the Cute Pixel Game Assets style direction. The sheet is intended as reserve/source art for later slicing or repainting, not a runtime mapping update.

| Asset | Path |
|------|------|
| High-resolution source sheet | `public/assets/reserve/_meta/map-tiles-cute-48/terrain-source-sheet-v17-highres-feature.png` |
| 48px downscale proof | `public/assets/reserve/_meta/map-tiles-cute-48/terrain-source-sheet-v17-48px-proof.png` |
| Enlarged 48px proof | `public/assets/reserve/_meta/map-tiles-cute-48/terrain-source-sheet-v17-48px-proof-4x.png` |
| Generated source cache | `C:/Users/Xinran/.codex/generated_images/019effac-e6e3-7b11-a2e7-fd1d7001c8d5/ig_0fa979a1e09e8479016a3d5c1e1cfc819481179c5608bd0c95.png` |

Notes: prompted for four large square source tiles: grass, sand, sea, and dirt. Each tile keeps one prominent terrain feature designed to survive downscaling to 48px: grass tuft, sand shell, sea foam crest, and dirt clod/sprout. A 48px proof was created from the generated sheet; the main feature remains legible in each tile. These assets are not wired into runtime code yet.

Prompt summary: high-resolution 2x2 cute pixel-art terrain tile sheet for a cozy old-time city-builder, plain white gutters, top-left grass, top-right sand, bottom-left sea, bottom-right dirt, chunky pixels, warm highlights, dark brown/olive accents, mostly flat terrain fields, one bold feature occupying about 25-35% of each tile, calm low-contrast edges for repeated tiling, no text, no watermark, no dense speckled noise, and readable after downscaling to 48x48 pixels.

## 2026-06-25 - runtime organic terrain alpha masks

Replaced the placeholder runtime terrain blend masks with real 64x64 white-on-transparent alpha masks.

| Asset | Path |
|------|------|
| Edge mask | `public/assets/used/map-tiles/blend/edge-mask.png` |
| Corner mask | `public/assets/used/map-tiles/blend/corner-mask.png` |
| Dark preview | `tmp/blend-alpha-masks-preview.png` |
| Placeholder backups | `public/assets/reserve/map-tile-blend-masks/` |

Notes: `edge-mask.png` is fully opaque across the entire top edge, spans both side borders, and reaches just past the centerline with an organic dithered boundary and small alpha specks below it. `corner-mask.png` is fully opaque in the top-right corner and uses the same organic feathering style for the rounded convex corner. No code changes were made; the existing terrain blend code already consumes these filenames.

## 2026-06-26 - directional runtime organic terrain alpha masks

Added explicit directional variants of the runtime blend masks and updated the canvas renderer to consume them without rotating a canonical source.

| Asset | Path |
|------|------|
| North edge mask | `public/assets/used/map-tiles/blend/edge-n.png` |
| East edge mask | `public/assets/used/map-tiles/blend/edge-e.png` |
| South edge mask | `public/assets/used/map-tiles/blend/edge-s.png` |
| West edge mask | `public/assets/used/map-tiles/blend/edge-w.png` |
| Northeast corner mask | `public/assets/used/map-tiles/blend/corner-ne.png` |
| Southeast corner mask | `public/assets/used/map-tiles/blend/corner-se.png` |
| Southwest corner mask | `public/assets/used/map-tiles/blend/corner-sw.png` |
| Northwest corner mask | `public/assets/used/map-tiles/blend/corner-nw.png` |
| Reproducible generator | `scripts/generate-organic-blend-masks.mjs` |

Notes: all 8 masks are 64x64 white-on-transparent PNGs. Edge masks reach just past the centerline with a shallow periodic wavy boundary and small alpha specks beyond it; north/south are horizontally tileable, and east/west are vertically tileable. Corner masks fill only their named outer corner with a rounded organic wedge reaching about 85% along both named edges. The old generic `edge-mask.png` and `corner-mask.png` remain in place, but runtime blending now uses the directional files.
