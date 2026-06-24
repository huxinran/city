import { Storage, Item } from "./storage"
import { Tile } from "./tile"
import { TakeItems } from "./utils"
import { Resource, HouseType, Resident, ProductionStatus, ServiceType, ShippingTaskType, BuildingType, ShipType, CityName, Terrain, Feature } from "./types"


// --- Building footprints (how many tiles a building occupies, size x size) ---
// Roads, houses and service buildings are 1x1.
const SMALL_BUILDINGS = new Set<BuildingType>([
    BuildingType.ROAD, BuildingType.HOUSE,
    BuildingType.WELL, BuildingType.FIRE_STATION, BuildingType.POLICE_STATION,
    BuildingType.SCHOOL, BuildingType.SHIPYARD, BuildingType.DOCK,
    BuildingType.FISHERY,
    BuildingType.MARKETPLACE, BuildingType.TAVERN, BuildingType.CHAPEL,
    BuildingType.CLINIC, BuildingType.COURTHOUSE, BuildingType.ENGINEER_STATION,
    BuildingType.WHALING_POST,
])
const MEDIUM_BUILDINGS = new Set<BuildingType>([
    BuildingType.WAREHOUSE,
    BuildingType.UNIVERSITY,
    // Extraction / production (2x2 factories)
    BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT,
    BuildingType.SAND_PIT, BuildingType.COAL_KILN, BuildingType.IRON_MINE,
    BuildingType.GOLD_MINE, BuildingType.GEM_MINE, BuildingType.SALTERN,
    // Workshops are 2x2
    BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY,
    BuildingType.CIDERY, BuildingType.PANT_SHOP, BuildingType.SHIRT_SHOP, BuildingType.BOOT_SHOP, BuildingType.CIGAR_FACTORY,
    BuildingType.CREAMERY, BuildingType.POTTERY_SHOP, BuildingType.BRANDY_DISTILLERY,
    BuildingType.CANDLE_Manufactory, BuildingType.GLASSWORK, BuildingType.STEELWORK,
    BuildingType.SAWMILL, BuildingType.BRICKYARY, BuildingType.MASON_SHOP,
    BuildingType.CANNERY, BuildingType.FORGE, BuildingType.GOLDSMITH,
    BuildingType.TOOLSMITH, BuildingType.JEWELER, BuildingType.CARPENTER_SHOP,
    BuildingType.WINERY, BuildingType.OIL_PRESS, BuildingType.RUM_DISTILLERY,
    BuildingType.CONCRETE_PLANT, BuildingType.SCULPTOR, BuildingType.GLAZIER,
    // Jinlin workshops
    BuildingType.TOFU_SHOP, BuildingType.KILN, BuildingType.NOODLE_SHOP,
    // Columbia workshops
    BuildingType.CORN_MILL, BuildingType.TANNERY, BuildingType.DENIM_MILL,
    BuildingType.WHISKEY_DISTILLERY, BuildingType.RAIL_MILL,
    // Solara workshops
    BuildingType.PALM_OIL_PRESS, BuildingType.COCOA_SHOP,
    BuildingType.COPPER_MINE, BuildingType.BRONZE_FOUNDRY,
    // Mintaka workshops
    BuildingType.FUR_WORKSHOP, BuildingType.SMOKEHOUSE,
    BuildingType.BLUBBER_PRESS, BuildingType.AMBER_MINE,
])

export const WORKSHOP_BUILDINGS = new Set<BuildingType>([
    // Extraction factories
    BuildingType.FISHERY,
    BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT,
    BuildingType.SAND_PIT, BuildingType.COAL_KILN, BuildingType.IRON_MINE,
    BuildingType.GOLD_MINE, BuildingType.GEM_MINE, BuildingType.SALTERN,
    // Processing workshops
    BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY,
    BuildingType.CIDERY, BuildingType.PANT_SHOP, BuildingType.SHIRT_SHOP, BuildingType.BOOT_SHOP, BuildingType.CIGAR_FACTORY,
    BuildingType.CREAMERY, BuildingType.POTTERY_SHOP, BuildingType.BRANDY_DISTILLERY,
    BuildingType.CANDLE_Manufactory, BuildingType.GLASSWORK, BuildingType.STEELWORK,
    BuildingType.SAWMILL, BuildingType.BRICKYARY, BuildingType.MASON_SHOP,
    BuildingType.CANNERY, BuildingType.FORGE, BuildingType.GOLDSMITH,
    BuildingType.TOOLSMITH, BuildingType.JEWELER, BuildingType.CARPENTER_SHOP,
    BuildingType.WINERY, BuildingType.OIL_PRESS, BuildingType.RUM_DISTILLERY,
    BuildingType.CONCRETE_PLANT, BuildingType.SCULPTOR, BuildingType.GLAZIER,
    // Jinlin
    BuildingType.TOFU_SHOP, BuildingType.KILN, BuildingType.NOODLE_SHOP,
    // Columbia
    BuildingType.CORN_MILL, BuildingType.TANNERY, BuildingType.DENIM_MILL,
    BuildingType.WHISKEY_DISTILLERY, BuildingType.RAIL_MILL,
    // Solara
    BuildingType.PALM_OIL_PRESS, BuildingType.COCOA_SHOP,
    BuildingType.COPPER_MINE, BuildingType.BRONZE_FOUNDRY,
    // Mintaka
    BuildingType.WHALING_POST, BuildingType.FUR_WORKSHOP, BuildingType.SMOKEHOUSE,
    BuildingType.BLUBBER_PRESS, BuildingType.AMBER_MINE,
])

export function IsWorkshopBuilding(type: BuildingType): boolean {
    return WORKSHOP_BUILDINGS.has(type)
}

// Roads/houses/services are 1x1, workshops are 2x2, farms are 3x3.
export function GetBuildingSize(type: BuildingType): number {
    if (SMALL_BUILDINGS.has(type)) return 1
    if (MEDIUM_BUILDINGS.has(type)) return 2
    return 3
}

// Gold charged (in addition to materials) to construct each building.
export function GetBuildingGoldCost(type: BuildingType): number {
    switch (type) {
        case BuildingType.DELETE:         return 0
        case BuildingType.ROAD:           return 2
        case BuildingType.HOUSE:          return 20
        case BuildingType.WELL:           return 80
        case BuildingType.FIRE_STATION:   return 120
        case BuildingType.POLICE_STATION: return 120
        case BuildingType.SCHOOL:         return 200
        case BuildingType.MARKETPLACE:    return 120
        case BuildingType.TAVERN:         return 150
        case BuildingType.CHAPEL:         return 250
        case BuildingType.CLINIC:         return 150
        case BuildingType.COURTHOUSE:     return 200
        case BuildingType.ENGINEER_STATION: return 200
        case BuildingType.WAREHOUSE:      return 150
        case BuildingType.DOCK:           return 200
        case BuildingType.SHIPYARD:       return 300
    }
    if (FARM_BUILDINGS.has(type)) return 100
    if (WORKSHOP_BUILDINGS.has(type)) return 150
    return 100
}

// --- Build palette ordering by upgrade path -----------------------------------
// A building is grouped under the population tier its OUTPUT serves: the earliest
// tier whose needs (ongoing consumption or upgrade basket) include that product.
// Service buildings are grouped by the tier that first requires the service.
// Buildings whose output isn't a direct house need (raw materials, intermediate
// goods, ship/port) return undefined and fall into an "Other" bucket.

const SERVICE_UNLOCK_TIER: { [key in ServiceType]: number } = {
    [ServiceType.WATER]:  1,
    [ServiceType.MARKET]: 2,
    [ServiceType.FIRE]:   3,
    [ServiceType.POLICE]: 3,
    [ServiceType.SCHOOL]: 4,
    [ServiceType.TAVERN]: 5,
    [ServiceType.CHURCH]: 6,
    [ServiceType.HEALTH]:  3,
    [ServiceType.JUSTICE]: 4,
    [ServiceType.ENGINEER]: 5,
}

