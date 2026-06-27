---
name: city-image-assets
description: Default image-asset workflow for this city game repo. Generate, revise, extend, or match project image assets, including resource icons, food or drink items, buildings, animals, crops, character busts, terrain tiles, terrain overlays, inventory materials, sprites, cursors, UI/game visuals, and other assets saved under this project's asset library. Use whenever the user asks for a new image asset in this repo, wants to revise or match an existing asset, supplies reference images for a project asset, or asks to keep future game art visually consistent. The specific cute/cozy pixel-art style is defined inside this skill and its references.
---

# City Image Assets

Create polished project image assets that match the saved game reference style. Treat inventory icons as only one asset category, not the default assumption.

## Workflow

1. Read `references/style.md` before writing prompts or judging results. When visual references are present in `assets/`, use them as anchors for intended style, detail level, realism level, and anime-ness; do not copy them pixel by pixel or treat them as exact templates for new subjects.
2. Use the built-in image generation tool when available.
3. Generate one asset per image for best consistency and easier review, unless the user explicitly asks for a sheet.
4. Ask for transparent backgrounds for sprite-like project assets. Use a clean plain white background when matching the source-art/reference-sheet look. If the generator returns a non-transparent or white-background image, save it as-is and explain the limitation instead of removing the background.
5. Focus only on image generation, saving, and bookkeeping. Do not remove backgrounds, chroma-key, alpha-clean, crop, resize, or otherwise post-process generated images unless the user explicitly asks for that specific operation.
6. Do not integrate generated assets into the codebase. Do not update app mappings, imports, manifests used by runtime code, build files, or other source files.
7. Save newly generated image assets into the library under `public/assets/lib/<category>/<asset-name>/...`, using the repo's category/subject/version convention when it is obvious. The library is the canonical archive for all candidate versions, whether or not they are currently used by the game.
8. Treat `public/assets/used/...` as the runtime copy directory. Files there should have simple stable names such as `public/assets/used/resources/apple.png` or `public/assets/used/buildings/clinic.png`; avoid version numbers in `used/` unless the existing runtime naming already requires them.
8a. When the user says to use, swap, replace, try, promote, or roll back to a particular library version, copy that library file into the matching `used/` path with `node tools/swap-asset.mjs <used-relative-path> <lib-relative-path>`. Example: `node tools/swap-asset.mjs resources/apple.png resources/apple/v3.png`. Do this directly when the target is clear.
8b. Do not generate new art directly into `used/`. Generate and archive in `lib/` first, then copy into `used/` only when the user asks to make it active or clearly says the new version should be used in-game.
9. Preserve generated originals under Codex's generated image cache; copy into the project instead of moving.
10. Never delete or replace existing image assets anywhere in the project. When recreating, revising, or iterating on one asset, always save the new result in `public/assets/lib/<category>/<subject>/...` as a new version with a versioned/descriptive filename such as `<name>-v2.png` or `<name>-blue.png`; do not overwrite the old image.
11. When revising an existing generated asset, inspect the old version first and compare it against the user's feedback before writing the new prompt.
12. When creating an asset that belongs to a family or tier set, inspect existing sibling assets first and keep the family coherent.
13. Keep lightweight bookkeeping for generated batches, such as a local notes file or generation log that records asset names, saved lib paths, source-cache paths, prompts, feedback, family/tier notes, and version notes. This bookkeeping must not wire assets into runtime code.
14. Keep scratch and comparison images out of the repo root. Put temporary previews, contact sheets, masks, before/after comparisons, and intermediate crops under `/tmp/asset-work/<task-name>/` or another clearly named subdirectory inside the ignored `/tmp/` folder. Do not create root-level files like `tmp-*.png`; a contained scratch directory is easier to inspect and delete.

## Style

Read `references/style.md` when writing prompts or judging whether generated game art matches the established style.

Use `assets/references/` as the current visual reference set. Treat these as good examples of the target style, detail level, realism level, and anime-ness, not as images to follow pixel by pixel.

## Revision Workflow

When the user asks to revise a created image:

1. Open and inspect the previous version before generating the revision, using the project asset path, source-cache path, or generation log entry when available.
2. Identify what should stay and what should change: subject identity, silhouette, pose, scale, palette, detail density, realism/anime balance, background, and readability at game size.
3. Translate the user's feedback into explicit prompt constraints. Preserve successful traits from the old version and call out the specific corrections needed.
4. Save the revision as a new versioned file. Do not overwrite or delete the old version.
5. Record the lesson in the batch log: old path, new path, user feedback, what changed, and what preference should carry forward.

## Coherent Sets

When creating assets that belong together, such as all farm animals, houses of different tiers, production buildings, terrain overlays, or resource variants:

1. Inspect the existing family members before prompting. Use project asset paths, source-cache paths, or generation logs when available.
2. Identify shared family rules: camera angle, perspective, outline thickness, pixel density, palette warmth, shadow direction, highlight style, canvas size, footprint scale, proportions, and level of detail.
3. Preserve the shared rules in the prompt. Vary only what should distinguish the new asset, such as species, building tier, material upgrade, decoration, footprint, or gameplay role.
4. For tiered buildings, keep the same base silhouette language and perspective across tiers. Show progression through controlled additions like sturdier materials, extra floors, richer trim, larger footprint, or more refined props.
5. For animal sets, keep comparable body proportions, friendliness, outline treatment, lighting, and scale. Let species differences carry the variation.
6. Record family rules and any new exceptions in the batch log so future assets in the set continue the same artistic style.

