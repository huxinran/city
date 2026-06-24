# Map Tiles Cute 48 Generation Log

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
