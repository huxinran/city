import { City } from '../city'
import { Item } from '../storage'
import { CountItem, TakeAmount } from '../utils'
import { ShippingTask, FARM_BUILDINGS, MINE_CAMP_BUILDINGS } from '../building'
import { BALANCE } from '../balance'
import { ProductionStatus, ShippingTaskType, BuildingType } from '../types'
import { ALL_RESEARCH } from '../config/research.config'

// Passive production-speed multiplier a building gets from completed research,
// derived from each tech's declared effects (see research.config). Memoised per
// building type on the city (city.tech_mult_cache), invalidated when a tech
// unlocks (RebuildTechCaches).
function techSpeedMultiplier(city: City, type: BuildingType): number {
    const cached = city.tech_mult_cache.get(type)
    if (cached !== undefined) return cached
    // The compost pit is a farm but is excluded from farm-wide speed bonuses.
    const isFarm = FARM_BUILDINGS.has(type) && type !== BuildingType.COMPOST_PIT
    const isMine = MINE_CAMP_BUILDINGS.has(type)
    let mult = 1.0
    for (const proj of ALL_RESEARCH) {
        if (!proj.effects.length || !city.tech_set.has(proj.tech)) continue
        for (const e of proj.effects) {
            if (e.appliesTo === 'farm' && isFarm) mult *= e.speedMultiplier
            else if (e.appliesTo === 'mine' && isMine) mult *= e.speedMultiplier
        }
    }
    city.tech_mult_cache.set(type, mult)
    return mult
}

// Advance every production building through its cycle:
//   READY -> (queue an ingredient delivery, or start immediately if no inputs)
//   IN_PROGRESS -> accrue progress; consume/boost from stocked extras on cycle start
//   FINISHED -> queue a pick-up of the product
// Also keeps required/optional extra sources stocked via STOCKING tasks.
export function UpdateProduction(city: City) {
    for (const t of city.productions) {
        const production = t.building!.production!

        // Only consider extra sources whose gating tech (if any) is researched.
        const activeExtras = production.extra_sources.filter(
            es => !es.required_tech || city.tech_set.has(es.required_tech)
        )

        // Proactively stock active extra sources into the building's buffer.
        if (activeExtras.length > 0 && !production.stocking_in_progress) {
            for (const es of activeExtras) {
                const stockpile = CountItem(production.storage, es.resource)
                if (stockpile < es.max_stockpile) {
                    const need = es.max_stockpile - stockpile
                    city.shipping_tasks.push(new ShippingTask(ShippingTaskType.STOCKING, t, [new Item(es.resource, need)]))
                    production.stocking_in_progress = true
                    break
                }
            }
        }

        if (production.status == ProductionStatus.READY) {
            // Required active extras must be pre-stocked before starting.
            const requiredSatisfied = activeExtras
                .filter(es => es.required)
                .every(es => CountItem(production.storage, es.resource) >= es.amount)
            if (!requiredSatisfied) continue

            if (production.ingredient.length == 0) {
                production.status = ProductionStatus.IN_PROGRESS
            } else {
                city.shipping_tasks.push(new ShippingTask(ShippingTaskType.DELIVERING, t, production.ingredient))
                production.status = ProductionStatus.WAITING_DELIVERY
            }
        } else if (production.status == ProductionStatus.IN_PROGRESS) {
            if (production.progress == 0) {
                // First tick of a new cycle: consume active extras from the buffer.
                production.boost_multiplier = 1.0
                for (const es of activeExtras) {
                    const taken = TakeAmount(production.storage, es.resource, es.amount)
                    if (taken && !es.required) production.boost_multiplier *= es.speed_multiplier
                }
            }
            const techMult = techSpeedMultiplier(city, t.building!.type)
            production.progress = Math.min(
                production.progress + production.full_efficiency * production.worker / production.worker_needed * production.boost_multiplier * techMult * BALANCE.productionSpeed,
                100.0
            )
            if (production.progress == 100.0) {
                production.status = ProductionStatus.FINISHED
            }
        } else if (production.status == ProductionStatus.FINISHED) {
            city.shipping_tasks.push(new ShippingTask(ShippingTaskType.PICKING_UP, t, production.product))
            production.status = ProductionStatus.WAITING_PICK_UP
        }
    }
}
