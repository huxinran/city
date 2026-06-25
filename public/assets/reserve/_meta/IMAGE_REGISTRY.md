# Image Registry

Every image file currently loaded by the game, one row per file.
**Core name** = the simplest possible identifier for what the image depicts.
When two files would share a core name, the active one keeps it and the other gets a more specific name.

Columns: `core name` | `actual filename` | `in use?` | `note`

---

## Resource Icons — `used/resources/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| apple | apple.png | yes | |
| banana | banana.png | yes | |
| berry | berry.png | yes | |
| boot | boot.png | yes | |
| brandy | brandy.png | yes | |
| bread | bread.png | yes | |
| brick | brick.png | yes | |
| cabbage | lettuce.png | yes | core name is cabbage (Resource.CABBAGE), file is lettuce.png |
| candle | candle.png | yes | |
| cheese | cheese.png | yes | |
| chicken | chicken.png | yes | |
| cider | cider.png | yes | |
| cigar | cigar.png | yes | |
| clam | clam.png | yes | promoted from reserve |
| clay | clay.png | yes | |
| coal | coal.png | yes | |
| cocoa | cocoa.png | yes | |
| coin | coin.png | yes | represents GOLD resource |
| concrete | concrete.png | yes | |
| corn | corn.png | yes | |
| cotton | cotton.png | yes | |
| cow | cow.png | yes | used as dairy-farm product icon |
| egg | egg.png | yes | |
| feather-hat | feather-hat.png | yes | luxury hat resource |
| fish | fish.png | yes | |
| flour | flour.png | yes | |
| fur | fur.png | yes | |
| furniture | furniture.png | yes | |
| gem | gem.png | yes | |
| glass | glass.png | yes | |
| gold-ore | gold-ore.png | yes | |
| grape | grape.png | yes | |
| horse | horse.png | yes | |
| iron-ingot | iron-ingot.png | yes | represents processed IRON resource |
| iron-ore | iron-ore.png | yes | |
| jam | jam.png | yes | |
| jewelry | jewelry.png | yes | |
| marble | marble.png | yes | raw marble resource |
| marble-statue | marble-statue.png | yes | represents STATUE resource |
| melon | melon.png | yes | |
| milk | milk.png | yes | |
| oil | oil.png | yes | |
| olive | olive.png | yes | |
| olive-oil | olive-oil.png | yes | processed olive oil; distinct from oil |
| onion | onion.png | yes | |
| orange | orange.png | yes | |
| pant | pant.png | yes | |
| pig | pig.png | yes | used as PORK resource icon |
| potato | potato.png | yes | |
| pottery | pottery.png | yes | |
| pumpkin | pumpkin.png | yes | |
| rice | rice.png | yes | |
| rubber | rubber.png | yes | |
| rum | rum.png | yes | |
| salt | salt.png | yes | |
| sand | sand.png | yes | |
| sausage | sausage.png | yes | |
| sheep | sheep.png | yes | |
| shirt | shirt.png | yes | cloth shirt resource |
| slate | slate.png | yes | |
| soybean | soybean.png | yes | |
| steel | steel.png | yes | |
| stone | stone.png | yes | |
| sugar-cane | sugar-cane.png | yes | |
| timber | timber.png | yes | |
| tobacco | tobacco.png | yes | |
| tomato | tomato.png | yes | |
| tool | tool.png | yes | |
| wax | wax.png | yes | |
| weapon | weapon.png | yes | |
| wheat | wheat.png | yes | |
| window | window.png | yes | |
| wine | wine.png | yes | |
| wood | wood.png | yes | |
| wool | wool.png | yes | |

