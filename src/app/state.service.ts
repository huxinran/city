import { Injectable, NgZone, inject, signal } from '@angular/core';
import { State } from './sim/state';
import { Item, Storage } from './sim/storage';
import { FindNeighbours, TakeItems, ProvideService, Transfer, shuffle, AddItems, CountItem, TakeItemsAsPossible, StorageItems} from './sim/utils';
import { GetCurrentMaxOccupant, GetTaxPerResident, Ship, ShippingTask, ExtraSource, CreateBuilding, GetBuildingSize, GetBuildingGoldCost, GetRequiredTerrains, FeatureMatches, GetRequiredNearbyFeature, GetRequiredNearbyTerrain, Technology, ALL_RESEARCH, FARM_BUILDINGS, MINE_CAMP_BUILDINGS, ComputeBaseHappiness } from './sim/building'
import { City } from './sim/city';
import { Population,  } from './sim/population';
import { Resident, ProductionStatus, ShippingTaskType, BuildingType, Terrain, Feature, CityName } from './sim/types'
import { Tile } from './sim/tile';
import { SaveState, LoadState, SaveMaps, LoadMaps } from './sim/persistence';
import { RoadDistanceField, BuildRoadPath, WarehouseRoadDistance } from './sim/pathfinding';
import { Camera } from './camera';

// Taxes only weigh on happiness once they climb above this rate; at or below it
// residents don't mind paying, so happiness can still reach 100%.
const TAX_HAPPY_THRESHOLD = 0.5
// How much tax ABOVE the threshold subtracts from happiness, scaled across the
// remaining range (threshold..1.0).
const TAX_UNHAPPINESS = 0.8

// How far (in tiles) a resource building may sit from the rock/tree it works.
const FEATURE_RADIUS = 3

