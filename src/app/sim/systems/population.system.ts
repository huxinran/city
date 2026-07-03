import { City } from '../city'
import { ComputeBaseHappiness, GetCurrentMaxOccupant } from '../building'

// Recompute each house's happiness from its satisfied service/goods needs, then
// grow occupancy by one toward the happiness-scaled cap.
export function UpdatePopulation(city: City) {
    for (const t of city.houses) {
        const house = t.building!.house!
        // Happiness comes purely from satisfied services + goods (see
        // ComputeBaseHappiness in building.ts to tune the model).
        house.happiness = Math.max(0, Math.min(1, ComputeBaseHappiness(house)))
        house.current_max_occupant = GetCurrentMaxOccupant(house.tier, house.happiness)
        if (house.occupant < house.current_max_occupant) {
            house.occupant += 1
        }
    }
}
