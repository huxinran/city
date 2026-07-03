import { City } from '../city'
import { Ship } from '../building'
import { ProductionStatus } from '../types'

// Advance each shipyard that is building a selected blueprint; on completion,
// spawn the ship into the city's fleet and reset the yard to READY.
export function UpdateShipyard(city: City) {
    for (const t of city.shipyards) {
        const shipyard = t.building!.shipyard!
        const blueprint = shipyard.selected
        if (shipyard.status != ProductionStatus.IN_PROGRESS || !blueprint) continue
        shipyard.progress = Math.min(1.0, shipyard.progress + 1.0 / blueprint.build_time)
        if (shipyard.progress >= 1.0) {
            shipyard.progress = 0
            shipyard.status = ProductionStatus.READY
            city.ships.push(new Ship(blueprint.type, blueprint.max_cargo, blueprint.speed))
        }
    }
}
