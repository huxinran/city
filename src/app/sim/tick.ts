import { State } from './state'
import { City } from './city'
import { ShuffleBuildingLists } from './building-lists'
import { UpdatePopulation } from './systems/population.system'
import { UpdateProduction } from './systems/production.system'
import { UpdateWarehouses, HandleShipTasks } from './systems/logistics.system'
import { UpdateHouses } from './systems/houses.system'
import { UpdateShipyard } from './systems/shipyard.system'
import { UpdateUniversity } from './systems/university.system'
import { UpdateEmployment } from './systems/employment.system'
import { UpdateService } from './systems/services.system'
import { UpdateGold } from './systems/gold.system'
import { UpdateRoutes } from './systems/routes.system'

// Advance one city's local economy by a tick. Order matters: production queues
// delivery/pick-up tasks, warehouses move carts already assigned, employment is
// recomputed before the next round of work, and logistics assigns this tick's
// pending tasks last.
export function TickCity(state: State, city: City) {
    ShuffleBuildingLists(city)
    UpdatePopulation(city)
    UpdateProduction(city)
    UpdateWarehouses(city)
    UpdateHouses(city)
    UpdateShipyard(city)
    UpdateUniversity(city)
    UpdateEmployment(city)
    HandleShipTasks(city)
    UpdateService(city)
    UpdateGold(state, city)
}

// Advance the whole simulation by one tick. Every city is simulated (not just
// the one on screen), so background regions keep producing, employing and
// earning tax while the player is elsewhere. Sea trade runs once across all
// cities after their local economies have advanced.
export function TickState(state: State) {
    for (const city of state.cities) {
        TickCity(state, city)
    }
    UpdateRoutes(state)
}