### Reserve / alternate versions (not primary)

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| apple-regen | apple-regen-v2.png | used/resources/ | alternate apple depiction |
| boot-fur | fur-boot.png | reserve/fur-boot/ | fur boot variant |
| boot-fur-v2 | fur-boot-v2.png | reserve/fur-boot/ | second fur boot variant |
| chicken-regen | chicken-regen-v2.png | used/resources/ | alternate chicken depiction |
| clam-alt | clam.png | reserve/clam/ | reserve copy (used/ is active) |
| clam-alt-2 | clam-2.png | reserve/clam/ | second clam depiction |
| cotton-shirt | cotton-shirt.png | reserve/cotton-shirt/ | shirt alternate (cotton style) |
| cotton-shirt-v2 | cotton-shirt-v2.png | reserve/cotton-shirt/ | |
| cotton-shirt-v3 | cotton-shirt-v3.png | reserve/cotton-shirt/ | |
| cotton-shirt-v4 | cotton-shirt-v4.png | reserve/cotton-shirt/ | |
| cow-regen | cow-regen-v2.png | used/resources/ | alternate cow depiction |
| egg-basket | egg-basket-v2.png | reserve/egg-basket/ | alternate egg depiction |
| feather-hat-v2 | feather-hat-v2.png | reserve/feather-hat/ | second design |
| fish-caught | fish-caught-v2.png | reserve/fish-caught/ | alternate fish depiction |
| hand-push-cart | hand-push-cart.png | reserve/hand-push-cart/ | unused UI candidate |
| horse-v2 | horse-v2.png | reserve/horse/ | second horse design |
| horse-v3 | horse-v3.png | reserve/horse/ | third horse design |
| horse-v5 | horse-v5.png | reserve/horse/ | fifth horse design |
| marble-block | marble-block.png | reserve/marble-block/ | block/quarried alternate |
| oil-bottle | oil-v1.png | reserve/oil/ | **preferred alternate** |
| oil-flask | oil-v2.png | reserve/oil/ | second alternate |
| olive-oil-jug | olive-oil-jug-v2.png | reserve/olive-oil-jug/ | jug depiction v2 |
| olive-oil-jug-dark | olive-oil-jug-v3.png | reserve/olive-oil-jug/ | jug depiction v3 |
| pant-blue | pant-blue-v2.png | reserve/pant-blue/ | blue colorway alternate |
| pig-ear | pig-ear-v2.png | used/resources/ | pig ear cut depiction |
| pork-ham | pork-ham-v1.png | reserve/pork/ | round ham steak with center bone; generated 2026-06-23 |
| pork-ham-small-bone | pork-ham-v2.png | reserve/pork/ | bigger meat with smaller center bone; generated 2026-06-23 |
| pork-ham-leg | pork-ham-v3.png | reserve/pork/ | whole chunky ham leg with protruding bone; generated 2026-06-23 |
| pork-leg-cut-face | pork-ham-v4.png | reserve/pork/ | **preferred alternate**; pig leg with cut face and center bone; generated 2026-06-23 |
| pottery-household | pottery-household-v2.png | reserve/pottery-household/ | household-style alternate |
| sand-pile | sand-pile-v2.png | used/resources/ | sand pile alternate |
| sheep-regen | sheep-regen-v2.png | used/resources/ | alternate sheep depiction |
| weapon-sword-shield | weapon-sword-shield.png | reserve/weapon-sword-shield/ | sword+shield design |
| weapon-sword-shield-v2 | weapon-sword-shield-v2.png | reserve/weapon-sword-shield/ | second sword+shield design |
| wheat-sheaf | wheat-sheaf-v3.png | used/resources/ | sheaf depiction |
| wine-barrel | wine-barrel-v2.png | reserve/wine-barrel/ | barrel depiction v2 |
| wine-barrel-dark | wine-barrel-v3.png | reserve/wine-barrel/ | barrel depiction v3 |
| wine-classic | wine-v1.png | reserve/wine/ | earlier bottle design |

### Produce/Resource batch 2026-06-24 — `reserve/<slug>/` (chunky pixel art, not yet in use)

52 large pixel-art resource icons generated 2026-06-24. Each `<slug>/` folder also keeps a
`*-before-white-bg-removal-20260624.png` raw original alongside the keyed PNG.
"Preferred file" is the accepted/latest version per the generation log.

