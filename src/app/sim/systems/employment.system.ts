import { City } from '../city'
import { Tile } from '../tile'
import { Population } from '../population'
import { Resident } from '../types'

// Register a production building's worker demand under its worker tier.
function addProduction(population: Population, production: Tile) {
    const tier = production.building!.production!.worker_type
    const needed = production.building!.production!.worker_needed
    for (const t of population.tiers) {
        if (t.tier == tier) {
            t.needed += needed
            t.productions.push(production)
        }
    }
}

// A university employs Scholars up to its slot count.
function addUniversity(population: Population, tile: Tile) {
    const slots = tile.building!.university!.scholar_slots
    for (const t of population.tiers) {
        if (t.tier === Resident.SCHOLAR) {
            t.needed += slots
            t.productions.push(tile)
        }
    }
}

// Register a house's residents under their resident tier.
function addHouse(population: Population, house: Tile) {
    const tier = house.building!.house!.resident_type
    const has = house.building!.house!.occupant
    for (const t of population.tiers) {
        if (t.tier == tier) {
            t.has += has
            t.houses.push(house)
        }
    }
}

// Distribute the `has` available workers of a tier across its productions in
// proportion to each one's demand, then hand out the rounding remainder one at
// a time so nobody sits idle when there's slack.
function updateEmploymentPerTier(has: number, needed: number, productions: Tile[]) {
    const base_ratio = Math.min(1.0, has / needed)
    let new_employed = 0
    for (const t of productions) {
        const b = t.building!
        const worker_needed = b.production?.worker_needed ?? b.university?.scholar_slots ?? 0
        const new_employee = Math.floor(worker_needed * base_ratio)
        if (b.production) b.production.worker = new_employee
        else if (b.university) b.university.scholars = new_employee
        new_employed += new_employee
    }
    if (base_ratio == 1.0) return
    let unemployed = has - new_employed
    while (unemployed > 0) {
        for (const t of productions) {
            const b = t.building!
            if (b.production) b.production.worker += 1
            else if (b.university) b.university.scholars += 1
            unemployed -= 1
            if (unemployed == 0) break
        }
    }
}

// Recompute the whole employment picture for a city: tally residents (supply)
// and worker demand per tier, then allocate workers to each production.
export function UpdateEmployment(city: City) {
    for (const tier of city.population.tiers) {
        tier.has = 0; tier.needed = 0; tier.houses.length = 0; tier.productions.length = 0
    }
    for (const t of city.productions) addProduction(city.population, t)
    for (const t of city.universities) addUniversity(city.population, t)
    for (const t of city.houses) addHouse(city.population, t)
    for (const tier of city.population.tiers) {
        updateEmploymentPerTier(tier.has, tier.needed, tier.productions)
    }
}
