import { State } from '../state'
import { City } from '../city'
import { Item, Storage } from '../storage'
import { CountItem, AddItems, TakeItemsAsPossible, StorageItems } from '../utils'
import { CityName, ShippingTaskType } from '../types'

function getCity(cities: City[], name: CityName): City | undefined {
    return cities.find(c => c.name == name)
}

// Sea trade. Each route owns a ship that cycles:
//   READY      -> load `resource` from the origin city until full, then depart
//   DELIVERING -> sail to the destination; on arrival, unload into its storage
//   RETURNING  -> sail back empty; on arrival, become READY again
// Runs for every city (not just the one on screen) so trade continues in the
// background while the player looks at another city.
export function UpdateRoutes(state: State) {
    for (const city of state.cities) {
        for (const r of city.routes) {
            if (!r.ship) continue
            const ship = r.ship
            const from = getCity(state.cities, r.from)
            const to = getCity(state.cities, r.to)
            if (!from || !to) continue

            // How much this trip carries: the route amount, capped by capacity.
            const capacity = Math.min(r.amount, ship.max_cargo)

            if (ship.status == ShippingTaskType.READY) {
                let loaded = CountItem(ship.cargo, r.resource)
                if (loaded < capacity) {
                    const taken = TakeItemsAsPossible(from.storage, [new Item(r.resource, capacity - loaded)])
                    AddItems(ship.cargo, taken)
                    loaded = CountItem(ship.cargo, r.resource)
                }
                // Depart only once fully loaded (waits for the origin to produce more).
                if (capacity > 0 && loaded >= capacity) {
                    ship.status = ShippingTaskType.DELIVERING
                    r.progress = 0.0
                }
            } else if (ship.status == ShippingTaskType.DELIVERING) {
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
