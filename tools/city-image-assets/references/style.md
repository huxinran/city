# Project Image Asset Style

## Target Look

- Cute, cartoon-ish, cozy farming and city-builder game visual assets.
- Asset sizes vary by use; inventory resources may target 64x64, while terrain tiles, sprites, buildings, overlays, and character busts may use other game-rendered dimensions.
- Chunky pixel-art look with visible stepped edges.
- Soft rounded forms, friendly silhouettes, and high readability.
- Warm painterly pixel highlights and deeper soft shadows.
- Dark brown or dark olive outlines, not harsh black outlines.
- Subjects should fill most of the asset area without touching edges.
- Use natural saturated colors: glossy reds, leafy greens, warm creams, rich purples, soft pinks.
- Default setting is old-time / pre-industrial cozy city-building: hand-crafted materials, rustic tools, wood, stone, clay, iron, parchment, cloth, simple glass, and merchant-era objects.
- Avoid modern industrial design cues unless explicitly requested: plastic, chrome hardware, factory warning labels, modern packaging, modern construction materials, digital screens, or contemporary logos.

## Composition

- One main subject, focal object, tile, or character per asset unless the user asks for a sheet or scene.
- Centered on a clean plain white background for source art.
- No labels, text, watermark, UI frame, grid, or decorative background.
- Keep scale consistent across a set.
- For coherent families or tier sets: preserve camera angle, perspective, outline thickness, pixel density, palette warmth, shadow direction, highlight style, proportions, and detail level across related assets.
- For animals: full-body side/front three-quarter view, friendly expression, rounded proportions.
- For produce: strong single-object silhouette; include stem/leaf/branch when it improves recognition.
- For building materials: show clear old-time crafted objects with readable silhouettes, such as logs, planks, clay lumps, bricks, ingots, hand-cut stone blocks, simple glass windows, and carved statues.
- For map terrain tiles: use exact game-rendered dimensions when requested, favor bright anime/cartoon colors, and keep features extremely sparse. Terrain tiles should read as mostly flat color fields with only a few tiny pixel accents, not detailed inventory-resource art.
- For terrain object overlays such as trees and rocks: use exact game-rendered dimensions when requested, transparent backgrounds, and object scale that fits one tile. A tree may occupy roughly 75-85% of tile height; a rock should be lower and smaller, roughly 45-60% of tile width, so it reads as a tile feature rather than a building.

## Isometric Map Fit

- Build every building or map-placed asset in two steps: first create the isometric square footprint, then add the structure on top.
- The footprint should read as a clean diamond/parallelogram, width about twice its height, with left and right edges at roughly 30 degrees.
- The base field must have four clear sides forming two sets of parallel edges: left side parallel to right side, and top/back side parallel to bottom/front side.
- This is stylized isometric game art, not real-world camera perspective. Keep parallel iso edges parallel instead of using natural vanishing-point perspective.
- The visible base, yard, field, platform, dock, or ground contact area should preserve that footprint clearly.
- Major base edges, fence rails, wall tops, yard borders, crop rows, paths, plank directions, and roof ridge lines should follow the footprint's two isometric edge directions.
- Fence and wall perimeters should trace the footprint geometry with four straight sides, crisp corner turns, and opposite sides parallel. Reject bowed, oval, wobbly, random, or perspective-converging fence/wall outlines.
- Upright structures may stick out above or beyond the footprint, but the bottom contact shape should remain legible and grid-aligned.
- Avoid front-facing, side-view, top-down, or three-quarter camera angles that differ from existing map buildings.
- Prefer simpler decoration if it makes the footprint easier to read.
- For farm buildings and farm yards, align crop rows, furrows, tree rows, fences, walls, pens, troughs, shed bases, paths, and yard borders to the footprint's two isometric edge directions.
- Farm details should be chunky and readable at map scale: use a few clear crop clusters, animals, trees, sheds, and old-time props instead of dense tiny noise that hides the footprint.
- Crop-specific farms, fields, patches, paddies, orchards, groves, gardens, and plantations should form one consistent farm set, not standalone terrain patches. Keep the same isometric base proportion, camera angle, fence/border language, dirt/grass rim, outline weight, and crop-row alignment across the family. Vary the crop, tree, trellis, water, or planter details, but include at least one small farm-identity element such as a hut, shed, tool rack, barrels, sacks, gate, well, scarecrow, or irrigation prop unless the user explicitly requests a plain patch tile.

## Asset Library And Runtime Copies

- `public/assets/lib/<category>/<asset-name>/...` stores all candidate versions and experiments.
- `public/assets/used/<category>/<asset-name>.png` stores the active runtime copy with a simple stable filename.
- Promote, swap, or roll back an active asset by copying a selected library version into the matching `used/` path.
- Do not use versioned filenames in `used/` unless an existing runtime path already depends on that name.

## Visual References

Use the bundled reference images under `assets/references/` as the source of truth for intended style, scale, palette, detail level, realism level, anime-ness, and accepted output quality:

- `assets/references/bok-choy.png`: produce/resource asset reference.
- `assets/references/cake-v5.png`: prepared food/resource asset reference.
- `assets/references/carrot.png`: produce/resource asset reference.
- `assets/references/animal-farm.png`: isometric farm building/yard reference for footprint shape, fenced field scale, farm props, and old-time animal-farm material treatment.
- `assets/references/mine-camp-2x2-dirt-yard-v1.png`: building/yard footprint reference.
- `assets/references/ship-3-mast.png`: large vehicle/ship asset reference.

Reference images are good examples, not exact templates. Match their overall art direction and quality bar while adapting composition, silhouette, pose, proportions, and details to the requested new asset. Do not copy reference images pixel by pixel.

## Avoid

- Flat minimal app-icon styling.
- Thin line-art silhouettes.
- Tiny symbolic 32x32-style art when the requested asset is larger or more detailed.
- Realistic photos or smooth vector art.
- Overly sharp black outlines.
- Background cleanup artifacts unless explicitly doing transparent sprites.
