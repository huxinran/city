import { Injectable, NgZone, inject, signal, isDevMode } from '@angular/core';
import { State } from './sim/state';
import { Item, Storage } from './sim/storage';
import { FindNeighbours, TakeItems, ProvideService, Transfer, shuffle, AddItems, CountItem, TakeItemsAsPossible, StorageItems} from './sim/utils';
import { GetCurrentMaxOccupant, GetTaxPerResident, Ship, ShippingTask, CreateBuilding, GetBuildingSize, GetBuildingGoldCost, GetRequiredTerrains, CanPlaceOnFeature, GetRequiredNearbyFeature, GetRequiredNearbyTerrain, Technology, ALL_RESEARCH, FARM_BUILDINGS, MINE_CAMP_BUILDINGS, ComputeBaseHappiness, ValidateConfig, CanUpgradeHouse, RefreshHouse, RefreshWarehouse } from './sim/building'
import { BALANCE } from './sim/balance';
import { City, GenerateCityMap } from './sim/city';
import { Population,  } from './sim/population';
import { Resident, ProductionStatus, ShippingTaskType, BuildingType, Terrain, Feature, CityName } from './sim/types'
import { Tile } from './sim/tile';
import { SaveState, LoadState, LoadDefaultState, SaveMaps, LoadMaps, HasSavedMap, HasSavedState } from './sim/persistence';
import { RoadDistanceField, BuildRoadPath, WarehouseRoadDistance } from './sim/pathfinding';
import { Camera } from './camera';
// Sim tick + per-city helpers now live under ./sim; StateService drives them and
// keeps only the UI-facing state (selection, camera, placement, persistence).
import { TickState } from './sim/tick';
import { AddBuildingToLists, RemoveBuildingFromLists, RebuildBuildingLists } from './sim/building-lists';
import { InvalidateMapCaches, RebuildTechCaches } from './sim/derived';
import { StartResearch as StartResearchSystem } from './sim/systems/university.system';