## Isometric Building Assets

The game map uses an isometric diamond grid. For building, yard, farm, road-adjacent, dock, and other map-placed assets, prioritize diamond-grid fit over decorative detail. Regenerating only to fix perspective wastes time; make grid alignment explicit before every building prompt and reject outputs that visibly fight the grid.

Before generating or revising a building asset:

1. Inspect nearby sibling assets in `public/assets/lib/buildings/<asset-name>/...` and the active runtime copy in `public/assets/used/buildings/<asset-name>.png` when available.
2. Identify the intended footprint if it is known, such as 1x1, 2x2, 3x2, or a dock/shoreline footprint. If the user does not specify a footprint, infer it from sibling assets or use the smallest plausible diamond footprint for the requested building.
3. Preserve the map angle: the footprint must sit on a 2:1 isometric diamond, with the left and right ground edges parallel to the map grid diagonals. The building's base edges, fences, crop rows, paths, yard boundaries, docks, platforms, and roof ridge lines should follow those same isometric directions unless a vertical wall edge is intended.
4. Keep the building grounded: the visible base or yard should read as a clean diamond/parallelogram footprint. Upright elements may extend above the footprint, but the bottom contact shape should not be a random oval, flat frontal rectangle, or perspective trapezoid.
5. Avoid camera drift. Do not accept images where the building looks front-facing, top-down, side-view, or at a different rotation than the existing city map assets.

Add building-specific prompt constraints like:

```text
Isometric grid fit: designed for a 2:1 isometric diamond map tile grid. The ground footprint is a clean <FOOTPRINT> diamond/parallelogram aligned to the map grid; left and right footprint edges run exactly along the isometric diagonals. Building base edges, fence lines, yard borders, paths, crop rows, dock planks, and roof ridge lines are parallel to the grid directions. Camera is locked to the same isometric angle as existing city building assets, not frontal, not top-down, not side-view.
```

When judging generated building results, check the footprint first:

- The bottom footprint reads as a diamond/parallelogram aligned to the map grid.
- Major horizontal structure lines follow the same two isometric diagonal directions.
- The asset would sit cleanly on a diamond tile without the base crossing grid lines at odd angles.
- Decorative items do not hide or distort the footprint boundary.
- If grid alignment is poor, regenerate with a narrower prompt focused on footprint, base, and camera angle before spending time on style tweaks.

## Quality Check

Before delivering generated assets, verify that each result:

- Reads clearly at intended small size.
- Has one clear subject and no text, watermark, UI frame, or extra props.
- Uses chunky pixel forms, warm highlights, soft shadows, and dark brown or olive outlines.
- Fits the old-time cozy farming/city-building setting unless the user requested something else.
- Matches any relevant family or tier set in perspective, proportions, palette, outline treatment, and detail density.
- For buildings and map-placed structures, has a base footprint and major edges aligned to the 2:1 isometric diamond grid.
- Has a filename, saved project path, source-cache path, and note in the batch log.

## Prompt Template

```text
Use case: stylized-concept
Asset type: single game visual asset
Primary request: a cute cartoon-ish pixel art <SUBJECT> asset for an old-time cozy farming/city-building game.
Style/medium: polished high-detail pixel art, chunky pixels, soft rounded forms, warm painterly pixel highlights, dark brown pixel outline, friendly silhouette, old-time pre-industrial city-builder setting, matching the saved project image asset reference style.
Composition/framing: one <SUBJECT> only, centered, fills the requested canvas or asset area, readable at its intended in-game size.
Scene/backdrop: transparent background preferred for final project assets; if transparency is not feasible, use a clean plain white background.
Color palette: saturated natural colors, warm highlights, deeper soft shadows.
Constraints: no text, no watermark, no UI frame, no extra objects.
```

For animals, ask for a full-body side/front three-quarter view with a friendly expression. For crops, produce, and inventory resources, ask for one clear readable item silhouette with leaves/stems only when they help recognition.

For buildings, use a classic isometric view: camera positioned at 45° rotation and roughly 30° elevation (2:1 pixel-ratio isometric), showing the front face and one side face simultaneously. The ground/base footprint should read clearly as a diamond or parallelogram aligned to the intended map footprint. Building base edges, yard borders, fences, crop rows, paths, docks, platforms, and roof ridge lines should be parallel to the two isometric grid directions. Vertical structures, roofs, chimneys, trees, signs, and similar upright details may protrude above or outside that ground footprint; do not force the whole building silhouette inside the diamond. Keep the same isometric angle consistent across all building tiers and types in the set.

For building materials, use old-time hand-crafted forms and avoid modern industrial cues: logs, planks, clay lumps, bricks, ingots, rough stone blocks, simple glass windows, carved marble statues, cloth, parchment, wood, and iron are good references.

For terrain tiles, sprites, building art, character busts, and terrain object overlays, do not force the inventory asset template. Ask for the requested game-rendered dimensions, role, background requirement, and scale constraints from `references/style.md`.
