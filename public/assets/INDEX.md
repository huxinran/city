# Asset Index

Auto-generated map of `public/assets/`. Two trees:

- **`used/`** — stable app-facing symlinks (268 image pointers). Repoint these to swap art.
- **`lib/`** — unified image library. Category/subject folders hold real files; filenames distinguish variants.

> Regenerate: `node tools/gen-asset-index.mjs`

---

## `used/` — live assets

### `map-tiles/`  ·  4 files  ·  48×48

`dirt`, `grass`, `sand`, `sea`

### `map-tiles/road/`  ·  6 files  ·  512×512

`corner`, `cross`, `end`, `isolated`, `straight`, `tee`

### `buildings/`  ·  35 files  ·  1094×757, 1148×899, 1168×903, 1157×905, 896×1136, 1211×1178, 997×1142, 1213×818, 882×1108, 1183×1035, 1228×1172, 1213×1155, 1212×1086, 1552×1001, 1192×783, 1063×1063, 1003×1057, 991×1154, 1027×1168, 1003×1160, 1064×1029, 1297×835, 1184×1155, 1180×929, 857×1083, 1004×1054, 1099×1063, 1115×1038, 1508×1010, 1534×983, 1088×1067, 933×1161, 1521×1034

`animal-farm`, `cart-empty`, `cart-fetching`, `cart-loaded`, `chapel`, `clinic`, `courthouse`, `crop-farm`, `delete`, `dock`, `engineer-station`, `fire-station`, `fishermen-wharf`, `food-processing-workshop`, `grove-farm`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `house`, `marketplace`, `mine-camp`, `police-station`, `road`, `school`, `ship`, `shipyard`, `tavern`, `university-map`, `warehouse-map`, `warehouse`, `well`, `workshop`

### `resources/`  ·  86 files  ·  1254×1254

`apple`, `banana`, `berry`, `boot`, `brandy`, `bread`, `brick`, `cabbage`, `candle`, `cheese`, `chicken`, `cider`, `cigar`, `clam`, `clay`, `coal`, `cocoa`, `coin`, `concrete`, `copper`, `corn`, `cotton`, `cow`, `egg`, `feather-hat`, `fertilizer`, `fish`, `flour`, `fur-coat`, `fur`, `furniture`, `gem`, `glass`, `gold-ore`, `grape`, `horse`, `iron-ingot`, `iron-ore`, `ivory`, `jam`, `jewelry`, `lettuce`, `marble-statue`, `marble`, `melon`, `milk`, `noodle`, `olive-oil`, `olive`, `onion`, `orange`, `pant`, `pig`, `pork`, `potato`, `pottery`, `pumpkin`, `rice`, `rubber`, `rum`, `salt`, `sand`, `sausage`, `sheep`, `shirt`, `silk`, `slate`, `soybean`, `steel`, `stone-blocks`, `stone`, `sugar-cane`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `wax`, `weapon`, `whale-oil`, `wheat-sheaf-v3`, `window`, `wine`, `wood`, `wool`

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

### `terrain/bush/`  ·  11 files  ·  96×96, 803×732, 884×749, 724×617, 908×711, 816×681

`alternative-1`, `alternative-10`, `alternative-2`, `alternative-3`, `alternative-4`, `alternative-5`, `alternative-6`, `alternative-7`, `alternative-8`, `alternative-9`, `main`

### `terrain/decoration/`  ·  14 files  ·  96×96, 799×370, 554×412, 378×666, 563×325, 645×375, 785×512, 555×509, 540×761

`alternative-1`, `alternative-11`, `alternative-12`, `alternative-15`, `alternative-16`, `alternative-2`, `alternative-3`, `alternative-4`, `alternative-5`, `alternative-6`, `alternative-7`, `alternative-8`, `alternative-9`, `main`

### `terrain/mine/`  ·  1 files  ·  96×96

`alternative-6`

### `terrain/rock/`  ·  4 files  ·  96×96

`alternative-1`, `alternative-2`, `alternative-3`, `main`

### `terrain/tree/`  ·  11 files  ·  96×160, 722×1452, 96×96, 806×1489, 653×1433

`alternative-1`, `alternative-10`, `alternative-2`, `alternative-3`, `alternative-4`, `alternative-5`, `alternative-6`, `alternative-7`, `alternative-8`, `alternative-9`, `main`

### `ui/`  ·  2 files  ·  1254×1254, 1024×256

`button`, `panel-parchment`

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

<details><summary><code>buildings/</code> · 98 items</summary>