// Resource -> earliest tier that requires it. Seeded from the needs/upgrade
// tables, then propagated backward through every recipe so that an ingredient is
// always available no later than the product it feeds — e.g. wool inherits the
// tier of pant, wheat inherits flour's (which inherits bread's). Lazily built.
let _resourceTier: { [key: string]: number } | undefined
function resourceTierMap(): { [key: string]: number } {
    if (_resourceTier) return _resourceTier
    let tier: { [key: string]: number } = {}
    // Seed from Anrelia (6 tiers) and all themed cities (3 tiers each).
    const citySeeds: (CityName | undefined)[] = [
        undefined, CityName.JINLIN, CityName.COLUMBIA, CityName.SOLARA, CityName.MINTAKA,
    ]
    for (let cityType of citySeeds) {
        let maxTier = GetCityMaxTier(cityType)
        for (let t = 1; t <= maxTier; t++) {
            let resources = [
                ...GetResourceNeed(t, cityType).map(n => n.type),
                ...GetUpgradeItems(t, cityType).map(i => i.type),
            ]
            for (let r of resources) {
                if (!(r in tier) || t < tier[r]) tier[r] = t
            }
        }
    }
    // Collect every production recipe (ingredient list -> product list).
    let recipes: { ingredients: string[], products: string[] }[] = []
    for (let type of Object.values(BuildingType)) {
        let b = MakeBuilding(type as BuildingType)
        if (b?.production) {
            recipes.push({
                ingredients: [
                    ...b.production.ingredient.map(i => i.type),
                    ...(b.production.extra_sources ?? []).filter(es => es.required).map(es => es.resource),
                ],
                products: b.production.product.map(p => p.type),
            })
        }
    }
    // Propagate to a fixpoint: each ingredient's tier is pulled down to the
    // earliest tier of any product that consumes it (multi-step chains settle).
    let changed = true
    while (changed) {
        changed = false
        for (let r of recipes) {
            let productTier = Math.min(...r.products.map(p => tier[p] ?? Infinity))
            if (productTier === Infinity) continue
            for (let ing of r.ingredients) {
                if (productTier < (tier[ing] ?? Infinity)) {
                    tier[ing] = productTier
                    changed = true
                }
            }
        }
    }
    _resourceTier = tier
    return _resourceTier
}

// Palette grouping overrides: a few buildings are surfaced under an earlier
// tier than their output resource would imply, so the basic materials show up
// where the player first needs them. (Wood + timber sit with the Farmer tier.)
const BUILDING_TIER_OVERRIDE: { [key: string]: number } = {
    [BuildingType.LUMBER_HUT]: 1,   // wood   (Farmer)
    [BuildingType.SAWMILL]:    1,   // timber (Farmer)
    [BuildingType.BRICKYARY]:  2,   // brick  (Worker; brick itself is a tier-3 build good)
    [BuildingType.FIRE_STATION]: 2, // fire service (Worker; default service-unlock tier is 3)
    [BuildingType.MARKETPLACE]: 1,  // market service (Farmer; default service-unlock tier is 2)
    [BuildingType.COTTON_FIELD]: 2, // cotton (Worker)
    [BuildingType.SHIRT_SHOP]:  2,  // shirt  (Worker)
    [BuildingType.CLINIC]:      2,  // health service (Worker; default service-unlock tier is 3)
    [BuildingType.COAL_KILN]:   2,  // coal (Worker; coal feeds tier-3 build goods)
    [BuildingType.SCHOOL]:      3,  // school service (Artisan; default service-unlock tier is 4)
    [BuildingType.OLIVE_GROVE]: 3,  // olive (Artisan; oil is a tier-6 luxury good)
    [BuildingType.OIL_PRESS]:   3,  // oil   (Artisan)
    [BuildingType.TRAPLINE]:    3,  // fur  (Artisan)
    [BuildingType.BOOT_SHOP]:   3,  // boot (Artisan)
    [BuildingType.ENGINEER_STATION]: 3, // engineering service (Artisan; default service-unlock tier is 5)
    [BuildingType.TOOLSMITH]:   3,  // tool (Artisan; refined iron goods, feeds the statue chain)
    [BuildingType.WHEAT_FARM]: 3,   // wheat  (Artisan; bread is a tier-2 upgrade good, which would pull the chain to Worker)
    [BuildingType.WIND_MILL]:  3,   // flour  (Artisan)
    [BuildingType.BAKERY]:     3,   // bread  (Artisan)
    [BuildingType.IRON_MINE]:  3,   // iron ore   (Artisan; steel is a tier-4 build good, which would pull the chain to Scholar)
    [BuildingType.FORGE]:      3,   // iron ingot (Artisan)
    [BuildingType.STEELWORK]:  3,   // steel      (Artisan)
    // --- Jinlin buildings ---
    [BuildingType.TEA_GARDEN]:  1,  // tea garden produces basic resource
    [BuildingType.SILK_FARM]:   1,  // silk farm produces basic material
    [BuildingType.TOFU_SHOP]:   1,  // tofu is a tier-1 food need in Jinlin
    [BuildingType.KILN]:        2,  // porcelain is tier-2 daily need in Jinlin
    [BuildingType.NOODLE_SHOP]: 2,  // noodles are tier-2 food in Jinlin
    // --- Columbia buildings ---
    [BuildingType.CATTLE_RANCH]:      1,  // beef is the basic food source
    [BuildingType.CORN_MILL]:         1,  // cornbread is tier-1 food in Columbia
    [BuildingType.TANNERY]:           1,  // leather is tier-1 daily need
    [BuildingType.DENIM_MILL]:        2,  // denim is tier-2 daily need
    [BuildingType.WHISKEY_DISTILLERY]:2,  // whiskey is tier-2 luxury
    [BuildingType.RAIL_MILL]:         3,  // rail is tier-3 industrial good
    // --- Solara buildings ---
    [BuildingType.PALM_GROVE]:      1,  // palm fruit is raw material
    [BuildingType.PALM_OIL_PRESS]:  1,  // palm oil is tier-1 daily need
    [BuildingType.COCOA_SHOP]:      2,  // cocoa drink is tier-2 food
    [BuildingType.COPPER_MINE]:     2,  // copper feeds bronze (tier-2 daily)
    [BuildingType.BRONZE_FOUNDRY]:  2,  // bronze is tier-2 daily need
    [BuildingType.INCENSE_GROVE]:   2,  // incense is tier-2 luxury
    [BuildingType.IVORY_CAMP]:      3,  // ivory is a tier-3 luxury good
    // --- Mintaka buildings ---
    [BuildingType.REINDEER_FARM]:   2,  // reindeer meat is tier-2 food
    [BuildingType.FUR_WORKSHOP]:    1,  // fur coat is tier-1 daily need
    [BuildingType.SMOKEHOUSE]:      1,  // smoked fish is tier-1 food
    [BuildingType.WHALING_POST]:    2,  // blubber feeds whale oil (tier-2)
    [BuildingType.BLUBBER_PRESS]:   2,  // whale oil is tier-2 daily need
    [BuildingType.AMBER_MINE]:      3,  // amber is a tier-3 luxury good
    // --- Shared utility ---
    [BuildingType.COMPOST_PIT]: 1,      // fertilizer boosts tier-1+ farms
    [BuildingType.UNIVERSITY]:  4,      // unlocks after Scholars (tier 4)
}

export function GetBuildingTier(type: BuildingType): number | undefined {
    if (type in BUILDING_TIER_OVERRIDE) return BUILDING_TIER_OVERRIDE[type]
    let b = MakeBuilding(type)
    if (!b) return undefined
    if (b.service) return SERVICE_UNLOCK_TIER[b.service.need_provided]
    if (b.production) {
        let map = resourceTierMap()
        let tiers = b.production.product
            .map(p => map[p.type])
            .filter((t): t is number => t !== undefined)
        if (tiers.length) return Math.min(...tiers)
    }
    return undefined
}

// Farm-type buildings get a special "farmhouse + produce" map rendering.
export const FARM_BUILDINGS = new Set<BuildingType>([
    BuildingType.WHEAT_FARM, BuildingType.RICE_PADDY,
    BuildingType.APPLE_ORCHARD, BuildingType.ORANGE_ORCHARD,
    BuildingType.CABBAGE_PATCH, BuildingType.PIG_FARM,
    BuildingType.DIARY_FARM, BuildingType.SHEEP_FARM,
    BuildingType.POTATO_FARM, BuildingType.MELON_GARDEN,
    BuildingType.TOMATO_FIELD, BuildingType.CHICKEN_COOP,
    BuildingType.CORN_FIELD, BuildingType.BANANA_PLANTATION,
    BuildingType.ONION_FIELD, BuildingType.VINEYARD,
    BuildingType.OLIVE_GROVE, BuildingType.PUMPKIN_PATCH,
    BuildingType.SOYBEAN_FARM, BuildingType.COCOA_PLANT,
    BuildingType.SUGAR_CANE_PLANTATION, BuildingType.TOBACCO_PLANTATION,
    BuildingType.COTTON_FIELD, BuildingType.RUBBER_PLANTATION,
    BuildingType.BERRY_GROVE, BuildingType.APIARY,
    BuildingType.TRAPLINE,
    // Jinlin farms
    BuildingType.TEA_GARDEN, BuildingType.SILK_FARM,
    // Columbia farms
    BuildingType.CATTLE_RANCH,
    // Solara farms
    BuildingType.PALM_GROVE, BuildingType.INCENSE_GROVE, BuildingType.IVORY_CAMP,
    // Mintaka farms
    BuildingType.REINDEER_FARM,
    // Shared utility
    BuildingType.COMPOST_PIT,
])

