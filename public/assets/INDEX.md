# Asset Index

Auto-generated map of `public/assets/`. Two trees:

- **`used/`** — stable app-facing symlinks (237 image pointers). Repoint these to swap art.
- **`lib/`** — unified image library. Category/subject folders hold real files; filenames distinguish variants.

> Regenerate: `node tools/gen-asset-index.mjs`

---

## `used/` — live assets

### `map-tiles/`  ·  4 files  ·  48×48

`dirt`, `grass`, `sand`, `sea`

### `map-tiles/road/`  ·  6 files  ·  512×512

`corner`, `cross`, `end`, `isolated`, `straight`, `tee`

### `buildings/`  ·  32 files  ·  1094×757, 1254×1254, 1774×887, 1536×1024, 1513×1040, 1544×1018, 1521×1034

`animal-farm`, `cart-empty`, `cart-fetching`, `cart-loaded`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `fire-station`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `house`, `marketplace`, `mine-camp`, `police-station`, `road`, `school`, `ship`, `shipyard`, `tavern`, `university-map`, `warehouse-map`, `warehouse`, `well`, `workshop`

### `resources/`  ·  85 files  ·  1254×1254

`apple`, `banana`, `berry`, `boot`, `brandy`, `bread`, `brick`, `cabbage`, `candle`, `cheese`, `chicken`, `cider`, `cigar`, `clam`, `clay`, `coal`, `cocoa`, `coin`, `concrete`, `copper`, `corn`, `cotton`, `cow`, `egg`, `feather-hat`, `fertilizer`, `fish`, `flour`, `fur-coat`, `fur`, `furniture`, `gem`, `glass`, `gold-ore`, `grape`, `horse`, `iron-ingot`, `iron-ore`, `ivory`, `jam`, `jewelry`, `lettuce`, `marble-statue`, `marble`, `melon`, `milk`, `noodle`, `olive-oil`, `olive`, `onion`, `orange`, `pant`, `pig`, `pork`, `potato`, `pottery`, `pumpkin`, `rice`, `rubber`, `rum`, `salt`, `sand`, `sausage`, `sheep`, `shirt`, `silk`, `slate`, `soybean`, `steel`, `stone`, `sugar-cane`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `wax`, `weapon`, `whale-oil`, `wheat-sheaf-v3`, `window`, `wine`, `wood`, `wool`

### `terrain/`  ·  26 files  ·  96×96, 96×160

`bare-branch-tree-variant`, `bush-original-96-dirt`, `bush`, `fallen-log-variant`, `flowering-bush-variant`, `mushroom-patch-variant`, `reed-grass-variant`, `rock-original-96-dirt`, `rock-variant-1`, `rock-variant-2`, `rock-variant-3`, `rock`, `tall-autumn-tree`, `tall-bare-branch-tree`, `tall-birch-tree`, `tall-cypress-tree`, `tall-oak-tree`, `tall-pine-tree`, `tiny-pond-variant`, `tree-bush-autumn-variant`, `tree-bush-variant-1`, `tree-bush-variant-2`, `tree-bush-variant-3`, `tree-original-96-dirt`, `tree-stump-variant`, `tree`

### `population/busts/`  ·  6 files  ·  1254×1254

`artisan-bust-v2-clean-alpha`, `entrepreneur-bust-v2-clean-alpha`, `farmer-bust-v2-clean-alpha`, `magnate-bust-v2-clean-alpha`, `scholar-bust-v2-clean-alpha`, `worker-bust-v2-clean-alpha`

### `coat-of-arms/`  ·  5 files  ·  1254×1254

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

### `cursors/`  ·  3 files  ·  40×40

`build-hammer`, `shovel`, `white-glove-pointer`

### `actors/`  ·  5 files  ·  96×96, 384×96

`poodle-se`, `poodle-walk-ne`, `poodle-walk-nw`, `poodle-walk-se`, `poodle-walk-sw`

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

Real image files, grouped into 11 categories. For normal game assets, the folder is the subject and the filename is the variant. Runtime code should keep referencing `used/` symlinks.

<details><summary><code>actors/</code> · 1 items</summary>

