import { State } from './state'
import { City, Map } from './city'

// localStorage persistence for the game state and per-city terrain maps.
// Pure functions that operate on the passed-in state/cities so the service
// stays a thin owner of state rather than carrying serialization logic.

const STATE_KEY = 'state'
const MAP_KEY_PREFIX = 'map'
const VERSION_KEY = 'save_version'

// Bumped whenever the saved data shape changes incompatibly. Saves from an
// older version are discarded (a fresh game is generated) rather than migrated.
const SAVE_VERSION = '6'

export function SaveState(state: State) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
  localStorage.setItem(VERSION_KEY, SAVE_VERSION)
  SaveMaps(state.cities)
}

// Returns the persisted state (with current_city re-linked into cities[]), or
// undefined if there is no save / the save is from an incompatible version.
export function LoadState(): State | undefined {
  let saved = localStorage.getItem(STATE_KEY)
  if (!saved || localStorage.getItem(VERSION_KEY) !== SAVE_VERSION) {
    return undefined
  }
  let state: State = JSON.parse(saved)
  // JSON round-trips current_city into a separate object from the one in
  // cities[]; re-link it so mutations and ChangeCity stay consistent.
  let name = state.current_city?.name
  state.current_city = state.cities.find(c => c.name === name) ?? state.cities[0]
  return state
}

export function SaveMaps(cities: City[]) {
  for (let city of cities) {
    localStorage.setItem(MAP_KEY_PREFIX + city.name, JSON.stringify(new Map(city.h, city.w, city.tiles)))
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
    let saved_map_obj = JSON.parse(saved_map)
    // Only restore if the saved map matches the current grid dimensions.
    if (saved_map_obj.tiles && saved_map_obj.tiles.length == city.tiles.length) {
      city.h = saved_map_obj.h
      city.w = saved_map_obj.w
      for (let i = 0; i < city.tiles.length; ++i) {
        city.tiles[i].terrain = saved_map_obj.tiles[i].terrain
        city.tiles[i].feature = saved_map_obj.tiles[i].feature
      }
    }
  }
}