export function IsFarmBuilding(type: BuildingType): boolean {
    return FARM_BUILDINGS.has(type)
}

export const ANIMAL_FARM_BUILDINGS = new Set<BuildingType>([
    BuildingType.PIG_FARM, BuildingType.DIARY_FARM,
    BuildingType.SHEEP_FARM, BuildingType.CHICKEN_COOP,
])

export function IsAnimalFarm(type: BuildingType): boolean {
    return ANIMAL_FARM_BUILDINGS.has(type)
}

// Raw resource extraction buildings that use the mine-camp art as background.
export const MINE_CAMP_BUILDINGS = new Set<BuildingType>([
    BuildingType.LUMBER_HUT,
    BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT,
    BuildingType.COAL_KILN, BuildingType.IRON_MINE, BuildingType.GOLD_MINE,
    BuildingType.GEM_MINE, BuildingType.SALTERN,
    // Solara / Mintaka extraction
    BuildingType.COPPER_MINE, BuildingType.AMBER_MINE,
])

export function IsMineCampBuilding(type: BuildingType): boolean {
    return MINE_CAMP_BUILDINGS.has(type)
}

// --- Terrain requirements: where each building may be placed ---
// Water buildings need water. Mines need a rock outcrop nearby, lumber/foraging
// need trees nearby, and the sand pit needs a sand tile nearby — see
// GetRequiredNearbyFeature / GetRequiredNearbyTerrain. All of those still sit on
// open land themselves.
const SEA_BUILDINGS = new Set<BuildingType>([
    BuildingType.FISHERY,
    BuildingType.DOCK,
    BuildingType.SHIPYARD,
    BuildingType.SALTERN,
    BuildingType.WHALING_POST,
])
const ROCK_BUILDINGS = new Set<BuildingType>([
    BuildingType.STONE_QUARRY,
    BuildingType.CLAY_PIT,
    BuildingType.COAL_KILN,
    BuildingType.GEM_MINE,
    BuildingType.GOLD_MINE,
    BuildingType.IRON_MINE,
    BuildingType.COPPER_MINE,
    BuildingType.AMBER_MINE,
])
const TREE_BUILDINGS = new Set<BuildingType>([
    BuildingType.LUMBER_HUT,
    BuildingType.TRAPLINE,
    BuildingType.BERRY_GROVE,
    BuildingType.APIARY,
    BuildingType.INCENSE_GROVE,
    BuildingType.IVORY_CAMP,
])

const LAND_TERRAINS = [Terrain.GRASS, Terrain.SAND, Terrain.DIRT]

export function GetRequiredTerrains(type: BuildingType): Terrain[] {
    if (SEA_BUILDINGS.has(type)) return [Terrain.WATER]
    return LAND_TERRAINS
}

// Whether a tile's natural feature allows this building to sit on it. Every
// building must be placed on open land (no tree/rock on the tile itself);
// only roads and houses ignore features. Resource buildings additionally need
// a feature *nearby* — see GetRequiredNearbyFeature.
export function FeatureMatches(type: BuildingType, feature?: Feature): boolean {
    return feature == undefined
}

// The feature that must exist on a tile near (not under) this building: rock for
// mines, trees for lumber/foraging. Undefined for buildings with no such need.
export function GetRequiredNearbyFeature(type: BuildingType): Feature | undefined {
    if (ROCK_BUILDINGS.has(type)) return Feature.ROCK
    if (TREE_BUILDINGS.has(type)) return Feature.TREE
    return undefined
}

// The terrain that must exist on a tile near this building: the sand pit digs
// from a nearby sand deposit while sitting on solid ground.
export function GetRequiredNearbyTerrain(type: BuildingType): Terrain | undefined {
    if (type == BuildingType.SAND_PIT) return Terrain.SAND
    return undefined
}

// Houses and production buildings must be built touching a road (carts only
// travel on roads). Roads, services and port buildings have no such need.
const NO_ROAD_BUILDINGS = new Set<BuildingType>([
    BuildingType.ROAD,
    BuildingType.WELL,
    BuildingType.FIRE_STATION,
    BuildingType.POLICE_STATION,
    BuildingType.SCHOOL,
    BuildingType.WAREHOUSE,
    BuildingType.SHIPYARD,
    BuildingType.DOCK,
    BuildingType.MARKETPLACE,
    BuildingType.TAVERN,
    BuildingType.CHAPEL,
    BuildingType.CLINIC,
    BuildingType.COURTHOUSE,
    BuildingType.ENGINEER_STATION,
    BuildingType.DELETE,
])

export function RequiresRoad(type: BuildingType): boolean {
    return !NO_ROAD_BUILDINGS.has(type)
}

// Emoji shown for each building on the map and in the build palette.
export const BUILDING_ICONS: { [key: string]: string } = {
    // Farms — use the crop/animal so you know at a glance what it produces
    [BuildingType.WHEAT_FARM]: '🌾',  [BuildingType.RICE_PADDY]: '🍚',
    [BuildingType.APPLE_ORCHARD]: '🍎', [BuildingType.ORANGE_ORCHARD]: '🍊',
    [BuildingType.CABBAGE_PATCH]: '🥬', [BuildingType.PIG_FARM]: '🐷',
    [BuildingType.DIARY_FARM]: '🐄',  [BuildingType.SHEEP_FARM]: '🐑',
    [BuildingType.FISHERY]: '🎣',     [BuildingType.POTATO_FARM]: '🥔',
    [BuildingType.MELON_GARDEN]: '🍉', [BuildingType.TOMATO_FIELD]: '🍅',
    [BuildingType.CHICKEN_COOP]: '🐓', [BuildingType.CORN_FIELD]: '🌽',
    [BuildingType.BANANA_PLANTATION]: '🍌', [BuildingType.ONION_FIELD]: '🧅',
    [BuildingType.BERRY_GROVE]: '🍓', [BuildingType.VINEYARD]: '🍇',
    [BuildingType.OLIVE_GROVE]: '🫒', [BuildingType.PUMPKIN_PATCH]: '🎃',
    [BuildingType.SOYBEAN_FARM]: '🫘', [BuildingType.COCOA_PLANT]: '🍫',
    [BuildingType.SUGAR_CANE_PLANTATION]: '🍬', [BuildingType.TOBACCO_PLANTATION]: '🌿',
    [BuildingType.COTTON_FIELD]: '🪡', [BuildingType.RUBBER_PLANTATION]: '🌴',
    [BuildingType.TRAPLINE]: '🦊',    [BuildingType.APIARY]: '🍯',
    // Raw extraction — each material gets its own distinct icon
    [BuildingType.LUMBER_HUT]: '🪵',  [BuildingType.STONE_QUARRY]: '🪨',
    [BuildingType.CLAY_PIT]: '🟤',   [BuildingType.SAND_PIT]: '🏜️',
    [BuildingType.COAL_KILN]: '🏭',  [BuildingType.IRON_MINE]: '⛏️',
    [BuildingType.GOLD_MINE]: '🪙',  [BuildingType.GEM_MINE]: '💎',
    [BuildingType.SALTERN]: '🧂',
    // Workshops — process/tool icon (what happens inside); product shown separately
    [BuildingType.WIND_MILL]: '🌀',   [BuildingType.BAKERY]: '🫕',
    [BuildingType.BUTCHERY]: '🔪',   [BuildingType.CIDERY]: '🍶',
    [BuildingType.PANT_SHOP]: '🧵', [BuildingType.CIGAR_FACTORY]: '🍃',
    [BuildingType.CREAMERY]: '🥛',   [BuildingType.POTTERY_SHOP]: '🤲',
    [BuildingType.BRANDY_DISTILLERY]: '🧪', [BuildingType.CANDLE_Manufactory]: '🪔',
    [BuildingType.GLASSWORK]: '🫧',  [BuildingType.STEELWORK]: '⚒️',
    [BuildingType.SAWMILL]: '🪚',    [BuildingType.BRICKYARY]: '🏭',
    [BuildingType.MASON_SHOP]: '🏛️', [BuildingType.CANNERY]: '🍎',
    [BuildingType.FORGE]: '🔥',      [BuildingType.GOLDSMITH]: '🔆',
    [BuildingType.TOOLSMITH]: '🔧',  [BuildingType.JEWELER]: '💎',
    [BuildingType.CARPENTER_SHOP]: '🪓',
    [BuildingType.WINERY]: '🍇',     [BuildingType.OIL_PRESS]: '🫒',
    [BuildingType.RUM_DISTILLERY]: '🍬',
    [BuildingType.CONCRETE_PLANT]: '🏗️', [BuildingType.SCULPTOR]: '🗿',
    [BuildingType.GLAZIER]: '🪟',
    // Infrastructure — old-era flavored
    [BuildingType.HOUSE]: '🏠',      [BuildingType.WELL]: '🪣',
    [BuildingType.FIRE_STATION]: '🔔', [BuildingType.POLICE_STATION]: '⚖️',
    [BuildingType.SCHOOL]: '📜',     [BuildingType.WAREHOUSE]: '📦',
    [BuildingType.MARKETPLACE]: '🏪', [BuildingType.TAVERN]: '🍺',
    [BuildingType.CHAPEL]: '⛪',
    [BuildingType.CLINIC]: '🏥', [BuildingType.COURTHOUSE]: '⚖️', [BuildingType.ENGINEER_STATION]: '🔧',
    [BuildingType.SHIRT_SHOP]: '👕', [BuildingType.BOOT_SHOP]: '👢',
    [BuildingType.SHIPYARD]: '⚓',   [BuildingType.DOCK]: '⛵',
    [BuildingType.ROAD]: '🛣️',
    [BuildingType.DELETE]: '🗑️',
    // Jinlin (East Asian) buildings
    [BuildingType.TEA_GARDEN]: '🍵',   [BuildingType.SILK_FARM]: '🪺',
    [BuildingType.TOFU_SHOP]: '🫘',    [BuildingType.KILN]: '🏺',
    [BuildingType.NOODLE_SHOP]: '🍜',
    // Columbia (American frontier) buildings
    [BuildingType.CATTLE_RANCH]: '🐄',  [BuildingType.CORN_MILL]: '🌽',
    [BuildingType.TANNERY]: '🥩',       [BuildingType.DENIM_MILL]: '🧵',
    [BuildingType.WHISKEY_DISTILLERY]: '🥃', [BuildingType.RAIL_MILL]: '🛤️',
    // Solara (African / tropical) buildings
    [BuildingType.PALM_GROVE]: '🌴',    [BuildingType.PALM_OIL_PRESS]: '🫗',
    [BuildingType.COCOA_SHOP]: '🍫',    [BuildingType.COPPER_MINE]: '🪨',
    [BuildingType.BRONZE_FOUNDRY]: '🔶', [BuildingType.INCENSE_GROVE]: '🌿',
    [BuildingType.IVORY_CAMP]: '🐘',
    // Mintaka (polar) buildings
    [BuildingType.REINDEER_FARM]: '🦌',  [BuildingType.FUR_WORKSHOP]: '🧥',
    [BuildingType.SMOKEHOUSE]: '🐟',     [BuildingType.WHALING_POST]: '🐋',
    [BuildingType.BLUBBER_PRESS]: '🛢️',  [BuildingType.AMBER_MINE]: '🟡',
    // Shared utility
    [BuildingType.COMPOST_PIT]: '🌱',
    [BuildingType.UNIVERSITY]:  '🎓',
}