`animal-farm`, `apothecary`, `apple-orchard`, `bakery`, `banana-plantation`, `berry-grove`, `bottleworks`, `butchery`, `cabbage-patch`, `candle-manufactory`, `cart-empty`, `cart-fetching`, `cart-loaded`, `chapel`, `cidery`, `clay-pit`, `clinic`, `coal-kiln`, `cocoa-plant`, `compost-pit`, `copper-mine`, `corn-field`, `courthouse`, `creamery`, `crop-farm`, `delete`, `dock`, `dumpling-kitchen`, `dye-workshop`, `engineer-station`, `farmer-hut`, `fire-station`, `fishermen-wharf`, `fishery`, `food-processing-workshop`, `food-workshop`, `fur-workshop`, `gem-mine`, `glassworks`, `gold-mine`, `grove-farm`, `house`, `house-tier-1`, `house-tier-2`, `house-tier-3`, `house-tier-4`, `house-tier-5`, `house-tier-6`, `ice-creamery`, `incense-grove`, `ink-workshop`, `iron-mine`, `ivory-camp`, `kiln`, `lumber-hut`, `machine-shop`, `marketplace`, `melon-garden`, `mine-camp`, `noodle-shop`, `olive-grove`, `onion-field`, `orange-orchard`, `painter-studio`, `paper-mill`, `perfumery`, `picklery`, `police-station`, `potato-farm`, `pottery-shop`, `reindeer-farm`, `rice-paddy`, `road`, `saltern`, `sand-pit`, `school`, `ship`, `shipyard`, `silk-farm`, `smokehouse`, `soap-works`, `sushi-bar`, `tannery`, `tavern`, `tea-garden`, `tofu-shop`, `tomato-field`, `town-objects-cute`, `university-map`, `vineyard`, `warehouse`, `warehouse-map`, `watchmaker`, `well`, `whaling-post`, `wheat-farm`, `wind-mill`, `workshop`

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

<details><summary><code>resources/</code> · 198 items</summary>

`apple`, `avocado`, `banana`, `beer`, `bell-pepper`, `berry`, `black-bean`, `black-pepper`, `blackberry`, `blueberry`, `bok-choy`, `boot`, `brandy`, `bread`, `brick`, `broccoli`, `butter`, `cabbage`, `cake`, `candle`, `cantaloupe`, `cardamom`, `carrot`, `cauliflower`, `celestial-objects-20260626`, `cheese`, `cherry`, `chestnut`, `chicken`, `chickpea`, `chili-pepper`, `chocolate`, `cider`, `cigar`, `cinnamon`, `clam`, `clay`, `coal`, `cocoa`, `coconut`, `coffee-berry`, `coffee-drink`, `coin`, `concrete`, `corn`, `cotton`, `cotton-cloth`, `cotton-shirt`, `cow`, `crab`, `cucumber`, `date`, `deer`, `donkey`, `dragon-fruit`, `duck`, `dumplings`, `dye`, `egg`, `eggplant`, `feather-hat`, `feather-hat-female`, `fertilizer`, `fig`, `fish`, `flax`, `flour`, `fur`, `fur-boot`, `fur-coat`, `furniture`, `garlic`, `gem`, `glass`, `glass-bottle`, `gold-ore`, `goose`, `grape`, `green-peas`, `hemp`, `honey`, `hops`, `horse`, `ice-cream`, `incense`, `ingots`, `ink`, `iron-ore`, `ivory`, `jam`, `jewelry`, `jute`, `knight-armor`, `leather`, `leek`, `lemon`, `lettuce`, `lime`, `llama`, `lobster`, `lychee`, `machine-parts`, `mango`, `marble`, `marble-statue`, `medicine`, `melon`, `milk`, `millet`, `mushroom`, `noodles`, `oats`, `okra`, `olive`, `olive-oil`, `onion`, `orange`, `ores`, `oyster`, `paintings`, `pant`, `papaya`, `paper`, `pasta`, `pastry`, `peach`, `peanut`, `pear`, `pearl`, `perfume`, `pickles`, `pie`, `pig`, `pineapple`, `plum`, `pomegranate`, `porcelain`, `pork`, `potato`, `pottery`, `pumpkin`, `quinoa`, `raspberry`, `rice`, `rice-plant`, `rubber`, `rum`, `saffron`, `salmon`, `salt`, `sand`, `sausage`, `seaweed`, `sheep`, `shirt`, `shrimp`, `silk`, `slate`, `smoked-fish`, `soap`, `sorghum`, `soybean`, `spinach`, `steel`, `stone`, `stone-slab`, `strawberry`, `sugar`, `sugar-beet`, `sugar-cane`, `sunflower`, `sushi`, `taro`, `tea`, `timber`, `tobacco`, `tofu`, `tomato`, `tool`, `turkey`, `vanilla`, `vinegar`, `walnut`, `watch`, `water-buffalo`, `watermelon`, `wax`, `weapon-sword-shield`, `whale-oil`, `wheat-sheaf`, `window`, `wine`, `wood`, `wool`, `yam`, `yellow-squash`, `yogurt`, `zucchini`

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

<details><summary><code>ui/</code> · 4 items</summary>

`downgrade-button`, `move-button`, `panel-parchment`, `upgrade-button`

</details>

