# Grass On Sand 64px Edge Detail Tiles

Reference-sampled corner-Wang transition set for grass patches on sand, with bolder edge details.

- Tile size: `64x64`
- Filename pattern: `grass-sand-ms-v7-<MASK>.png`
- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`
- Bit value: `1` means grass, `0` means sand
- Source references:
  - `public/assets/reserve/sand/sand-2.png`
  - `public/assets/reserve/grass/grass-surface-icon-v1.png`

Edge details include small grass tufts, leaf-like pixels, and occasional sand pebbles. Compatible shared edges were checked pixel-for-pixel.

Not wired into runtime code.