export function GetBuildingIcon(type: BuildingType): string {
    return BUILDING_ICONS[type] ?? '🏗️'
}

// Output-product icon for each workshop building, shown alongside the process icon.
const WORKSHOP_PRODUCT_ICONS: { [key: string]: string } = {
    [BuildingType.WIND_MILL]: '🥣',
    [BuildingType.BAKERY]: '🥖',
    [BuildingType.BUTCHERY]: '🌭',
    [BuildingType.CIDERY]: '🍺',
    [BuildingType.PANT_SHOP]: '👖',
    [BuildingType.CIGAR_FACTORY]: '🚬',
    [BuildingType.CREAMERY]: '🧀',
    [BuildingType.POTTERY_SHOP]: '🏺',
    [BuildingType.BRANDY_DISTILLERY]: '🍾',
    [BuildingType.CANDLE_Manufactory]: '🕯️',
    [BuildingType.GLASSWORK]: '🪟',
    [BuildingType.STEELWORK]: '⚙️',
    [BuildingType.SAWMILL]: '🪵',
    [BuildingType.BRICKYARY]: '🧱',
    [BuildingType.MASON_SHOP]: '🪨',
    [BuildingType.CANNERY]: '🫙',
    [BuildingType.FORGE]: '🔩',
    [BuildingType.GOLDSMITH]: '🪙',
    [BuildingType.TOOLSMITH]: '⚒️',
    [BuildingType.JEWELER]: '💍',
    [BuildingType.CARPENTER_SHOP]: '🪑',
    [BuildingType.WINERY]: '🍷',
    [BuildingType.OIL_PRESS]: '🫗',
    [BuildingType.RUM_DISTILLERY]: '🥃',
    [BuildingType.CONCRETE_PLANT]: '🧱',
    [BuildingType.SCULPTOR]: '🗿',
    [BuildingType.GLAZIER]: '🪟',
}

export function GetWorkshopProductIcon(type: BuildingType): string {
    return WORKSHOP_PRODUCT_ICONS[type] ?? ''
}


export class Building {
    constructor(
        public type: BuildingType,
        public material: Item[] = [],
        public house?: House,
        public production?: Production,
        public service?: Service,
        public warehouse?: Warehouse,
        public shipyard?: Shipyard,
        public dock?: Dock,
        public university?: University,
    ) {}
}


export function RefreshHouse(house: House) {
    house.max_occupant = house.tier * 10
    house.resident_type = GetResidentType(house.tier)
    house.type = GetHouseType(house.tier)
    house.current_max_occupant = GetCurrentMaxOccupant(house.tier, house.happiness)
    house.resource_needs = GetResourceNeed(house.tier, house.city_type)
    house.service_needs = GetServiceNeed(house.tier, house.city_type)
}


export class House {
    constructor(
        public tier: number = 1,
        public happiness: number = 0,
        public occupant: number = 0,
        public type: HouseType = GetHouseType(tier),
        public current_max_occupant: number = GetCurrentMaxOccupant(tier, happiness),
        public max_occupant: number = 10,
        public resource_needs: ResourceNeed[] = GetResourceNeed(tier),
        public service_needs: ServiceNeed[] = GetServiceNeed(tier),
        public resident_type: Resident = Resident.FARMER,
        public storage: Storage = new Storage(),
        public city_type: CityName = CityName.ANRELIA,
    ) {
        RefreshHouse(this)
    }
}

export class Ship {
    constructor(
        public type: ShipType,
        public max_cargo: number,
        public speed: number,
        public cargo: Storage = new Storage, 
        public status: ShippingTaskType = ShippingTaskType.READY,
    ) {}
}

export class ShipBlueprint {
    constructor(
        public type: ShipType, 
        public speed: number, 
        public max_cargo: number, 
        public cost: Item[], 
        public build_time: number,
    ) {}
}


export class Shipyard {
    constructor(
        public tier: number = 1,
        public status: ProductionStatus = ProductionStatus.READY,
        public progress: number = 0.0,
        public blueprints: ShipBlueprint[] = [],
        public selected?: ShipBlueprint,
        public storage: Storage = new Storage(),
    ) {
        this.blueprints = [new ShipBlueprint(ShipType.CARGO, 1.5, 100, [new Item(Resource.WOOD, 10)], 60), new ShipBlueprint(ShipType.CLIPPER, 2.0, 60, [new Item(Resource.WOOD, 10)], 90), new ShipBlueprint(ShipType.GRAND, 1.0, 300, [new Item(Resource.WOOD, 10)], 120)]
    }
}

export class Route {
    constructor(
        public from: CityName,
        public to: CityName,
        public resource: Resource,
        public amount: number,
        public ship?: Ship,
        public progress: number = 0.0
    ){}
}

export class Dock {
    constructor(
        public tier: number = 1,
        public from?: CityName,
        public to?: CityName,
        public resource?: Resource,
        public num : number = 0,
    ) {}
}



// Technologies researched at the University that unlock or improve buildings.
export enum Technology {
    FERTILIZER_APPLICATION = "Fertilizer Application",
    CROP_ROTATION = "Crop Rotation",
    ADVANCED_MINING = "Advanced Mining",
}

export class ResearchProject {
    constructor(
        public tech: Technology,
        public name: string,
        public description: string,
        public research_time: number,  // ticks at full staffing to complete
        public gold_cost: number,
    ) {}
}

export const ALL_RESEARCH: ResearchProject[] = [
    new ResearchProject(
        Technology.FERTILIZER_APPLICATION,
        "Fertilizer Application",
        "Farms can use fertilizer for a 1.5× speed boost when stockpiled.",
        400, 300,
    ),
    new ResearchProject(
        Technology.CROP_ROTATION,
        "Crop Rotation",
        "All farms produce 30% faster permanently.",
        600, 500,
    ),
    new ResearchProject(
        Technology.ADVANCED_MINING,
        "Advanced Mining",
        "All extraction buildings operate 30% faster.",
        500, 400,
    ),
]

