# Asset Index

Auto-generated map of `public/assets/`. Two trees:

- **`used/`** — stable app-facing symlinks (247 image pointers). Repoint these to swap art.
- **`lib/`** — unified image library. Category/subject folders hold real files; filenames distinguish variants.

> Regenerate: `node tools/gen-asset-index.mjs`

---

## `used/` — live assets

### `map-tiles/`  ·  4 files  ·  48×48

`dirt`, `grass`, `sand`, `sea`

### `map-tiles/road/`  ·  6 files  ·  512×512

`corner`, `cross`, `end`, `isolated`, `straight`, `tee`

### `buildings/`  ·  33 files  ·  1094×757, 1127×903, 1184×1048, 896×1136, 1211×1178, 997×1142, 1213×818, 882×1108, 1183×1035, 1228×1172, 1213×1155, 1212×1086, 1063×1063, 1003×1057, 991×1154, 1027×1168, 1003×1160, 1064×1029, 1523×969, 1184×1155, 1180×929, 857×1083, 1004×1054, 1099×1063, 1115×1038, 1508×1010, 1534×983, 1088×1067, 933×1161, 1506×944

`animal-farm`, `cart-empty`, `cart-fetching`, `cart-loaded`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `fire-station`, `fishermen-wharf`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `house`, `marketplace`, `mine-camp`, `police-station`, `road`, `school`, `ship`, `shipyard`, `tavern`, `university-map`, `warehouse-map`, `warehouse`, `well`, `workshop`

### `resources/`  ·  85 files  ·  1254×1254

`apple`, `banana`, `berry`, `boot`, `brandy`, `bread`, `brick`, `cabbage`, `candle`, `cheese`, `chicken`, `cider`, `cigar`, `clam`, `clay`, `coal`, `cocoa`, `coin`, `concrete`, `copper`, `corn`, `cotton`, `cow`, `egg`, `feather-hat`, `fertilizer`, `fish`, `flour`, `fur-coat`, `fur`, `furniture`, `gem`, `glass`, `gold-ore`, `grape`, `horse`, `iron-ingot`, `iron-ore`, `ivory`, `jam`, `jewelry`, `lettuce`, `marble-statue`, `marble`, `melon`, `milk`, `noodle`, `olive-oil`, `olive`, `onion`, `orange`, `pant`, `pig`, `pork`, `potato`, `pottery`, `pumpkin`, `rice`, `rubber`, `rum`, `salt`, `sand`, `sausage`, `sheep`, `shirt`, `silk`, `slate`, `soybean`, `steel`, `stone`, `sugar-cane`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `wax`, `weapon`, `whale-oil`, `wheat-sheaf-v3`, `window`, `wine`, `wood`, `wool`

### `population/busts/`  ·  6 files  ·  1254×1254

`artisan-bust-v2-clean-alpha`, `entrepreneur-bust-v2-clean-alpha`, `farmer-bust-v2-clean-alpha`, `magnate-bust-v2-clean-alpha`, `scholar-bust-v2-clean-alpha`, `worker-bust-v2-clean-alpha`

### `coat-of-arms/`  ·  5 files  ·  1254×1254

`anrelia`, `columbia`, `jinlin`, `mintaka`, `solara`

### `cursors/`  ·  6 files  ·  40×40

`build-hammer`, `downgrade-arrow`, `move-arrows`, `shovel`, `upgrade-arrow`, `white-glove-pointer`

### `actors/`  ·  5 files  ·  96×96, 384×96

`poodle-se`, `poodle-walk-ne`, `poodle-walk-nw`, `poodle-walk-se`, `poodle-walk-sw`

### `map-tiles/surfaces/grass/`  ·  2 files  ·  64×64

`alternative-1`, `main`

### `map-tiles/surfaces/rock-grass/`  ·  2 files  ·  64×64

`alternative-1`, `main`

### `map-tiles/surfaces/sand/`  ·  2 files  ·  64×64

`alternative-1`, `main`

### `map-tiles/surfaces/sea/`  ·  2 files  ·  64×64

`alternative-1`, `main`

### `terrain/bush/`  ·  6 files  ·  96×96

`alternative-1`, `alternative-2`, `alternative-3`, `alternative-4`, `alternative-5`, `main`

### `terrain/decoration/`  ·  6 files  ·  96×96

`alternative-1`, `alternative-2`, `alternative-3`, `alternative-4`, `alternative-5`, `main`

