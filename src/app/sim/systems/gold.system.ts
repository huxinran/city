import { State } from '../state'
import { City } from '../city'
import { GetTaxPerResident } from '../building'

// Gold collected from all of a city's residents this tick, at the current tax
// rate. Wealthier tiers contribute more per resident (see GetTaxPerResident).
export function TaxIncome(state: State, city: City): number {
    let income = 0
    for (const t of city.population.tiers) {
        income += t.has * GetTaxPerResident(t.tier)
    }
    return income * state.tax_rate
}

// Collect residential tax from a city into the shared treasury.
export function UpdateGold(state: State, city: City) {
    state.gold += TaxIncome(state, city)
}
