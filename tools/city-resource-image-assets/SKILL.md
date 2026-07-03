---
name: city-resource-image-assets
description: Generate, revise, and archive resource/inventory item icons for this city game. Use when creating materials, crops, foods, crafted goods, trade goods, medicine, tools, or other non-building resource icons under public/assets/lib/resources while preserving the project's cozy pixel-art style.
---

# City Resource Image Assets

Create polished resource and inventory icons that match the saved game art style. This skill is for item icons only; use the isometric building skill for map-placed buildings, farms, mines, roads, docks, yards, and other footprint-based art.

## Required References

Read `../city-image-assets/references/style.md` before writing prompts or judging results. Use the resource examples named there as style anchors, especially produce, prepared food, and crafted material icons.

## Workflow

1. Inspect any existing versions in `public/assets/lib/resources/<asset-name>/...` and the active runtime copy in `public/assets/used/resources/<asset-name>.png` when available.
2. Generate one resource item per image with the built-in image generation tool.
3. Ask for one clear centered subject on a transparent background. If transparency is not reliable, generate on a clean flat chroma-key or white background and remove it locally before saving the final.
4. Keep the asset as a standalone item icon, not a scene, building, logo, UI badge, or collection of many tiny props.
5. Save new candidates under `public/assets/lib/resources/<asset-name>/...` using the next obvious version filename, such as `v1.png`, `v2.png`, or a concise descriptive version name.
6. Do not overwrite or delete existing assets. Do not generate directly into `public/assets/used`.
7. Promote to `public/assets/used/resources/<asset-name>.png` only when the user explicitly asks to use, replace, swap, promote, or roll back the active game asset.
8. Keep scratch files, masks, contact sheets, and generation notes under `tmp/asset-work/<task-name>/`.
9. Record a lightweight log for each batch with asset names, saved paths, source-cache paths, prompts, and any user feedback.

## Style Rules

- Cute, cozy, cartoon-ish pixel art with chunky stepped edges.
- Soft rounded forms, friendly silhouettes, warm painterly highlights, deeper soft shadows.
- Dark brown or olive outlines, not hard black line art.
- Old-time pre-industrial materials and presentation: hand-crafted paper, clay, glass, wood, cloth, iron, wax, herbs, jars, baskets, and simple tools.
- Strong silhouette at small inventory size. Prefer one readable object or a small coherent bundle over many details.
- Natural saturated colors with warm highlights.
- No text, labels, watermark, UI frame, modern packaging, plastic, chrome, digital screens, or brand marks.

## Prompt Template

```text
Use case: stylized-concept
Asset type: single resource icon
Primary request: a cute cartoon-ish pixel art <RESOURCE> inventory icon for an old-time cozy farming/city-building game.
Style/medium: polished high-detail pixel art, chunky pixels, soft rounded forms, warm painterly pixel highlights, dark brown or olive pixel outline, friendly readable silhouette, matching the saved project resource icon references.
Composition/framing: one clear <RESOURCE> subject only, centered, fills most of the icon area without touching edges, readable at small inventory size.
Scene/backdrop: transparent background preferred; if transparency is not feasible, use a clean removable flat chroma-key or plain white background.
Color palette: saturated natural colors, warm highlights, deeper soft shadows.
Constraints: no text, no watermark, no UI frame, no extra unrelated objects, no modern packaging.
```

## Quality Check

Before delivering generated resource icons, verify that each result:

- Reads clearly as the intended resource at small size.
- Has exactly one focused subject or a compact coherent bundle.
- Has usable transparency after cleanup.
- Matches the cozy pixel-art references in palette, outline, scale, and detail density.
- Avoids building/map-footprint composition.
- Has a saved library path, source-cache path, and batch note.
