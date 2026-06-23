# Image Registry

Every image file currently loaded by the game, one row per file.
**Core name** = the simplest possible identifier for what the image depicts.
When two files would share a core name, the active one keeps it and the other gets a more specific name.

Columns: `core name` | `actual filename` | `folder` | `in use?` | `note`

---

## Resource Icons — `resource-icons-cute-64/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| apple | apple.png | yes | |
| banana | banana.png | yes | |
| berry | berry.png | yes | |
| brandy | brandy.png | yes | |
| bread | bread.png | yes | |
| brick | brick.png | yes | |
| cabbage | lettuce.png | yes | core name is cabbage (Resource.CABBAGE), file is lettuce.png |
| candle | candle.png | yes | |
| cheese | cheese.png | yes | |
| chicken | chicken.png | yes | |
| cider | cider.png | yes | |
| cigar | cigar.png | yes | |
| clay | clay.png | yes | |
| coal | coal.png | yes | |
| cocoa | cocoa.png | yes | |
| coin | coin.png | yes | represents GOLD resource |
| concrete | concrete.png | yes | |
| corn | corn.png | yes | |
| cotton | cotton.png | yes | |
| cow | cow.png | yes | used as dairy-farm product icon |
| egg | egg.png | yes | |
| fish | fish.png | yes | |
| flour | flour.png | yes | |
| fur | fur.png | yes | |
| furniture | furniture.png | yes | |
| gem | gem.png | yes | |
| glass | glass.png | yes | |
| gold-ore | gold-ore.png | yes | |
| grape | grape.png | yes | |
| iron-ingot | iron-ingot.png | yes | represents processed IRON resource |
| iron-ore | iron-ore.png | yes | |
| jam | jam.png | yes | |
| jewelry | jewelry.png | yes | |
| marble-statue | marble-statue.png | yes | represents STATUE resource |
| melon | melon.png | yes | |
| milk | milk.png | yes | |
| oil | oil.png | yes | |
| olive | olive.png | yes | |
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
| wheat | wheat.png | yes | |
| window | window.png | yes | |
| wine | wine.png | yes | |
| wood | wood.png | yes | |
| wool | wool.png | yes | |

### Reserve / source variants (not in use by game)

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| clam | clam.png | reserve/ + sources/ | unused resource candidate |
| egg-basket | egg-basket-v2.png | sources/ | alternate egg depiction |
| fish-caught | fish-caught-v2.png | sources/ | alternate fish depiction |
| hand-push-cart | hand-push-cart.png | reserve/ + sources/ | unused UI candidate |
| oil-bottle | oil-v1.png | reserve/ | **preferred alternate** (marked latest in viewer) |
| oil-flask | oil-v2.png | reserve/ | second alternate |
| olive-oil-jug | olive-oil-jug-v2.png | sources/ | source variant v2 |
| olive-oil-jug-dark | olive-oil-jug-v3.png | sources/ | source variant v3 |
| pant-blue | pant-blue-v2.png | sources/ | blue colorway alternate |
| pork-ham | pork-ham-v1.png | reserve/ | round ham steak with center bone; generated 2026-06-23 |
| pork-ham-small-bone | pork-ham-v2.png | reserve/ | bigger meat with smaller center bone; generated 2026-06-23 |
| pork-ham-leg | pork-ham-v3.png | reserve/ | whole chunky ham leg with protruding bone; generated 2026-06-23 |
| pork-leg-cut-face | pork-ham-v4.png | reserve/ | **preferred alternate**; pig leg with cut face and center bone; generated 2026-06-23 |
| pottery-household | pottery-household-v2.png | sources/ | household-style alternate |
| wine-barrel | wine-barrel-v2.png | sources/ | barrel depiction v2 |
| wine-barrel-dark | wine-barrel-v3.png | sources/ | barrel depiction v3 |
| wine-classic | wine-v1.png | reserve/ | earlier bottle design |

---

## Building Icons — `icons/buildings/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| chapel | chapel.png | yes | |
| clinic | clinic.png | yes | |
| courthouse | courthouse.png | yes | |
| delete | delete.png | yes | shovel / delete tool |
| dock | dock.png | yes | swapped to v4-with-3-mast-ship 2026-06-22 |
| engineer-station | engineer-station.png | yes | |
| fire-station | fire-station.png | yes | |
| house | house.png | yes | |
| marketplace | marketplace.png | yes | |
| police-station | police-station.png | yes | |
| road | road.png | yes | |
| school | school.png | yes | |
| shipyard | shipyard.png | yes | swapped to v2-launch-ramp 2026-06-22 |
| tavern | tavern.png | yes | |
| warehouse | warehouse.png | yes | |
| well | well.png | yes | |

### Reserve / alternate versions (not in use by game)