### `terrain/rock/`  ·  4 files  ·  96×96

`alternative-1`, `alternative-2`, `alternative-3`, `main`

### `terrain/tree/`  ·  8 files  ·  96×160, 96×96

`alternative-1`, `alternative-2`, `alternative-3`, `alternative-4`, `alternative-5`, `alternative-6`, `alternative-7`, `main`

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

<details><summary><code>cursors/</code> · 6 items</summary>

`build-hammer`, `downgrade-arrow`, `move-arrows`, `shovel`, `upgrade-arrow`, `white-glove-pointer`

</details>

<details><summary><code>map-tiles/</code> · 7 items</summary>

`blend`, `dirt`, `grass`, `road`, `sand`, `sea`, `surfaces`

</details>

<details><summary><code>population/</code> · 6 items</summary>

`artisan-bust`, `entrepreneur-bust`, `farmer-bust`, `magnate-bust`, `scholar-bust`, `worker-bust`

</details>

<details><summary><code>resources/</code> · 184 items</summary>

`apple`, `avocado`, `banana`, `beer`, `bell-pepper`, `berry`, `black-bean`, `black-pepper`, `blackberry`, `blueberry`, `bok-choy`, `boot`, `brandy`, `bread`, `brick`, `broccoli`, `butter`, `cabbage`, `cake`, `candle`, `cantaloupe`, `cardamom`, `carrot`, `cauliflower`, `celestial-objects-20260626`, `cheese`, `cherry`, `chestnut`, `chicken`, `chickpea`, `chili-pepper`, `chocolate`, `cider`, `cigar`, `cinnamon`, `clam`, `clay`, `coal`, `cocoa`, `coconut`, `coffee-berry`, `coffee-drink`, `coin`, `concrete`, `corn`, `cotton`, `cotton-cloth`, `cotton-shirt`, `cow`, `crab`, `cucumber`, `date`, `deer`, `donkey`, `dragon-fruit`, `duck`, `egg`, `eggplant`, `feather-hat`, `feather-hat-female`, `fertilizer`, `fig`, `fish`, `flax`, `flour`, `fur`, `fur-boot`, `fur-coat`, `furniture`, `garlic`, `gem`, `glass`, `gold-ore`, `goose`, `grape`, `green-peas`, `hemp`, `honey`, `hops`, `horse`, `incense`, `ingots`, `iron-ore`, `ivory`, `jam`, `jewelry`, `jute`, `knight-armor`, `leather`, `leek`, `lemon`, `lettuce`, `lime`, `llama`, `lobster`, `lychee`, `mango`, `marble`, `marble-statue`, `melon`, `milk`, `millet`, `mushroom`, `noodles`, `oats`, `okra`, `olive`, `olive-oil`, `onion`, `orange`, `ores`, `oyster`, `pant`, `papaya`, `pasta`, `pastry`, `peach`, `peanut`, `pear`, `pearl`, `pie`, `pig`, `pineapple`, `plum`, `pomegranate`, `porcelain`, `pork`, `potato`, `pottery`, `pumpkin`, `quinoa`, `raspberry`, `rice`, `rice-plant`, `rubber`, `rum`, `saffron`, `salmon`, `salt`, `sand`, `sausage`, `seaweed`, `sheep`, `shirt`, `shrimp`, `silk`, `slate`, `smoked-fish`, `sorghum`, `soybean`, `spinach`, `steel`, `stone`, `stone-slab`, `strawberry`, `sugar`, `sugar-beet`, `sugar-cane`, `sunflower`, `taro`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `turkey`, `vanilla`, `vinegar`, `walnut`, `water-buffalo`, `watermelon`, `wax`, `weapon-sword-shield`, `whale-oil`, `wheat-sheaf`, `window`, `wine`, `wood`, `wool`, `yam`, `yellow-squash`, `yogurt`, `zucchini`

</details>

<details><summary><code>road/</code> · 1 items</summary>

`road-tiles`

</details>

<details><summary><code>terrain/</code> · 4 items</summary>

`bush`, `decoration`, `rock`, `tree`

</details>

<details><summary><code>tiles/</code> · 7 items</summary>

`boulder`, `bushes`, `dirt`, `grass`, `sand`, `sea`, `three-trees-large`

</details>

<details><summary><code>ui/</code> · 3 items</summary>

`downgrade-button`, `move-button`, `upgrade-button`

</details>

