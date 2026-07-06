# Hot African Climate Map Tiles

Complete drop-in themed equivalent of `public/assets/used/map-tiles` for Solara.

This set is built from the preserved AI-generated raster source sheet `imagegen-source-sheet.png`, then cropped and masked into the runtime `64x64` tile contract.

- `sea` is warm coastal sea.
- `sand` is golden savanna shore.
- `grass` is dry savanna grass.
- `dirt` is red laterite rock.
- `road` is sun-baked stone road.
- `blend/*` contains full `0.png` through `F.png` corner-Wang sets built from generated terrain textures.

Built by `tools/build-themed-map-tiles-from-imagegen.mjs` using the built-in image generation tool.
