import { State } from './state'
import { City } from './city'
import { Tile } from './tile'
import { Terrain, Feature, ProductionStatus } from './types'
import { Population } from './population'

// localStorage persistence for the game state and per-city terrain maps.
// Pure functions that operate on the passed-in state/cities so the service
// stays a thin owner of state rather than carrying serialization logic.

const STATE_KEY = 'state'
const MAP_KEY_PREFIX = 'map'
const VERSION_KEY = 'save_version'

// Bumped whenever the saved data shape changes incompatibly. Saves from an
// older version are discarded (a fresh game is generated) rather than migrated.
const SAVE_VERSION = '6'

// --- Compact save format ---
// Tiles skip terrain/feature (stored in separate map keys) and i/j (derivable
// from array index). Only non-empty tiles are stored (null = fully default).
// Building arrays (houses, productions, etc.) are omitted since
// RebuildBuildingLists reconstructs them from tiles on every load.
// Population is omitted since UpdateEmployment recomputes it every tick.
// Carts are omitted since UpdateWarehouses rebuilds them every tick.
// Shipping tasks are omitted; production statuses that required an in-flight
// cart are reset to READY on load so the cycle restarts cleanly.

interface TileSave {
  building?: any
  covered?: boolean
  anchor_i?: number
  anchor_j?: number
  original_terrain?: string
}

interface CitySave {
  name: string
  h: number
  w: number
  storage: any
  unlocked_techs: string[]
  routes: any[]
  ships: any[]
  tiles: (TileSave | null)[]
}

interface StateSave {
  time: number
  gold: number
  tax_rate: number
  current_city_name: string | undefined
  cities: CitySave[]
}

// Strip warehouse cart tasks before serializing — they hold Tile references
// that cannot round-trip through JSON. Carts become idle after load, which is
// correct: UpdateWarehouses repopulates city.carts each tick anyway.
function serializeBuilding(b: any): any {
  if (!b?.warehouse?.carts) return b
  return {
    ...b,
    warehouse: {
      ...b.warehouse,
      carts: b.warehouse.carts.map((c: any) => ({ speed: c.speed }))
    }
  }
}

function serializeTile(tile: Tile): TileSave | null {
  const hasBuilding = !!tile.building
  const isCovered = tile.covered
  const hasOriginal = tile.original_terrain !== undefined
  if (!hasBuilding && !isCovered && !hasOriginal) return null
  const saved: TileSave = {}
  if (hasBuilding) saved.building = serializeBuilding(tile.building)
  if (isCovered) { saved.covered = true; saved.anchor_i = tile.anchor_i; saved.anchor_j = tile.anchor_j }
  if (hasOriginal) saved.original_terrain = tile.original_terrain
  return saved
}

function serializeCity(city: City): CitySave {
  return {
    name: city.name,
    h: city.h,
    w: city.w,
    storage: city.storage,
    unlocked_techs: city.unlocked_techs,
    routes: city.routes,
    ships: city.ships,
    tiles: city.tiles.map(serializeTile),
  }
}

// Guard a localStorage write so a QuotaExceededError (the save grew past the
// ~5MB origin limit) is logged rather than thrown — an uncaught throw here would
// abort the autosave mid-write and bubble out of the tick loop.
function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    console.error(`Save failed for "${key}" (localStorage quota?):`, e)
    return false
  }
}

export function SaveState(state: State) {
  const saved: StateSave = {
    time: state.time,
    gold: state.gold,
    tax_rate: state.tax_rate,
    current_city_name: state.current_city?.name,
    cities: state.cities.map(serializeCity),
  }
  safeSet(STATE_KEY, JSON.stringify(saved))
  safeSet(VERSION_KEY, SAVE_VERSION)
  SaveMaps(state.cities)
}