export class University {
    constructor(
        public scholar_slots: number = 10,
        public scholars: number = 0,
        public selected_tech?: Technology,
        public progress: number = 0,
    ) {}
}

// An extra resource consumed by a production building each cycle.
// Required extras block production until the building's local stockpile
// has enough.  Optional extras are consumed when available and multiply
// the production speed by speed_multiplier for that cycle.
// required_tech: if set, this extra source is only active after that tech is researched.
export class ExtraSource {
    constructor(
        public resource: Resource,
        public amount: number,
        public required: boolean,
        public speed_multiplier: number = 1.5,
        public max_stockpile: number = 5,
        public required_tech?: Technology,
    ) {}
}

export class Production {
    constructor(
        public worker_needed: number,
        public worker_type: Resident,
        public full_efficiency: number,
        public ingredient: Item[],
        public product: Item[],
        public worker: number = 0,
        public progress: number = 0,
        public storage: Storage = new Storage(),
        public status: ProductionStatus = ProductionStatus.READY,
        public extra_sources: ExtraSource[] = [],
        public boost_multiplier: number = 1.0,
        public stocking_in_progress: boolean = false,
    ) {}
}

export class Service {
    constructor(
        public need_provided : ServiceType,
        public radius: number 
    ) {}
}


export class ServiceNeed {
    constructor(
        public type: ServiceType,
        public satisfied : boolean = false
    ) {}
}

export class ResourceNeed {
    constructor(
        public type: Resource,
        public satisfied : boolean = false
    ) {}
}

export class Cart {
    constructor(
        public speed: number,
        public task?: ShippingTask,
    ) {}
}

export class ShippingTask {
    constructor(
        public type: ShippingTaskType,
        public dst: Tile,
        public cargo: Item[],
        public distance: number = 0,
        public progress: number = 0,
        // The road path the assigned cart follows, warehouse -> destination,
        // as tile coordinates (used to draw the cart moving along the road).
        public path: { i: number, j: number }[] = [],
    ) {}

}

function GetNumOfCarts(tier: number) {
    if (tier == 1) {
        return 4
    } else if (tier == 2) {
        return 6
    } else {
        return 8
    }
}

// Tiles travelled per tick. Kept well below 1 so carts step a fraction of a
// tile each tick — slower journeys and smooth, granular motion between tiles.
function GetCartSpeed(tier: number) {
    if (tier == 1) {
        return 0.3
    } else if (tier == 2) {
        return 0.45
    } else {
        return 0.6
    }
}

export function RefreshWarehouse(warehouse: Warehouse) {
    warehouse.num_carts = GetNumOfCarts(warehouse.tier)
    warehouse.cart_speed = GetCartSpeed(warehouse.tier)
    for (let i = warehouse.carts.length; i < warehouse.num_carts; ++i) {
        warehouse.carts.push(new Cart(1))
    }
    for (let cart of warehouse.carts) {
        cart.speed = warehouse.cart_speed
    }
}


export class Warehouse {
    constructor(
        public tier: number = 1,
        public num_carts: number = GetNumOfCarts(tier),
        public cart_speed: number = GetCartSpeed(tier),
        public carts : Cart[] = []
    ) {
        RefreshWarehouse(this)
    }
}

// Gold collected from one resident per tick at full (100%) tax, by tier.
// Wealthier residents are taxed more heavily than farmers.
export function GetTaxPerResident(tier: Resident): number {
    switch (tier) {
        case Resident.FARMER:       return 0.002
        case Resident.WORKER:       return 0.004
        case Resident.ARTISAN:      return 0.007
        case Resident.SCHOLAR:      return 0.011
        case Resident.ENTREPRENEUR: return 0.016
        case Resident.MAGNATE:      return 0.022
        default:                    return 0.002
    }
}

// Emoji shown for each resident tier (in place of the tier name).
const RESIDENT_ICONS: { [key: string]: string } = {
    [Resident.FARMER]:       '🧑‍🌾',
    [Resident.WORKER]:       '👷',
    [Resident.ARTISAN]:      '🧑‍🎨',
    [Resident.SCHOLAR]:      '🧑‍🎓',
    [Resident.ENTREPRENEUR]: '🧑‍💼',
    [Resident.MAGNATE]:      '🫅',
}

export function GetResidentIcon(tier: Resident): string {
    return RESIDENT_ICONS[tier] ?? '🧑'
}

const RESIDENT_ICON_ASSETS: { [key: string]: string } = {
    [Resident.FARMER]:       'assets/used/population/busts/farmer-bust.png',
    [Resident.WORKER]:       'assets/used/population/busts/worker-bust.png',
    [Resident.ARTISAN]:      'assets/used/population/busts/artisan-bust.png',
    [Resident.SCHOLAR]:      'assets/used/population/busts/scholar-bust.png',
    [Resident.ENTREPRENEUR]: 'assets/used/population/busts/entrepreneur-bust.png',
    [Resident.MAGNATE]:      'assets/used/population/busts/magnate-bust.png',
}

export function GetResidentIconAsset(tier: Resident): string {
    return RESIDENT_ICON_ASSETS[tier] ?? 'assets/used/population/farmer.png'
}

export function GetResidentType(tier: number) {
    if (tier == 1) {
        return Resident.FARMER
    } else if (tier == 2) {
        return Resident.WORKER
    } else if  (tier == 3) {
        return Resident.ARTISAN
    } else if (tier == 4) {
        return Resident.SCHOLAR
    } else if (tier == 5) {
        return Resident.ENTREPRENEUR
    } else {
        return Resident.MAGNATE
    }
}

export function GetHouseType(tier: number) {
    if (tier == 1) {
        return HouseType.COTTAGE
    } else if (tier == 2) {
        return HouseType.TENEMENT
    } else if  (tier == 3) {
        return HouseType.HOUSE
    } else if (tier == 4) {
        return HouseType.VILLA
    } else if (tier == 5) {
        return HouseType.MANSION
    } else {
        return HouseType.ESTATE
    }
}

export function GetCurrentMaxOccupant(tier: number, happiness:number) {
    let min = Math.max(2, (tier - 1) * 10)
    let max = tier * 10
    let range = max - min
    return Math.floor(min + range * happiness)
}

// --- House upgrade costs -----------------------------------------------------
// To upgrade a house INTO the given tier you must supply a basket of goods,
// grouped into Food / Daily / Luxury. The basket grows in both quantity and
// variety each step: humble homes need basic staples, the grandest estates
// demand fine furnishings and luxuries. (Services are required separately — see
// GetServiceNeed — and gate happiness, which itself gates the upgrade.)
//
// All goods here are produced within a single self-sufficient region, but the
// chains run long, so higher tiers take real industrial build-out.
export interface UpgradeBasket {
    food: Item[]
    daily: Item[]
    luxury: Item[]
    build: Item[]
}

const EMPTY_BASKET: UpgradeBasket = { food: [], daily: [], luxury: [], build: [] }

// Building-material ladder consumed to physically build out each upgrade:
// timber -> brick -> steel -> window -> statue, finer with every tier.
const UPGRADE_COSTS: { [tier: number]: UpgradeBasket } = {
    // Cottage -> Tenement (Farmer -> Worker): first comforts.
    2: {
        food:   [new Item(Resource.BREAD, 10)],
        daily:  [new Item(Resource.POTTERY, 8)],
        luxury: [],
        build:  [new Item(Resource.TIMBER, 10)],
    },
    // Tenement -> House (Worker -> Artisan): a furnished household.
    3: {
        food:   [new Item(Resource.SAUSAGE, 10), new Item(Resource.CHEESE, 10)],
        daily:  [new Item(Resource.PANT, 8)],
        luxury: [new Item(Resource.CIDER, 8)],
        build:  [new Item(Resource.BRICK, 15)],
    },
    // House -> Villa (Artisan -> Scholar): a refined home.
    4: {
        food:   [new Item(Resource.CHEESE, 12), new Item(Resource.APPLE, 12)],
        daily:  [new Item(Resource.FURNITURE, 10), new Item(Resource.GLASS, 8)],
        luxury: [new Item(Resource.WINE, 10)],
        build:  [new Item(Resource.STEEL, 12)],
    },
    // Villa -> Mansion (Scholar -> Entrepreneur): a gentleman's estate.
    5: {
        food:   [new Item(Resource.SAUSAGE, 15), new Item(Resource.JAM, 12)],
        daily:  [new Item(Resource.FURNITURE, 15), new Item(Resource.GLASS, 12)],
        luxury: [new Item(Resource.WINE, 15), new Item(Resource.BRANDY, 12)],
        build:  [new Item(Resource.WINDOW, 15)],
    },
    // Mansion -> Estate (Entrepreneur -> Magnate): the grandest residence.
    6: {
        food:   [new Item(Resource.CHEESE, 18), new Item(Resource.APPLE, 18)],
        daily:  [new Item(Resource.FURNITURE, 20), new Item(Resource.GLASS, 18)],
        luxury: [new Item(Resource.BRANDY, 25), new Item(Resource.WINE, 20), new Item(Resource.OIL, 15)],
        build:  [new Item(Resource.STATUE, 10)],
    },
}

