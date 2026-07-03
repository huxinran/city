import { City } from '../city'
import { FindNeighbours, ProvideService } from '../utils'

// Recompute which houses have each service covered. Coverage only changes when a
// building is placed/deleted/moved or a house's tier changes (which rewrites its
// service_needs) — all of which set city.coverage_dirty. So this skips the
// O(services × radius²) tile scan on the ticks where nothing changed, which is
// the vast majority of them.
export function UpdateService(city: City) {
    if (!city.coverage_dirty) return

    for (const t of city.houses) {
        for (const n of t.building!.house!.service_needs) n.satisfied = false
    }
    for (const t of city.services) {
        const service = t.building!.service!
        for (const n of FindNeighbours(city, t, service.radius)) {
            ProvideService(n, service.need_provided)
        }
    }
    city.coverage_dirty = false
}
