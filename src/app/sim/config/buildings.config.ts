// Building registry config — the single source of truth for every placeable
// building plus its per-building build-cost overrides. Pure data; edit here to
// add or retune a building. Re-exported from building.ts so importers keep paths.
import { Item } from "../storage"
import { Resource, Resident, ServiceType, BuildingType, Feature } from "../types"

// Shorthand for the many Item literals in the registry below.
const I = (type: Resource, num = 1) => new Item(type, num)

// --- Building registry -------------------------------------------------------
// The single source of truth for every placeable building. One entry captures
// everything that used to be scattered across a dozen Sets, switch statements,
// icon maps and the old MakeBuilding if-chain. To add a building: add a
// BuildingType enum value and one entry here — sizes, costs, terrain rules,
// category flags and icons are all derived from this table.
//
// `material` is the construction cost as declared; a few families are rewritten
// by BuildMaterial (e.g. farms/houses bootstrap from a single timber). `gold`
// is only set where it differs from the category default (farms 100, other
// production 150, everything else 100).
export interface Recipe {
    workers: number
    worker_type: Resident
    efficiency: number
    in: Item[]
    out: Item[]
    coal?: boolean   // adds a required Coal extra source (kiln/forge/steelwork)
}
export interface BuildingDef {
    size: 1 | 2 | 3
    material: Item[]
    icon: string
    gold?: number
    recipe?: Recipe
    service?: { need: ServiceType, radius: number }
    special?: 'house' | 'warehouse' | 'shipyard' | 'dock' | 'university' | 'road'
    farm?: boolean       // 3x3 farmhouse-style plot (eligible for fertilizer)
    animal?: boolean     // pasture art instead of crop rows
    mine?: boolean       // mine-camp extraction art / Advanced Mining tech
    sea?: boolean        // must be placed on water
    near?: Feature       // requires this feature on an adjacent tile (rock/tree)
    nearSand?: boolean   // requires a sand tile nearby (sand pit)
    noRoad?: boolean     // may be placed without touching a road
    productIcon?: string // output icon overlaid on a workshop's process icon
}

// A standard raw farm: 3x3, one timber to build, ten farmers producing one
// unit of `out` per cycle. Tree-foraging and animal farms layer flags on top.
export function rawFarm(icon: string, out: Resource, opts: Partial<BuildingDef> = {}): BuildingDef {
    return {
        size: 3, farm: true, material: [I(Resource.TIMBER, 10)], icon,
        recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(out)] },
        ...opts,
    }
}

