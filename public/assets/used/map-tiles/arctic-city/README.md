# Arctic City Map Tile Set

Complete drop-in themed equivalent of `public/assets/used/map-tiles` for Mintaka.

This set is built from the preserved AI-generated raster source sheet `imagegen-source-sheet.png`, then cropped and masked into the runtime `64x64` tile contract.

- `sea` is cold open water with ice chunks.
- `sand` is shore-fast cracked ice / frozen beach.
- `grass` is snowfield with sparse tundra flecks.
- `dirt` is dark frozen rock with snow crust.
- `road` uses AI-generated icy stone paver texture with transparent auto-tile masks.
- `blend/*` contains full `0.png` through `F.png` corner-Wang sets built from the generated terrain textures.

Built by `tools/build-arctic-map-tiles-from-imagegen.mjs` using the built-in image generation tool.
