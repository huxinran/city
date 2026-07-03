// Per-city building indexes. Each city keeps a flat list of the anchor tiles of
// every building of a given kind (houses, productions, services, …) so the tick
// loop can iterate a category without scanning all 6,400 tiles. A building
// carries exactly one sub-object, so its category is fixed by which one is set.
//
// This single CATEGORIES table is the only place that knows the mapping from a
// building's sub-object to its city list; adding a new building kind means one
// new entry here (plus the Building field and the City list it points at).
import { City } from './city'
import { Tile } from './tile'
import { Building } from './building'
import { shuffle } from './utils'

interface BuildingCategory {
    has: (b: Building) => boolean
    list: (c: City) => Tile[]
    // Whether the tick distributes a shared resource (workers, carts) over this
    // list. Only those need per-tick reshuffling for fair round-robin ordering.
    fair: boolean
}

const CATEGORIES: BuildingCategory[] = [
    { has: b => !!b.house,      list: c => c.houses,       fair: true },
    { has: b => !!b.production, list: c => c.productions,  fair: true },
    { has: b => !!b.warehouse,  list: c => c.warehouses,   fair: true },
    { has: b => !!b.service,    list: c => c.services,     fair: false },
    { has: b => !!b.shipyard,   list: c => c.shipyards,    fair: false },
    { has: b => !!b.dock,       list: c => c.docks,        fair: false },
    { has: b => !!b.university, list: c => c.universities, fair: false },
]

function categoryOf(b: Building): BuildingCategory | undefined {
    return CATEGORIES.find(c => c.has(b))
}

// Add a building's anchor tile to its matching per-city list. Roads (and
// anything with no sub-object) belong to no list. Covered tiles carry no
// building, so passing one is a safe no-op.
export function AddBuildingToLists(city: City, tile: Tile) {
    const b = tile.building
    if (!b) return
    categoryOf(b)?.list(city).push(tile)
}

// Remove a building's anchor tile from its list. Call before clearing
// tile.building so the category is still known.
export function RemoveBuildingFromLists(city: City, tile: Tile) {
    const b = tile.building
    if (!b) return
    const arr = categoryOf(b)?.list(city)
    if (!arr) return
    const idx = arr.indexOf(tile)
    if (idx >= 0) arr.splice(idx, 1)
}

// Seed all per-city building lists from a full grid scan. Used on load, where
// buildings are restored onto tiles but the serialized lists are stale; the
// lists are then maintained incrementally on place/delete/move.
export function RebuildBuildingLists(city: City) {
    for (const cat of CATEGORIES) cat.list(city).length = 0
    for (const t of city.tiles) AddBuildingToLists(city, t)
}

// Re-randomise the order of the lists the tick distributes over, so no building
// gets permanent priority in employment/logistics. Lists that aren't the target
// of any distribution keep their order (cheaper, and order there is irrelevant).
export function ShuffleBuildingLists(city: City) {
    for (const cat of CATEGORIES) if (cat.fair) shuffle(cat.list(city))
}