export const BUILDING_DEFS: Partial<Record<BuildingType, BuildingDef>> = {
    // --- Crop farms (Farmer, 3x3) ---
    [BuildingType.WHEAT_FARM]:        rawFarm('🌾', Resource.WHEAT),
    [BuildingType.RICE_PADDY]:        rawFarm('🍚', Resource.RICE),
    [BuildingType.APPLE_ORCHARD]:     rawFarm('🍎', Resource.APPLE),
    [BuildingType.ORANGE_ORCHARD]:    rawFarm('🍊', Resource.ORANGE),
    [BuildingType.CABBAGE_PATCH]:     rawFarm('🥬', Resource.CABBAGE),
    [BuildingType.POTATO_FARM]:       rawFarm('🥔', Resource.POTATO),
    [BuildingType.MELON_GARDEN]:      rawFarm('🍉', Resource.MELON),
    [BuildingType.TOMATO_FIELD]:      rawFarm('🍅', Resource.TOMATO),
    [BuildingType.CORN_FIELD]:        rawFarm('🌽', Resource.CORN),
    [BuildingType.BANANA_PLANTATION]: rawFarm('🍌', Resource.BANANA),
    [BuildingType.ONION_FIELD]:       rawFarm('🧅', Resource.ONION),
    [BuildingType.VINEYARD]:          rawFarm('🍇', Resource.GRAPE),
    [BuildingType.OLIVE_GROVE]:       rawFarm('🫒', Resource.OLIVE),
    [BuildingType.PUMPKIN_PATCH]:     rawFarm('🎃', Resource.PUMPKIN),
    [BuildingType.SOYBEAN_FARM]:      rawFarm('🫘', Resource.SOYBEAN),
    [BuildingType.COCOA_PLANT]:       rawFarm('🍫', Resource.COCOA),
    [BuildingType.SUGAR_CANE_PLANTATION]: rawFarm('🍬', Resource.SUGAR_CANE),
    [BuildingType.TOBACCO_PLANTATION]: rawFarm('🌿', Resource.TOBACCO),
    [BuildingType.COTTON_FIELD]:      rawFarm('🪡', Resource.COTTON),
    [BuildingType.RUBBER_PLANTATION]: rawFarm('🌴', Resource.RUBBER),
    // --- Foraging farms (require a nearby tree stand) ---
    [BuildingType.BERRY_GROVE]:       rawFarm('🍓', Resource.BERRY, { near: Feature.TREE }),
    [BuildingType.APIARY]:            rawFarm('🍯', Resource.WAX,   { near: Feature.TREE }),
    [BuildingType.TRAPLINE]:          rawFarm('🦊', Resource.FUR,   { near: Feature.TREE }),
    // --- Animal farms (pasture art) ---
    [BuildingType.PIG_FARM]:          rawFarm('🐷', Resource.PORK,  { animal: true }),
    [BuildingType.DAIRY_FARM]:        rawFarm('🐄', Resource.MILK,  { animal: true }),
    [BuildingType.SHEEP_FARM]:        rawFarm('🐑', Resource.WOOL,  { animal: true }),
    [BuildingType.CHICKEN_COOP]:      rawFarm('🐓', Resource.EGG,   { animal: true }),
    // --- Raw extraction (mine-camp art) ---
    [BuildingType.LUMBER_HUT]:  { size: 2, mine: true, near: Feature.TREE, material: [I(Resource.TIMBER, 10)], icon: '🪵', recipe: { workers: 4, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.WOOD)] } },
    [BuildingType.STONE_QUARRY]:{ size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.TIMBER, 10)], icon: '🪨', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.STONE)] } },
    [BuildingType.CLAY_PIT]:    { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.TIMBER, 10)], icon: '🟤', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.CLAY)] } },
    [BuildingType.COAL_KILN]:   { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.TIMBER, 10)], icon: '🏭', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.COAL)] } },
    [BuildingType.SAND_PIT]:    { size: 2, mine: true, nearSand: true,     material: [I(Resource.TIMBER, 10)], icon: '🏜️', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.SAND)] } },
    [BuildingType.SALTERN]:     { size: 2, mine: true, sea: true,          material: [I(Resource.TIMBER, 10)], icon: '🧂', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.SALT)] } },
    [BuildingType.IRON_MINE]:   { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.BRICK, 20)], icon: '⛏️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 8, in: [], out: [I(Resource.IRON_ORE)] } },
    [BuildingType.GOLD_MINE]:   { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.BRICK, 20)], icon: '🪙', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 8, in: [], out: [I(Resource.GOLD_ORE)] } },
    [BuildingType.GEM_MINE]:    { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.BRICK, 20)], icon: '💎', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 8, in: [], out: [I(Resource.GEM)] } },
    // --- Processing workshops (2x2) ---
    [BuildingType.SAWMILL]:     { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🪚', productIcon: '🪵', recipe: { workers: 4, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.WOOD)], out: [I(Resource.TIMBER)] } },
    [BuildingType.WIND_MILL]:   { size: 2, material: [I(Resource.BRICK, 10)], icon: '🌀', productIcon: '🥣', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.WHEAT)], out: [I(Resource.FLOUR)] } },
    [BuildingType.BAKERY]:      { size: 2, material: [I(Resource.BRICK, 10)], icon: '🫕', productIcon: '🥖', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.FLOUR)], out: [I(Resource.BREAD)] } },
    [BuildingType.BUTCHERY]:    { size: 2, material: [I(Resource.SLATE, 10)], icon: '🔪', productIcon: '🌭', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.PORK)], out: [I(Resource.SAUSAGE)] } },
    [BuildingType.CIDERY]:      { size: 2, material: [I(Resource.SLATE, 10)], icon: '🍶', productIcon: '🍺', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.APPLE)], out: [I(Resource.CIDER)] } },
    [BuildingType.CREAMERY]:    { size: 2, material: [I(Resource.SLATE, 10)], icon: '🥛', productIcon: '🧀', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.MILK)], out: [I(Resource.CHEESE)] } },
    [BuildingType.POTTERY_SHOP]:{ size: 2, material: [I(Resource.SLATE, 10)], icon: '🤲', productIcon: '🏺', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CLAY)], out: [I(Resource.POTTERY)] } },
    [BuildingType.PANT_SHOP]:   { size: 2, material: [I(Resource.SLATE, 10)], icon: '🧵', productIcon: '👖', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.WOOL)], out: [I(Resource.PANT)] } },
    [BuildingType.SHIRT_SHOP]:  { size: 2, material: [I(Resource.SLATE, 10)], icon: '👕', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.COTTON)], out: [I(Resource.SHIRT)] } },
    [BuildingType.BOOT_SHOP]:   { size: 2, material: [I(Resource.BRICK, 10)], icon: '👢', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.FUR)], out: [I(Resource.BOOT)] } },
    [BuildingType.CIGAR_FACTORY]:{ size: 2, material: [I(Resource.BRICK, 10)], icon: '🍃', productIcon: '🚬', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.TOBACCO)], out: [I(Resource.CIGAR)] } },
    [BuildingType.CANDLE_MANUFACTORY]:{ size: 2, material: [I(Resource.SLATE, 10)], icon: '🪔', productIcon: '🕯️', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.WAX)], out: [I(Resource.CANDLE)] } },
    [BuildingType.GLASSWORK]:   { size: 2, material: [I(Resource.BRICK, 20)], icon: '🫧', productIcon: '🪟', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.SAND)], out: [I(Resource.GLASS)] } },
    [BuildingType.GLAZIER]:     { size: 2, material: [I(Resource.BRICK, 20)], icon: '🪟', productIcon: '🪟', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GLASS)], out: [I(Resource.WINDOW)] } },
    [BuildingType.MASON_SHOP]:  { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🏛️', productIcon: '🪨', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.STONE)], out: [I(Resource.SLATE)] } },
    [BuildingType.CONCRETE_PLANT]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🏗️', productIcon: '🧱', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.STONE), I(Resource.SAND)], out: [I(Resource.CONCRETE)] } },
    [BuildingType.SCULPTOR]:    { size: 2, material: [I(Resource.STEEL, 20)], icon: '🗿', productIcon: '🗿', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.STONE), I(Resource.TOOL)], out: [I(Resource.STATUE)] } },
    [BuildingType.CANNERY]:     { size: 2, material: [I(Resource.SLATE, 10)], icon: '🍎', productIcon: '🫙', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.APPLE)], out: [I(Resource.JAM)] } },
    [BuildingType.BRANDY_DISTILLERY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🧪', productIcon: '🍾', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GRAPE)], out: [I(Resource.BRANDY)] } },
    [BuildingType.BRICKYARD]:   { size: 2, material: [I(Resource.SLATE, 20)], icon: '🏭', productIcon: '🧱', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CLAY)], out: [I(Resource.BRICK)], coal: true } },
    [BuildingType.STEELWORK]:   { size: 2, material: [I(Resource.BRICK, 20)], icon: '⚒️', productIcon: '⚙️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.IRON)], out: [I(Resource.STEEL)], coal: true } },
    [BuildingType.FORGE]:       { size: 2, material: [I(Resource.STEEL, 20)], icon: '🔥', productIcon: '🔩', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.IRON_ORE)], out: [I(Resource.IRON)], coal: true } },
    [BuildingType.TOOLSMITH]:   { size: 2, material: [I(Resource.STEEL, 20)], icon: '🔧', productIcon: '⚒️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.IRON)], out: [I(Resource.TOOL)] } },
    [BuildingType.GOLDSMITH]:   { size: 2, material: [I(Resource.SLATE, 10)], icon: '🔆', productIcon: '🪙', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.GOLD_ORE)], out: [I(Resource.GOLD)] } },
    [BuildingType.JEWELER]:     { size: 2, material: [I(Resource.STEEL, 20)], icon: '💎', productIcon: '💍', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GOLD)], out: [I(Resource.JEWELRY)] } },
    [BuildingType.CARPENTER_SHOP]:{ size: 2, material: [I(Resource.SLATE, 10)], icon: '🪓', productIcon: '🪑', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.TIMBER)], out: [I(Resource.FURNITURE)] } },
    [BuildingType.WINERY]:      { size: 2, material: [I(Resource.BRICK, 20)], icon: '🍇', productIcon: '🍷', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GRAPE)], out: [I(Resource.WINE)] } },
    [BuildingType.OIL_PRESS]:   { size: 2, material: [I(Resource.SLATE, 10)], icon: '🫒', productIcon: '🫗', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.OLIVE)], out: [I(Resource.OIL)] } },
    [BuildingType.RUM_DISTILLERY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🍬', productIcon: '🥃', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.SUGAR_CANE)], out: [I(Resource.RUM)] } },
    // --- Sea producers ---
    [BuildingType.FISHERY]:     { size: 1, sea: true, material: [I(Resource.TIMBER, 10)], icon: '🎣', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.FISH)] } },
    // --- Houses, services, infrastructure ---
    [BuildingType.HOUSE]:       { size: 1, gold: 20,  material: [I(Resource.TIMBER, 5)],  icon: '🏠', special: 'house' },
    [BuildingType.WELL]:        { size: 1, gold: 80,  noRoad: true, material: [I(Resource.TIMBER, 10)], icon: '🪣', service: { need: ServiceType.WATER, radius: 10 } },
    [BuildingType.FIRE_STATION]:{ size: 1, gold: 120, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '🔔', service: { need: ServiceType.FIRE, radius: 12 } },
    [BuildingType.POLICE_STATION]:{ size: 1, gold: 120, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '⚖️', service: { need: ServiceType.POLICE, radius: 12 } },
    [BuildingType.SCHOOL]:      { size: 1, gold: 200, noRoad: true, material: [I(Resource.BRICK, 20)], icon: '📜', service: { need: ServiceType.SCHOOL, radius: 16 } },
    [BuildingType.MARKETPLACE]: { size: 1, gold: 120, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '🏪', service: { need: ServiceType.MARKET, radius: 12 } },
    [BuildingType.TAVERN]:      { size: 1, gold: 150, noRoad: true, material: [I(Resource.SLATE, 20)], icon: '🍺', service: { need: ServiceType.TAVERN, radius: 12 } },
    [BuildingType.CHAPEL]:      { size: 1, gold: 250, noRoad: true, material: [I(Resource.BRICK, 20)], icon: '⛪', service: { need: ServiceType.CHURCH, radius: 14 } },
    [BuildingType.CLINIC]:      { size: 1, gold: 150, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '🏥', service: { need: ServiceType.HEALTH, radius: 12 } },
    [BuildingType.COURTHOUSE]:  { size: 1, gold: 200, noRoad: true, material: [I(Resource.BRICK, 20)], icon: '⚖️', service: { need: ServiceType.JUSTICE, radius: 14 } },
    [BuildingType.ENGINEER_STATION]:{ size: 1, gold: 200, noRoad: true, material: [I(Resource.STEEL, 20)], icon: '🔧', service: { need: ServiceType.ENGINEER, radius: 14 } },
    [BuildingType.WAREHOUSE]:   { size: 2, gold: 150, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '📦', special: 'warehouse' },
    [BuildingType.SHIPYARD]:    { size: 1, gold: 300, noRoad: true, sea: true, material: [I(Resource.SLATE, 20)], icon: '⚓', special: 'shipyard' },
    [BuildingType.DOCK]:        { size: 1, gold: 200, noRoad: true, sea: true, material: [I(Resource.SLATE, 20)], icon: '⛵', special: 'dock' },
    [BuildingType.ROAD]:        { size: 1, gold: 2,   noRoad: true, material: [I(Resource.TIMBER, 1)], icon: '🛣️', special: 'road' },
    [BuildingType.UNIVERSITY]:  { size: 2, material: [I(Resource.BRICK, 20)], icon: '🎓', special: 'university' },
    [BuildingType.COMPOST_PIT]: { size: 3, farm: true, material: [I(Resource.TIMBER, 10)], icon: '🌱', recipe: { workers: 5, worker_type: Resident.FARMER, efficiency: 6, in: [], out: [I(Resource.FERTILIZER)] } },
    // --- Jinlin (East Asian) ---
    [BuildingType.TEA_GARDEN]:  rawFarm('🍵', Resource.TEA),
    [BuildingType.SILK_FARM]:   rawFarm('🪺', Resource.SILK),
    [BuildingType.TOFU_SHOP]:   { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🫘', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.SOYBEAN)], out: [I(Resource.TOFU)] } },
    [BuildingType.KILN]:        { size: 2, material: [I(Resource.BRICK, 10)], icon: '🏺', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CLAY)], out: [I(Resource.PORCELAIN)] } },
    [BuildingType.NOODLE_SHOP]: { size: 2, material: [I(Resource.BRICK, 10)], icon: '🍜', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.RICE)], out: [I(Resource.NOODLE)] } },
    // --- Columbia (American frontier) ---
    [BuildingType.CATTLE_RANCH]:rawFarm('🐄', Resource.BEEF),
    [BuildingType.CORN_MILL]:   { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🌽', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.CORN)], out: [I(Resource.CORNBREAD)] } },
    [BuildingType.TANNERY]:     { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🥩', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.BEEF)], out: [I(Resource.LEATHER)] } },
    [BuildingType.DENIM_MILL]:  { size: 2, material: [I(Resource.BRICK, 10)], icon: '🧵', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.COTTON)], out: [I(Resource.DENIM)] } },
    [BuildingType.WHISKEY_DISTILLERY]:{ size: 2, material: [I(Resource.BRICK, 15)], icon: '🥃', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CORN)], out: [I(Resource.WHISKEY)] } },
    [BuildingType.RAIL_MILL]:   { size: 2, material: [I(Resource.STEEL, 20)], icon: '🛤️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.STEEL)], out: [I(Resource.RAIL)] } },
    // --- Solara (African / tropical) ---
    [BuildingType.PALM_GROVE]:  rawFarm('🌴', Resource.PALM_FRUIT),
    [BuildingType.INCENSE_GROVE]: rawFarm('🌿', Resource.INCENSE, { near: Feature.TREE }),
    [BuildingType.IVORY_CAMP]:  { size: 3, farm: true, near: Feature.TREE, material: [I(Resource.BRICK, 10)], icon: '🐘', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 8, in: [], out: [I(Resource.IVORY)] } },
    [BuildingType.PALM_OIL_PRESS]:{ size: 2, material: [I(Resource.TIMBER, 10)], icon: '🫗', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.PALM_FRUIT)], out: [I(Resource.PALM_OIL)] } },
    [BuildingType.COCOA_SHOP]:  { size: 2, material: [I(Resource.BRICK, 10)], icon: '🍫', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.COCOA)], out: [I(Resource.COCOA_DRINK)] } },
    [BuildingType.COPPER_MINE]: { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.BRICK, 20)], icon: '🪨', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 8, in: [], out: [I(Resource.COPPER)] } },
    [BuildingType.BRONZE_FOUNDRY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🔶', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.COPPER)], out: [I(Resource.BRONZE)] } },
    // --- Mintaka (polar) ---
    [BuildingType.REINDEER_FARM]: rawFarm('🦌', Resource.REINDEER_MEAT),
    [BuildingType.FUR_WORKSHOP]:{ size: 2, material: [I(Resource.TIMBER, 10)], icon: '🧥', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.FUR)], out: [I(Resource.FUR_COAT)] } },
    [BuildingType.SMOKEHOUSE]:  { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🐟', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.FISH), I(Resource.SALT)], out: [I(Resource.SMOKED_FISH)] } },
    [BuildingType.WHALING_POST]:{ size: 1, sea: true, material: [I(Resource.TIMBER, 10)], icon: '🐋', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.BLUBBER)] } },
    [BuildingType.BLUBBER_PRESS]:{ size: 2, material: [I(Resource.BRICK, 10)], icon: '🛢️', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.BLUBBER)], out: [I(Resource.WHALE_OIL)] } },
    [BuildingType.AMBER_MINE]:  { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.BRICK, 20)], icon: '🟡', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 8, in: [], out: [I(Resource.AMBER)] } },
}


