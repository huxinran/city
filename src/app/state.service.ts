import { Injectable, NgZone, inject, signal } from '@angular/core';
import { State } from './state';
import { Item, Storage } from './storage';
import { FindNeighbours, TakeItems, ProvideService, Transfer, shuffle, AddItems, CountItem, TakeItemsAsPossible, StorageItems} from './utils';
import { GetCurrentMaxOccupant, Ship, ShippingTask, CreateBuilding, GetBuildingSize, GetRequiredTerrains } from './building'
import { City, Map,  } from './city';
import { Population,  } from './population';
import { Resident, ProductionStatus, ShippingTaskType, BuildingType, Terrain, CityName } from './types'
import { Tile } from './tile';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public state: State
  // True while a building icon is being dragged from the palette or the map.
  public dragging = false
  // First clicked tile when drawing a road from a start point to an end point.
  public road_start?: { i: number, j: number }
  // The anchor tile of a placed building being dragged to a new location.
  public move_source?: Tile

  // Render heartbeat: bumped every simulation tick so views showing live data
  // (carts, production progress, storage) re-check on an OnPush schedule.
  public frame = signal(0)
  // Grid/selection version: bumped only on user map edits so the 3,600 tile
  // components repaint on placement/move/delete/selection — not every tick.
  public mapVersion = signal(0)

  private zone = inject(NgZone)

  constructor() {
    this.state = new State()
    this.Load()
    // Run the loop outside Angular so tick math doesn't trigger change
    // detection; the signal bumps below drive rendering instead.
    this.zone.runOutsideAngular(() => {
      setInterval(() => this.Tick(), 200)
    })
  }

  // Bump the grid version (call after any user edit to the map/selection).
  public bumpMap() {
    this.zone.run(() => this.mapVersion.update(v => v + 1))
  }

  public Save() {
    localStorage.setItem("state", JSON.stringify(this.state))
    this.SaveMap()
  }


  public Load() {
    let saved_state = localStorage.getItem("state")
    if (saved_state) {
      this.state = JSON.parse(saved_state)
      // JSON round-trips current_city into a separate object from the one in
      // cities[]; re-link it so mutations and ChangeCity stay consistent.
      let name = this.state.current_city?.name
      this.state.current_city = this.state.cities.find(c => c.name === name) ?? this.state.cities[0]
    }
    this.LoadMap()
    this.bumpMap()
  }

  public SaveMap() {
    for (let city of this.state.cities) {
      localStorage.setItem("map" + city.name, JSON.stringify(new Map(city.h, city.w, city.tiles))) 
    }
  }
  public LoadMap() {
    for (let city of this.state.cities) {
      let saved_map = localStorage.getItem("map" + city.name)
      if (saved_map && city.name == "Anrelia") {
        let saved_map_obj = JSON.parse(saved_map)
        // Only restore if the saved map matches the current grid dimensions.
        if (saved_map_obj.tiles && saved_map_obj.tiles.length == city.tiles.length) {
          city.h = saved_map_obj.h
          city.w = saved_map_obj.w
          for (let i = 0; i < city.tiles.length; ++i) {
            city.tiles[i].terrain = saved_map_obj.tiles[i].terrain
          }
        }
      }
    }
  }
  public Restart() {
    this.state = new State()
    this.LoadMap()
    this.bumpMap()
  }

  public Reset() {
    this.state = new State()
    this.bumpMap()
  }
  
  public ChangeCity(name: string) {
    for (let city of this.state.cities) {
      if (city.name == name) {
        this.state.current_city = city
        this.bumpMap()
        return
      }
    }
  }

  public Tick() {
    this.state.time += 1
    this.SortTiles(this.state.current_city!)
    this.UpdatePopulation(this.state.current_city!)
    this.UpdateProduction(this.state.current_city!)
    this.UpdateWarehouses(this.state.current_city!)
    this.UpdateHouses(this.state.current_city!)
    this.UpdateShipyard(this.state.current_city!)
    this.UpdateEmployment(this.state.current_city!)
    this.HandleShipTasks(this.state.current_city!)
    this.UpdateService(this.state.current_city!)
    this.UpdateGold(this.state.current_city!)
    // Drive OnPush rendering of live data. Bump inside the zone so change
    // detection runs (the tick itself ran outside Angular).
    this.zone.run(() => this.frame.update(f => f + 1))
  }

  public ClearSelection() {
    this.ClearBuildType()
    this.ClearTerrainType()
  }
  
  public SetBuildType(type: BuildingType) {
    this.state.build_type = type
    this.road_start = undefined
    this.move_source = undefined
    this.bumpMap()
  }
  public ClearBuildType() {
    this.state.build_type = undefined
    this.road_start = undefined
    this.bumpMap()
  }

  public SetTerrainType(type: Terrain) {
    this.state.terrain_type = type
    this.bumpMap()
  }
  public ClearTerrainType() {
    this.state.terrain_type = undefined
    this.bumpMap()
  }

  public GetTile(city: City, i: number, j: number): Tile {
    return city.tiles[i * city.w + j]
  }

  // Apply the currently selected build_type at a tile (used by click and drop).
  public ApplyBuild(tile: Tile) {
    let type = this.state.build_type
    if (!type) {
      return
    }
    this.bumpMap()
    let city = this.state.current_city!
    if (type == BuildingType.ROAD) {
      this.RoadPoint(tile)
      return
    }
    if (type == BuildingType.DELETE) {
      this.DeleteBuilding(tile)
    } else {
      this.TryPlaceBuilding(tile, type)
    }
    city.focus_tile = tile
  }

  // Roads are drawn between two points: the first click sets the start, the
  // second lays an L-shaped path of road tiles to the end point.
  public RoadPoint(tile: Tile) {
    let city = this.state.current_city!
    city.focus_tile = tile
    if (!this.road_start) {
      this.road_start = { i: tile.i, j: tile.j }
      return
    }
    this.PlaceRoadPath(this.road_start, tile)
    this.road_start = undefined
  }

  private PlaceRoadPath(a: { i: number, j: number }, b: { i: number, j: number }) {
    let city = this.state.current_city!
    let stepJ = a.j <= b.j ? 1 : -1
    for (let j = a.j; j != b.j + stepJ; j += stepJ) {
      this.TryPlaceBuilding(this.GetTile(city, a.i, j), BuildingType.ROAD)
    }
    let stepI = a.i <= b.i ? 1 : -1
    for (let i = a.i; i != b.i + stepI; i += stepI) {
      this.TryPlaceBuilding(this.GetTile(city, i, b.j), BuildingType.ROAD)
    }
  }

  // Try to place a multi-tile building anchored at `tile`. Fails (returns false,
  // no resources spent) if it goes out of bounds, overlaps another building, or
  // any covered tile has the wrong terrain.
  public TryPlaceBuilding(tile: Tile, type: BuildingType): boolean {
    let city = this.state.current_city!
    let size = GetBuildingSize(type)
    if (tile.i + size > city.h || tile.j + size > city.w) {
      return false
    }
    let required = GetRequiredTerrains(type)
    let footprint: Tile[] = []
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        let t = this.GetTile(city, tile.i + di, tile.j + dj)
        if (t.building || t.covered) {
          return false
        }
        if (!required.includes(t.terrain)) {
          return false
        }
        footprint.push(t)
      }
    }
    let building = CreateBuilding(type, city.storage)
    if (!building) {
      return false
    }
    tile.building = building
    for (let t of footprint) {
      if (t === tile) {
        continue
      }
      t.covered = true
      t.anchor_i = tile.i
      t.anchor_j = tile.j
    }
    return true
  }

  // Remove the building covering `tile` (whether `tile` is the anchor or a
  // covered tile), clearing its whole footprint.
  public DeleteBuilding(tile: Tile) {
    let city = this.state.current_city!
    let anchor = tile.covered ? this.GetTile(city, tile.anchor_i, tile.anchor_j) : tile
    if (!anchor.building) {
      tile.covered = false
      // Nothing built here: clear a removable tree/rock back to open grass.
      if (tile.terrain == Terrain.TREE || tile.terrain == Terrain.ROCK) {
        tile.terrain = Terrain.GRASS
      }
      return
    }
    let size = GetBuildingSize(anchor.building.type)
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        let t = this.GetTile(city, anchor.i + di, anchor.j + dj)
        t.building = undefined
        t.covered = false
        t.anchor_i = -1
        t.anchor_j = -1
      }
    }
  }


  // Move an already-placed building from its current position to a new anchor.
  // Does not charge materials. Returns false (no-op) if the destination is invalid.
  public MoveBuildingTo(from: Tile, to: Tile): boolean {
    let city = this.state.current_city!
    let building = from.building!
    let type = building.type
    let size = GetBuildingSize(type)

    if (to.i + size > city.h || to.j + size > city.w) return false

    // Keys occupied by the source footprint — these are allowed in the destination.
    let srcKeys = new Set<number>()
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        srcKeys.add((from.i + di) * city.w + (from.j + dj))
      }
    }

    let required = GetRequiredTerrains(type)
    let destFootprint: Tile[] = []
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        let t = this.GetTile(city, to.i + di, to.j + dj)
        if (!srcKeys.has((to.i + di) * city.w + (to.j + dj))) {
          if (t.building || t.covered) return false
          if (!required.includes(t.terrain)) return false
        }
        destFootprint.push(t)
      }
    }

    // Clear source footprint.
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        let t = this.GetTile(city, from.i + di, from.j + dj)
        t.building = undefined
        t.covered = false
        t.anchor_i = -1
        t.anchor_j = -1
      }
    }

    // Place at destination.
    to.building = building
    for (let t of destFootprint) {
      if (t === to) continue
      t.covered = true
      t.anchor_i = to.i
      t.anchor_j = to.j
    }

    city.focus_tile = to
    this.bumpMap()
    return true
  }

  public SortTiles(city: City) {
    let houses = []
    let productions = []
    let services = []
    let warehouses = []
    let shipyards = []
    let docks = []
    for (let t of city.tiles) {
      if (t.building == undefined) {
        continue
      }

      if (t.building.house) {
        houses.push(t)
      } else if (t.building.production) {
        productions.push(t)
      } else if (t.building.service) {
        services.push(t)
      } else if (t.building.warehouse) {
        warehouses.push(t)
      } else if (t.building.shipyard) {
        shipyards.push(t)
      } else if (t.building.dock) {
        docks.push(t)
      }
    }

    city.houses = shuffle(houses)
    city.productions = shuffle(productions)
    city.services = shuffle(services)
    city.warehouses = shuffle(warehouses)
    city.shipyards = shuffle(shipyards)
    city.docks = shuffle(docks)
    
  }

  public UpdateService(city: City) {
    for (let t of city.services) {
      let service = t.building!.service!
      let neighbours = FindNeighbours(city, t, t.building!.service!.radius)
      for (let n of neighbours) {
        ProvideService(n, service.need_provided)
      }
    }

  }

  public UpdateProduction(city: City) {
    for (let t of city.productions) {
      let production = t.building!.production!
      if (production.status == ProductionStatus.READY) {
        if (production.ingredient.length == 0) {
          production.status = ProductionStatus.IN_PROGRESS
        } else {
          let shipping_task = new ShippingTask(ShippingTaskType.DELIVERYING, t, production.ingredient)
          city.shipping_tasks.push(shipping_task)
          production.status = ProductionStatus.WAITING_DELIVERY
        }
      } else if (production.status == ProductionStatus.IN_PROGRESS) {
        production.progress = Math.min(production.progress + production.full_efficiency * production.worker / production.worker_needed, 100.0)
        if (production.progress == 100.0) {
          production.status = ProductionStatus.FINISHED
        }
      } else if (production.status == ProductionStatus.FINISHED) {
        let shipping_task = new ShippingTask(ShippingTaskType.PICKING_UP, t, production.product)
        city.shipping_tasks.push(shipping_task)
        production.status = ProductionStatus.WAITING_PICK_UP
      }
    }
  }

  public UpdateHouses(city: City) {
    for (let t of city.houses) {
      let house = t.building!.house!
      for (let n of house.resource_needs!) {
        let cnt = CountItem(house.storage, n.type)
        if (cnt! <= 1.0) {
          n.satisfied = Transfer(city.storage, house.storage, [new Item(n.type, 1)])
        }   
        n.satisfied = TakeItems(house.storage, [new Item(n.type, 0.002)])  
      }
    }
  }
  
  public UpdateWarehouses(city: City) {
    let idle_carts = []
    for (let t of city.warehouses) {
      for (let c of t.building!.warehouse!.carts) {
        if (c.task == undefined) {
          idle_carts.push(t)
          continue
        }
        c.task.progress = Math.min(c.task.progress + c.speed, c.task.distance)
        if (c.task.progress == c.task.distance) {
          if (c.task.type == ShippingTaskType.DELIVERYING) {
            c.task.type = ShippingTaskType.RETURNING
            c.task.progress = 0
            c.task.cargo = []
            c.task.dst.building!.production!.status = ProductionStatus.IN_PROGRESS
          } else if (c.task.type == ShippingTaskType.PICKING_UP) {
            c.task.type = ShippingTaskType.RETURNING
            c.task.progress = 0
            c.task.dst.building!.production!.status = ProductionStatus.READY
            c.task.dst.building!.production!.progress = 0
          } else {
            AddItems(city.storage, c.task.cargo)
            c.task = undefined
          }
        }
      }
    }
    city.carts = idle_carts     
  }

  public UpdateShipyard(city: City) {
    for (let t of city.shipyards) {
      let shipyard = t.building!.shipyard!
      let blueprint = shipyard.selected
      if (shipyard.status == ProductionStatus.IN_PROGRESS) {
        shipyard.progress = Math.min(1.0, shipyard.progress += 1.0 / blueprint!.build_time)
      }

      if (shipyard.progress == 1.0) {
        shipyard.progress = 0
        shipyard.status = ProductionStatus.READY
        let ship = new Ship(blueprint!.type, blueprint!.max_cargo, blueprint!.speed)
        city.ships.push(ship)
      }
    }
  }

  // Road tiles orthogonally adjacent to the footprint of a size x size building
  // anchored at (i, j).
  private AdjacentRoadTiles(city: City, i: number, j: number, size: number): Tile[] {
    let roads: Tile[] = []
    let seen = new Set<number>()
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        for (let d of dirs) {
          let ni = i + di + d[0]
          let nj = j + dj + d[1]
          if (ni < 0 || nj < 0 || ni >= city.h || nj >= city.w) {
            continue
          }
          let key = ni * city.w + nj
          if (seen.has(key)) {
            continue
          }
          let t = this.GetTile(city, ni, nj)
          if (t.building?.type == BuildingType.ROAD) {
            seen.add(key)
            roads.push(t)
          }
        }
      }
    }
    return roads
  }

  // BFS over the road network from the roads touching `building`, returning the
  // road-step distance to every reachable road tile (keyed by tile index).
  private RoadDistanceField(city: City, building: Tile): { [key: number]: number } {
    let size = GetBuildingSize(building.building!.type)
    let dist: { [key: number]: number } = {}
    let queue: Tile[] = []
    for (let r of this.AdjacentRoadTiles(city, building.i, building.j, size)) {
      let key = r.i * city.w + r.j
      if (dist[key] == undefined) {
        dist[key] = 1
        queue.push(r)
      }
    }
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    let head = 0
    while (head < queue.length) {
      let t = queue[head++]
      let d = dist[t.i * city.w + t.j]
      for (let dir of dirs) {
        let ni = t.i + dir[0]
        let nj = t.j + dir[1]
        if (ni < 0 || nj < 0 || ni >= city.h || nj >= city.w) {
          continue
        }
        let key = ni * city.w + nj
        if (dist[key] != undefined) {
          continue
        }
        let n = this.GetTile(city, ni, nj)
        if (n.building?.type == BuildingType.ROAD) {
          dist[key] = d + 1
          queue.push(n)
        }
      }
    }
    return dist
  }

  private BuildingCenter(building: Tile): { i: number, j: number } {
    let size = GetBuildingSize(building.building!.type)
    return { i: building.i + (size - 1) / 2, j: building.j + (size - 1) / 2 }
  }

  // Reconstruct the shortest road path warehouse -> destination by descending
  // the distance field one road step at a time. Returns tile centers to follow.
  private BuildRoadPath(city: City, field: { [key: number]: number }, warehouse: Tile, dst: Tile): { i: number, j: number }[] {
    let size = GetBuildingSize(warehouse.building!.type)
    let entry: Tile | undefined = undefined
    let entryVal = Infinity
    for (let r of this.AdjacentRoadTiles(city, warehouse.i, warehouse.j, size)) {
      let v = field[r.i * city.w + r.j]
      if (v != undefined && v < entryVal) {
        entryVal = v
        entry = r
      }
    }
    if (!entry) {
      return []
    }
    let roads: Tile[] = [entry]
    let current = entry
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    while (field[current.i * city.w + current.j] > 1) {
      let cv = field[current.i * city.w + current.j]
      let next: Tile | undefined = undefined
      for (let dir of dirs) {
        let ni = current.i + dir[0]
        let nj = current.j + dir[1]
        if (ni < 0 || nj < 0 || ni >= city.h || nj >= city.w) {
          continue
        }
        let n = this.GetTile(city, ni, nj)
        if (n.building?.type == BuildingType.ROAD && field[ni * city.w + nj] == cv - 1) {
          next = n
          break
        }
      }
      if (!next) {
        break
      }
      roads.push(next)
      current = next
    }
    let path = [this.BuildingCenter(warehouse)]
    for (let r of roads) {
      path.push({ i: r.i, j: r.j })
    }
    path.push(this.BuildingCenter(dst))
    return path
  }

  // Shortest road distance from a warehouse to the building described by `field`.
  private WarehouseRoadDistance(city: City, field: { [key: number]: number }, warehouse: Tile): number {
    if (!warehouse.building) {
      return Infinity
    }
    let size = GetBuildingSize(warehouse.building.type)
    let best = Infinity
    for (let r of this.AdjacentRoadTiles(city, warehouse.i, warehouse.j, size)) {
      let d = field[r.i * city.w + r.j]
      if (d != undefined) {
        best = Math.min(best, d + 1)
      }
    }
    return best
  }

  public HandleShipTasks(city: City) {
    let i = 0
    while (i < city.shipping_tasks.length) {
      if (city.carts.length == 0) {
        break
      }

      let task = city.shipping_tasks[i]
      // Drop tasks whose destination building has been removed.
      if (!task.dst.building) {
        city.shipping_tasks = [...city.shipping_tasks.slice(0, i), ...city.shipping_tasks.slice(i + 1)]
        continue
      }

      // Find the closest warehouse reachable by road.
      let field = this.RoadDistanceField(city, task.dst)
      let min_dist = Infinity
      let min_idx = undefined
      for (let j = 0; j < city.carts.length; ++j) {
        let dist = this.WarehouseRoadDistance(city, field, city.carts[j])
        if (dist < min_dist) {
          min_dist = dist
          min_idx = j
        }
      }
      // No road path to any warehouse yet: leave the task pending.
      if (min_idx == undefined || min_dist == Infinity) {
        ++i
        continue
      }

      if (task.type == ShippingTaskType.DELIVERYING) {
        if (!TakeItems(city.storage, task.cargo)) {
          ++i
          continue
        }
      }
      let cart = city.carts[min_idx]
      task.distance = min_dist
      task.progress = 0
      task.path = this.BuildRoadPath(city, field, cart, task.dst)
      for (let c of cart.building!.warehouse!.carts) {
        if (c.task == undefined) {
          c.task = task
          break
        }
      }
      city.shipping_tasks = [...city.shipping_tasks.slice(0, i), ...city.shipping_tasks.slice(i + 1)]
      city.carts = [...city.carts.slice(0, min_idx), ...city.carts.slice(min_idx + 1)]
    }
  }

  public UpdatePopulation(city: City) {
    for (let t of city.houses) {
      let house = t.building!.house! 
      let needs_satified = 0
      for (let e of house.service_needs) {
        if (e.satisfied) {
          needs_satified += 1
        }
      }
      for (let e of house.resource_needs) {
        if (e.satisfied) {
          needs_satified += 1
        }
      }
      let total_needs = house.service_needs.length + house.resource_needs.length
      house.happiness = total_needs == 0 ? 1.0 : needs_satified / total_needs

      house.current_max_occupant = GetCurrentMaxOccupant(house.tier, house.happiness)
      if (house.occupant < house.current_max_occupant) {
        house.occupant += 1
      }
    }
  }

  public UpdateEmploymentPerTier(has: number, needed: number, productions: Tile[]) {
    let base_ratio = Math.min(1.0, has / needed)
    let new_employed = 0 
    for (let t of productions) {
      let production = t.building!.production!
      let new_employee = Math.floor(production.worker_needed * base_ratio)
      production.worker = new_employee 
      new_employed += new_employee
    }
    if (base_ratio == 1.0) {
      return
    }
    let unemployed = has - new_employed
    while (unemployed > 0) {
      for (let t of productions) {
        let production = t.building!.production!
        production.worker += 1
        unemployed -= 1
        if (unemployed == 0) {
          break
        }
      }      
    }
  }

