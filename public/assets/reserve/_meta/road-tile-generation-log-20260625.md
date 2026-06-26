# Road tile generation - 20260625

Created six transparent cobblestone road connection tiles in `public/assets/used/map-tiles/road/`:

- `isolated.png`
- `end.png`
- `straight.png`
- `corner.png`
- `tee.png`
- `cross.png`

Current saved source size is 192x192. The map canvas renders them into 48px cells with
image smoothing disabled, so the larger originals provide more detail while downscaling crisply.

Revision:

- Widened the road bands after feedback that the roads should be a bit wider.
- Connected edge spans are now pixels 40-151 inclusive at 192px.
- This maps to pixels 10-37 inclusive at 48px display size, or 28px wide.
- Previous 24px-display-width readable versions were preserved in `public/assets/reserve/road-tiles/`
  as `*-192px-readable-24px-band-v1.png`.
- Strengthened the curb after feedback that it should be clearer.
- Added a darker outer rim, brighter inner highlight, and slightly thicker curb lip.
- Previous softer wide-curb versions were preserved in `public/assets/reserve/road-tiles/`
  as `*-192px-wide-curb-soft-v1.png`.
- Removed the visual divider at road connections.
- Connected off-canvas space is now treated as continuing road for curb calculations.
- Added matching seam strips at connected edges so adjacent tiles do not show a cap line.
- Previous clear-curb versions with possible connected-edge divider artifacts were preserved in
  `public/assets/reserve/road-tiles/`.
- Tightened the edge-pixel rule after feedback that road pieces must reach the edge and match
  pixel-perfectly.
- Every connected border now uses a canonical edge profile: top/bottom connected edges match
  pixel-for-pixel, and left/right connected edges match pixel-for-pixel.
- Connected-edge center pixels no longer include a grout line running along the tile boundary.
- Previous canonical-edge attempt was preserved in `public/assets/reserve/road-tiles/`.
- Widened the road again so it takes up more of each tile.
- Connected edge spans are now pixels 28-163 inclusive at 192px.
- This maps to pixels 7-40 inclusive at 48px display size, or 34px wide.
- Made the curb cuter with a warmer palette, chunkier rounded curb bands, and brighter soft
  highlight beats.
- Previous 28px-display-width edge-flush versions were preserved in
  `public/assets/reserve/road-tiles/` as `*-192px-edge-flush-28px-display-v1.png`.
- Used the image-generated road art from
  `C:/Users/Xinran/.codex/generated_images/019efd04-f106-7fa0-905e-adf5cbf72e6f/`
  as the visual reference for a production-safe tile set.
- Rebuilt the active six road sprites as exact 48x48 transparent PNGs with generated-art-inspired
  cream curb blocks, warm tan/grey cobbles, and cute rounded highlights.
- Production connection span is now pixels 7-40 inclusive at 48px.
- Verified connected border pixels match for all compatible edges, while open edges remain transparent.
- Previous active set was preserved in `public/assets/reserve/road-tiles/` as
  `*-pre-reference-production-20260625.png`.
- Rebuilt the active sprites again as 192x192 source originals after feedback that they can be
  downscaled by the renderer and should carry more feature/detail.
- 192px connected edge spans are pixels 28-163 inclusive, preserving the same 34px-wide road
  when rendered at 48px.
- Added more original-source detail: denser cobbles, bevel variation, curb chips, small highlights,
  darker grout pockets, and a larger soft shadow.
- Previous exact 48x48 production set was preserved in `public/assets/reserve/road-tiles/` as
  `*-48px-reference-production-20260625.png`.
- Generated a new image-gen sprite sheet after feedback to use image generation in the production
  path, then cut it into cells and inspected the result.
- Source sheet copy: `public/assets/reserve/road-tiles/imagegen-road-sheet-magenta-source-20260625.png`.
- Raw equal-cell cuts from the first sheet attempt: `public/assets/reserve/road-tiles/imagegen-sheet-cuts-20260625/`.
- Inner-cell cuts from the same sheet attempt: `public/assets/reserve/road-tiles/imagegen-sheet-cuts-20260625-v2-inner/`.
- The strict image-gen sheet still did not obey production geometry exactly, so the active set uses
  the image-gen sheet as sampled stone/curb source material inside exact road masks.
- Cleaned magenta-background color contamination from sampled pixels while preserving the image-gen
  sampled palette direction.
- Previous detailed 192px procedural set was preserved in `public/assets/reserve/road-tiles/` as
  `*-192px-detailed-before-imagegen-sampled-20260625.png`.
- Generated another stricter image-gen road sheet after feedback to use image generation directly:
  `public/assets/reserve/road-tiles/imagegen-road-sheet-strict-source-20260625.png`.
- The raw generated sheet had the desired cute curb language but still did not obey exact tile-map
  topology, so the active production sprites now use the sheet as visual direction while exact
  road masks provide pixel-perfect connections.
- Active sprites are now 512x512 transparent PNG source originals for downscaling to 48px.
- The road band is wider than before: connected edge span is pixels 66-445 inclusive at 512px,
  which maps to about 36px wide at 48px.
- Previous direct image-gen active cuts were preserved as
  `*-direct-imagegen-before-production-mask-20260625.png`.

Connection rules:

- Road band is wider than half the tile.
- At 512px, connected edge spans are pixels 66-445 inclusive.
- This maps to about pixels 6-42 at 48px display size, or about 36px wide.
- Open edges remain fully transparent.
- Connected arms bleed fully to the tile border.

Style notes:

- Warm tan and grey cobbles based on `#c9c0ae` and `#b9b3a4`.
- Dark soft grout lines.
- Raised curb added to every non-open road edge.
- Transparent background only; no grass, border, or square backdrop.

Validation:

- Verified all six active files are 512x512 PNGs with alpha.
- Verified connected edges have exactly the centered 380px alpha span, pixels 66-445 inclusive.
- Verified all compatible vertical connected edge rows share the same edge-pixel hash
  (`bb14b85f63`) and all compatible horizontal connected edge columns share the same edge-pixel
  hash (`b8da4dff77`).
- Verified non-connected edges are fully transparent.
- Full-size preview: `tmp/road-production-imagegen-guided-preview.png`.
- 48px downscale proof: `tmp/road-production-imagegen-guided-48-proof.png`.
- Tiled connection preview: `tmp/road-production-imagegen-guided-seam-test.png`.

Backups:

- Iteration backups were moved to `public/assets/reserve/road-tiles/`.
- The active `public/assets/used/map-tiles/road/` folder contains only the six requested filenames.