// Per-building construction-cost overrides, consulted by BuildMaterial before the
// material-ladder rules below. Cheap timber lets a supply chain be bootstrapped
// from nothing; [] means "free" (only the gold cost applies). Retune a building's
// build cost here in one place.
export const BOOTSTRAP_MATERIAL: Partial<Record<BuildingType, Item[]>> = {
    [BuildingType.ROAD]:           [],
    [BuildingType.LUMBER_HUT]:     [],   // timber producers bootstrap free
    [BuildingType.SAWMILL]:        [],
    [BuildingType.HOUSE]:          [I(Resource.TIMBER, 1)],
    [BuildingType.WAREHOUSE]:      [I(Resource.TIMBER, 10)],
    [BuildingType.MASON_SHOP]:     [I(Resource.TIMBER, 10)],  // bootstraps the stone-block chain from timber, not brick
    // Themed-city workshops also bootstrap cheaply from timber.
    [BuildingType.TOFU_SHOP]:      [I(Resource.TIMBER, 5)],
    [BuildingType.NOODLE_SHOP]:    [I(Resource.TIMBER, 5)],
    [BuildingType.CORN_MILL]:      [I(Resource.TIMBER, 5)],
    [BuildingType.TANNERY]:        [I(Resource.TIMBER, 5)],
    [BuildingType.PALM_OIL_PRESS]: [I(Resource.TIMBER, 5)],
    [BuildingType.COCOA_SHOP]:     [I(Resource.TIMBER, 5)],
    [BuildingType.FUR_WORKSHOP]:   [I(Resource.TIMBER, 5)],
    [BuildingType.SMOKEHOUSE]:     [I(Resource.TIMBER, 5)],
    [BuildingType.BLUBBER_PRESS]:  [I(Resource.TIMBER, 5)],
}
