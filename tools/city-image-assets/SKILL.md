---
name: city-image-assets
description: Default image-asset workflow for this city game repo. Generate, revise, extend, or match project image assets, including resource icons, food or drink items, buildings, animals, crops, character busts, terrain tiles, terrain overlays, inventory materials, sprites, cursors, UI/game visuals, and other assets saved under this project's asset library. Use whenever the user asks for a new image asset in this repo, wants to revise or match an existing asset, supplies reference images for a project asset, or asks to keep future game art visually consistent. The specific cute/cozy pixel-art style is defined inside this skill and its references.
---

# City Image Assets

Create polished project image assets that match the saved game reference style. This is the legacy umbrella workflow. Prefer the focused sibling skills when they apply:

- Use `../city-resource-image-assets/SKILL.md` for resource and inventory item icons.
- Use `../city-isometric-building-assets/SKILL.md` for map-placed building, farm, mine, dock, road, yard, and isometric footprint assets.

Treat inventory icons as only one asset category, not the default assumption.

## Workflow

1. Read `references/style.md` before writing prompts or judging results. When visual references are present in `assets/`, use them as anchors for intended style, detail level, realism level, and anime-ness; do not copy them pixel by pixel or treat them as exact templates for new subjects.
2. Always use the built-in image generation tool for asset creation and visual revisions. The only exceptions are local post-processing tasks such as background removal, alpha cleanup, and cropping.
3. Generate one asset per image for best consistency and easier review, unless the user explicitly asks for a sheet.
4. Ask for transparent backgrounds for sprite-like project assets. Use a removable flat chroma-key background when alpha output is not directly available, then remove the background before final saving.
5. Before saving any final standalone game asset, remove the background and validate that the saved PNG/WebP has usable alpha. Keep intermediate source images in scratch/cache paths when useful, but do not treat a non-transparent or white-background output as final unless the background is intentionally part of the asset.
6. Focus only on image generation, background removal for final standalone assets, saving, and bookkeeping. Do not crop, resize, or otherwise post-process generated images unless the user explicitly asks for that specific operation, except that building assets should be cropped to their alpha bounds before final saving.
7. Do not integrate generated assets into the codebase. Do not update app mappings, imports, manifests used by runtime code, build files, or other source files.
8. Save newly generated image assets into the library under `public/assets/lib/<category>/<asset-name>/...`, using the repo's category/subject/version convention when it is obvious. The library is the canonical archive for all candidate versions, whether or not they are currently used by the game.
9. Treat `public/assets/used/...` as the runtime copy directory. Files there should have simple stable names such as `public/assets/used/resources/apple.png` or `public/assets/used/buildings/clinic.png`; avoid version numbers in `used/` unless the existing runtime naming already requires it.
9a. When the user says to use, swap, replace, try, promote, or roll back to a particular library version, copy that library file into the matching `used/` path with `node tools/swap-asset.mjs <used-relative-path> <lib-relative-path>`. Example: `node tools/swap-asset.mjs resources/apple.png resources/apple/v3.png`. Do this directly when the target is clear.
9b. Do not generate new art directly into `used/`. Generate and archive in `lib/` first, then copy into `used/` only when the user asks to make it active or clearly says the new version should be used in-game.
10. Preserve generated originals under Codex's generated image cache; copy into the project instead of moving.
11. Never delete or replace existing image assets anywhere in the project. When recreating, revising, or iterating on one asset, always save the new result in `public/assets/lib/<category>/<subject>/...` as a new version with a versioned/descriptive filename such as `<name>-v2.png` or `<name>-blue.png`; do not overwrite the old image.
12. When revising an existing generated asset, inspect the old version first and compare it against the user's feedback before writing the new prompt.
13. When creating an asset that belongs to a family or tier set, inspect existing sibling assets first and keep the family coherent.
14. Keep lightweight bookkeeping for generated batches, such as a local notes file or generation log that records asset names, saved lib paths, source-cache paths, prompts, feedback, family/tier notes, and version notes. This bookkeeping must not wire assets into runtime code.
15. Keep scratch and comparison images out of the repo root. Put temporary previews, contact sheets, masks, before/after comparisons, and intermediate crops under `/tmp/asset-work/<task-name>/` or another clearly named subdirectory inside the ignored `/tmp/` folder. Do not create root-level files like `tmp-*.png`; a contained scratch directory is easier to inspect and delete.

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

