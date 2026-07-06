---
name: city-isometric-building-assets
description: Generate, revise, and archive standalone isometric building art for this city game. Use for map-placed buildings, farms, mines, workshops, civic buildings, roads, docks, yards, and other footprint-based assets under public/assets/lib/buildings.
---

# City Isometric Building Assets

Create standalone map building assets that match the game style and sit cleanly on the isometric diamond grid. This skill is for map-placed art only; use the resource skill for inventory/resource icons.

## Required References

Read `../city-image-assets/references/style.md` before writing prompts or judging results. Inspect relevant sibling assets in:

- `public/assets/used/buildings/`
- `public/assets/lib/buildings/<asset-name>/`
- `public/assets/lib/buildings/crop-farm/`
- `public/assets/lib/buildings/animal-farm/`
- `public/assets/lib/buildings/grove-farm/`
- `public/assets/lib/buildings/mine-camp/`
- `public/assets/lib/buildings/workshop/`

Use siblings as camera, footprint, palette, and detail-density anchors. Do not copy them pixel-for-pixel.

## Workflow

1. Identify the building type, slug, gameplay role, and intended footprint. Use the config size when available: size 1 usually means a compact 1x1 footprint; size 2 means a roomier 2x2 workshop/mine/service footprint; size 3 means a larger farm/camp footprint.
2. Inspect existing active and library versions for the same slug before generating. If a standalone asset already exists, generate a new version only when the user asks for a revision.
3. Generate one building per image with the built-in image generation tool.
4. Use a transparent background. If needed, generate on a removable flat chroma-key background, remove it locally, and validate the alpha.
5. Crop final building assets to their non-transparent alpha bounds while preserving all visible structure, props, and the full ground footprint.
6. Save candidates under `public/assets/lib/buildings/<slug>/...` using the next obvious version filename, such as `v1.png`, `v2.png`, or a concise descriptive version name.
7. Do not overwrite or delete existing assets. Do not generate directly into `public/assets/used`.
8. Promote to `public/assets/used/buildings/<slug>.png` only when the user explicitly asks to use, replace, swap, promote, or roll back the active game asset.
9. Keep scratch files, masks, contact sheets, and generation logs under `tmp/asset-work/<task-name>/`.
10. Record asset name, building type, footprint assumption, saved path, source-cache path, prompt, and quality notes.

## Isometric Acceptance Gate

The footprint is the first-pass acceptance gate. Reject and regenerate any beautiful image whose footprint does not fit the map.

- Build the asset in two conceptual steps: first a clean isometric square footprint, then the structure, crops, yard, platform, or props on top.
- The footprint must read as a true diamond/parallelogram, with width about twice its height and left/right edges near 30 degrees.
- The base field must have four clear sides, four sharp uncut corners, and two sets of parallel edges: left side parallel to right side, top/back side parallel to bottom/front side.
- Do not bevel, chamfer, round, flatten, crop, stair-step, or cut off footprint corners.
- This is stylized isometric game art, not real-world perspective. Keep parallel iso edges parallel and avoid vanishing-point convergence.
- Base edges, fence rails, wall tops, crop rows, paths, dock planks, yard borders, and roof ridges should follow the footprint's two isometric directions.
- Upright parts may extend above or slightly beyond the footprint, but the contact footprint must remain readable.
- Avoid front-facing, side-view, top-down, oval-ground, rectangular-sticker, or wrong-rotation outputs.

## Building Style Rules

- Cute, cozy, cartoon-ish pixel art with chunky stepped edges.
- Old-time pre-industrial construction: timber, brick, stone, clay, thatch, shingles, canvas, iron fittings, barrels, crates, hand tools, simple glass.
- Dark brown or olive outlines, warm highlights, deeper soft shadows.
- Friendly readable silhouette at map size. Prefer fewer chunky props over dense noisy detail.
- For farms and groves, align fields, tree rows, pens, fences, sheds, and paths to the footprint directions.
- Crop-producing farm variants should read as one coherent farm set, not as isolated terrain/crop patches. Use a shared farm-chassis language across the set: the same clean diamond/parallelogram base proportion, comparable fence/border thickness, matching warm dirt/grass rim, aligned crop rows, and a small old-time farm identity element such as a shed, hut, tool rack, barrels, sacks, gate, well, scarecrow, trellis, or irrigation prop. The crop type provides the variation; the base, camera, border, scale, and farm-prop vocabulary provide the family consistency.
- Do not accept a crop-specific building that is only a fenced field of plants unless the user explicitly asks for a plain empty/patch tile. If the subject is `wheat-farm`, `corn-field`, `cabbage-patch`, `rice-paddy`, `vineyard`, `orchard`, `plantation`, `garden`, `grove`, or similar, it is still a map building/farm and must carry the isometric farm-set identity.
- For mines and extraction buildings, use small huts, rock piles, timber supports, ore bins, pits, carts, and hand tools while preserving the diamond yard.
- For workshops and civic buildings, show the production identity through roof shapes, chimneys, awnings, signs without text, barrels, crates, workbenches, and visible materials.
- No text, labels, watermark, UI frame, modern factory details, plastic, chrome, warning signs, digital screens, or logos.

## Prompt Template

```text
Use case: stylized-concept
Asset type: standalone isometric map building
Primary request: a cute cartoon-ish pixel art <BUILDING> for an old-time cozy farming/city-building game.
Style/medium: polished high-detail pixel art, chunky pixels, soft rounded forms, warm painterly pixel highlights, dark brown or olive pixel outline, friendly silhouette, matching the saved project isometric building references.
Composition/framing: one standalone <BUILDING> only, centered, transparent background, full building and footprint visible, readable at map scale.
Isometric construction: first create a clean <FOOTPRINT> isometric square footprint as a true diamond/parallelogram, width about twice its height, with left and right edges at roughly 30 degrees. The base field has four clear sides, four sharp uncut corners, and two sets of parallel edges. Then place the building, yard, props, fields, pens, paths, or platform on top. Keep base edges, fences, walls, crop rows, dock planks, paths, and roof ridges aligned to the footprint's two isometric directions. No beveled, chamfered, rounded, cropped, or cut-off footprint corners. No frontal, side-view, top-down, oval-ground, or perspective-converging base.
Scene/backdrop: transparent background preferred; if transparency is not feasible, use a clean removable flat chroma-key background.
Color palette: saturated natural colors, warm highlights, deeper soft shadows.
Constraints: no text, no watermark, no UI frame, no extra unrelated objects, no modern industrial details.
```

## Quality Check

Before delivering generated building art, verify that each result:

- Passes the isometric footprint gate before style or charm is considered.
- Matches existing building references in camera angle, outline, palette, pixel density, and shadow direction.
- Communicates the building's gameplay role without text.
- Has usable transparency and cropped alpha bounds.
- Is saved in the library, not directly in `used`.
- Has source-cache and prompt notes in the batch log.