// City-specific upgrade baskets (only tiers 2 and 3; higher tiers locked).
const UPGRADE_COSTS_JINLIN: { [tier: number]: UpgradeBasket } = {
    2: {
        food:   [new Item(Resource.TOFU, 8)],
        daily:  [new Item(Resource.SILK, 6)],
        luxury: [],
        build:  [new Item(Resource.TIMBER, 10)],
    },
    3: {
        food:   [new Item(Resource.NOODLE, 10)],
        daily:  [new Item(Resource.PORCELAIN, 8)],
        luxury: [new Item(Resource.TEA, 8)],
        build:  [new Item(Resource.BRICK, 15)],
    },
}

const UPGRADE_COSTS_COLUMBIA: { [tier: number]: UpgradeBasket } = {
    2: {
        food:   [new Item(Resource.CORNBREAD, 8)],
        daily:  [new Item(Resource.LEATHER, 6)],
        luxury: [],
        build:  [new Item(Resource.TIMBER, 10)],
    },
    3: {
        food:   [new Item(Resource.BEEF, 10)],
        daily:  [new Item(Resource.DENIM, 8)],
        luxury: [new Item(Resource.WHISKEY, 8)],
        build:  [new Item(Resource.BRICK, 15)],
    },
}

const UPGRADE_COSTS_SOLARA: { [tier: number]: UpgradeBasket } = {
    2: {
        food:   [new Item(Resource.COCOA_DRINK, 8)],
        daily:  [new Item(Resource.PALM_OIL, 6)],
        luxury: [],
        build:  [new Item(Resource.TIMBER, 10)],
    },
    3: {
        food:   [new Item(Resource.PORK, 10)],
        daily:  [new Item(Resource.BRONZE, 8)],
        luxury: [new Item(Resource.INCENSE, 8)],
        build:  [new Item(Resource.BRICK, 15)],
    },
}

const UPGRADE_COSTS_MINTAKA: { [tier: number]: UpgradeBasket } = {
    2: {
        food:   [new Item(Resource.SMOKED_FISH, 8)],
        daily:  [new Item(Resource.FUR_COAT, 6)],
        luxury: [],
        build:  [new Item(Resource.TIMBER, 10)],
    },
    3: {
        food:   [new Item(Resource.REINDEER_MEAT, 10)],
        daily:  [new Item(Resource.WHALE_OIL, 8)],
        luxury: [new Item(Resource.RUM, 8)],
        build:  [new Item(Resource.BRICK, 15)],
    },
}

// Max tier per city: non-Anrelia cities cap at 3.
export function GetCityMaxTier(cityType?: CityName): number {
    return (!cityType || cityType === CityName.ANRELIA) ? 6 : 3
}

// The categorized basket required to upgrade a house into `targetTier`.
export function GetUpgradeCost(targetTier: number, cityType?: CityName): UpgradeBasket {
    if (cityType === CityName.JINLIN)   return UPGRADE_COSTS_JINLIN[targetTier]   ?? EMPTY_BASKET
    if (cityType === CityName.COLUMBIA) return UPGRADE_COSTS_COLUMBIA[targetTier] ?? EMPTY_BASKET
    if (cityType === CityName.SOLARA)   return UPGRADE_COSTS_SOLARA[targetTier]   ?? EMPTY_BASKET
    if (cityType === CityName.MINTAKA)  return UPGRADE_COSTS_MINTAKA[targetTier]  ?? EMPTY_BASKET
    return UPGRADE_COSTS[targetTier] ?? EMPTY_BASKET
}

// Flattened list of every item in the upgrade basket, for affordability checks
// and charging in one shot.
export function GetUpgradeItems(targetTier: number, cityType?: CityName): Item[] {
    let b = GetUpgradeCost(targetTier, cityType)
    return [...b.food, ...b.daily, ...b.luxury, ...b.build]
}


// --- Per-city resource need tables (3 tiers each) ---

function GetResourceNeedJinlin(tier: number): ResourceNeed[] {
    const needs: Resource[] = []
    if (tier >= 1) needs.push(Resource.RICE, Resource.FISH)
    if (tier >= 2) needs.push(Resource.TOFU)
    if (tier >= 3) needs.push(Resource.NOODLE)
    if (tier >= 1) needs.push(Resource.PANT)
    if (tier >= 2) needs.push(Resource.SILK)
    if (tier >= 3) needs.push(Resource.PORCELAIN)
    if (tier >= 2) needs.push(Resource.TEA)
    if (tier >= 3) needs.push(Resource.WINE)
    return needs.map(r => new ResourceNeed(r))
}

function GetResourceNeedColumbia(tier: number): ResourceNeed[] {
    const needs: Resource[] = []
    if (tier >= 1) needs.push(Resource.CORNBREAD)
    if (tier >= 2) needs.push(Resource.BEEF)
    if (tier >= 3) needs.push(Resource.SAUSAGE)
    if (tier >= 1) needs.push(Resource.LEATHER)
    if (tier >= 2) needs.push(Resource.DENIM)
    if (tier >= 3) needs.push(Resource.FURNITURE)
    if (tier >= 2) needs.push(Resource.WHISKEY)
    if (tier >= 3) needs.push(Resource.BRANDY)
    return needs.map(r => new ResourceNeed(r))
}

function GetResourceNeedSolara(tier: number): ResourceNeed[] {
    const needs: Resource[] = []
    if (tier >= 1) needs.push(Resource.BANANA)
    if (tier >= 2) needs.push(Resource.COCOA_DRINK)
    if (tier >= 3) needs.push(Resource.PORK)
    if (tier >= 1) needs.push(Resource.PALM_OIL)
    if (tier >= 2) needs.push(Resource.BRONZE)
    if (tier >= 3) needs.push(Resource.POTTERY)
    if (tier >= 2) needs.push(Resource.INCENSE)
    if (tier >= 3) needs.push(Resource.GOLD)
    return needs.map(r => new ResourceNeed(r))
}

function GetResourceNeedMintaka(tier: number): ResourceNeed[] {
    const needs: Resource[] = []
    if (tier >= 1) needs.push(Resource.SMOKED_FISH)
    if (tier >= 2) needs.push(Resource.REINDEER_MEAT)
    if (tier >= 3) needs.push(Resource.CHEESE)
    if (tier >= 1) needs.push(Resource.FUR_COAT)
    if (tier >= 2) needs.push(Resource.WHALE_OIL)
    if (tier >= 3) needs.push(Resource.TOOL)
    if (tier >= 2) needs.push(Resource.RUM)
    if (tier >= 3) needs.push(Resource.AMBER)
    return needs.map(r => new ResourceNeed(r))
}

// Goods a house consumes continuously (drives happiness, which gates upgrades).
export function GetResourceNeed(tier: number, cityType?: CityName): ResourceNeed[] {
    if (cityType === CityName.JINLIN)   return GetResourceNeedJinlin(tier)
    if (cityType === CityName.COLUMBIA) return GetResourceNeedColumbia(tier)
    if (cityType === CityName.SOLARA)   return GetResourceNeedSolara(tier)
    if (cityType === CityName.MINTAKA)  return GetResourceNeedMintaka(tier)
    // Anrelia (default): original 6-tier system
    const needs: Resource[] = []
    if (tier >= 1) needs.push(Resource.FISH)
    if (tier >= 2) needs.push(Resource.SAUSAGE)
    if (tier >= 2) needs.push(Resource.CABBAGE)
    if (tier >= 3) needs.push(Resource.BREAD)
    if (tier >= 4) needs.push(Resource.CHEESE)
    if (tier >= 1) needs.push(Resource.PANT)
    if (tier >= 2) needs.push(Resource.POTTERY)
    if (tier >= 5) needs.push(Resource.FURNITURE)
    if (tier >= 3) needs.push(Resource.CIDER)
    if (tier >= 4) needs.push(Resource.WINE)
    if (tier >= 6) needs.push(Resource.BRANDY)
    return needs.map(r => new ResourceNeed(r))
}

// Services needed for non-Anrelia 3-tier cities.
function GetServiceNeedOtherCity(tier: number): ServiceNeed[] {
    const services: ServiceType[] = []
    if (tier >= 1) services.push(ServiceType.WATER)
    if (tier >= 2) services.push(ServiceType.MARKET, ServiceType.HEALTH)
    if (tier >= 3) services.push(ServiceType.FIRE, ServiceType.SCHOOL)
    return services.map(s => new ServiceNeed(s))
}