| Core name | Preferred file | Reserve path | Status |
|-----------|----------------|--------------|--------|
| avocado | avocado.png | reserve/avocado/ | new |
| black-bean | black-bean.png | reserve/black-bean/ | new |
| blackberry | blackberry-detailed-v2.png | reserve/blackberry/ | revised berry cluster, 3 berries, no leaves, white background |
| black-pepper | black-pepper-v3.png | reserve/black-pepper/ | new (v1–v3) |
| blueberry | blueberry-detailed-v1.png | reserve/blueberry/ | existing berry cluster reference |
| bok-choy | bok-choy.png | reserve/bok-choy/ | new |
| cabbage | cabbage.png | reserve/cabbage/ | recreation of lettuce.png (CABBAGE) |
| cardamom | cardamom.png | reserve/cardamom/ | new |
| carrot | carrot.png | reserve/carrot/ | new |
| chickpea | chickpea.png | reserve/chickpea/ | new |
| chili-pepper | chili-pepper.png | reserve/chili-pepper/ | new |
| cinnamon | cinnamon.png | reserve/cinnamon/ | new |
| coconut | coconut-v2.png | reserve/coconut/ | new (v2 = no leaf) |
| coffee | coffee-v3.png | reserve/coffee/ | new (v1–v3, v3 = raw coffee berries) |
| date | date.png | reserve/date/ | new |
| eggplant | eggplant-v3.png | reserve/eggplant/ | new (v1–v3, whole only) |
| fig | fig-v2.png | reserve/fig/ | new (v2) |
| flax | flax.png | reserve/flax/ | new |
| garlic | garlic-v2.png | reserve/garlic/ | new (v2 = no roots) |
| grape | grape-v2.png | reserve/grape/ | recreation of grape.png |
| hemp | hemp.png | reserve/hemp/ | new |
| honey | honey.png | reserve/honey/ | new |
| jute | jute.png | reserve/jute/ | new |
| lemon | lemon-v2.png | reserve/lemon/ | new (v2) |
| lentil | lentil.png | reserve/lentil/ | new |
| mango | mango-v4.png | reserve/mango/ | new (v1–v4) |
| millet | millet-v2.png | reserve/millet/ | new (v2 = right-pointing sheaf) |
| oats | oats-v2.png | reserve/oats/ | new (v2 = right-pointing sheaf) |
| okra | okra-v3.png | reserve/okra/ | new (v1–v3, two pods one cut) |
| olive | olive.png | reserve/olive/ | recreation of olive.png |
| papaya | papaya-v2.png | reserve/papaya/ | new (v2) |
| peanut | peanut.png | reserve/peanut/ | new |
| pineapple | pineapple-v2.png | reserve/pineapple/ | new (v2 = slight tilt) |
| pomegranate | pomegranate-v4.png | reserve/pomegranate/ | new (v1-v4, v4 = natural exposed seed half) |
| quinoa | quinoa.png | reserve/quinoa/ | new |
| raspberry | raspberry-detailed-v2.png | reserve/raspberry/ | revised berry cluster, 3 berries, no leaves, white background |
| rice-plant | rice-plant-v2.png | reserve/rice-plant/ | recreation/variant of rice.png |
| rubber | rubber-v2.png | reserve/rubber/ | recreation of rubber.png (sap bucket) |
| saffron | saffron-v2.png | reserve/saffron/ | new (v2 = crimson threads) |
| salmon | salmon.png | reserve/salmon/ | recreation of fish.png (FISH) |
| seaweed | seaweed-v2.png | reserve/seaweed/ | new (v2 = no rope) |
| sorghum | sorghum-v2.png | reserve/sorghum/ | new (v2 = right-pointing sheaf) |
| spinach | spinach.png | reserve/spinach/ | new |
| strawberry | strawberry-detailed-v2.png | reserve/strawberry/ | revised berry pair, 2 berries, no leaves, white background |
| sugar-beet | sugar-beet-v2.png | reserve/sugar-beet/ | new (v2 = red beet root) |
| sunflower | sunflower.png | reserve/sunflower/ | new |
| taro | taro.png | reserve/taro/ | new |
| tea | tea-v3.png | reserve/tea/ | new (v1–v3, fresh leaves) |
| tofu | tofu-v4.png | reserve/tofu/ | new (v1–v4, one soft block) |
| vanilla | vanilla.png | reserve/vanilla/ | new |
| watermelon | watermelon-v2.png | reserve/watermelon/ | recreation of melon.png (MELON) |
| yam | yam-v2.png | reserve/yam/ | new (v2 = full retry) |

### Requested produce additions 2026-06-24 - `reserve/<slug>/` (chunky pixel art, not yet in use)

10 more requested pixel-art resource icons. Each `<slug>/` folder keeps a
`*-before-white-bg-removal-20260624.png` raw original alongside the keyed PNG.

| Core name | Preferred file | Reserve path | Note |
|-----------|----------------|--------------|------|
| bell-pepper | bell-pepper.png | reserve/bell-pepper/ | requested produce addition |
| broccoli | broccoli.png | reserve/broccoli/ | requested produce addition |
| cantaloupe | cantaloupe.png | reserve/cantaloupe/ | requested produce addition |
| cauliflower | cauliflower.png | reserve/cauliflower/ | requested produce addition |
| dragon-fruit | dragon-fruit.png | reserve/dragon-fruit/ | requested produce addition |
| green-peas | green-peas.png | reserve/green-peas/ | requested produce addition |
| lychee | lychee.png | reserve/lychee/ | requested produce addition |
| plum | plum.png | reserve/plum/ | requested produce addition |
| yellow-squash | yellow-squash-v5.png | reserve/yellow-squash/ | requested produce addition (v5 preferred chunkier thick end) |
| zucchini | zucchini.png | reserve/zucchini/ | requested produce addition |

