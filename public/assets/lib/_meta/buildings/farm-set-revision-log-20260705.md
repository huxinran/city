# Farm Set Revision Log - 2026-07-05

## Crop farm family consistency pass

User feedback: the crop-specific farm assets were reading as crop patches rather than a consistent farm building set. The isometric base requirement remains the top acceptance gate.

Updated active runtime assets by creating new library candidates and promoting them with `tools/swap-asset.mjs`:

- `public/assets/lib/buildings/cabbage-patch/v2-farm-set.png`
- `public/assets/lib/buildings/corn-field/v2-farm-set.png`
- `public/assets/lib/buildings/cotton-field/v2-farm-set.png`
- `public/assets/lib/buildings/melon-garden/v2-farm-set.png`
- `public/assets/lib/buildings/onion-field/v2-farm-set.png`
- `public/assets/lib/buildings/potato-farm/v2-farm-set.png`
- `public/assets/lib/buildings/pumpkin-patch/v2-farm-set.png`
- `public/assets/lib/buildings/rice-paddy/v2-farm-set.png`
- `public/assets/lib/buildings/soybean-farm/v2-farm-set.png`
- `public/assets/lib/buildings/sugar-cane-plantation/v2-farm-set.png`
- `public/assets/lib/buildings/tobacco-plantation/v2-farm-set.png`
- `public/assets/lib/buildings/tomato-field/v2-farm-set.png`
- `public/assets/lib/buildings/wheat-farm/v2-farm-set.png`

Revision approach: preserved each asset's existing diamond/parallelogram footprint, fence, crop rows, transparency, and crop identity, then added a shared small old-time farm shed/prop corner based on the accepted `crop-farm` family anchor. This avoids regenerating from scratch and keeps the visible isometric base stable.

Carry-forward rule: crop-specific farms, fields, patches, paddies, orchards, groves, gardens, and plantations should be treated as one map-building family. They need a readable isometric farm base first, then crop variation. Do not accept plain plant patches as final farm buildings unless a user explicitly asks for patch-only art.

Review sheets:

- `tmp/asset-work/farm-set-review/used-crop-farm-contact-sheet.png`
- `tmp/asset-work/farm-set-review/v2-farm-set-candidates.png`

## Crop-producing farm 3x3 base pass

User feedback: crop farm buildings must use a real 3x3 isometric base, with the top/back 1x1 corner occupied by a farmhouse.

Updated active runtime assets by creating new library candidates and promoting them into `public/assets/used/buildings/`:

- `public/assets/lib/buildings/crop-farm/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/apple-orchard/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/banana-plantation/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/berry-grove/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/cabbage-patch/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/cocoa-plant/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/corn-field/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/cotton-field/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/incense-grove/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/melon-garden/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/olive-grove/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/onion-field/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/orange-orchard/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/potato-farm/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/pumpkin-patch/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/rice-paddy/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/rubber-plantation/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/soybean-farm/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/sugar-cane-plantation/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/tea-garden/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/tobacco-plantation/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/tomato-field/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/vineyard/v3-3x3-top-corner-farmhouse.png`
- `public/assets/lib/buildings/wheat-farm/v3-3x3-top-corner-farmhouse.png`

Scope decision: includes `crop-farm` plus all crop-producing `rawFarm(...)` slugs mapped in runtime building icons: orchards, groves, plantations, paddy, vineyard, garden, patch, and field assets. Excludes animal farms and non-crop feature/resource producers such as `pig-farm`, `dairy-farm`, `sheep-farm`, `reindeer-farm`, `apiary`, `trapline`, `silk-farm`, `ivory-camp`, and `compost-pit`.

Revision approach: used a deterministic 3x3 isometric template to enforce the base geometry instead of relying on loose image-generation grid placement. Each output has the same 3x3 diamond/parallelogram farm base, visible internal 3x3 cell layout, a farmhouse anchored in the top/back 1x1 cell, and crop-specific visual treatment in the remaining cells.

Review sheet:

- `tmp/asset-work/crop-farm-3x3/v3-3x3-top-corner-farmhouse-contact.png`

## Production workshop 2x2 base pass

User feedback: production buildings and workshops need the same kind of explicit isometric footprint discipline as the crop farm pass. These assets must use a 2x2 base, with the primary 1x1 building placed on the top/back cell.

Updated active runtime assets by creating new library candidates and promoting them into `public/assets/used/buildings/`:

- `public/assets/lib/buildings/apothecary/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/bakery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/boot-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/bottleworks/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/brandy-distillery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/brickyard/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/butchery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/candle-manufactory/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/carpenter-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/cidery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/cigar-factory/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/concrete-plant/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/creamery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/dumpling-kitchen/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/dye-workshop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/forge/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/fur-workshop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/glassworks/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/glazier/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/goldsmith/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/ice-creamery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/ink-workshop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/jeweler/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/kiln/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/machine-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/mason-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/noodle-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/oil-press/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/painter-studio/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/pant-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/paper-mill/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/perfumery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/picklery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/pottery-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/preserve-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/rum-distillery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/sawmill/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/sculptor/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/shirt-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/smokehouse/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/soap-works/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/steelworks/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/sushi-bar/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/tannery/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/tofu-shop/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/toolsmith/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/watchmaker/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/windmill/v2-2x2-base-1x1-building.png`
- `public/assets/lib/buildings/winery/v2-2x2-base-1x1-building.png`

Scope decision: includes land processing/workshop buildings with `size: 2` and recipes. Excludes mines, pits, quarries, sea/extraction producers, farms, animal producers, special buildings, and generic placeholder slugs. The excluded runtime assets restored during this pass were `lumber-hut`, `stone-quarry`, `clay-pit`, `coal-kiln`, `sand-pit`, `saltern`, `iron-mine`, `gold-mine`, `gem-mine`, `copper-mine`, `fishery`, and `whaling-post`.

Revision approach: used a deterministic 2x2 isometric template so every output has the same base geometry, visible 2x2 cell structure, top/back 1x1 building placement, and workshop-specific props/materials in the remaining cells.

Review sheet:

- `tmp/asset-work/production-2x2/v2-workshops-only-contact.png`

### Production workshop visual correction

User feedback: the first 2x2 production pass had the right footprint but was visually unusable because the open cells read as empty template patches. The production set needs image-generation-level material richness and no upright pole markers.

Final promoted library assets now use `v6-2x2-production-filled-yard-no-poles-repainted.png` under each workshop slug folder. The active runtime copies in `public/assets/used/buildings/` were updated from those `v6` files. Earlier production candidates `v2-2x2-base-1x1-building.png`, `v3-2x2-production-filled-yard.png`, `v4-2x2-production-filled-yard-no-poles.png`, and `v5-2x2-production-filled-yard-no-poles-clean.png` were removed for the production workshop slugs so the library keeps only the usable final candidate.

Revision approach: generated a richer image-reference production yard tile with the same project style, then postprocessed the 49 workshop assets so the 2x2 base remains consistent while the three open cells gain production-yard detail: crates, barrels, sacks, tools, workbenches, material piles, dirt wear, and low base trim. Removed the upright pole markers and preserved the top/back 1x1 building placement.

Review sheet:

- `tmp/asset-work/production-2x2/v6-workshops-filled-yard-no-poles-repainted-contact.png`