// Services a house of the given tier requires (coverage from service buildings).
export function GetServiceNeed(tier: number, cityType?: CityName): ServiceNeed[] {
    if (cityType && cityType !== CityName.ANRELIA) return GetServiceNeedOtherCity(tier)
    const services: ServiceType[] = []
    if (tier >= 1) services.push(ServiceType.WATER)
    if (tier >= 2) services.push(ServiceType.MARKET)
    if (tier >= 3) services.push(ServiceType.FIRE, ServiceType.POLICE, ServiceType.HEALTH)
    if (tier >= 4) services.push(ServiceType.SCHOOL, ServiceType.JUSTICE)
    if (tier >= 5) services.push(ServiceType.TAVERN, ServiceType.ENGINEER)
    if (tier >= 6) services.push(ServiceType.CHURCH)
    return services.map(s => new ServiceNeed(s))
}

// Build a building's blueprint (its material cost and production recipe) without
// charging anything. Pure — safe to call for previews/tooltips. CreateBuilding
// wraps this and deducts the cost from storage.
export function MakeBuilding(type: BuildingType): Building | undefined {
    let new_building
    if (type == BuildingType.HOUSE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 5)], new House(), undefined, undefined,)
    } else if (type == BuildingType.LUMBER_HUT) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(4, Resident.FARMER, 10.0, [], [new Item(Resource.WOOD, 1)]))
    } else if (type == BuildingType.STONE_QUARRY) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.STONE, 1)]))    
    } else if (type == BuildingType.CLAY_PIT) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.CLAY, 1)]))
    } else if (type == BuildingType.COAL_KILN) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.COAL, 1)]))
    } else if (type == BuildingType.WHEAT_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.WHEAT, 1)]))
    } else if (type == BuildingType.WIND_MILL) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.WHEAT, 1)], [new Item(Resource.FLOUR, 1)]))
    } else if (type == BuildingType.BAKERY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.FLOUR, 1)], [new Item(Resource.BREAD, 1)]))
    } else if (type == BuildingType.PIG_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.PORK, 1)]))
    } else if (type == BuildingType.BUTCHERY) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.PORK, 1)], [new Item(Resource.SAUSAGE, 1)]))
    } else if (type == BuildingType.FISHERY) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.FISH, 1)]))
    } else if (type == BuildingType.CABBAGE_PATCH) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.CABBAGE, 1)]))
    } else if (type == BuildingType.APPLE_ORCHARD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.APPLE, 1)]))
    } else if (type == BuildingType.TOBACCO_PLANTATION) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.TOBACCO, 1)]))
    } else if (type == BuildingType.DIARY_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.MILK, 1)]))
    } else if (type == BuildingType.SHEEP_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.WOOL, 1)]))
    } else if (type == BuildingType.CIDERY) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.APPLE, 1)], [new Item(Resource.CIDER, 1)]))
    } else if (type == BuildingType.CREAMERY) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.MILK, 1)], [new Item(Resource.CHEESE, 1)]))
    } else if (type == BuildingType.POTTERY_SHOP) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.CLAY, 1)], [new Item(Resource.POTTERY, 1)]))
    } else if (type == BuildingType.PANT_SHOP) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.WOOL, 1)], [new Item(Resource.PANT, 1)]))
    } else if (type == BuildingType.SHIRT_SHOP) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.COTTON, 1)], [new Item(Resource.SHIRT, 1)]))
    } else if (type == BuildingType.BOOT_SHOP) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.FUR, 1)], [new Item(Resource.BOOT, 1)]))
    } else if (type == BuildingType.CIGAR_FACTORY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.TOBACCO, 1)], [new Item(Resource.CIGAR, 1)]))
    } else if (type == BuildingType.WELL) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, undefined, new Service(ServiceType.WATER, 10))
    } else if (type == BuildingType.FIRE_STATION) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 20)], undefined, undefined, new Service(ServiceType.FIRE, 12))
    } else if (type == BuildingType.POLICE_STATION) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 20)], undefined, undefined, new Service(ServiceType.POLICE, 12))
    } else if (type == BuildingType.SCHOOL) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, undefined, new Service(ServiceType.SCHOOL, 16))
    } else if (type == BuildingType.MARKETPLACE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 20)], undefined, undefined, new Service(ServiceType.MARKET, 12))
    } else if (type == BuildingType.TAVERN) {
        new_building = new Building(type, [new Item(Resource.SLATE, 20)], undefined, undefined, new Service(ServiceType.TAVERN, 12))
    } else if (type == BuildingType.CHAPEL) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, undefined, new Service(ServiceType.CHURCH, 14))
    } else if (type == BuildingType.CLINIC) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 20)], undefined, undefined, new Service(ServiceType.HEALTH, 12))
    } else if (type == BuildingType.COURTHOUSE) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, undefined, new Service(ServiceType.JUSTICE, 14))
    } else if (type == BuildingType.ENGINEER_STATION) {
        new_building = new Building(type, [new Item(Resource.STEEL, 20)], undefined, undefined, new Service(ServiceType.ENGINEER, 14))
    } else if (type == BuildingType.WAREHOUSE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 20)], undefined, undefined, undefined, new Warehouse())
    } else if (type == BuildingType.SHIPYARD) {
        new_building = new Building(type, [new Item(Resource.SLATE, 20)], undefined, undefined, undefined, undefined, new Shipyard())
    } else if (type == BuildingType.DOCK) {
        new_building = new Building(type, [new Item(Resource.SLATE, 20)], undefined, undefined, undefined, undefined, undefined, new Dock())
    } else if (type == BuildingType.ROAD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 1)])
    // Raw material farms & gathering (Farmer)
    } else if (type == BuildingType.BANANA_PLANTATION) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.BANANA, 1)]))
    } else if (type == BuildingType.BERRY_GROVE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.BERRY, 1)]))
    } else if (type == BuildingType.CORN_FIELD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.CORN, 1)]))
    } else if (type == BuildingType.COTTON_FIELD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.COTTON, 1)]))
    } else if (type == BuildingType.CHICKEN_COOP) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.EGG, 1)]))
    } else if (type == BuildingType.TRAPLINE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.FUR, 1)]))
    } else if (type == BuildingType.VINEYARD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.GRAPE, 1)]))
    } else if (type == BuildingType.MELON_GARDEN) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.MELON, 1)]))
    } else if (type == BuildingType.OLIVE_GROVE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.OLIVE, 1)]))
    } else if (type == BuildingType.ORANGE_ORCHARD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.ORANGE, 1)]))
    } else if (type == BuildingType.ONION_FIELD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.ONION, 1)]))
    } else if (type == BuildingType.POTATO_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.POTATO, 1)]))
    } else if (type == BuildingType.PUMPKIN_PATCH) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.PUMPKIN, 1)]))
    } else if (type == BuildingType.SALTERN) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.SALT, 1)]))
    } else if (type == BuildingType.SAND_PIT) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.SAND, 1)]))
    } else if (type == BuildingType.SOYBEAN_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.SOYBEAN, 1)]))
    } else if (type == BuildingType.SUGAR_CANE_PLANTATION) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.SUGAR_CANE, 1)]))
    } else if (type == BuildingType.RICE_PADDY) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.RICE, 1)]))
    } else if (type == BuildingType.RUBBER_PLANTATION) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.RUBBER, 1)]))
    } else if (type == BuildingType.TOMATO_FIELD) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.TOMATO, 1)]))
    } else if (type == BuildingType.APIARY) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.WAX, 1)]))
    } else if (type == BuildingType.COCOA_PLANT) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.COCOA, 1)]))
    // Mining (Worker)
    } else if (type == BuildingType.GEM_MINE) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.WORKER, 8.0, [], [new Item(Resource.GEM, 1)]))
    } else if (type == BuildingType.GOLD_MINE) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.WORKER, 8.0, [], [new Item(Resource.GOLD_ORE, 1)]))
    } else if (type == BuildingType.IRON_MINE) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 8.0, [], [new Item(Resource.IRON_ORE, 1)]))
    // Processing — Worker tier
    } else if (type == BuildingType.SAWMILL) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(4, Resident.FARMER, 10.0, [new Item(Resource.WOOD, 1)], [new Item(Resource.TIMBER, 1)]))
    } else if (type == BuildingType.BRICKYARY) {
        let p = new Production(10, Resident.WORKER, 10.0, [new Item(Resource.CLAY, 1)], [new Item(Resource.BRICK, 1)])
        p.extra_sources = [new ExtraSource(Resource.COAL, 1, true)]
        new_building = new Building(type, [new Item(Resource.SLATE, 20)], undefined, p)
    } else if (type == BuildingType.CANDLE_Manufactory) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.WAX, 1)], [new Item(Resource.CANDLE, 1)]))
    } else if (type == BuildingType.GLASSWORK) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.SAND, 1)], [new Item(Resource.GLASS, 1)]))
    } else if (type == BuildingType.GLAZIER) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.GLASS, 1)], [new Item(Resource.WINDOW, 1)]))
    } else if (type == BuildingType.MASON_SHOP) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.STONE, 1)], [new Item(Resource.SLATE, 1)]))
    } else if (type == BuildingType.CONCRETE_PLANT) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.STONE, 1), new Item(Resource.SAND, 1)], [new Item(Resource.CONCRETE, 1)]))
    } else if (type == BuildingType.SCULPTOR) {
        new_building = new Building(type, [new Item(Resource.STEEL, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.STONE, 1), new Item(Resource.TOOL, 1)], [new Item(Resource.STATUE, 1)]))
    } else if (type == BuildingType.CANNERY) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.APPLE, 1)], [new Item(Resource.JAM, 1)]))
    // Processing — Artisan tier
    } else if (type == BuildingType.BRANDY_DISTILLERY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.GRAPE, 1)], [new Item(Resource.BRANDY, 1)]))
    } else if (type == BuildingType.STEELWORK) {
        let p = new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.IRON, 1)], [new Item(Resource.STEEL, 1)])
        p.extra_sources = [new ExtraSource(Resource.COAL, 1, true)]
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, p)
    // Metal & craft chains
    } else if (type == BuildingType.FORGE) {
        let p = new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.IRON_ORE, 1)], [new Item(Resource.IRON, 1)])
        p.extra_sources = [new ExtraSource(Resource.COAL, 1, true)]
        new_building = new Building(type, [new Item(Resource.STEEL, 20)], undefined, p)
    } else if (type == BuildingType.TOOLSMITH) {
        new_building = new Building(type, [new Item(Resource.STEEL, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.IRON, 1)], [new Item(Resource.TOOL, 1)]))
    } else if (type == BuildingType.GOLDSMITH) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.GOLD_ORE, 1)], [new Item(Resource.GOLD, 1)]))
    } else if (type == BuildingType.JEWELER) {
        new_building = new Building(type, [new Item(Resource.STEEL, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.GOLD, 1)], [new Item(Resource.JEWELRY, 1)]))
    } else if (type == BuildingType.CARPENTER_SHOP) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.TIMBER, 1)], [new Item(Resource.FURNITURE, 1)]))
    } else if (type == BuildingType.WINERY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.GRAPE, 1)], [new Item(Resource.WINE, 1)]))
    } else if (type == BuildingType.OIL_PRESS) {
        new_building = new Building(type, [new Item(Resource.SLATE, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.OLIVE, 1)], [new Item(Resource.OIL, 1)]))
    } else if (type == BuildingType.RUM_DISTILLERY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.SUGAR_CANE, 1)], [new Item(Resource.RUM, 1)]))
    // ---- Jinlin (East Asian) buildings ----
    } else if (type == BuildingType.TEA_GARDEN) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.TEA, 1)]))
    } else if (type == BuildingType.SILK_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.SILK, 1)]))
    } else if (type == BuildingType.TOFU_SHOP) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.SOYBEAN, 1)], [new Item(Resource.TOFU, 1)]))
    } else if (type == BuildingType.KILN) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.CLAY, 1)], [new Item(Resource.PORCELAIN, 1)]))
    } else if (type == BuildingType.NOODLE_SHOP) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.RICE, 1)], [new Item(Resource.NOODLE, 1)]))
    // ---- Columbia (American frontier) buildings ----
    } else if (type == BuildingType.CATTLE_RANCH) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.BEEF, 1)]))
    } else if (type == BuildingType.CORN_MILL) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.CORN, 1)], [new Item(Resource.CORNBREAD, 1)]))
    } else if (type == BuildingType.TANNERY) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.BEEF, 1)], [new Item(Resource.LEATHER, 1)]))
    } else if (type == BuildingType.DENIM_MILL) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.COTTON, 1)], [new Item(Resource.DENIM, 1)]))
    } else if (type == BuildingType.WHISKEY_DISTILLERY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 15)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.CORN, 1)], [new Item(Resource.WHISKEY, 1)]))
    } else if (type == BuildingType.RAIL_MILL) {
        new_building = new Building(type, [new Item(Resource.STEEL, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.STEEL, 1)], [new Item(Resource.RAIL, 1)]))
    // ---- Solara (African / tropical) buildings ----
    } else if (type == BuildingType.PALM_GROVE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.PALM_FRUIT, 1)]))
    } else if (type == BuildingType.PALM_OIL_PRESS) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.PALM_FRUIT, 1)], [new Item(Resource.PALM_OIL, 1)]))
    } else if (type == BuildingType.COCOA_SHOP) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.COCOA, 1)], [new Item(Resource.COCOA_DRINK, 1)]))
    } else if (type == BuildingType.COPPER_MINE) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.WORKER, 8.0, [], [new Item(Resource.COPPER, 1)]))
    } else if (type == BuildingType.BRONZE_FOUNDRY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.COPPER, 1)], [new Item(Resource.BRONZE, 1)]))
    } else if (type == BuildingType.INCENSE_GROVE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.INCENSE, 1)]))
    } else if (type == BuildingType.IVORY_CAMP) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.ARTISAN, 8.0, [], [new Item(Resource.IVORY, 1)]))
    // ---- Mintaka (polar) buildings ----
    } else if (type == BuildingType.REINDEER_FARM) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.REINDEER_MEAT, 1)]))
    } else if (type == BuildingType.FUR_WORKSHOP) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.FUR, 1)], [new Item(Resource.FUR_COAT, 1)]))
    } else if (type == BuildingType.SMOKEHOUSE) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.FISH, 1), new Item(Resource.SALT, 1)], [new Item(Resource.SMOKED_FISH, 1)]))
    } else if (type == BuildingType.WHALING_POST) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.BLUBBER, 1)]))
    } else if (type == BuildingType.BLUBBER_PRESS) {
        new_building = new Building(type, [new Item(Resource.BRICK, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.BLUBBER, 1)], [new Item(Resource.WHALE_OIL, 1)]))
    } else if (type == BuildingType.AMBER_MINE) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, new Production(10, Resident.ARTISAN, 8.0, [], [new Item(Resource.AMBER, 1)]))
    // ---- Shared utility ----
    } else if (type == BuildingType.COMPOST_PIT) {
        new_building = new Building(type, [new Item(Resource.TIMBER, 10)], undefined, new Production(5, Resident.FARMER, 6.0, [], [new Item(Resource.FERTILIZER, 1)]))
    } else if (type == BuildingType.UNIVERSITY) {
        new_building = new Building(type, [new Item(Resource.BRICK, 20)], undefined, undefined, undefined, undefined, undefined, undefined, new University())
    }
    if (new_building) {
        new_building.material = BuildMaterial(type, new_building.material)
        // All farms (except the compost pit) get an optional fertilizer boost,
        // gated behind the Fertilizer Application research.
        if (new_building.production && FARM_BUILDINGS.has(type) && type !== BuildingType.COMPOST_PIT) {
            new_building.production.extra_sources = [
                new ExtraSource(Resource.FERTILIZER, 1, false, 1.5, 5, Technology.FERTILIZER_APPLICATION),
            ]
        }
    }
    return new_building
}