### Food/Resource batch 2026-06-24 (round 2) — `reserve/<slug>/` (chunky pixel art, not yet in use)

27 more pixel-art resource icons — chain-completion and gap-fill items (proteins, baked
goods, processed foods, missing fruit/veg/nuts). Each `<slug>/` folder also keeps a
`*-before-white-bg-removal-20260624.png` raw original. "Preferred file" is the
accepted/latest version per the food-resource revision log. All new (no recreations).

| Core name | Preferred file | Reserve path | Note |
|-----------|----------------|--------------|------|
| barley | barley.png | reserve/barley/ | wheat-sheaf structure |
| beer | beer-v2.png | reserve/beer/ | v2 = ornate mug |
| butter | butter.png | reserve/butter/ | no board |
| cake | cake-v2.png | reserve/cake/ | v2 = whole cake |
| cherry | cherry.png | reserve/cherry/ | twig/stem silhouette |
| chestnut | chestnut.png | reserve/chestnut/ | |
| chocolate | chocolate-v2.png | reserve/chocolate/ | v2 = segmented bar |
| crab | crab-v2.png | reserve/crab/ | v2 = less cartoon |
| cucumber | cucumber.png | reserve/cucumber/ | |
| hops | hops.png | reserve/hops/ | feeds beer |
| leek | leek.png | reserve/leek/ | |
| lime | lime.png | reserve/lime/ | |
| lobster | lobster-v2.png | reserve/lobster/ | |
| mushroom | mushroom.png | reserve/mushroom/ | |
| noodles | noodles.png | reserve/noodles/ | |
| oyster | oyster-v3.png | reserve/oyster/ | v3 = elongated shape |
| pasta | pasta.png | reserve/pasta/ | |
| pastry | pastry.png | reserve/pastry/ | |
| peach | peach.png | reserve/peach/ | seam, blush, texture |
| pear | pear.png | reserve/pear/ | speckles/detail |
| pearl | pearl-v2.png | reserve/pearl/ | v2 = clam shell + pearl |
| pie | pie.png | reserve/pie/ | |
| shrimp | shrimp-v3.png | reserve/shrimp/ | v3 = curled shrimp |
| sugar | sugar-v2.png | reserve/sugar/ | v2 = granules + cubes |
| vinegar | vinegar.png | reserve/vinegar/ | corked amber cruet |
| walnut | walnut.png | reserve/walnut/ | |
| yogurt | yogurt-v2.png | reserve/yogurt/ | v2 = plain, no garnish |

---

## Building Icons — `used/buildings/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| animal-farm | animal-farm.png | yes | |
| cart-empty | cart-empty.png | yes | cart sprite — empty state |
| cart-fetching | cart-fetching.png | yes | cart sprite — fetching state |
| cart-loaded | cart-loaded.png | yes | cart sprite — loaded state |
| chapel | chapel.png | yes | |
| clinic | clinic.png | yes | |
| courthouse | courthouse.png | yes | |
| crop-farm | crop-farm.png | yes | |
| delete | delete.png | yes | shovel / delete tool |
| dock | dock.png | yes | swapped to v4-with-3-mast-ship 2026-06-22 |
| engineer-station | engineer-station.png | yes | |
| fire-station | fire-station.png | yes | |
| horse-farm | horse-farm.png | yes | |
| house | house.png | yes | |
| marketplace | marketplace.png | yes | |
| police-station | police-station.png | yes | |
| road | road.png | yes | |
| school | school.png | yes | |
| shipyard | shipyard.png | yes | swapped to v2-launch-ramp 2026-06-22 |
| tavern | tavern.png | yes | |
| warehouse | warehouse.png | yes | |
| well | well.png | yes | |
| workshop | workshop.png | yes | |

