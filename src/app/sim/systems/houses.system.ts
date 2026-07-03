import { City } from '../city'
import { CountItem, AddAmount, TakeAmount } from '../utils'

// Feed each house from its small local buffer, topping the buffer up from city
// storage only when nearly empty (and only a little), so scarce city stock
// spreads evenly across many houses instead of first-come-first-served.
export function UpdateHouses(city: City) {
    for (const t of city.houses) {
        const house = t.building!.house!
        for (const n of house.resource_needs) {
            const cnt = CountItem(house.storage, n.type)
            if (cnt <= 0.1) {
                // Move a small top-up from city storage, only if it's available.
                if (TakeAmount(city.storage, n.type, 0.2)) AddAmount(house.storage, n.type, 0.2)
            }
            n.satisfied = TakeAmount(house.storage, n.type, 0.002)
        }
    }
}
