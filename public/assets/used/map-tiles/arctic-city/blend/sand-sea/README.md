# Arctic City Map Tiles: Sea To Shore

- Tile size: `64x64`
- Mask bit order: `NW=1`, `NE=2`, `SE=4`, `SW=8`
- Bit value: `1` means blue cold sea
- Bit value: `0` means shore ice

Tuned by `tools/tune-climate-map-tiles.mjs`.
