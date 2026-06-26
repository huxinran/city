# Dirt On Grass 64px Edge Detail Tiles

Reference-sampled corner-Wang transition set for dirt patches on grass, with bolder edge details.

- Tile size: `64x64`
- Filename pattern: `dirt-grass-ms-v7-<MASK>.png`
- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`
- Bit value: `1` means dirt, `0` means grass
- Source references:
  - `public/assets/reserve/grass/grass-surface-icon-v1.png`
  - `public/assets/reserve/dirt/dirt-surface-icon-v1.png`

Edge details include dirt clods, pebbles, and a few grass blades crossing into the patch. Compatible shared edges were checked pixel-for-pixel.

Not wired into runtime code.