// Global production speed scalar. Lower = every production building fills its
// progress bar more slowly (1.0 = original speed).
const PRODUCTION_SPEED = 0.5

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
  // Grid/selection version: bumped only on user map edits so the map canvas
  // repaints on placement/move/delete/selection — not every tick.
  public mapVersion = signal(0)

  // Shared map camera (pan/zoom). Mutated in place by the pan handler and the
  // map canvas's wheel-zoom; `cameraVersion` is bumped so the map canvas and
  // the DOM overlay layer repaint. The cart canvas reads it every frame.
  public camera: Camera = { x: 0, y: 0, zoom: 1 }
  public cameraVersion = signal(0)
  public bumpCamera() {
    this.zone.run(() => this.cameraVersion.update(v => v + 1))
  }

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
    SaveState(this.state)
  }

  public Load() {
    let loaded = LoadState()
    if (loaded) {
      this.state = loaded
    }
    this.LoadMap()
    // Seed building lists from the grid: a save restores buildings onto tiles,
    // but its serialized lists hold stale (post-JSON) tile references. From here
    // the lists are maintained incrementally on place/delete/move.
    for (let city of this.state.cities) {
      this.RebuildBuildingLists(city)
    }
    this.bumpMap()
  }

  public SaveMap() {
    SaveMaps(this.state.cities)
  }

  public LoadMap() {
    LoadMaps(this.state.cities)
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
    this.ShuffleBuildingLists(this.state.current_city!)
    this.UpdatePopulation(this.state.current_city!)
    this.UpdateProduction(this.state.current_city!)
    this.UpdateWarehouses(this.state.current_city!)
    this.UpdateHouses(this.state.current_city!)
    this.UpdateShipyard(this.state.current_city!)
    this.UpdateUniversity(this.state.current_city!)
    this.UpdateEmployment(this.state.current_city!)
    this.HandleShipTasks(this.state.current_city!)
    this.UpdateService(this.state.current_city!)
    this.UpdateRoutes()
    this.UpdateGold(this.state.current_city!)
    // Drive OnPush rendering of live data. Bump inside the zone so change
    // detection runs (the tick itself ran outside Angular).
    this.zone.run(() => this.frame.update(f => f + 1))
  }

  public ClearSelection() {
    this.ClearBuildType()
    this.ClearTerrainType()
    this.ClearFeatureType()
  }

  // Handle a click on a map tile, applying whichever paint mode is active
  // (build / feature / terrain) or selecting the tile. Relocated here from the
  // per-tile component so the canvas map can drive it from a single hit test.
  public HandleTileClick(tile: Tile) {
    let city = this.state.current_city!
    let building_type = this.state.build_type
    let terrain_type = this.state.terrain_type
    let feature_type = this.state.feature_type

    if (building_type) {
      // Clicking an occupied tile while a non-delete build tool is active:
      // clear the selection and focus the existing building instead.
      if (building_type !== BuildingType.DELETE) {
        let anchor = tile.covered
          ? this.GetTile(city, tile.anchor_i, tile.anchor_j)
          : tile
        if (anchor.building) {
          this.ClearSelection()
          city.focus_tile = anchor
          return
        }
      }
      this.ApplyBuild(tile)
      return
    }
    if (feature_type) {
      // Features paint onto bare land only — not water, not occupied tiles.
      if (tile.terrain != Terrain.WATER && !tile.building && !tile.covered) {
        tile.feature = feature_type
        city.focus_tile = tile
        this.bumpMap()
      }
      return
    }
    if (terrain_type) {
      tile.terrain = terrain_type
      // Water can't hold a tree/rock feature.
      if (terrain_type == Terrain.WATER) {
        tile.feature = undefined
      }
      city.focus_tile = tile
      this.bumpMap()
      return
    }
    // Plain selection: focus the building's anchor if a covered tile was clicked.
    city.focus_tile = tile.covered
      ? this.GetTile(city, tile.anchor_i, tile.anchor_j)
      : tile
    this.bumpMap()
  }

  // The three paint modes (build / terrain / feature) are mutually exclusive:
  // selecting one clears the others so a click is never ambiguous.
  public SetBuildType(type: BuildingType) {
    this.state.build_type = type
    this.state.terrain_type = undefined
    this.state.feature_type = undefined
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
    this.state.build_type = undefined
    this.state.feature_type = undefined
    this.bumpMap()
  }
  public ClearTerrainType() {
    this.state.terrain_type = undefined
    this.bumpMap()
  }

  public SetFeatureType(feature: Feature) {
    this.state.feature_type = feature
    this.state.build_type = undefined
    this.state.terrain_type = undefined
    this.bumpMap()
  }
  public ClearFeatureType() {
    this.state.feature_type = undefined
    this.bumpMap()
  }

  public GetTile(city: City, i: number, j: number): Tile {
    return city.tiles[i * city.w + j]
  }

  // True if any tile within FEATURE_RADIUS of a size x size footprint anchored
  // at (i, j) satisfies `pred`. Used to place resource buildings on open land
  // next to (rather than on top of) the rock/tree/sand they harvest.
  public HasNearby(city: City, i: number, j: number, size: number, pred: (t: Tile) => boolean): boolean {
    let i0 = Math.max(0, i - FEATURE_RADIUS), i1 = Math.min(city.h - 1, i + size - 1 + FEATURE_RADIUS)
    let j0 = Math.max(0, j - FEATURE_RADIUS), j1 = Math.min(city.w - 1, j + size - 1 + FEATURE_RADIUS)
    for (let ii = i0; ii <= i1; ++ii) {
      for (let jj = j0; jj <= j1; ++jj) {
        if (pred(this.GetTile(city, ii, jj))) {
          return true
        }
      }
    }
    return false
  }

  // Whether a resource building's required rock/tree feature and/or sand terrain
  // is within reach of a size x size footprint anchored at (i, j).
  public HasRequiredSurroundings(city: City, type: BuildingType, i: number, j: number, size: number): boolean {
    let feature = GetRequiredNearbyFeature(type)
    if (feature && !this.HasNearby(city, i, j, size, t => t.feature == feature)) {
      return false
    }
    let terrain = GetRequiredNearbyTerrain(type)
    if (terrain && !this.HasNearby(city, i, j, size, t => t.terrain == terrain)) {
      return false
    }
    return true
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
        if (!FeatureMatches(type, t.feature)) {
          return false
        }
        footprint.push(t)
      }
    }
    if (!this.HasRequiredSurroundings(city, type, tile.i, tile.j, size)) {
      return false
    }
    // Check gold up front (no charge) so materials aren't spent if we can't
    // afford it; deduct only once the building is actually created.
    let goldCost = GetBuildingGoldCost(type)
    if (this.state.gold < goldCost) {
      return false
    }
    let building = CreateBuilding(type, city.storage)
    if (!building) {
      return false
    }
    this.state.gold -= goldCost
    // Stamp the city identity onto every house so it reads the right need tables.
    if (building.house) {
      building.house.city_type = city.name
    }
    tile.building = building
    // Houses no longer stamp the ground to dirt on build (disabled).
    // if (building.house) {
    //   tile.original_terrain = tile.terrain
    //   tile.terrain = Terrain.DIRT
    // }
    for (let t of footprint) {
      if (t === tile) {
        continue
      }
      t.covered = true
      t.anchor_i = tile.i
      t.anchor_j = tile.j
    }
    this.AddBuildingToLists(city, tile)
    return true
  }

  // Remove the building covering `tile` (whether `tile` is the anchor or a
  // covered tile), clearing its whole footprint.
  public DeleteBuilding(tile: Tile) {
    let city = this.state.current_city!
    let anchor = tile.covered ? this.GetTile(city, tile.anchor_i, tile.anchor_j) : tile
    if (!anchor.building) {
      tile.covered = false
      // Nothing built here: clear a removable tree/rock feature off the land.
      tile.feature = undefined
      return
    }
    let isHouse = !!anchor.building.house
    let size = GetBuildingSize(anchor.building.type)
    this.RemoveBuildingFromLists(city, anchor)
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        let t = this.GetTile(city, anchor.i + di, anchor.j + dj)
        // Restore terrain that was replaced when the house was placed.
        if (isHouse && t.original_terrain !== undefined) {
          t.terrain = t.original_terrain
          t.original_terrain = undefined
        }
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
          if (!FeatureMatches(type, t.feature)) return false
        }
        destFootprint.push(t)
      }
    }
    if (!this.HasRequiredSurroundings(city, type, to.i, to.j, size)) return false

    const isHouse = !!building.house

    // Clear source footprint (drop from lists first, while still categorisable).
    this.RemoveBuildingFromLists(city, from)
    for (let di = 0; di < size; ++di) {
      for (let dj = 0; dj < size; ++dj) {
        let t = this.GetTile(city, from.i + di, from.j + dj)
        // Restore terrain at source if this was a house.
        if (isHouse && t.original_terrain !== undefined) {
          t.terrain = t.original_terrain
          t.original_terrain = undefined
        }
        t.building = undefined
        t.covered = false
        t.anchor_i = -1
        t.anchor_j = -1
      }
    }

    // Place at destination.
    to.building = building
    // Houses no longer stamp the ground to dirt on move (disabled).
    for (let t of destFootprint) {
      if (t === to) continue
      t.covered = true
      t.anchor_i = to.i
      t.anchor_j = to.j
    }
    this.AddBuildingToLists(city, to)

    // Tasks hold a reference to their destination tile; after a move that tile
    // no longer carries the building, so the task is orphaned. Left alone it
    // gets dropped by HandleShipTasks while the production stays
    // WAITING_PICK_UP / WAITING_DELIVERY forever (no new task is ever issued),
    // stranding the building. Re-point every task that targeted the old tile.
    //
    // Pending tasks only need the new dst — HandleShipTasks rebuilds their path.
    for (let task of city.shipping_tasks) {
      if (task.dst === from) task.dst = to
    }
    // In-flight DELIVERYING / PICKING_UP carts are en route to the building, so
    // re-route them from their own warehouse to the new tile (reset progress so
    // the cart cleanly retravels). RETURNING carts are heading back to the
    // warehouse with cargo and don't touch dst, so the move doesn't affect them.
    let field = RoadDistanceField(city, to)
    for (let wt of city.warehouses) {
      for (let cart of wt.building!.warehouse!.carts) {
        let task = cart.task
        if (!task || task.dst !== from) continue
        task.dst = to
        if (task.type == ShippingTaskType.RETURNING) continue
        let dist = WarehouseRoadDistance(city, field, wt)
        if (dist != Infinity) {
          task.distance = dist
          task.progress = 0
          task.path = BuildRoadPath(city, field, wt, to)
        }
      }
    }

    city.focus_tile = to
    this.bumpMap()
    return true
  }

  // Add a building's anchor tile to its matching per-city list. The category is
  // fixed by which sub-object the building carries; roads (and anything with no
  // sub-object) belong to no list. Covered tiles carry no building, so passing
  // one is a safe no-op.
  public AddBuildingToLists(city: City, tile: Tile) {
    let b = tile.building
    if (!b) return
    if (b.house) city.houses.push(tile)
    else if (b.production) city.productions.push(tile)
    else if (b.service) city.services.push(tile)
    else if (b.warehouse) city.warehouses.push(tile)
    else if (b.shipyard) city.shipyards.push(tile)
    else if (b.dock) city.docks.push(tile)
    else if (b.university) city.universities.push(tile)
  }

  // Remove a building's anchor tile from its list. Call before clearing
  // tile.building so the category is still known.
  public RemoveBuildingFromLists(city: City, tile: Tile) {
    let b = tile.building
    if (!b) return
    let drop = (arr: Tile[]) => {
      let idx = arr.indexOf(tile)
      if (idx >= 0) arr.splice(idx, 1)
    }
    if (b.house) drop(city.houses)
    else if (b.production) drop(city.productions)
    else if (b.service) drop(city.services)
    else if (b.warehouse) drop(city.warehouses)
    else if (b.shipyard) drop(city.shipyards)
    else if (b.dock) drop(city.docks)
    else if (b.university) drop(city.universities)
  }

  // Seed the per-city building lists from a full grid scan. Used on load, where
  // buildings are restored onto tiles but the serialized lists hold stale tile
  // references. The lists are then maintained incrementally on place/delete/move.
  public RebuildBuildingLists(city: City) {
    city.houses = []
    city.productions = []
    city.services = []
    city.warehouses = []
    city.shipyards = []
    city.docks = []
    city.universities = []
    for (let t of city.tiles) {
      this.AddBuildingToLists(city, t)
    }
  }

  // Re-randomise list order each tick so no building gets permanent priority in
  // employment/logistics distribution (shuffle is in place).
  public ShuffleBuildingLists(city: City) {
    shuffle(city.houses)
    shuffle(city.productions)
    shuffle(city.services)
    shuffle(city.warehouses)
    shuffle(city.shipyards)
    shuffle(city.docks)
    shuffle(city.universities)
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

      // Only consider extra sources whose required tech has been researched.
      let activeExtras = production.extra_sources.filter(
        es => !es.required_tech || (city.unlocked_techs ?? []).includes(es.required_tech)
      )

      // Proactively stock active extra sources into the building's local buffer.
      if (activeExtras.length > 0 && !production.stocking_in_progress) {
        for (let es of activeExtras) {
          let stockpile = CountItem(production.storage, es.resource)
          if (stockpile < es.max_stockpile) {
            let need = es.max_stockpile - stockpile
            let task = new ShippingTask(ShippingTaskType.STOCKING, t, [new Item(es.resource, need)])
            city.shipping_tasks.push(task)
            production.stocking_in_progress = true
            break
          }
        }
      }

      if (production.status == ProductionStatus.READY) {
        // Required active extra sources must be pre-stocked before starting
        let requiredSatisfied = activeExtras
          .filter(es => es.required)
          .every(es => CountItem(production.storage, es.resource) >= es.amount)
        if (!requiredSatisfied) continue

        if (production.ingredient.length == 0) {
          production.status = ProductionStatus.IN_PROGRESS
        } else {
          let shipping_task = new ShippingTask(ShippingTaskType.DELIVERYING, t, production.ingredient)
          city.shipping_tasks.push(shipping_task)
          production.status = ProductionStatus.WAITING_DELIVERY
        }
      } else if (production.status == ProductionStatus.IN_PROGRESS) {
        if (production.progress == 0) {
          // First tick of a new cycle: consume active extras from local stockpile
          production.boost_multiplier = 1.0
          for (let es of activeExtras) {
            let taken = TakeItems(production.storage, [new Item(es.resource, es.amount)])
            if (taken && !es.required) {
              production.boost_multiplier *= es.speed_multiplier
            }
          }
        }
        let techMult = this.getTechSpeedMultiplier(city, t.building!.type)
        production.progress = Math.min(
          production.progress + production.full_efficiency * production.worker / production.worker_needed * (production.boost_multiplier ?? 1.0) * techMult * PRODUCTION_SPEED,
          100.0
        )
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
        // Only pull from city storage when nearly empty, and only a small top-up
        // so city stock spreads evenly across many houses rather than first-come gets all.
        if (cnt! <= 0.1) {
          Transfer(city.storage, house.storage, [new Item(n.type, 0.2)])
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
          } else if (c.task.type == ShippingTaskType.STOCKING) {
            // Deposit extra sources into the building's local stockpile buffer
            AddItems(c.task.dst.building!.production!.storage, c.task.cargo)
            c.task.dst.building!.production!.stocking_in_progress = false
            c.task.type = ShippingTaskType.RETURNING
            c.task.progress = 0
            c.task.cargo = []
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
      // Only build while in progress with a chosen blueprint; nothing to do
      // (and no blueprint to read) otherwise.
      if (shipyard.status != ProductionStatus.IN_PROGRESS || !blueprint) continue
      shipyard.progress = Math.min(1.0, shipyard.progress + 1.0 / blueprint.build_time)
      if (shipyard.progress >= 1.0) {
        shipyard.progress = 0
        shipyard.status = ProductionStatus.READY
        city.ships.push(new Ship(blueprint.type, blueprint.max_cargo, blueprint.speed))
      }
    }
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
      let field = RoadDistanceField(city, task.dst)
      let min_dist = Infinity
      let min_idx = undefined
      for (let j = 0; j < city.carts.length; ++j) {
        let dist = WarehouseRoadDistance(city, field, city.carts[j])
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

      if (task.type == ShippingTaskType.DELIVERYING || task.type == ShippingTaskType.STOCKING) {
        if (!TakeItems(city.storage, task.cargo)) {
          ++i
          continue
        }
      }
      let cart = city.carts[min_idx]
      task.distance = min_dist
      task.progress = 0
      task.path = BuildRoadPath(city, field, cart, task.dst)
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
      // Base happiness from satisfied services + goods (see ComputeBaseHappiness
      // in building.ts to tune the model). Tax only bites above the threshold, so
      // a modest tax rate leaves happiness untouched (and 100% reachable).
      let base_happiness = ComputeBaseHappiness(house)
      let tax_penalty = Math.max(0, this.state.tax_rate - TAX_HAPPY_THRESHOLD) * TAX_UNHAPPINESS
      house.happiness = Math.max(0, Math.min(1, base_happiness - tax_penalty))

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
      let b = t.building!
      let worker_needed = b.production?.worker_needed ?? b.university?.scholar_slots ?? 0
      let new_employee = Math.floor(worker_needed * base_ratio)
      if (b.production) b.production.worker = new_employee
      else if (b.university) b.university.scholars = new_employee
      new_employed += new_employee
    }
    if (base_ratio == 1.0) return
    let unemployed = has - new_employed
    while (unemployed > 0) {
      for (let t of productions) {
        let b = t.building!
        if (b.production) b.production.worker += 1
        else if (b.university) b.university.scholars += 1
        unemployed -= 1
        if (unemployed == 0) break
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

 public AddUniversity(population: Population, tile: Tile) {
    let slots = tile.building!.university!.scholar_slots
    for (let t of population.tiers) {
        if (t.tier === Resident.SCHOLAR) {
            t.needed += slots
            t.productions.push(tile)
        }
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
    for (let t of city.universities) {
      this.AddUniversity(population, t)
    }
    for (let t of city.houses) {
      this.AddHouse(population, t)
    }
    for (let tier of population.tiers) {
      this.UpdateEmploymentPerTier(tier.has, tier.needed, tier.productions)
    }
    city.population = population
  }


  public StartResearch(city: City, tile: Tile, tech: Technology): boolean {
    let univ = tile.building?.university
    if (!univ) return false
    let project = ALL_RESEARCH.find(p => p.tech === tech)
    if (!project) return false
    if (this.state.gold < project.gold_cost) return false
    this.state.gold -= project.gold_cost
    univ.selected_tech = tech
    univ.progress = 0
    return true
  }

  public UpdateUniversity(city: City) {
    if (!city.unlocked_techs) city.unlocked_techs = []
    for (let t of (city.universities ?? [])) {
      let univ = t.building!.university!
      if (!univ.selected_tech) continue
      if (city.unlocked_techs.includes(univ.selected_tech)) {
        univ.selected_tech = undefined
        univ.progress = 0
        continue
      }
      let project = ALL_RESEARCH.find(p => p.tech === univ.selected_tech)
      if (!project || univ.scholars <= 0) continue
      univ.progress += (univ.scholars / univ.scholar_slots) * (100 / project.research_time)
      if (univ.progress >= 100) {
        city.unlocked_techs.push(univ.selected_tech)
        univ.progress = 0
        univ.selected_tech = undefined
      }
    }
  }

  private getTechSpeedMultiplier(city: City, type: BuildingType): number {
    const unlocked = city.unlocked_techs ?? []
    let mult = 1.0
    if (FARM_BUILDINGS.has(type) && type !== BuildingType.COMPOST_PIT &&
        unlocked.includes(Technology.CROP_ROTATION)) {
      mult *= 1.3
    }
    if (MINE_CAMP_BUILDINGS.has(type) && unlocked.includes(Technology.ADVANCED_MINING)) {
      mult *= 1.3
    }
    return mult
  }

  // Collect residential tax. Each resident pays a tier-based amount scaled by
  // the current tax rate; wealthier tiers contribute more.
  public UpdateGold(city: City) {
    this.state.gold += this.TaxIncome(city)
  }

  // Gold collected from all residents this tick at the current tax rate.
  public TaxIncome(city: City): number {
    let income = 0
    for (let t of city.population.tiers) {
      income += t.has * GetTaxPerResident(t.tier)
    }
    return income * this.state.tax_rate
  }

  // Set the tax rate, clamped to [0, 1].
  public SetTaxRate(rate: number) {
    this.state.tax_rate = Math.min(1, Math.max(0, rate))
    this.bumpMap()
  }

  // Sea trade. Each route owns a ship that cycles:
  //   READY       -> load `resource` from the origin city until full, then depart
  //   DELIVERYING -> sail to the destination; on arrival, unload into its storage
  //   RETURNING   -> sail back empty; on arrival, become READY again
  // Routes run for every city (not just the one on screen) so trade continues
  // in the background while the player looks at another city.
  public UpdateRoutes() {
    for (let city of this.state.cities) {
      for (let r of city.routes) {
        if (!r.ship) {
          continue
        }
        let ship = r.ship
        let from = this.GetCity(this.state.cities, r.from)
        let to = this.GetCity(this.state.cities, r.to)
        if (!from || !to) {
          continue
        }

        // How much this trip carries: the route amount, capped by ship capacity.
        let capacity = Math.min(r.amount, ship.max_cargo)

        if (ship.status == ShippingTaskType.READY) {
          let loaded = CountItem(ship.cargo, r.resource)
          if (loaded < capacity) {
            let taken = TakeItemsAsPossible(from.storage, [new Item(r.resource, capacity - loaded)])
            AddItems(ship.cargo, taken)
            loaded = CountItem(ship.cargo, r.resource)
          }
          // Depart only once fully loaded (waits for the origin to produce more).
          if (capacity > 0 && loaded >= capacity) {
            ship.status = ShippingTaskType.DELIVERYING
            r.progress = 0.0
          }
        } else if (ship.status == ShippingTaskType.DELIVERYING) {
          r.progress = Math.min(1.0, r.progress + ship.speed / 100.0)
          if (r.progress >= 1.0) {
            r.progress = 0.0
            ship.status = ShippingTaskType.RETURNING
            AddItems(to.storage, StorageItems(ship.cargo))
            ship.cargo = new Storage()
          }
        } else if (ship.status == ShippingTaskType.RETURNING) {
          r.progress = Math.min(1.0, r.progress + ship.speed / 100.0)
          if (r.progress >= 1.0) {
            r.progress = 0.0
            ship.status = ShippingTaskType.READY
          }
        }
      }
    }
  }
}