### Reserve / alternate versions (not in use by game)

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| animal-farm-pasture-v1 | animal-farm-3x3-pasture-v1.png | reserve/animal-farm/ | 3x3 pasture v1 |
| animal-farm-pasture-v2 | animal-farm-3x3-pasture-v2.png | reserve/animal-farm/ | 3x3 pasture v2 |
| animal-farm-square | animal-farm-3x3-pasture-v3-square.png | reserve/animal-farm/ | square layout v3 |
| clinic-simplified | clinic-v2.png | reserve/clinic/ | second design |
| clinic-minimal | clinic-v3.png | reserve/clinic/ | simplified/minimal |
| clinic-minimal-sized | clinic-v3-same-size.png | reserve/clinic/ | sized match of v3 |
| clinic-compact | clinic-v4.png | reserve/clinic/ | fourth iteration |
| clinic-bigger | clinic-v5-slight-bigger.png | reserve/clinic/ | slightly larger v5 |
| clinic-bigger-v2 | clinic-v6-slight-bigger.png | reserve/clinic/ | **preferred alternate** (marked latest in viewer) |
| delete-old | delete-before-clean-shovel-20260621-210910.png | reserve/delete/ | pre-shovel design |
| dock-large-ship | dock-v2-bigger-ship.png | reserve/dock/ | bigger ship variant |
| dock-real-ship | dock-v3-large-real-ship.png | reserve/dock/ | realistic large ship |
| dock-3-mast | dock-v4-with-3-mast-ship.png | reserve/dock/ | **preferred alternate** (marked latest in viewer) |
| engineer-station-v2 | engineer-station-v2.png | reserve/engineer-station/ | second design |
| engineer-station-tools | engineer-station-v3-tools-same-size.png | reserve/engineer-station/ | **preferred alternate** (marked latest in viewer) |
| horse-farm-alt | horse-farm.png | reserve/horse-farm/ | reserve copy |
| housing-tier-01 | housing-tier-01-basic-hut-v5.png | reserve/housing-tier-01/ | basic hut — 5 variants (v1–v5) |
| housing-tier-02 | housing-tier-02-worker-house-v5.png | reserve/housing-tier-02/ | worker house — 5 variants (v1–v5) |
| housing-tier-03 | housing-tier-03-two-story-green-roof-v5.png | reserve/housing-tier-03/ | town house — 5 variants (v1–v5) |
| housing-tier-04 | housing-tier-04-merchant-red-roof-v5.png | reserve/housing-tier-04/ | merchant residence — 5 variants (v1–v5) |
| housing-tier-05 | housing-tier-05-one-tower-purple-roof-v5.png | reserve/housing-tier-05/ | upper class — 5 variants (v1–v5) |
| housing-tier-06 | housing-tier-06-two-tower-yellow-roof-v5.png | reserve/housing-tier-06/ | lavish mansion — 5 variants (v1–v5) |
| mine-camp | mine-camp-2x2-dirt-yard-v1.png | reserve/mine-camp/ | 2x2 dirt yard mine |
| police-station-old | police-station-v1.png | reserve/police-station/ | earlier design |
| road-curb | road-before-long-curb-20260621-210711.png | reserve/road/ | long-curb style |
| road-pre-cobble | road-before-cobble-20260621-213614.png | reserve/road/ | pre-cobble design |
| ship-3-mast | ship-3-mast.png | reserve/ship-3-mast/ | standalone ship sprite |
| shipyard-ramp | shipyard-v2-launch-ramp.png | reserve/shipyard/ | **preferred alternate** (marked latest in viewer) |
| warehouse-2x2-camp-yard | warehouse-2x2-camp-yard-v3-transparent.png | reserve/ (legacy) | **preferred alternate**; square 2x2 warehouse yard matching mine-camp orientation; generated 2026-06-23 |
| workshop-perspective | workshop-2x2-square-perspective-v1.png | reserve/workshop/ | 2x2 square perspective |
| workshop-stone-yard | workshop-2x2-stone-yard-v1.png | reserve/workshop/ | 2x2 stone yard |
| workshop-reference | workshop-2x2-reference-v1.png | reserve/workshop/ | reference layout |

---

## Population — `used/population/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| farmer | farmer.png | yes | full-body tier icon |
| worker | — | no | not present in used/; see reserve/worker/ |
| artisan | — | no | not present in used/; see reserve/artisan/ |
| scholar | — | no | not present in used/; see reserve/scholar/ |
| entrepreneur | — | no | not present in used/; see reserve/entrepreneur/ |
| magnate | — | no | not present in used/; see reserve/magnate/ |

