# Sand Sea 64px Edge Detail Tiles

Reference-sampled corner-Wang transition set for sand meeting sea, with a more detailed shoreline.

- Tile size: `64x64`
- Filename pattern: `sand-sea-ms-v7-<MASK>.png`
- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`
- Bit value: `1` means sea, `0` means sand
- Source references:
  - `public/assets/reserve/sand/sand-2.png`
  - `public/assets/reserve/sea/sea-2.png`

Edge details include cream foam, shallow-water tint, wave glints, and small sand pebbles. Compatible shared edges were checked pixel-for-pixel.

Not wired into runtime code.
