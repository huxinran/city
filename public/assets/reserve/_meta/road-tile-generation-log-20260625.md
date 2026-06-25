# Road tile generation - 20260625

Created six transparent cobblestone road connection tiles in `public/assets/used/map-tiles/road/`:

- `isolated.png`
- `end.png`
- `straight.png`
- `corner.png`
- `tee.png`
- `cross.png`

Current saved source size is 192x192 so the assets can be scaled down by the game.
The visual target remains 48px display size, so the cobbles and curb were intentionally
made chunky and high-contrast enough to read after downscaling.

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

Connection rules:

- Road band is slightly wider than half the tile.
- At 192px, connected edge spans are pixels 40-151 inclusive.
- This maps to pixels 10-37 inclusive at 48px display size.
- Open edges remain fully transparent.
- Connected arms bleed fully to the tile border.

Style notes:

- Warm tan and grey cobbles based on `#c9c0ae` and `#b9b3a4`.
- Dark soft grout lines.
- Raised curb added to every non-open road edge.
- Transparent background only; no grass, border, or square backdrop.

Validation:

- Verified all six files are 192x192 PNGs with alpha.
- Verified connected edges have exactly the centered half-tile alpha span.
- Verified non-connected edges are fully transparent.
- Preview at target display scale: `tmp/road-tile-set-20260625-48-edge-flush-preview.png`.
- Full-size preview: `tmp/road-tile-set-20260625-192-edge-flush-preview.png`.
- Tiled connection preview: `tmp/road-tile-set-20260625-48-edge-flush-seam-test.png`.

Backups:

- Iteration backups were moved to `public/assets/reserve/road-tiles/`.
- The active `public/assets/used/map-tiles/road/` folder contains only the six requested filenames.
