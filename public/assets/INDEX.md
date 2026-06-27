# Asset Index

Auto-generated map of `public/assets/`. Two trees:

- **`used/`** — stable app-facing symlinks (203 image pointers). Repoint these to swap art.
- **`lib/`** — unified image library. Category/subject folders hold real files; filenames distinguish variants.

> Regenerate: `node tools/gen-asset-index.mjs`

---

## `used/` — live assets

### `map-tiles/`  ·  4 files  ·  48×48

`dirt`, `grass`, `sand`, `sea`

### `map-tiles/road/`  ·  6 files  ·  512×512

`corner`, `cross`, `end`, `isolated`, `straight`, `tee`

### `buildings/`  ·  31 files  ·  1094×757, 1254×1254, 1539×1022

`animal-farm`, `cart-empty`, `cart-fetching`, `cart-loaded`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `fire-station`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `house`, `marketplace`, `mine-camp`, `police-station`, `road`, `school`, `ship`, `shipyard`, `tavern`, `warehouse-map`, `warehouse`, `well`, `workshop`

### `resources/`  ·  75 files  ·  1254×1254

`apple`, `banana`, `berry`, `boot`, `brandy`, `bread`, `brick`, `candle`, `cheese`, `chicken`, `cider`, `cigar`, `clam`, `clay`, `coal`, `cocoa`, `coin`, `concrete`, `corn`, `cotton`, `cow`, `egg`, `feather-hat`, `fish`, `flour`, `fur`, `furniture`, `gem`, `glass`, `gold-ore`, `grape`, `horse`, `iron-ingot`, `iron-ore`, `jam`, `jewelry`, `lettuce`, `marble-statue`, `marble`, `melon`, `milk`, `olive-oil`, `olive`, `onion`, `orange`, `pant`, `pig`, `pork`, `potato`, `pottery`, `pumpkin`, `rice`, `rubber`, `rum`, `salt`, `sand`, `sausage`, `sheep`, `shirt`, `slate`, `soybean`, `steel`, `stone`, `sugar-cane`, `timber`, `tobacco`, `tomato`, `tool`, `wax`, `weapon`, `wheat-sheaf-v3`, `window`, `wine`, `wood`, `wool`

### `terrain/`  ·  3 files  ·  48×48

`bush`, `rock`, `tree`

### `population/busts/`  ·  12 files  ·  1254×1254

`artisan-bust-v2-clean-alpha`, `artisan-bust-v2-clean`, `entrepreneur-bust-v2-clean-alpha`, `entrepreneur-bust-v2-clean`, `farmer-bust-v2-clean-alpha`, `farmer-bust-v2-clean`, `magnate-bust-v2-clean-alpha`, `magnate-bust-v2-clean`, `scholar-bust-v2-clean-alpha`, `scholar-bust-v2-clean`, `worker-bust-v2-clean-alpha`, `worker-bust-v2-clean`

### `coat-of-arms/`  ·  5 files  ·  1254×1254

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

### `cursors/`  ·  1 files  ·  40×40

`shovel`

### `buildings/old_versions/`  ·  1 files  ·  1281×828

`animal-farm-before-v9-rediamond-20260626`

### `ui/`  ·  1 files  ·  1254×1254

`button`

### `map-tiles/blend/`  ·  terrain auto-tiling (dual-grid corner-Wang)

Three 16-tile sets, one per layer boundary. Files are `0.png`–`F.png` = the 4-corner mask (`NW=1, NE=2, SE=4, SW=8`). See each folder’s `README.md` for source/version.

| folder | boundary | bit 1 = |
|---|---|---|
| `sand-sea/` | sand ↔ sea | sea |
| `grass-sand/` | grass ↔ sand | grass |
| `dirt-grass/` | dirt ↔ grass | dirt |

---

## `lib/` — image library

Real image files, grouped into 10 categories. For normal game assets, the folder is the subject and the filename is the variant. Runtime code should keep referencing `used/` symlinks.

<details><summary><code>buildings/</code> · 44 items</summary>