public ResetPopulation(population: Population) {
    for (let t of population.tiers) {
        t.has = 0
        t.needed = 0
        t.houses = []
        t.productions = []
    }
  }

 public AddProduction(population: Population, production: Tile) {
    let tier = production.building!.production!.worker_type
    let needed = production.building!.production!.worker_needed
    for (let t of population.tiers) {
        if (t.tier == tier) {
            t.needed += needed
            t.productions.push(production)
        }
    }
}

public AddHouse(population: Population, house: Tile) {
    let tier = house.building!.house!.resident_type
    let has = house.building!.house!.occupant
    for (let t of population.tiers) {
        if (t.tier == tier) {
            t.has += has
            t.houses.push(house)
        }
    }
}

public GetCity(cities: City[], city_name: CityName) {
  for (let c of cities) {
    if (c.name == city_name) {
      return c
    }
  }
  return undefined
}



public GetWorkerNeeded(population: Population, tier: Resident, num: number) {
    for (let t of population.tiers) {
        if (t.tier == tier) {
           return t.needed
        }
    }
    return 0
}

  public UpdateEmployment(city: City) {
    let population = new Population()
    for (let t of city.productions) {
      this.AddProduction(population, t)
    }

    for (let t of city.houses) {
      this.AddHouse(population, t)
    }

    for (let tier of population.tiers) {
      this.UpdateEmploymentPerTier(tier.has, tier.needed, tier.productions)
    }
    city.population = population
  }


  public UpdateGold(city: City) {
    for (let t of city.population.tiers) {
      this.state.gold += t.has * 0.001 
    } 
  }

  public UpdateRoute(city: City, other_cities: City[]) {
    for (let r of city.routes) {
      if (!r.ship) {
        continue
      }

      if (r.from != city.name) {
        continue
      }

      let ship = r.ship
      if (ship.status == ShippingTaskType.READY) {
        let cargo = TakeItemsAsPossible(city.storage, [new Item(r.resource, r.amount)])
        AddItems(ship.cargo, cargo)
      } else if (ship.status == ShippingTaskType.DELIVERYING) {
        r.progress = Math.min(1.0, r.progress + ship.speed / 100.0)
        if (r.progress == 1.0) {
          r.progress = 0.0
          ship.status = ShippingTaskType.RETURNING
          let dst_city = this.GetCity(other_cities, r.to)
          AddItems(dst_city!.storage, StorageItems(ship.cargo))
          ship.cargo = new Storage() 
        }
      } else if (ship.status == ShippingTaskType.RETURNING) {
        r.progress = Math.min(1.0, r.progress + ship.speed / 100.0)
        if (r.progress == 1.0) {
          r.progress = 0.0
          ship.status = ShippingTaskType.READY
        }
      }
    } 
  }
}