`poodle`

</details>

<details><summary><code>buildings/</code> · 39 items</summary>

`animal-farm`, `cart`, `cart-empty`, `cart-fetching`, `cart-loaded`, `cart-with-cargo`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `farmer-hut`, `fire-station`, `fishermen-wharf`, `food-processing-workshop`, `grove-farm`, `house`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `marketplace`, `mine-camp`, `police-station`, `road`, `school`, `ship`, `shipyard`, `tavern`, `town-objects-cute`, `university-map`, `warehouse`, `warehouse-map`, `well`, `workshop`

</details>

<details><summary><code>coat-of-arms/</code> · 5 items</summary>

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

</details>

<details><summary><code>cursors/</code> · 3 items</summary>

`build-hammer`, `shovel`, `white-glove-pointer`

</details>

<details><summary><code>map-tiles/</code> · 6 items</summary>

`blend`, `dirt`, `grass`, `road`, `sand`, `sea`

</details>

<details><summary><code>population/</code> · 12 items</summary>

`artisan`, `artisan-bust`, `entrepreneur`, `entrepreneur-bust`, `farmer`, `farmer-bust`, `magnate`, `magnate-bust`, `scholar`, `scholar-bust`, `worker`, `worker-bust`

</details>

<details><summary><code>resources/</code> · 183 items</summary>

`apple`, `avocado`, `banana`, `beer`, `bell-pepper`, `berry`, `black-bean`, `black-pepper`, `blackberry`, `blueberry`, `bok-choy`, `boot`, `brandy`, `bread`, `brick`, `broccoli`, `butter`, `cabbage`, `cake`, `candle`, `cantaloupe`, `cardamom`, `carrot`, `cauliflower`, `celestial-objects-20260626`, `cheese`, `cherry`, `chestnut`, `chicken`, `chickpea`, `chili-pepper`, `chocolate`, `cider`, `cigar`, `cinnamon`, `clam`, `clay`, `coal`, `cocoa`, `coconut`, `coffee-berry`, `coffee-drink`, `coin`, `concrete`, `corn`, `cotton`, `cotton-cloth`, `cotton-shirt`, `cow`, `crab`, `cucumber`, `date`, `deer`, `donkey`, `dragon-fruit`, `duck`, `egg`, `eggplant`, `feather-hat`, `fertilizer`, `fig`, `fish`, `flax`, `flour`, `fur`, `fur-boot`, `fur-coat`, `furniture`, `garlic`, `gem`, `glass`, `gold-ore`, `goose`, `grape`, `green-peas`, `hemp`, `honey`, `hops`, `horse`, `incense`, `ingots`, `iron-ore`, `ivory`, `jam`, `jewelry`, `jute`, `knight-armor`, `leather`, `leek`, `lemon`, `lettuce`, `lime`, `llama`, `lobster`, `lychee`, `mango`, `marble`, `marble-statue`, `melon`, `milk`, `millet`, `mushroom`, `noodles`, `oats`, `okra`, `olive`, `olive-oil`, `onion`, `orange`, `ores`, `oyster`, `pant`, `papaya`, `pasta`, `pastry`, `peach`, `peanut`, `pear`, `pearl`, `pie`, `pig`, `pineapple`, `plum`, `pomegranate`, `porcelain`, `pork`, `potato`, `pottery`, `pumpkin`, `quinoa`, `raspberry`, `rice`, `rice-plant`, `rubber`, `rum`, `saffron`, `salmon`, `salt`, `sand`, `sausage`, `seaweed`, `sheep`, `shirt`, `shrimp`, `silk`, `slate`, `smoked-fish`, `sorghum`, `soybean`, `spinach`, `steel`, `stone`, `stone-slab`, `strawberry`, `sugar`, `sugar-beet`, `sugar-cane`, `sunflower`, `taro`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `turkey`, `vanilla`, `vinegar`, `walnut`, `water-buffalo`, `watermelon`, `wax`, `weapon-sword-shield`, `whale-oil`, `wheat-sheaf`, `window`, `wine`, `wood`, `wool`, `yam`, `yellow-squash`, `yogurt`, `zucchini`

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