### Reserve full-body tier icons

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| worker | worker-2.png | reserve/worker/ | full-body tier icon |
| artisan | artisan.png | reserve/artisan/ | full-body tier icon |
| scholar | scholar.png | reserve/scholar/ | full-body tier icon |
| entrepreneur | entrepreneur.png | reserve/entrepreneur/ | full-body tier icon |
| entrepreneur-older | entrepreneur-older.png | reserve/entrepreneur/ | **preferred alternate** (marked latest in viewer) |
| magnate | magnate.png | reserve/magnate/ | full-body tier icon |

## Population Busts — `used/population/busts/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| farmer-bust | farmer-bust.png | yes | portrait used in palette/resident labels |
| worker-bust | worker-bust.png | yes | |
| artisan-bust | artisan-bust.png | yes | |
| scholar-bust | scholar-bust.png | yes | |
| entrepreneur-bust | entrepreneur-bust.png | yes | |
| magnate-bust | magnate-bust.png | yes | |

### Reserve bust alternates

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| entrepreneur-bust-older | entrepreneur-bust-older.png | reserve/entrepreneur-bust/ | **preferred alternate** (marked latest in viewer) |

---

## Coat of Arms — `used/coat-of-arms/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| anrelia-coa | anrelia.png | yes | city coat of arms |
| columbia-coa | columbia.png | yes | city coat of arms |
| jinlin-coa | jinlin.png | yes | city coat of arms |
| mintaka-coa | mintaka.png | yes | city coat of arms |
| solara-coa | solara.png | yes | city coat of arms |

---

## Map Tiles — `used/map-tiles/` (active 48px)

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| grass-tile | grass.png | yes | 48px active set; updated 2026-06-23 |
| sand-tile | sand.png | yes | 48px active set; updated 2026-06-23 |
| sea-tile | sea.png | yes | 48px active set; updated 2026-06-23 |
| dirt-tile | dirt.png | yes | 48px active set |
| cobblestone-road-tile | cobblestone-road.png | yes | 48px active set; core name disambiguated from road building icon |

### Map Tile alternates

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| cobblestone-road-light | cobblestone-road-light-48-v3.png | used/map-tiles/ | lighter variant v3; not primary |
| grass-tile-legacy | grass.png | reserve/grass/ | legacy 64px set |
| sand-tile-legacy | sand.png | reserve/sand/ | legacy 64px set |
| sea-tile-legacy | sea.png | reserve/sea/ | legacy 64px set |
| cobblestone-road-tile-legacy | cobblestone-road.png | reserve/cobblestone-road/ | legacy 64px set |

---

## Terrain Objects — `used/terrain/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| bush | bush.png | yes | removable map feature |
| rock | rock.png | yes | removable map feature |
| tree | tree.png | yes | removable map feature |

### Reserve / alternate versions

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| boulder | boulder.png | reserve/boulder/ | boulder terrain object |
| bushes-alt | bushes.png | reserve/bushes/ | bushes alternate |
| rock-bigger | rock-before-bigger-20260621-205036.png | reserve/rock/ | earlier larger design |
| three-trees | three-trees.png | reserve/three-trees/ | clustered trees alternate |
| three-trees-large | three-trees-large-v2.png | reserve/three-trees-large/ | large clustered trees |
| three-trees-tree-like | three-trees-tree-like-v3.png | reserve/three-trees-tree-like/ | tree-like cluster |

---

## Naming conflicts resolved

The following pairs would have collided on the same core name and were disambiguated:

| Conflict | File A (keeps core name) | File B (gets specific name) | Reason |
|----------|--------------------------|-----------------------------|--------|
| `road` | `used/buildings/road.png` (building icon) | `used/map-tiles/cobblestone-road.png` → `cobblestone-road-tile` | building vs. terrain tile |
| `sand` | `used/resources/sand.png` (resource) | `used/map-tiles/sand.png` → `sand-tile` | resource vs. terrain tile |
| `grass` (n/a — no resource) | `used/map-tiles/grass.png` → `grass-tile` | — | tile suffix added for consistency with sand-tile |
| `sea` (n/a) | `used/map-tiles/sea.png` → `sea-tile` | — | same |
| `marble` | `used/resources/marble.png` (raw resource) | `used/resources/marble-statue.png` → `marble-statue` | raw vs. processed luxury good |
| `entrepreneur` | `reserve/entrepreneur/entrepreneur.png` (active design) | `entrepreneur-older.png` → `entrepreneur-older` | active vs. alternate |
| `entrepreneur-bust` | `used/population/busts/entrepreneur-bust.png` (active) | `entrepreneur-bust-older.png` → `entrepreneur-bust-older` | active vs. alternate |
