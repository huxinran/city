import { Tile } from './src/app/tile'
import { Terrain, BuildingType, Resource, Resident } from './src/app/types'
import { CreateBuilding, GetBuildingSize, GetResidentType } from './src/app/building'
import { Storage, Item } from './src/app/storage'
import { AddItem } from './src/app/utils'
import { StateService } from './src/app/state.service'

const svc: any = Object.create(StateService.prototype)
const H = 40, W = 40
const tiles: Tile[] = []
for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) tiles.push(new Tile(i, j, Terrain.GRASS))
const city: any = {
  h: H, w: W, tiles, storage: new Storage(),
  houses: [], productions: [], services: [], warehouses: [], shipyards: [], docks: [],
  shipping_tasks: [], carts: [], ships: [], routes: [], population: undefined,
}
for (const r of Object.values(Resource)) AddItem(city.storage, new Item(r as Resource, 100000))
const at = (i: number, j: number) => tiles[i * W + j]
const place = (type: BuildingType, i: number, j: number) => {
  const size = GetBuildingSize(type)
  const anchor = at(i, j)
  anchor.building = CreateBuilding(type, city.storage)!
  for (let di = 0; di < size; di++) for (let dj = 0; dj < size; dj++) {
    if (di === 0 && dj === 0) continue
    const t = at(i + di, j + dj); t.covered = true; t.anchor_i = i; t.anchor_j = j
  }
  return anchor
}

// Houses full of FARMER residents (tier 1).
console.log('GetResidentType(1) =', GetResidentType(1))
const farmerHouses = 6
for (let k = 0; k < farmerHouses; k++) {
  const h = place(BuildingType.HOUSE, 0, k * 2)
  h.building.house.occupant = 10           // 60 farmers total
}

const producers = [
  place(BuildingType.FISHERY, 5, 0),
  place(BuildingType.LUMBER_HUT, 5, 4),
  place(BuildingType.SHEEP_FARM, 5, 8),
  place(BuildingType.APPLE_ORCHARD, 5, 12),
  place(BuildingType.DIARY_FARM, 5, 16),
]
for (const p of producers) city.productions.push(p)
for (const h of city.houses) {} // houses already pushed by place? no:
// place() doesn't push to lists; do it here
city.houses = tiles.filter(t => t.building?.house)
city.productions = producers

svc.UpdateEmployment(city)

const farmerTier = city.population.tiers.find((t: any) => t.tier === Resident.FARMER)
console.log(`FARMER tier: has=${farmerTier.has} needed=${farmerTier.needed}`)
for (const p of producers) {
  console.log(`  ${String(p.building.type).padEnd(14)} size=${GetBuildingSize(p.building.type)} worker=${p.building.production.worker}/${p.building.production.worker_needed} type=${p.building.production.worker_type}`)
}
