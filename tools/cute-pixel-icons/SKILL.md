---
name: cute-pixel-icons
description: Generate or extend consistent cute cartoon-ish 64x64 pixel-art game icons, especially cozy farming/city-builder resource, building, animal, crop, and inventory icons. Use when the user asks to create more icons in the established cute pixel style, match the saved apple/lettuce/grape/olive/pig/cow/sheep/chicken examples, or keep future game art assets visually consistent.
---

# Cute Pixel Icons

Create polished, cute, cartoon-ish pixel-art game icons that match the saved cozy farming reference style.

## Workflow

1. Use the built-in image generation tool when available.
2. Generate one icon per image for best consistency and easier review, unless the user explicitly asks for a sheet.
3. Focus only on image generation, saving, and bookkeeping. Do not remove backgrounds, chroma-key, alpha-clean, crop, resize, or otherwise post-process generated images unless the user explicitly asks for that specific operation.
4. Do not integrate generated icons into the codebase. Do not update app mappings, imports, manifests used by runtime code, build files, or other source files unless the user explicitly asks for integration.
5. Save generated image assets into the active project in an appropriate asset/source folder, using the repo's existing naming/location conventions when they are obvious.
6. Preserve generated originals under Codex's generated image cache; copy into the project instead of moving.
7. Never delete generated image assets during iteration. When recreating, revising, or iterating on one icon, always save the new result as a new version with a versioned/descriptive filename such as `<name>-v2.png` or `<name>-blue.png`; do not overwrite the old image.
8. Prefer transparent-background icons in the prompt by default. If the generator returns a non-transparent or white-background image, save it as-is and explain the limitation instead of removing the background.
9. Keep lightweight bookkeeping for generated batches, such as a local notes file or generation log that records icon names, saved paths, source-cache paths, and version notes. This bookkeeping must not wire assets into runtime code.

## Style

Read `references/style.md` when writing prompts or judging whether a generated icon matches the established style.

Use `assets/reference-sheet.png` as the primary visual reference. Use `assets/examples/` for individual example outputs already accepted by the user.

## Prompt Template

```text
Use case: stylized-concept
Asset type: single game resource source icon
Primary request: a cute cartoon-ish pixel art <SUBJECT> icon for an old-time cozy farming/city-building game.
Style/medium: polished high-detail pixel art, chunky pixels, soft rounded forms, warm painterly pixel highlights, dark brown pixel outline, friendly silhouette, old-time pre-industrial city-builder setting, matching the saved Cute Pixel Icons reference style.
Composition/framing: one <SUBJECT> only, centered, fills most of a 64x64 icon area, readable at small size.
Scene/backdrop: transparent background preferred for final project assets; if transparency is not feasible, use a clean plain white background.
Color palette: saturated natural colors, warm highlights, deeper soft shadows.
Constraints: no text, no watermark, no UI frame, no extra objects.
```

For animals, ask for a full-body side/front three-quarter view with a friendly expression. For crops or produce, ask for one clear inventory icon silhouette with leaves/stems only when they help recognition.

For building materials, use old-time hand-crafted forms and avoid modern industrial cues: logs, planks, clay lumps, bricks, ingots, rough stone blocks, simple glass windows, carved marble statues, cloth, parchment, wood, and iron are good references.