`animal-farm`, `cart`, `cart-empty`, `cart-fetching`, `cart-loaded`, `cart-with-cargo`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `farmer-hut`, `fire-station`, `house`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `housing-tier-01`, `housing-tier-02`, `housing-tier-03`, `housing-tier-04`, `housing-tier-05`, `housing-tier-06`, `marketplace`, `mine-camp`, `old_versions`, `plowed-barn-farm`, `police-station`, `road`, `school`, `ship`, `ship-3-mast`, `shipyard`, `tavern`, `town-objects-cute`, `warehouse`, `warehouse-map`, `well`, `workshop`

</details>

<details><summary><code>coat-of-arms/</code> · 5 items</summary>

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

</details>

<details><summary><code>cursors/</code> · 1 items</summary>

`shovel`

</details>

<details><summary><code>map-tiles/</code> · 6 items</summary>

`blend`, `dirt`, `grass`, `road`, `sand`, `sea`

</details>

<details><summary><code>population/</code> · 13 items</summary>

`artisan`, `artisan-bust`, `busts`, `entrepreneur`, `entrepreneur-bust`, `farmer`, `farmer-bust`, `magnate`, `magnate-bust`, `scholar`, `scholar-bust`, `worker`, `worker-bust`

</details>

<details><summary><code>resources/</code> · 184 items</summary>

`apple`, `avocado`, `banana`, `barley`, `beer`, `bell-pepper`, `berry`, `black-bean`, `black-pepper`, `blackberry`, `blueberry`, `bok-choy`, `boot`, `brandy`, `bread`, `brick`, `broccoli`, `butter`, `cabbage`, `cake`, `candle`, `cantaloupe`, `cardamom`, `carrot`, `cauliflower`, `celestial-objects-20260626`, `cheese`, `cherry`, `chestnut`, `chicken`, `chickpea`, `chili-pepper`, `chocolate`, `cider`, `cigar`, `cinnamon`, `clam`, `clay`, `coal`, `cocoa`, `coconut`, `coffee`, `coin`, `concrete`, `corn`, `cotton`, `cotton-cloth`, `cotton-shirt`, `cow`, `crab`, `cucumber`, `date`, `donkey`, `dragon-fruit`, `duck`, `egg`, `egg-basket`, `eggplant`, `feather-hat`, `fig`, `fish`, `flax`, `flour`, `fur`, `fur-boot`, `furniture`, `garlic`, `gem`, `glass`, `gold-ore`, `goose`, `grape`, `green-peas`, `hemp`, `honey`, `hops`, `horse`, `ingots`, `iron-ingot`, `iron-ore`, `jam`, `jewelry`, `jute`, `knight-armor`, `leek`, `lemon`, `lentil`, `lettuce`, `lime`, `llama`, `lobster`, `lychee`, `mango`, `marble`, `marble-block`, `marble-statue`, `melon`, `milk`, `millet`, `mushroom`, `noodles`, `oats`, `oil`, `okra`, `olive`, `olive-oil`, `onion`, `orange`, `ores`, `oyster`, `pant`, `papaya`, `pasta`, `pastry`, `peach`, `peanut`, `pear`, `pearl`, `pie`, `pig`, `pineapple`, `plum`, `pomegranate`, `pork`, `potato`, `pottery`, `pottery-household`, `pumpkin`, `quinoa`, `raspberry`, `rice`, `rice-plant`, `rubber`, `rum`, `saffron`, `salmon`, `salt`, `sand`, `sand-pile`, `sausage`, `seaweed`, `sheep`, `shirt`, `shrimp`, `silk`, `slate`, `sorghum`, `soybean`, `spinach`, `steel`, `stone`, `stone-block-stack`, `stone-slab`, `strawberry`, `sugar`, `sugar-beet`, `sugar-cane`, `sunflower`, `taro`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `turkey`, `vanilla`, `vinegar`, `walnut`, `water-buffalo`, `watermelon`, `wax`, `weapon`, `weapon-sword-shield`, `wheat-sheaf`, `window`, `wine`, `wine-barrel`, `wood`, `wool`, `yam`, `yellow-squash`, `yogurt`, `zucchini`

</details>

<details><summary><code>road/</code> · 1 items</summary>

`road-tiles`

</details>

<details><summary><code>terrain/</code> · 3 items</summary>

`bush`, `rock`, `tree`

</details>

<details><summary><code>tiles/</code> · 7 items</summary>

`boulder`, `bushes`, `dirt`, `grass`, `sand`, `sea`, `three-trees-large`

</details>