// Construction material cost, overriding the per-building defaults above:
//  - the wood/timber producers cost only money (no material), so the timber
//    supply chain can be bootstrapped from nothing;
//  - farms cost a single timber; the warehouse costs 10.
function BuildMaterial(type: BuildingType, current: Item[]): Item[] {
    if (type == BuildingType.ROAD) return []
    if (type == BuildingType.LUMBER_HUT || type == BuildingType.SAWMILL) return []
    if (type == BuildingType.HOUSE) return [new Item(Resource.TIMBER, 1)]
    if (FARM_BUILDINGS.has(type)) return [new Item(Resource.TIMBER, 1)]
    if (type == BuildingType.WAREHOUSE) return [new Item(Resource.TIMBER, 10)]
    // Themed city workshops also bootstrap cheaply from timber
    if (type == BuildingType.TOFU_SHOP || type == BuildingType.NOODLE_SHOP) return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.CORN_MILL || type == BuildingType.TANNERY)     return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.PALM_OIL_PRESS || type == BuildingType.COCOA_SHOP) return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.FUR_WORKSHOP || type == BuildingType.SMOKEHOUSE) return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.BLUBBER_PRESS) return [new Item(Resource.TIMBER, 5)]
    return current
}

export function CreateBuilding(type: BuildingType, storage: Storage) {
    let new_building = MakeBuilding(type)
    if (new_building == undefined) {
        return undefined
    }
    if (TakeItems(storage, new_building.material)) {
        return new_building
    }
    return undefined
}