// How far (in tiles) a resource building may sit from the rock/tree it works.
const FEATURE_RADIUS = 3
const POODLE_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export interface PoodleActor {
  mode: boolean
  i: number
  j: number
  x: number
  y: number
  facing: 'se' | 'sw' | 'ne' | 'nw'
  path: { i: number, j: number }[]
}

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
  // Buildings can only be dragged after the palette's Move tool is selected.
  public move_mode = false
  // Click a building on the map to upgrade or downgrade it when possible.
  public upgrade_mode: 'upgrade' | 'downgrade' | undefined

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

  public poodle: PoodleActor = { mode: false, i: 0, j: 0, x: 0, y: 0, facing: 'se', path: [] }

  private zone = inject(NgZone)

  constructor() {
    // In dev, surface any building/city config drift (missing producers, defs,
    // icons) in the console at startup. Stripped from production builds.
    if (isDevMode()) {
      const problems = ValidateConfig()
      if (problems.length) {
        console.warn(`[config] ${problems.length} issue(s):\n` + problems.map(p => '  • ' + p).join('\n'))
      }
    }
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

  public HasSave() {
    return HasSavedState()
  }

  public Load() {
    let loaded = LoadState()
    if (loaded) {
      this.state = loaded
    }
    this.LoadOrGenerateMaps()
    // Seed building lists from the grid: a save restores buildings onto tiles,
    // but its serialized lists hold stale (post-JSON) tile references. From here
    // the lists are maintained incrementally on place/delete/move. Also rebuild
    // the transient tech caches from the persisted unlocked_techs array.
    for (let city of this.state.cities) {
      RebuildBuildingLists(city)
      RebuildTechCaches(city)
    }
    this.bumpMap()
  }

  // Restore each city's locked-in map, then generate (and lock) only the cities
  // that don't have one saved yet. So terrain is generated on the first ever load
  // and on Reset — never re-rolled on an ordinary reload.
  private LoadOrGenerateMaps() {
    this.LoadMap()
    let generated = false
    for (let city of this.state.cities) {
      if (!HasSavedMap(city.name)) { GenerateCityMap(city); generated = true }
    }
    // Only write back when something was actually generated — a plain reload
    // restored every map unchanged and needs no save.
    if (generated) this.SaveMap()
  }

  public SaveMap() {
    SaveMaps(this.state.cities)
  }

  public LoadMap() {
    LoadMaps(this.state.cities)
  }
  public Restart() {
    this.state = LoadDefaultState() ?? new State()
    this.LoadOrGenerateMaps()
    this.bumpMap()
  }

  // Wipe the game and roll fresh maps. This is the ONLY path that regenerates an
  // existing city's terrain; SaveState then locks the new maps in for reloads.
  public Reset() {
    this.state = new State()
    for (let city of this.state.cities) GenerateCityMap(city)
    this.Save()
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

  // Auto-save every 1500 ticks (~5 min at 200 ms/tick).
  private readonly AUTO_SAVE_INTERVAL = 1500

  public Tick() {
    this.state.time += 1
    // Advance every city's economy plus sea trade (see sim/tick.ts). All cities
    // simulate each tick, so background regions keep producing while the player
    // is elsewhere.
    TickState(this.state)
    if (this.state.time % this.AUTO_SAVE_INTERVAL === 0) this.Save()
    // Drive OnPush rendering of live data. Bump inside the zone so change
    // detection runs (the tick itself ran outside Angular).
    this.zone.run(() => this.frame.update(f => f + 1))
  }

  public ClearSelection() {
    this.ClearBuildType()
    this.ClearTerrainType()
    this.ClearFeatureType()
  }

  // Cancel everything currently selected: the active build/terrain/feature paint
  // tool, an in-progress road draw, a pending building move, and the focused-tile
  // outline. Bound to right-click on the map so one click clears any selection.
  public Deselect() {
    this.state.build_type = undefined
    this.state.terrain_type = undefined
    this.state.feature_type = undefined
    this.road_start = undefined
    this.move_source = undefined
    this.move_mode = false
    this.upgrade_mode = undefined
    this.poodle.mode = false
    this.poodle.path = []
    if (this.state.current_city) this.state.current_city.focus_tile = undefined
    this.bumpMap()
  }

  // Handle a click on a map tile, applying whichever paint mode is active
  // (build / feature / terrain) or selecting the tile. Relocated here from the
  // per-tile component so the canvas map can drive it from a single hit test.
  public HandleTileClick(tile: Tile) {
    let city = this.state.current_city!
    let building_type = this.state.build_type
    let terrain_type = this.state.terrain_type
    let feature_type = this.state.feature_type

    if (this.upgrade_mode) {
      this.ApplyUpgradeMode(tile, this.upgrade_mode)
      return
    }

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
        // Center a multi-tile footprint on the clicked tile so click placement
        // matches the drag-and-drop preview (roads stay 1x1, so unaffected).
        let size = GetBuildingSize(building_type)
        if (size > 1) {
          let a = this.CenteredAnchor(city, tile.i, tile.j, size)
          tile = this.GetTile(city, a.i, a.j)
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

  private ApplyUpgradeMode(tile: Tile, mode: 'upgrade' | 'downgrade') {
    let city = this.state.current_city!
    let anchor = tile.covered
      ? this.GetTile(city, tile.anchor_i, tile.anchor_j)
      : tile
    let building = anchor.building
    city.focus_tile = anchor

    if (!building) {
      this.bumpMap()
      return
    }

    if (mode === 'upgrade') {
      if (building.house && CanUpgradeHouse(building.house)) {
        building.house.tier += 1
        RefreshHouse(building.house)
      } else if (building.warehouse && building.warehouse.tier < BALANCE.warehouse.cartsByTier.length) {
        building.warehouse.tier += 1
        RefreshWarehouse(building.warehouse)
      }
    } else if (building.house && building.house.tier > 1) {
      building.house.tier -= 1
      RefreshHouse(building.house)
    }

    // A house tier change rewrites its service_needs, so service coverage (and,
    // for a warehouse tier change, cart routing) must be recomputed next tick.
    InvalidateMapCaches(city)
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
    this.move_mode = false
    this.upgrade_mode = undefined
    this.poodle.mode = false
    this.bumpMap()
  }
  public ClearBuildType() {
    this.state.build_type = undefined
    this.road_start = undefined
    this.move_mode = false
    this.upgrade_mode = undefined
    this.bumpMap()
  }

  public SetMoveMode() {
    this.state.build_type = undefined
    this.state.terrain_type = undefined
    this.state.feature_type = undefined
    this.road_start = undefined
    this.move_source = undefined
    this.move_mode = true
    this.upgrade_mode = undefined
    this.poodle.mode = false
    this.bumpMap()
  }

  public SetUpgradeMode(mode: 'upgrade' | 'downgrade') {
    this.state.build_type = undefined
    this.state.terrain_type = undefined
    this.state.feature_type = undefined
    this.road_start = undefined
    this.move_source = undefined
    this.move_mode = false
    this.upgrade_mode = mode
    this.poodle.mode = false
    this.bumpMap()
  }

  public SetTerrainType(type: Terrain) {
    this.state.terrain_type = type
    this.state.build_type = undefined
    this.state.feature_type = undefined
    this.move_mode = false
    this.upgrade_mode = undefined
    this.poodle.mode = false
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
    this.move_mode = false
    this.upgrade_mode = undefined
    this.poodle.mode = false
    this.bumpMap()
  }

  public TogglePoodleMode() {
    this.poodle.mode = !this.poodle.mode
    if (this.poodle.mode) {
      this.ClearSelection()
      this.EnsurePoodleOnCurrentCity()
    } else {
      this.poodle.path = []
    }
    this.bumpMap()
  }

  public EnsurePoodleOnCurrentCity() {
    const city = this.state.current_city
    if (!city) return
    if (this.IsPoodleWalkable(city, Math.round(this.poodle.y), Math.round(this.poodle.x))) return
    const start = this.FirstPoodleWalkableTile(city)
    if (!start) return
    this.poodle.i = start.i
    this.poodle.j = start.j
    this.poodle.x = start.j
    this.poodle.y = start.i
    this.poodle.path = []
  }

  public SendPoodleTo(tile: Tile): boolean {
    const city = this.state.current_city!
    this.EnsurePoodleOnCurrentCity()
    const target = this.NearestPoodleWalkableTile(city, tile.i, tile.j)
    if (!target) return false
    const start = { i: Math.round(this.poodle.y), j: Math.round(this.poodle.x) }
    const path = this.FindPoodlePath(city, start, target)
    if (!path.length) return false
    this.poodle.i = start.i
    this.poodle.j = start.j
    this.poodle.path = path.slice(1)
    city.focus_tile = this.GetTile(city, target.i, target.j)
    this.bumpMap()
    return true
  }

  public IsPoodleWalkable(city: City, i: number, j: number): boolean {
    if (i < 0 || j < 0 || i >= city.h || j >= city.w) return false
    const t = this.GetTile(city, i, j)
    if (t.terrain === Terrain.WATER || t.covered || t.feature) return false
    return !t.building || t.building.type === BuildingType.ROAD
  }

  private FirstPoodleWalkableTile(city: City): { i: number, j: number } | undefined {
    const ci = Math.floor(city.h / 2), cj = Math.floor(city.w / 2)
    return this.NearestPoodleWalkableTile(city, ci, cj)
  }

  private NearestPoodleWalkableTile(city: City, i: number, j: number): { i: number, j: number } | undefined {
    const seen = new Set<number>()
    const queue = [{ i, j }]
    let head = 0
    while (head < queue.length) {
      const p = queue[head++]
      if (p.i < 0 || p.j < 0 || p.i >= city.h || p.j >= city.w) continue
      const k = p.i * city.w + p.j
      if (seen.has(k)) continue
      seen.add(k)
      if (this.IsPoodleWalkable(city, p.i, p.j)) return p
      for (const [di, dj] of POODLE_DIRS) queue.push({ i: p.i + di, j: p.j + dj })
    }
    return undefined
  }

  private FindPoodlePath(city: City, start: { i: number, j: number }, target: { i: number, j: number }): { i: number, j: number }[] {
    const startKey = start.i * city.w + start.j
    const targetKey = target.i * city.w + target.j
    const prev = new Map<number, number>()
    const queue = [start]
    const seen = new Set<number>([startKey])
    let head = 0
    while (head < queue.length) {
      const p = queue[head++]
      const pk = p.i * city.w + p.j
      if (pk === targetKey) break
      for (const [di, dj] of POODLE_DIRS) {
        const ni = p.i + di, nj = p.j + dj
        if (!this.IsPoodleWalkable(city, ni, nj)) continue
        const nk = ni * city.w + nj
        if (seen.has(nk)) continue
        seen.add(nk)
        prev.set(nk, pk)
        queue.push({ i: ni, j: nj })
      }
    }
    if (!seen.has(targetKey)) return []
    const keys = [targetKey]
    while (keys[keys.length - 1] !== startKey) {
      const p = prev.get(keys[keys.length - 1])
      if (p === undefined) return []
      keys.push(p)
    }
    keys.reverse()
    return keys.map(k => ({ i: Math.floor(k / city.w), j: k % city.w }))
  }
  public ClearFeatureType() {
    this.state.feature_type = undefined
    this.bumpMap()
  }

  public GetTile(city: City, i: number, j: number): Tile {
    return city.tiles[i * city.w + j]
  }

  // Anchor (top-left) tile so the cursor/clicked tile sits at the center of a
  // size x size footprint, clamped to stay on the grid. 1x1 is a no-op (so
  // roads and single-tile placement are unaffected). This is the single source
  // of truth shared by click placement and drag-and-drop placement, so the two
  // can never disagree on where a multi-tile building lands.
  public CenteredAnchor(city: City, i: number, j: number, size: number): { i: number, j: number } {
    let off = Math.round((size - 1) / 2)
    return {
      i: Math.max(0, Math.min(i - off, city.h - size)),
      j: Math.max(0, Math.min(j - off, city.w - size)),
    }
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
    // Building is a paint action, not an inspect action. Leaving focus empty
    // keeps the info panel closed after placing a new building.
    city.focus_tile = undefined
  }

  // Roads are drawn between two points: the first click sets the start, the
  // second lays an L-shaped path of road tiles to the end point.
  public RoadPoint(tile: Tile) {
    let city = this.state.current_city!
    city.focus_tile = undefined
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
        if (!CanPlaceOnFeature(t.feature)) {
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
    AddBuildingToLists(city, tile)
    InvalidateMapCaches(city)
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
    RemoveBuildingFromLists(city, anchor)
    InvalidateMapCaches(city)
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
          if (!CanPlaceOnFeature(t.feature)) return false
        }
        destFootprint.push(t)
      }
    }
    if (!this.HasRequiredSurroundings(city, type, to.i, to.j, size)) return false

    const isHouse = !!building.house

    // Clear source footprint (drop from lists first, while still categorisable).
    RemoveBuildingFromLists(city, from)
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
    AddBuildingToLists(city, to)
    InvalidateMapCaches(city)

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
    // In-flight DELIVERING / PICKING_UP carts are en route to the building, so
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

  // Begin researching a technology at the given university tile. Delegates to
  // the university system (which charges the gold cost up front).
  public StartResearch(city: City, tile: Tile, tech: Technology): boolean {
    return StartResearchSystem(this.state, tile, tech)
  }

  // Set the tax rate, clamped to [0, 1].
  public SetTaxRate(rate: number) {
    this.state.tax_rate = Math.min(1, Math.max(0, rate))
    this.bumpMap()
  }
}
