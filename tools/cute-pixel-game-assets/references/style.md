# Cute Pixel Game Asset Style

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

## Visual References

Use the bundled reference images under `assets/references/` as the source of truth for intended style, scale, palette, detail level, realism level, anime-ness, and accepted output quality:

- `assets/references/bok-choy.png`: produce/resource asset reference.
- `assets/references/cake-v5.png`: prepared food/resource asset reference.
- `assets/references/carrot.png`: produce/resource asset reference.
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
