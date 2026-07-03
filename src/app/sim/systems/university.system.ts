import { State } from '../state'
import { City } from '../city'
import { Tile } from '../tile'
import { Technology, ALL_RESEARCH } from '../config/research.config'
import { RebuildTechCaches } from '../derived'

// Start researching `tech` at the university on `tile`, charging its gold cost
// up front. Returns false (no charge) if the tile isn't a university, the tech
// is unknown, or the treasury can't afford it.
export function StartResearch(state: State, tile: Tile, tech: Technology): boolean {
    const univ = tile.building?.university
    if (!univ) return false
    const project = ALL_RESEARCH.find(p => p.tech === tech)
    if (!project) return false
    if (state.gold < project.gold_cost) return false
    state.gold -= project.gold_cost
    univ.selected_tech = tech
    univ.progress = 0
    return true
}

// Advance research at every university. Staffing (scholars / slots) scales the
// rate. On completion the tech is recorded on the city and the derived tech
// caches are rebuilt so production picks up any speed effects immediately.
export function UpdateUniversity(city: City) {
    if (!city.unlocked_techs) city.unlocked_techs = []
    for (const t of (city.universities ?? [])) {
        const univ = t.building!.university!
        if (!univ.selected_tech) continue
        if (city.unlocked_techs.includes(univ.selected_tech)) {
            univ.selected_tech = undefined
            univ.progress = 0
            continue
        }
        const project = ALL_RESEARCH.find(p => p.tech === univ.selected_tech)
        if (!project || univ.scholars <= 0) continue
        univ.progress += (univ.scholars / univ.scholar_slots) * (100 / project.research_time)
        if (univ.progress >= 100) {
            city.unlocked_techs.push(univ.selected_tech)
            RebuildTechCaches(city)
            univ.progress = 0
            univ.selected_tech = undefined
        }
    }
}