The game map uses an isometric diamond grid. For building, yard, farm, road-adjacent, dock, and other map-placed assets, isometric fit is the highest-priority rule and an acceptance gate: construct the asset in two steps, first create the isometric square footprint, then add the structure on top. Prioritize this footprint-first construction over decoration, charm, prop density, and subject detail. If an output has a beautiful subject but the footprint or camera angle is wrong, reject it and regenerate.

Before generating or revising a building asset:

1. Inspect nearby sibling assets in `public/assets/lib/buildings/<asset-name>/...` and the active runtime copy in `public/assets/used/buildings/<asset-name>.png` when available.
2. Identify the intended footprint if it is known, such as 1x1, 2x2, 3x2, or a dock/shoreline footprint. If the user does not specify a footprint, infer it from sibling assets or use the smallest plausible diamond footprint for the requested building.
3. Step 1, create the footprint: draw a clean isometric square footprint as a true diamond/parallelogram, with width about twice its height and left/right edges at roughly 30 degrees. The base field must have four clear sides and four sharp, uncut corners forming two sets of parallel edges: left edge parallel to right edge, and top/back edge parallel to bottom/front edge. Do not bevel, crop, chamfer, flatten, round, stair-step, or cut off any footprint corner. This footprint is the ground/base shape the asset sits on.
4. Step 2, add the structure: place the building, farm, yard objects, crops, pens, fences, dock, or props on top of that footprint. Upright parts may stick out above or beyond the footprint, but the footprint itself must remain readable.
5. Treat this as stylized isometric game art, not real-world camera perspective. Do not follow natural vanishing-point perspective if it conflicts with the isometric footprint; parallel iso edges should stay parallel.
6. Preserve the map angle: base edges, fence rails, wall tops, crop rows, paths, yard boundaries, docks, platforms, and roof ridge lines should follow the footprint's two isometric edge directions unless a vertical wall edge is intended. Fence and wall perimeters must trace the footprint as a true parallelogram, with opposite sides parallel.
7. Avoid camera drift. Do not accept images where the building looks front-facing, top-down, side-view, or at a different rotation than the existing city map assets. Do not accept square/frontal yards, rectangular sticker bases, oval ground blobs, perspective trapezoids with converging edges, cut-off/beveled/chamfered diamond corners, or footprints whose left/right edges do not match the map diagonals.

For farm-style isometric buildings such as crop farms, animal farms, groves, orchards, barns, farm huts, pens, and mixed yard buildings:

- Treat the farm as a map-placed building with a readable diamond/parallelogram ground footprint, not as an inventory icon, landscape scene, or rectangular sticker.
- Make rows, furrows, irrigation lines, fences, walls, paths, shed bases, troughs, pens, tree rows, and crop patches follow the footprint's two isometric edge directions.
- Treat crop-specific farms, fields, patches, paddies, orchards, groves, gardens, and plantations as one coherent farm building set, not as isolated plant patches. Preserve a shared farm chassis across the family: same isometric base proportion, camera angle, fence/border language, dirt/grass rim, outline weight, crop-row direction, and readable map scale. Let the crop type vary the subject, but include a small old-time farm identity element such as a hut, shed, tool rack, barrels, sacks, gate, well, scarecrow, trellis, or irrigation prop unless the user explicitly asks for a plain patch tile.
- For fenced or walled farms/yards, the fence or wall must make the footprint geometry obvious: four clean sides, two parallel edge pairs, four true uncut diamond corners, crisp corner turns, and no bowed, oval, random, beveled/chamfered/cut-off-corner, or perspective-converging perimeter.
- Keep the footprint border visible and simple. Crops, animals, trees, carts, hay, barrels, and tools may overlap or stick out, but they should not hide the diamond/parallelogram base shape.
- Use small old-time farm structures and props to clarify function: wooden shed, thatched or shingled roof, simple fence, tilled soil, hand tools, hay, troughs, sacks, crates, barrels, watering cans, scarecrows, or orchard trees.
- Keep farm details chunky and readable at map scale. Prefer a few larger repeated crop clusters, animals, or trees over many tiny noisy marks.
- Match existing farm siblings in footprint scale and camera angle before inventing a new composition. Especially inspect `crop-farm`, `animal-farm`, `grove-farm`, and `farmer-hut` when relevant.
- For farm tiers, preserve the same base angle and farm identity; show progression through cleaner fences, larger or fuller crop beds, sturdier sheds, richer roof/material details, more organized props, or a slightly expanded footprint.

Add building-specific prompt constraints like:

