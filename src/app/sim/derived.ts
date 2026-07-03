// Transient per-city derived caches and their invalidation. These are never
// serialized (see persistence.ts); they are rebuilt at runtime from the
// authoritative state (tiles, unlocked_techs) after a load and kept fresh by
// the mutation entry points calling InvalidateMapCaches on every map edit.
import { City } from './city'

// Call after any edit that could change the road network or service coverage
// (place / delete / move a building, change a house tier). Cheap: it just marks
// coverage stale and drops the road distance-field cache so it's recomputed
// lazily on the next tick that needs it.
export function InvalidateMapCaches(city: City) {
    city.coverage_dirty = true
    city.road_version++
    city.road_fields.clear()
}

// Rebuild the fast tech-membership set (and drop the speed-multiplier memo that
// depends on it) from the authoritative unlocked_techs array. Call on load and
// whenever a technology is unlocked.
export function RebuildTechCaches(city: City) {
    city.tech_set = new Set(city.unlocked_techs)
    city.tech_mult_cache.clear()
}