// Returns the persisted state (with current_city re-linked into cities[]), or
// undefined if there is no save / the save is from an incompatible version.
export function LoadState(): State | undefined {
  const raw = localStorage.getItem(STATE_KEY)
  if (!raw || localStorage.getItem(VERSION_KEY) !== SAVE_VERSION) return undefined

  // A corrupt/truncated save must not throw out of the constructor (that would
  // brick the app on load). Treat unparseable data as "no save" so the caller
  // falls back to a fresh game rather than crashing.
  let data: StateSave
  try {
    data = JSON.parse(raw)
  } catch (e) {
    console.error('Discarding corrupt save:', e)
    return undefined
  }

  const state = new State()
  state.time = data.time ?? 0
  state.gold = data.gold ?? 0
  state.tax_rate = data.tax_rate ?? 0.3

  state.cities = data.cities.map(cityData => {
    // Build a fresh city so all non-saved fields get proper defaults.
    // Its tiles start as WATER; terrain is filled by LoadOrGenerateMaps after.
    const city = new City(cityData.name as any, cityData.h, cityData.w)
    city.storage = cityData.storage
    city.unlocked_techs = (cityData.unlocked_techs ?? []) as any
    city.routes = cityData.routes ?? []
    city.ships = cityData.ships ?? []

    // Overlay saved tile data onto the blank tile grid.
    const saved = cityData.tiles
    for (let k = 0; k < saved.length && k < city.tiles.length; k++) {
      const s = saved[k]
      if (!s) continue
      const tile = city.tiles[k]
      if (s.building !== undefined) tile.building = s.building
      if (s.covered) { tile.covered = true; tile.anchor_i = s.anchor_i!; tile.anchor_j = s.anchor_j! }
      if (s.original_terrain !== undefined) tile.original_terrain = s.original_terrain as Terrain
    }

    // Cart tasks were stripped on save. Any production waiting on an in-flight
    // cart (WAITING_DELIVERY, WAITING_PICK_UP) would be permanently stuck, so
    // reset those statuses to READY so the cycle restarts on the next tick.
    for (const tile of city.tiles) {
      const prod = tile.building?.production
      if (!prod) continue
      if (prod.status === ProductionStatus.WAITING_DELIVERY ||
          prod.status === ProductionStatus.WAITING_PICK_UP) {
        prod.status = ProductionStatus.READY
        prod.progress = 0
      }
      prod.stocking_in_progress = false
    }

    return city
  })

  state.current_city = state.cities.find(c => c.name === data.current_city_name) ?? state.cities[0]
  return state
}

// --- Compact map format (v2) ---
// A city map only needs terrain + feature to round-trip (see LoadMaps). The old
// format JSON-stringified the whole Tile[], which re-stored every tile's
// `building`, `covered`, anchors, i/j etc. — duplicating all the building data
// already held in the STATE_KEY save and bloating each map key toward the
// ~5MB localStorage quota. v2 stores two code-strings of one char per tile.
const TERRAIN_CODE: Record<Terrain, string> = {
  [Terrain.GRASS]: 'G', [Terrain.SAND]: 'S', [Terrain.WATER]: 'W', [Terrain.DIRT]: 'D',
}
const FEATURE_CODE: Record<Feature, string> = {
  [Feature.TREE]: 'T', [Feature.ROCK]: 'R', [Feature.BUSH]: 'B',
}
const TERRAIN_FROM = Object.fromEntries(Object.entries(TERRAIN_CODE).map(([k, v]) => [v, k as Terrain]))
const FEATURE_FROM = Object.fromEntries(Object.entries(FEATURE_CODE).map(([k, v]) => [v, k as Feature]))
const NO_FEATURE = '.'

interface MapSave { v: 2; h: number; w: number; t: string; f: string }

export function SaveMaps(cities: City[]) {
  for (let city of cities) {
    let t = '', f = ''
    for (const tile of city.tiles) {
      t += TERRAIN_CODE[tile.terrain]
      f += tile.feature ? FEATURE_CODE[tile.feature] : NO_FEATURE
    }
    const saved: MapSave = { v: 2, h: city.h, w: city.w, t, f }
    safeSet(MAP_KEY_PREFIX + city.name, JSON.stringify(saved))
  }
}

// True if a map has been persisted for this city — used to decide whether a
// city needs a fresh GenerateTerrain or can reuse its locked-in map.
export function HasSavedMap(name: string): boolean {
  return localStorage.getItem(MAP_KEY_PREFIX + name) != null
}

// Restore each city's locked-in map (terrain AND features) from localStorage,
// overwriting whatever the City constructor generated. This is what keeps the
// map stable across reloads — it only changes again on an explicit Reset (which
// regenerates and re-saves).
export function LoadMaps(cities: City[]) {
  for (let city of cities) {
    let saved_map = localStorage.getItem(MAP_KEY_PREFIX + city.name)
    if (!saved_map) continue
    let obj = JSON.parse(saved_map)

    // v2 compact format: two code-strings, one char per tile.
    if (obj.v === 2 && typeof obj.t === 'string' && obj.t.length === city.tiles.length) {
      city.h = obj.h
      city.w = obj.w
      for (let i = 0; i < city.tiles.length; ++i) {
        city.tiles[i].terrain = TERRAIN_FROM[obj.t[i]] ?? Terrain.WATER
        const fc = obj.f[i]
        city.tiles[i].feature = fc === NO_FEATURE ? undefined : FEATURE_FROM[fc]
      }
      continue
    }

    // Legacy format: full Tile[] under `tiles`. Only restore terrain/feature.
    if (obj.tiles && obj.tiles.length == city.tiles.length) {
      city.h = obj.h
      city.w = obj.w
      for (let i = 0; i < city.tiles.length; ++i) {
        city.tiles[i].terrain = obj.tiles[i].terrain
        city.tiles[i].feature = obj.tiles[i].feature
      }
    }
  }
}