```text
Isometric construction is mandatory and more important than decoration: first create a clean <FOOTPRINT> isometric square footprint as a true diamond/parallelogram, width about twice its height, with left and right edges at roughly 30 degrees. The base field has four clear sides, four sharp uncut corners, and two sets of parallel edges: left edge parallel to right edge, top/back edge parallel to bottom/front edge. Do not bevel, crop, chamfer, flatten, round, stair-step, or cut off any footprint corner. Then add the building/yard structure on top of that footprint. Upright parts may stick out above or beyond the footprint, but the footprint remains readable. This is stylized isometric game art, not real-world perspective; keep parallel iso edges parallel instead of using vanishing-point perspective. Building base edges, fence rails, wall tops, yard borders, paths, crop rows, dock planks, and roof ridge lines follow the footprint's two isometric edge directions. Fence and wall perimeters trace the footprint with four straight sides, four true diamond corners, crisp corners, and opposite sides parallel. Camera is locked to the same isometric angle as existing city building assets, not frontal, not top-down, not side-view. Reject square/frontal yards, oval ground blobs, rectangular sticker bases, bowed fences, wobbly walls, cut-off/beveled/chamfered diamond corners, and any converging-perspective base edges.
```

For farms, append constraints like:

```text
Farm composition: first create the isometric farm footprint as a clean true diamond/parallelogram, width about twice its height, with roughly 30 degree edges. The base field must show four straight sides, four sharp uncut corners, and two sets of parallel edges, with the left/right sides parallel and the top/bottom sides parallel. Do not bevel, chamfer, crop, flatten, round, stair-step, or cut off any farm footprint corner. Then add chunky readable crops, animals, pens, trees, sheds, fences, walls, troughs, paths, and old-time props on top. Farm structures and props may stick out, but crop rows, furrows, orchard/tree rows, animal pens, fences, walls, shed bases, paths, and yard borders follow the footprint's two isometric edge directions. Fence or wall perimeters should clearly trace four straight footprint sides with four true diamond corners and crisp corner turns, and the footprint stays visible.
```

When judging generated building results, check the footprint first:

- The bottom footprint reads as an isometric square: a true diamond/parallelogram with width about twice its height, edges at roughly 30 degrees, and four sharp uncut corners.
- The base field has two sets of parallel edges: left/right sides parallel, top/back and bottom/front sides parallel.
- Major horizontal structure lines follow the footprint's two isometric edge directions.
- Fence rails, wall tops, and yard borders form a clean parallelogram perimeter with four true diamond corners, no beveled/chamfered/cut-off corners, and crisp corner turns.
- The asset would sit cleanly on a diamond tile without the base crossing grid lines at odd angles.
- Decorative items do not hide or distort the footprint boundary.
- The camera angle matches existing map buildings before style, palette, props, or detail quality are considered.
- If grid alignment is poor, regenerate with a narrower prompt focused on footprint, base, and camera angle before spending time on style tweaks.
- After background removal, crop building assets to the non-transparent alpha bounds before final library save, preserving the full visible building, protruding details, and any intentional ground/base footprint.

## Quality Check

Before delivering generated assets, verify that each result:

- Reads clearly at intended small size.
- Has one clear subject and no text, watermark, UI frame, or extra props.
- Uses chunky pixel forms, warm highlights, soft shadows, and dark brown or olive outlines.
- Fits the old-time cozy farming/city-building setting unless the user requested something else.
- Matches any relevant family or tier set in perspective, proportions, palette, outline treatment, and detail density.
- For buildings and map-placed structures, passes the isometric fit gate before any other visual judgment: starts from a readable isometric square footprint, a diamond/parallelogram with width about twice its height and roughly 30 degree edges, with major structure lines aligned to that footprint.
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

For buildings, the isometric footprint is mandatory and has priority over decoration. First create a clean isometric square footprint: a diamond/parallelogram with width about twice its height and edges at roughly 30 degrees. Then add the building, yard, farm rows, dock, platform, or props on top. Building base edges, yard borders, fences, crop rows, paths, docks, platforms, and roof ridge lines should follow the footprint's two isometric edge directions. Vertical structures, roofs, chimneys, trees, signs, and similar upright details may stick out above or beyond that ground footprint; do not force the whole building silhouette inside the diamond. Keep the same isometric angle consistent across all building tiers and types in the set. Regenerate any result with a wrong footprint or camera angle even if the subject details look good.

For building materials, use old-time hand-crafted forms and avoid modern industrial cues: logs, planks, clay lumps, bricks, ingots, rough stone blocks, simple glass windows, carved marble statues, cloth, parchment, wood, and iron are good references.

For terrain tiles, sprites, building art, character busts, and terrain object overlays, do not force the inventory asset template. Ask for the requested game-rendered dimensions, role, background requirement, and scale constraints from `references/style.md`.