| Core name | Filename | Location | Note |
|-----------|----------|----------|------|
| clinic-simplified | clinic-v2.png | reserve/ | second design |
| clinic-minimal | clinic-v3.png | reserve/ | simplified/minimal |
| clinic-minimal-sized | clinic-v3-same-size.png | reserve/ | sized match of v3 |
| clinic-compact | clinic-v4.png | reserve/ | fourth iteration |
| clinic-bigger | clinic-v5-slight-bigger.png | reserve/ | slightly larger v5 |
| clinic-bigger-v2 | clinic-v6-slight-bigger.png | reserve/ | **preferred alternate** (marked latest in viewer) |
| delete-old | delete-before-clean-shovel-20260621-210910.png | old_versions/ | pre-shovel design |
| dock-large-ship | dock-v2-bigger-ship.png | reserve/ | bigger ship variant |
| dock-real-ship | dock-v3-large-real-ship.png | reserve/ | realistic large ship |
| dock-3-mast | dock-v4-with-3-mast-ship.png | reserve/ | **preferred alternate** (marked latest in viewer) |
| engineer-station-v2 | engineer-station-v2.png | reserve/ | second design |
| engineer-station-tools | engineer-station-v3-tools-same-size.png | reserve/ | **preferred alternate** (marked latest in viewer) |
| police-station-old | police-station-v1.png | reserve/ | earlier design |
| road-curb | road-before-long-curb-20260621-210711.png | old_versions/ | long-curb style |
| road-pre-cobble | road-before-cobble-20260621-213614.png | old_versions/ | pre-cobble design |
| ship-3-mast | ship-3-mast.png | reserve/ | standalone ship sprite |
| shipyard-ramp | shipyard-v2-launch-ramp.png | reserve/ | **preferred alternate** (marked latest in viewer) |
| warehouse-2x2-camp-yard | warehouse-2x2-camp-yard-v3-transparent.png | reserve/ | **preferred alternate**; square 2x2 warehouse yard matching mine-camp orientation; generated 2026-06-23 |

---

## Population — `population/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| farmer | farmer.png | yes | full-body tier icon |
| worker | worker.png | yes | full-body tier icon |
| artisan | artisan.png | yes | full-body tier icon |
| scholar | scholar.png | yes | full-body tier icon |
| entrepreneur | entrepreneur.png | yes | full-body tier icon |
| magnate | magnate.png | yes | full-body tier icon |
| entrepreneur-older | entrepreneur-older.png | no | **preferred alternate** (marked latest in viewer) |

## Population Busts — `population/busts/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| farmer-bust | farmer-bust.png | yes | portrait used in palette/resident labels |
| worker-bust | worker-bust.png | yes | |
| artisan-bust | artisan-bust.png | yes | |
| scholar-bust | scholar-bust.png | yes | |
| entrepreneur-bust | entrepreneur-bust.png | yes | |
| magnate-bust | magnate-bust.png | yes | |
| entrepreneur-bust-older | entrepreneur-bust-older.png | no | **preferred alternate** (marked latest in viewer) |

---

## Map Tiles — `map-tiles-cute-48/` (active)

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| grass-tile | grass.png | yes | 48px active set |
| sand-tile | sand.png | yes | 48px active set |
| sea-tile | sea.png | yes | 48px active set |
| cobblestone-road-tile | cobblestone-road.png | yes | 48px active set — core name disambiguated from road building icon |

### Map Tiles — `map-tiles-cute-64/` (legacy 64px set)

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| grass-tile-64 | grass.png | no | legacy 64px; same image, different size |
| sand-tile-64 | sand.png | no | legacy 64px |
| sea-tile-64 | sea.png | no | legacy 64px |
| cobblestone-road-tile-64 | cobblestone-road.png | no | legacy 64px |

---

## Terrain Objects — `terrain-objects-cute-48/`

| Core name | Filename | In use | Note |
|-----------|----------|--------|------|
| tree | tree.png | yes | removable map feature |
| rock | rock.png | yes | removable map feature |
| rock-bigger | rock-before-bigger-20260621-205036.png | no | old_versions/ — earlier larger design |

---

## Naming conflicts resolved

The following pairs would have collided on the same core name and were disambiguated:

| Conflict | File A (keeps core name) | File B (gets specific name) | Reason |
|----------|--------------------------|-----------------------------|--------|
| `road` | `icons/buildings/road.png` (building icon) | `map-tiles-cute-48/cobblestone-road.png` → `cobblestone-road-tile` | building vs. terrain tile |
| `sand` | `resource-icons-cute-64/sand.png` (resource) | `map-tiles-cute-48/sand.png` → `sand-tile` | resource vs. terrain tile |
| `grass` (n/a — no resource) | `map-tiles-cute-48/grass.png` → `grass-tile` | — | tile suffix added for consistency with sand-tile |
| `sea` (n/a) | `map-tiles-cute-48/sea.png` → `sea-tile` | — | same |
| `entrepreneur` | `population/entrepreneur.png` (active) | `entrepreneur-older.png` → `entrepreneur-older` | active vs. alternate |
| `entrepreneur-bust` | `busts/entrepreneur-bust.png` (active) | `entrepreneur-bust-older.png` → `entrepreneur-bust-older` | active vs. alternate |
