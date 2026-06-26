# Asset Index

Auto-generated map of `public/assets/`. Two trees:

- **`used/`** — the live set referenced by the app (185 files). Editing here changes the game.
- **`reserve/`** — staging library of generated source art (one folder per item). Not referenced by code; promote into `used/` when needed.

> Regenerate: `node tools/gen-asset-index.mjs`

---

## `used/` — live assets

### `map-tiles/`  ·  4 files  ·  48×48

`dirt`, `grass`, `sand`, `sea`

### `map-tiles/road/`  ·  6 files  ·  512×512

`corner`, `cross`, `end`, `isolated`, `straight`, `tee`

### `buildings/`  ·  31 files  ·  1254×1254

`animal-farm`, `cart-empty`, `cart-fetching`, `cart-loaded`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `fire-station`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `house`, `marketplace`, `mine-camp`, `police-station`, `road`, `school`, `ship`, `shipyard`, `tavern`, `warehouse-map`, `warehouse`, `well`, `workshop`

### `resources/`  ·  75 files  ·  1254×1254

`apple`, `banana`, `berry`, `boot`, `brandy`, `bread`, `brick`, `candle`, `cheese`, `chicken`, `cider`, `cigar`, `clam`, `clay`, `coal`, `cocoa`, `coin`, `concrete`, `corn`, `cotton`, `cow`, `egg`, `feather-hat`, `fish`, `flour`, `fur`, `furniture`, `gem`, `glass`, `gold-ore`, `grape`, `horse`, `iron-ingot`, `iron-ore`, `jam`, `jewelry`, `lettuce`, `marble-statue`, `marble`, `melon`, `milk`, `olive-oil`, `olive`, `onion`, `orange`, `pant`, `pig`, `pork`, `potato`, `pottery`, `pumpkin`, `rice`, `rubber`, `rum`, `salt`, `sand`, `sausage`, `sheep`, `shirt`, `slate`, `soybean`, `steel`, `stone`, `sugar-cane`, `timber`, `tobacco`, `tomato`, `tool`, `wax`, `weapon`, `wheat-sheaf-v3`, `window`, `wine`, `wood`, `wool`

### `terrain/`  ·  3 files  ·  48×48

`bush`, `rock`, `tree`

### `population/busts/`  ·  6 files  ·  1254×1254

`artisan-bust`, `entrepreneur-bust`, `farmer-bust`, `magnate-bust`, `scholar-bust`, `worker-bust`

### `coat-of-arms/`  ·  5 files  ·  1254×1254

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

### `cursors/`  ·  1 files  ·  40×40

`shovel`

### `map-tiles/blend/`  ·  terrain auto-tiling (dual-grid corner-Wang)

Three 16-tile sets, one per layer boundary. Files are `0.png`–`F.png` = the 4-corner mask (`NW=1, NE=2, SE=4, SW=8`). See each folder’s `README.md` for source/version.

| folder | boundary | bit 1 = |
|---|---|---|
| `sand-sea/` | sand ↔ sea | sea |
| `grass-sand/` | grass ↔ sand | grass |
| `dirt-grass/` | dirt ↔ grass | dirt |

---

## `reserve/` — staging library

234 item folders (plus `_meta/`, `_sheets/`). Each holds variants of one icon/sprite.

<details><summary>All 234 items</summary>

`animal-farm`, `apple-regen`, `artisan`, `artisan-bust`, `avocado`, `banana`, `barley`, `beer`, `bell-pepper`, `berry`, `black-bean`, `black-pepper`, `blackberry`, `blueberry`, `bok-choy`, `boulder`, `brandy`, `bread`, `brick`, `broccoli`, `bushes`, `butter`, `cabbage`, `cake`, `candle`, `cantaloupe`, `cardamom`, `carrot`, `cart`, `cart-with-cargo`, `cauliflower`, `chapel`, `cheese`, `cherry`, `chestnut`, `chicken`, `chickpea`, `chili-pepper`, `chocolate`, `cider`, `cigar`, `cinnamon`, `clam`, `clay`, `clinic`, `coal`, `coat-of-arms`, `cobblestone-road`, `cocoa`, `coconut`, `coffee`, `coin`, `concrete`, `copper-ore`, `corn`, `cotton`, `cotton-cloth`, `cotton-shirt`, `courthouse`, `cow`, `crab`, `crop-farm`, `cucumber`, `date`, `delete`, `dirt`, `dock`, `dragon-fruit`, `egg`, `egg-basket`, `eggplant`, `engineer-station`, `entrepreneur`, `entrepreneur-bust`, `farm`, `farmer`, `farmer-bust`, `farmer-hut`, `feather-hat`, `fig`, `fire-station`, `fish`, `flax`, `flour`, `fur`, `fur-boot`, `furniture`, `garlic`, `gem`, `glass`, `gold`, `gold-ore`, `grape`, `grass`, `grassland-barn-farm`, `green-peas`, `hand-push-cart`, `hemp`, `honey`, `hops`, `horse`, `housing-tier-01`, `housing-tier-02`, `housing-tier-03`, `housing-tier-04`, `housing-tier-05`, `housing-tier-06`, `iron`, `iron-ingot`, `iron-ore`, `jam`, `jewelry`, `jute`, `knight-armor`, `leek`, `lemon`, `lentil`, `lettuce`, `lime`, `lobster`, `lychee`, `magnate`, `magnate-bust`, `main-menu`, `mango`, `marble-block`, `marble-statue`, `marketplace`, `melon`, `milk`, `millet`, `mine-camp`, `mushroom`, `noodles`, `oats`, `oil`, `okra`, `olive`, `olive-oil`, `olive-oil-jug`, `onion`, `orange`, `oyster`, `pant-blue`, `papaya`, `pasta`, `pastry`, `peach`, `peanut`, `pear`, `pearl`, `pie`, `pig`, `pig-ear`, `pineapple`, `plowed-barn-farm`, `plum`, `police-station`, `pomegranate`, `pork`, `potato`, `pottery`, `pottery-household`, `pumpkin`, `quinoa`, `raspberry`, `rice`, `rice-plant`, `road`, `road-tiles`, `rubber`, `rum`, `saffron`, `salmon`, `salt`, `sand`, `sand-pile`, `sausage`, `scholar`, `scholar-bust`, `school`, `sea`, `seaweed`, `sheep`, `ship-3-mast`, `shipyard`, `shrimp`, `silk`, `silver-ore`, `slate`, `sorghum`, `soybean`, `spinach`, `steel`, `stone`, `stone-block-quarry`, `stone-block-stack`, `stone-slab`, `strawberry`, `sugar`, `sugar-beet`, `sugar-cane`, `sunflower`, `taro`, `tavern`, `tea`, `three-trees-large`, `timber`, `tin-ore`, `tobacco`, `tofu`, `tomato`, `tool`, `ui`, `vanilla`, `vinegar`, `walnut`, `warehouse`, `watermelon`, `wax`, `weapon-sword-shield`, `well`, `wheat-sheaf`, `window`, `wine-barrel`, `wood`, `wool`, `worker`, `worker-bust`, `workshop`, `yam`, `yellow-squash`, `yogurt`, `zucchini`

</details>
