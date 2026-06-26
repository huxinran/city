---
name: cute-pixel-game-assets
description: Generate or extend consistent cute cartoon-ish pixel-art visual assets for a cozy farming/city-builder game, including resource art, buildings, animals, crops, character busts, terrain tiles, terrain overlays, inventory materials, sprites, and other game images. Use when the user asks to create, revise, or match game visual assets in the Cute Pixel Game Assets style, use newly supplied reference images, or keep future game art visually consistent.
---

# Cute Pixel Game Assets

Create polished, cute, cartoon-ish pixel-art visual assets that match the saved cozy farming reference style. Treat inventory icons as only one asset category, not the default assumption.

## Workflow

1. Read `references/style.md` before writing prompts or judging results. When visual references are present in `assets/`, use them as anchors for intended style, detail level, realism level, and anime-ness; do not copy them pixel by pixel or treat them as exact templates for new subjects.
2. Use the built-in image generation tool when available.
3. Generate one asset per image for best consistency and easier review, unless the user explicitly asks for a sheet.
4. Ask for transparent backgrounds for sprite-like project assets. Use a clean plain white background when matching the source-art/reference-sheet look. If the generator returns a non-transparent or white-background image, save it as-is and explain the limitation instead of removing the background.
5. Focus only on image generation, saving, and bookkeeping. Do not remove backgrounds, chroma-key, alpha-clean, crop, resize, or otherwise post-process generated images unless the user explicitly asks for that specific operation.
6. Do not integrate generated assets into the codebase. Do not update app mappings, imports, manifests used by runtime code, build files, or other source files.
7. Save generated image assets into the active project under `public/assets/lib/...` only, using the repo's category/subject/filename convention when it is obvious. Treat `public/assets/used/...` as a curated runtime pointer area, not an image work area.
8. Do not write, overwrite, revise, recolor, regenerate, copy, promote, or stage real image files in `public/assets/used/...`. `used/` entries should be symlinks pointing to real files in `lib/`.
8a. Exception: if the user says to swap, replace, or try a specific asset, repoint the relevant `public/assets/used/...` symlink to the chosen `public/assets/lib/...` file with `node tools/swap-asset.mjs <used-relative-path> <lib-relative-path>` — no need to ask why or confirm.
9. Preserve generated originals under Codex's generated image cache; copy into the project instead of moving.
10. Never delete or replace existing image assets anywhere in the project. When recreating, revising, or iterating on one asset, always save the new result in `public/assets/lib/<category>/<subject>/...` as a new version with a versioned/descriptive filename such as `<name>-v2.png` or `<name>-blue.png`; do not overwrite the old image.
11. When revising an existing generated asset, inspect the old version first and compare it against the user's feedback before writing the new prompt.
12. When creating an asset that belongs to a family or tier set, inspect existing sibling assets first and keep the family coherent.
13. Keep lightweight bookkeeping for generated batches, such as a local notes file or generation log that records asset names, saved lib paths, source-cache paths, prompts, feedback, family/tier notes, and version notes. This bookkeeping must not wire assets into runtime code.

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

## Quality Check

Before delivering generated assets, verify that each result:

- Reads clearly at intended small size.
- Has one clear subject and no text, watermark, UI frame, or extra props.
- Uses chunky pixel forms, warm highlights, soft shadows, and dark brown or olive outlines.
- Fits the old-time cozy farming/city-building setting unless the user requested something else.
- Matches any relevant family or tier set in perspective, proportions, palette, outline treatment, and detail density.
- Has a filename, saved project path, source-cache path, and note in the batch log.

## Prompt Template

```text
Use case: stylized-concept
Asset type: single game visual asset
Primary request: a cute cartoon-ish pixel art <SUBJECT> asset for an old-time cozy farming/city-building game.
Style/medium: polished high-detail pixel art, chunky pixels, soft rounded forms, warm painterly pixel highlights, dark brown pixel outline, friendly silhouette, old-time pre-industrial city-builder setting, matching the saved Cute Pixel Game Assets reference style.
Composition/framing: one <SUBJECT> only, centered, fills the requested canvas or asset area, readable at its intended in-game size.
Scene/backdrop: transparent background preferred for final project assets; if transparency is not feasible, use a clean plain white background.
Color palette: saturated natural colors, warm highlights, deeper soft shadows.
Constraints: no text, no watermark, no UI frame, no extra objects.
```

For animals, ask for a full-body side/front three-quarter view with a friendly expression. For crops, produce, and inventory resources, ask for one clear readable item silhouette with leaves/stems only when they help recognition.

For buildings, use a classic isometric view: camera positioned at 45° rotation and roughly 30° elevation (2:1 pixel-ratio isometric), showing the front face and one side face simultaneously. The ground/base footprint should read clearly on an isometric grid and align to the intended map footprint diamond. Vertical structures, roofs, chimneys, trees, signs, and similar upright details may protrude above or outside that ground footprint; do not force the whole building silhouette inside the diamond. Keep the same isometric angle consistent across all building tiers and types in the set.

For building materials, use old-time hand-crafted forms and avoid modern industrial cues: logs, planks, clay lumps, bricks, ingots, rough stone blocks, simple glass windows, carved marble statues, cloth, parchment, wood, and iron are good references.

For terrain tiles, sprites, building art, character busts, and terrain object overlays, do not force the inventory asset template. Ask for the requested game-rendered dimensions, role, background requirement, and scale constraints from `references/style.md`.
