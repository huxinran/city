# Asset Index

Auto-generated map of `public/assets/`. Two trees:

- **`used/`** — the live set referenced by the app (210 files). Editing here changes the game.
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

### `population/busts/`  ·  18 files  ·  1254×1254

`artisan-bust-v2-clean-alpha`, `artisan-bust-v2-clean`, `artisan-bust`, `entrepreneur-bust-v2-clean-alpha`, `entrepreneur-bust-v2-clean`, `entrepreneur-bust`, `farmer-bust-v2-clean-alpha`, `farmer-bust-v2-clean`, `farmer-bust`, `magnate-bust-v2-clean-alpha`, `magnate-bust-v2-clean`, `magnate-bust`, `scholar-bust-v2-clean-alpha`, `scholar-bust-v2-clean`, `scholar-bust`, `worker-bust-v2-clean-alpha`, `worker-bust-v2-clean`, `worker-bust`

### `coat-of-arms/`  ·  5 files  ·  1254×1254

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

### `cursors/`  ·  1 files  ·  40×40

`shovel`

### `_meta/farm-animals-20260625/`  ·  3 files  ·  960×822, 960×816

`contact-sheet-v2`, `contact-sheet-v3`, `contact-sheet`

### `map-tiles/blend/`  ·  terrain auto-tiling (dual-grid corner-Wang)

Three 16-tile sets, one per layer boundary. Files are `0.png`–`F.png` = the 4-corner mask (`NW=1, NE=2, SE=4, SW=8`). See each folder’s `README.md` for source/version.

| folder | boundary | bit 1 = |
|---|---|---|
| `sand-sea/` | sand ↔ sea | sea |
| `grass-sand/` | grass ↔ sand | grass |
| `dirt-grass/` | dirt ↔ grass | dirt |

---

## `reserve/` — staging library

Generated source art, grouped into 7 categories (mirroring `used/`). Each item folder holds variants of one icon/sprite. Not referenced by code (except the menu button); promote into `used/` when needed.

<details><summary><code>buildings/</code> · 30 items</summary>

`animal-farm`, `cart`, `cart-with-cargo`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `farm`, `farmer-hut`, `fire-station`, `housing-tier-01`, `housing-tier-02`, `housing-tier-03`, `housing-tier-04`, `housing-tier-05`, `housing-tier-06`, `marketplace`, `mine-camp`, `plowed-barn-farm`, `school`, `ship-3-mast`, `shipyard`, `tavern`, `town-objects-cute`, `warehouse`, `well`, `workshop`

</details>

<details><summary><code>population/</code> · 12 items</summary>

`artisan`, `artisan-bust`, `entrepreneur`, `entrepreneur-bust`, `farmer`, `farmer-bust`, `magnate`, `magnate-bust`, `scholar`, `scholar-bust`, `worker`, `worker-bust`

</details>

<details><summary><code>resources/</code> · 179 items</summary>

`apple`, `avocado`, `banana`, `barley`, `beer`, `bell-pepper`, `berry`, `black-bean`, `black-pepper`, `blackberry`, `blueberry`, `bok-choy`, `brandy`, `bread`, `brick`, `broccoli`, `butter`, `cabbage`, `cake`, `candle`, `cantaloupe`, `cardamom`, `carrot`, `cauliflower`, `celestial-objects-20260626`, `cheese`, `cherry`, `chestnut`, `chicken`, `chickpea`, `chili-pepper`, `chocolate`, `cider`, `cigar`, `cinnamon`, `clam`, `clay`, `coal`, `cocoa`, `coconut`, `coffee`, `coin`, `concrete`, `copper-ore`, `corn`, `cotton`, `cotton-cloth`, `cotton-shirt`, `cow`, `crab`, `cucumber`, `date`, `donkey`, `dragon-fruit`, `duck`, `egg`, `egg-basket`, `eggplant`, `feather-hat`, `fig`, `fish`, `flax`, `flour`, `fur`, `fur-boot`, `furniture`, `garlic`, `gem`, `glass`, `gold-ore`, `goose`, `grape`, `green-peas`, `hemp`, `honey`, `hops`, `horse`, `iron-ingot`, `iron-ore`, `jam`, `jewelry`, `jute`, `knight-armor`, `leek`, `lemon`, `lentil`, `lettuce`, `lime`, `llama`, `lobster`, `lychee`, `mango`, `marble-block`, `marble-statue`, `melon`, `milk`, `millet`, `mushroom`, `noodles`, `oats`, `oil`, `okra`, `olive`, `olive-oil`, `onion`, `orange`, `oyster`, `pant`, `papaya`, `pasta`, `pastry`, `peach`, `peanut`, `pear`, `pearl`, `pie`, `pig`, `pineapple`, `plum`, `pomegranate`, `pork`, `potato`, `pottery`, `pottery-household`, `pumpkin`, `quinoa`, `raspberry`, `rice`, `rice-plant`, `rubber`, `rum`, `saffron`, `salmon`, `salt`, `sand-pile`, `sausage`, `seaweed`, `sheep`, `shrimp`, `silk`, `silver-ore`, `slate`, `sorghum`, `soybean`, `spinach`, `steel`, `stone`, `stone-block-stack`, `stone-slab`, `strawberry`, `sugar`, `sugar-beet`, `sugar-cane`, `sunflower`, `taro`, `tea`, `timber`, `tin-ore`, `tobacco`, `tofu`, `tomato`, `tool`, `turkey`, `vanilla`, `vinegar`, `walnut`, `water-buffalo`, `watermelon`, `wax`, `weapon-sword-shield`, `wheat-sheaf`, `window`, `wine-barrel`, `wood`, `wool`, `yam`, `yellow-squash`, `yogurt`, `zucchini`

</details>

<details><summary><code>road/</code> · 1 items</summary>

`road-tiles`

</details>

<details><summary><code>tiles/</code> · 7 items</summary>

`boulder`, `bushes`, `dirt`, `grass`, `sand`, `sea`, `three-trees-large`

</details>

