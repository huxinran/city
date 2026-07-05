// Building registry config — the single source of truth for every placeable
// building plus its per-building build-cost overrides. Pure data; edit here to
// add or retune a building. Re-exported from building.ts so importers keep paths.
import { Item } from "../storage"
import { Resource, Resident, ServiceType, BuildingType, Feature } from "../types"
import { Technology } from "./research.config"

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
}

// An extra resource a production building consumes each cycle, declared on the
// building def. `required` extras block production until pre-stocked; optional
// ones multiply speed by speedMultiplier when available. `tech`, if set, only
// activates the extra once that technology is researched. This is the general
// form of what used to be the hardcoded `recipe.coal` flag and the farm
// fertilizer special-case.
export interface ExtraSourceDef {
    resource: Resource
    amount: number
    required: boolean
    speedMultiplier?: number   // default 1.5
    maxStockpile?: number      // default 5
    tech?: Technology
}

export interface BuildingDef {
    size: 1 | 2 | 3
    material: Item[]
    icon: string
    gold?: number
    recipe?: Recipe
    extras?: ExtraSourceDef[]  // extra per-cycle inputs (e.g. coal for smelting)
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
    // Build-palette grouping. A building is shown under the population tier its
    // output first serves; `tier` overrides the auto-derived value and `other`
    // forces it into the catch-all "Other" bucket. Left unset for most buildings
    // (the tier is derived from recipes/needs — see GetBuildingTier).
    tier?: number
    other?: boolean
}

// A required-coal extra source, shared by the smelting recipes below.
const COAL_FIRED: ExtraSourceDef[] = [{ resource: Resource.COAL, amount: 1, required: true }]

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
    [BuildingType.HORSE_FARM]:        rawFarm('🐴', Resource.HORSE, { animal: true }),
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
    [BuildingType.PAPER_MILL]:  { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '📄', productIcon: '📄', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.WOOD)], out: [I(Resource.PAPER)] } },
    [BuildingType.INK_WORKSHOP]:{ size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🖋️', productIcon: '🖋️', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.COAL), I(Resource.OIL)], out: [I(Resource.INK)] } },
    [BuildingType.DYE_WORKSHOP]:{ size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🎨', productIcon: '🎨', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.BERRY)], out: [I(Resource.DYE)] } },
    [BuildingType.WINDMILL]:   { size: 2, material: [I(Resource.BRICK, 10)], icon: '🌀', productIcon: '🥣', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.WHEAT)], out: [I(Resource.FLOUR)] } },
    [BuildingType.BAKERY]:      { size: 2, material: [I(Resource.BRICK, 10)], icon: '🫕', productIcon: '🥖', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.FLOUR)], out: [I(Resource.BREAD)] } },
    [BuildingType.PICKLERY]:    { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🥒', productIcon: '🥒', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CABBAGE), I(Resource.SALT)], out: [I(Resource.PICKLES)] } },
    [BuildingType.DUMPLING_KITCHEN]:{ size: 2, material: [I(Resource.BRICK, 10)], icon: '🥟', productIcon: '🥟', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.FLOUR), I(Resource.PORK)], out: [I(Resource.DUMPLINGS)] } },
    [BuildingType.SUSHI_BAR]:   { size: 2, material: [I(Resource.BRICK, 10)], icon: '🍣', productIcon: '🍣', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.RICE), I(Resource.FISH)], out: [I(Resource.SUSHI)] } },
    [BuildingType.ICE_CREAMERY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🍨', productIcon: '🍨', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.MILK), I(Resource.SUGAR_CANE)], out: [I(Resource.ICE_CREAM)] } },
    [BuildingType.BUTCHERY]:    { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🔪', productIcon: '🌭', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.PORK)], out: [I(Resource.SAUSAGE)] } },
    [BuildingType.CIDERY]:      { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🍶', productIcon: '🍺', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.APPLE)], out: [I(Resource.CIDER)] } },
    [BuildingType.CREAMERY]:    { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🥛', productIcon: '🧀', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.MILK)], out: [I(Resource.CHEESE)] } },
    [BuildingType.POTTERY_SHOP]:{ size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🤲', productIcon: '🏺', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CLAY)], out: [I(Resource.POTTERY)] } },
    [BuildingType.PANT_SHOP]:   { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🧵', productIcon: '👖', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.WOOL)], out: [I(Resource.PANT)] } },
    [BuildingType.SHIRT_SHOP]:  { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '👕', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.COTTON)], out: [I(Resource.SHIRT)] } },
    [BuildingType.BOOT_SHOP]:   { size: 2, material: [I(Resource.BRICK, 10)], icon: '👢', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.FUR)], out: [I(Resource.BOOT)] } },
    [BuildingType.CIGAR_FACTORY]:{ size: 2, material: [I(Resource.BRICK, 10)], icon: '🍃', productIcon: '🚬', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.TOBACCO)], out: [I(Resource.CIGAR)] } },
    [BuildingType.CANDLE_MANUFACTORY]:{ size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🪔', productIcon: '🕯️', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.WAX)], out: [I(Resource.CANDLE)] } },
    [BuildingType.SOAP_WORKS]:  { size: 2, material: [I(Resource.BRICK, 10)], icon: '🧼', productIcon: '🧼', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.OIL), I(Resource.WAX)], out: [I(Resource.SOAP)] } },
    [BuildingType.GLASSWORKS]:   { size: 2, material: [I(Resource.BRICK, 20)], icon: '🫧', productIcon: '🪟', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.SAND)], out: [I(Resource.GLASS)] } },
    [BuildingType.BOTTLEWORKS]: { size: 2, material: [I(Resource.BRICK, 20)], icon: '🍾', productIcon: '🍾', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GLASS)], out: [I(Resource.GLASS_BOTTLE)] } },
    [BuildingType.GLAZIER]:     { size: 2, material: [I(Resource.BRICK, 20)], icon: '🪟', productIcon: '🪟', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GLASS)], out: [I(Resource.WINDOW)] } },
    [BuildingType.APOTHECARY]:  { size: 2, material: [I(Resource.BRICK, 20)], icon: '⚕️', productIcon: '💊', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GLASS_BOTTLE), I(Resource.WAX), I(Resource.OIL)], out: [I(Resource.MEDICINE)] } },
    [BuildingType.PERFUMERY]:   { size: 2, material: [I(Resource.BRICK, 20)], icon: '🌸', productIcon: '🧴', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GLASS_BOTTLE), I(Resource.OIL), I(Resource.BERRY)], out: [I(Resource.PERFUME)] } },
    [BuildingType.MASON_SHOP]:  { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🏛️', productIcon: '🪨', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.STONE)], out: [I(Resource.STONE_BLOCKS)] } },
    [BuildingType.CONCRETE_PLANT]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🏗️', productIcon: '🧱', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.STONE), I(Resource.SAND)], out: [I(Resource.CONCRETE)] } },
    [BuildingType.SCULPTOR]:    { size: 2, material: [I(Resource.STEEL, 20)], icon: '🗿', productIcon: '🗿', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.STONE), I(Resource.TOOL)], out: [I(Resource.STATUE)] } },
    [BuildingType.PRESERVE_SHOP]:     { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🍎', productIcon: '🫙', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.APPLE)], out: [I(Resource.JAM)] } },
    [BuildingType.BRANDY_DISTILLERY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🧪', productIcon: '🍾', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GRAPE)], out: [I(Resource.BRANDY)] } },
    [BuildingType.BRICKYARD]:   { size: 2, material: [I(Resource.STONE_BLOCKS, 20)], icon: '🏭', productIcon: '🧱', extras: COAL_FIRED, recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CLAY)], out: [I(Resource.BRICK)] } },
    [BuildingType.STEELWORKS]:   { size: 2, material: [I(Resource.BRICK, 20)], icon: '⚒️', productIcon: '⚙️', extras: COAL_FIRED, recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.IRON)], out: [I(Resource.STEEL)] } },
    [BuildingType.FORGE]:       { size: 2, material: [I(Resource.STEEL, 20)], icon: '🔥', productIcon: '🔩', extras: COAL_FIRED, recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.IRON_ORE)], out: [I(Resource.IRON)] } },
    [BuildingType.TOOLSMITH]:   { size: 2, material: [I(Resource.STEEL, 20)], icon: '🔧', productIcon: '⚒️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.IRON)], out: [I(Resource.TOOL)] } },
    [BuildingType.MACHINE_SHOP]:{ size: 2, material: [I(Resource.STEEL, 20)], icon: '⚙️', productIcon: '⚙️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.STEEL), I(Resource.TOOL)], out: [I(Resource.MACHINE_PARTS)] } },
    [BuildingType.GOLDSMITH]:   { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🔆', productIcon: '🪙', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.GOLD_ORE)], out: [I(Resource.GOLD)] } },
    [BuildingType.JEWELER]:     { size: 2, material: [I(Resource.STEEL, 20)], icon: '💎', productIcon: '💍', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GOLD)], out: [I(Resource.JEWELRY)] } },
    [BuildingType.WATCHMAKER]:  { size: 2, material: [I(Resource.STEEL, 20)], icon: '⌚', productIcon: '⌚', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GOLD), I(Resource.GLASS), I(Resource.MACHINE_PARTS)], out: [I(Resource.WATCH)] } },
    [BuildingType.CARPENTER_SHOP]:{ size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🪓', productIcon: '🪑', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.TIMBER)], out: [I(Resource.FURNITURE)] } },
    [BuildingType.PAINTER_STUDIO]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🖼️', productIcon: '🖼️', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.PAPER), I(Resource.DYE), I(Resource.TIMBER)], out: [I(Resource.PAINTINGS)] } },
    [BuildingType.WINERY]:      { size: 2, material: [I(Resource.BRICK, 20)], icon: '🍇', productIcon: '🍷', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GRAPE)], out: [I(Resource.WINE)] } },
    [BuildingType.OIL_PRESS]:   { size: 2, material: [I(Resource.STONE_BLOCKS, 10)], icon: '🫒', productIcon: '🫗', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.OLIVE)], out: [I(Resource.OIL)] } },
    [BuildingType.RUM_DISTILLERY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🍬', productIcon: '🥃', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.SUGAR_CANE)], out: [I(Resource.RUM)] } },
    // --- Sea producers ---
    [BuildingType.FISHERY]:     { size: 2, sea: true, material: [I(Resource.TIMBER, 10)], icon: '🎣', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.FISH)] } },
    // --- Houses, services, infrastructure ---
    [BuildingType.HOUSE]:       { size: 1, gold: 20,  material: [I(Resource.TIMBER, 5)],  icon: '🏠', special: 'house' },
    [BuildingType.WELL]:        { size: 1, gold: 80,  noRoad: true, material: [I(Resource.TIMBER, 10)], icon: '🪣', service: { need: ServiceType.WATER, radius: 10 } },
    [BuildingType.FIRE_STATION]:{ size: 1, gold: 120, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '🔔', service: { need: ServiceType.FIRE, radius: 12 } },
    [BuildingType.POLICE_STATION]:{ size: 1, gold: 120, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '⚖️', service: { need: ServiceType.POLICE, radius: 12 } },
    [BuildingType.SCHOOL]:      { size: 1, gold: 200, noRoad: true, material: [I(Resource.BRICK, 20)], icon: '📜', service: { need: ServiceType.SCHOOL, radius: 16 } },
    [BuildingType.MARKETPLACE]: { size: 1, gold: 120, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '🏪', service: { need: ServiceType.MARKET, radius: 12 } },
    [BuildingType.TAVERN]:      { size: 1, gold: 150, noRoad: true, material: [I(Resource.STONE_BLOCKS, 20)], icon: '🍺', service: { need: ServiceType.TAVERN, radius: 12 } },
    [BuildingType.CHAPEL]:      { size: 1, gold: 250, noRoad: true, material: [I(Resource.BRICK, 20)], icon: '⛪', service: { need: ServiceType.CHURCH, radius: 14 } },
    [BuildingType.CLINIC]:      { size: 1, gold: 150, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '🏥', service: { need: ServiceType.HEALTH, radius: 12 } },
    [BuildingType.COURTHOUSE]:  { size: 1, gold: 200, noRoad: true, material: [I(Resource.BRICK, 20)], icon: '⚖️', service: { need: ServiceType.JUSTICE, radius: 14 } },
    [BuildingType.ENGINEER_STATION]:{ size: 1, gold: 200, noRoad: true, material: [I(Resource.STEEL, 20)], icon: '🔧', service: { need: ServiceType.ENGINEER, radius: 14 } },
    [BuildingType.WAREHOUSE]:   { size: 2, gold: 150, noRoad: true, material: [I(Resource.TIMBER, 20)], icon: '📦', special: 'warehouse' },
    [BuildingType.SHIPYARD]:    { size: 1, gold: 300, noRoad: true, sea: true, material: [I(Resource.STONE_BLOCKS, 20)], icon: '⚓', special: 'shipyard' },
    [BuildingType.DOCK]:        { size: 1, gold: 200, noRoad: true, sea: true, material: [I(Resource.STONE_BLOCKS, 20)], icon: '⛵', special: 'dock' },
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
    [BuildingType.TANNERY]:     { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🥩', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.DEER)], out: [I(Resource.LEATHER)] } },
    // --- Solara (African / tropical) ---
    [BuildingType.INCENSE_GROVE]: rawFarm('🌿', Resource.INCENSE, { near: Feature.TREE }),
    [BuildingType.IVORY_CAMP]:  { size: 3, farm: true, near: Feature.TREE, material: [I(Resource.BRICK, 10)], icon: '🐘', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 8, in: [], out: [I(Resource.IVORY)] } },
    [BuildingType.COPPER_MINE]: { size: 2, mine: true, near: Feature.ROCK, material: [I(Resource.BRICK, 20)], icon: '🪨', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 8, in: [], out: [I(Resource.COPPER)] } },
    // --- Mintaka (polar) ---
    [BuildingType.REINDEER_FARM]: rawFarm('🦌', Resource.DEER),
    [BuildingType.FUR_WORKSHOP]:{ size: 2, material: [I(Resource.TIMBER, 10)], icon: '🧥', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.FUR)], out: [I(Resource.FUR_COAT)] } },
    [BuildingType.SMOKEHOUSE]:  { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🐟', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [I(Resource.FISH), I(Resource.SALT)], out: [I(Resource.SMOKED_FISH)] } },
    [BuildingType.WHALING_POST]:{ size: 2, sea: true, material: [I(Resource.TIMBER, 10)], icon: '🐋', recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(Resource.WHALE_OIL)] } },
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
    [BuildingType.MASON_SHOP]:     [I(Resource.TIMBER, 10)],  // bootstraps the stone blocks chain from timber, not brick
    // Themed-city workshops also bootstrap cheaply from timber.
    [BuildingType.TOFU_SHOP]:      [I(Resource.TIMBER, 5)],
    [BuildingType.NOODLE_SHOP]:    [I(Resource.TIMBER, 5)],
    [BuildingType.TANNERY]:        [I(Resource.TIMBER, 5)],
    [BuildingType.FUR_WORKSHOP]:   [I(Resource.TIMBER, 5)],
    [BuildingType.SMOKEHOUSE]:     [I(Resource.TIMBER, 5)],
}


// --- Build-palette tier grouping --------------------------------------------
// A building is grouped under the population tier its OUTPUT serves, auto-derived
// from the needs/upgrade tables and recipe chains (see GetBuildingTier). These
// two tables are the exceptions to that derivation. New buildings should prefer
// the inline `tier` / `other` fields on their BuildingDef; these bulk tables
// remain for the existing catalog.
//
// Buildings surfaced under an earlier tier than their output resource implies,
// so basic materials appear where the player first needs them.
export const BUILDING_TIER_OVERRIDE: { [key: string]: number } = {
    [BuildingType.LUMBER_HUT]: 1,   // wood   (Farmer)
    [BuildingType.SAWMILL]:    1,   // timber (Farmer)
    [BuildingType.DYE_WORKSHOP]: 2, // dye (Worker)
    [BuildingType.PICKLERY]:   2,   // pickles (Worker)
    [BuildingType.BRICKYARD]:  3,   // brick  (Artisan; built from tier-2 stone blocks)
    [BuildingType.STONE_QUARRY]: 2, // stone       (Worker)
    [BuildingType.MASON_SHOP]:   2, // stone blocks (Worker)
    [BuildingType.VINEYARD]:     4, // grape (Scholar)
    [BuildingType.WINERY]:       4, // wine  (Scholar)
    [BuildingType.FIRE_STATION]: 2, // fire service (Worker; default service-unlock tier is 3)
    [BuildingType.MARKETPLACE]: 1,  // market service (Farmer; default service-unlock tier is 2)
    [BuildingType.COTTON_FIELD]: 2, // cotton (Worker)
    [BuildingType.SHIRT_SHOP]:  2,  // shirt  (Worker)
    [BuildingType.CLINIC]:      2,  // health service (Worker; default service-unlock tier is 3)
    [BuildingType.COAL_KILN]:   2,  // coal (Worker; coal feeds tier-3 build goods)
    [BuildingType.SCHOOL]:      3,  // school service (Artisan; default service-unlock tier is 4)
    [BuildingType.OLIVE_GROVE]: 3,  // olive (Artisan; oil is a tier-6 luxury good)
    [BuildingType.OIL_PRESS]:   3,  // oil   (Artisan)
    [BuildingType.PAPER_MILL]:  3,  // paper (Artisan)
    [BuildingType.INK_WORKSHOP]: 3, // ink (Artisan)
    [BuildingType.DUMPLING_KITCHEN]: 3, // dumplings (Artisan)
    [BuildingType.SUSHI_BAR]:   3,  // sushi (Artisan)
    [BuildingType.TRAPLINE]:    3,  // fur  (Artisan)
    [BuildingType.BOOT_SHOP]:   3,  // boot (Artisan)
    [BuildingType.ENGINEER_STATION]: 3, // engineering service (Artisan; default service-unlock tier is 5)
    [BuildingType.TOOLSMITH]:   3,  // tool (Artisan; refined iron goods, feeds the statue chain)
    [BuildingType.WHEAT_FARM]: 3,   // wheat  (Artisan; bread is a tier-2 upgrade good, which would pull the chain to Worker)
    [BuildingType.WINDMILL]:  3,   // flour  (Artisan)
    [BuildingType.BAKERY]:     3,   // bread  (Artisan)
    [BuildingType.IRON_MINE]:  3,   // iron ore   (Artisan; steel is a tier-4 build good, which would pull the chain to Scholar)
    [BuildingType.FORGE]:      3,   // iron ingot (Artisan)
    [BuildingType.STEELWORKS]:  3,   // steel      (Artisan)
    [BuildingType.BOTTLEWORKS]: 4,  // glass bottle (Scholar)
    [BuildingType.APOTHECARY]: 4,   // medicine (Scholar)
    [BuildingType.SOAP_WORKS]: 4,   // soap (Scholar)
    [BuildingType.PERFUMERY]:  5,   // perfume (Entrepreneur)
    [BuildingType.PAINTER_STUDIO]: 5, // paintings (Entrepreneur)
    [BuildingType.MACHINE_SHOP]: 5, // machine parts (Entrepreneur)
    [BuildingType.ICE_CREAMERY]: 5, // ice cream (Entrepreneur)
    [BuildingType.WATCHMAKER]: 6,   // watch (Magnate)
    // --- Jinlin buildings ---
    [BuildingType.TEA_GARDEN]:  1,  // tea garden produces basic resource
    [BuildingType.SILK_FARM]:   1,  // silk farm produces basic material
    [BuildingType.TOFU_SHOP]:   1,  // tofu is a tier-1 food need in Jinlin
    [BuildingType.KILN]:        2,  // porcelain is tier-2 daily need in Jinlin
    [BuildingType.NOODLE_SHOP]: 2,  // noodles are tier-2 food in Jinlin
    // --- Columbia buildings ---
    [BuildingType.TANNERY]:           1,  // leather is tier-1 daily need
    // --- Solara buildings ---
    [BuildingType.COPPER_MINE]:     2,  // copper is tier-2 daily need
    [BuildingType.INCENSE_GROVE]:   2,  // incense is tier-2 luxury
    [BuildingType.IVORY_CAMP]:      3,  // ivory is a tier-3 luxury good
    // --- Mintaka buildings ---
    [BuildingType.REINDEER_FARM]:   2,  // deer is tier-2 food
    [BuildingType.FUR_WORKSHOP]:    1,  // fur coat is tier-1 daily need
    [BuildingType.SMOKEHOUSE]:      1,  // smoked fish is tier-1 food
    [BuildingType.WHALING_POST]:    2,  // whale oil is tier-2 daily need
    // --- Shared utility ---
    [BuildingType.COMPOST_PIT]: 1,      // fertilizer boosts tier-1+ farms
    [BuildingType.UNIVERSITY]:  4,      // unlocks after Scholars (tier 4)
}

// Buildings forced out of the tier groups into the palette's "Other" bucket,
// regardless of what their output resource would imply.
export const FORCE_OTHER_BUILDINGS = new Set<BuildingType>([
    BuildingType.BANANA_PLANTATION,
    BuildingType.CORN_FIELD,
    BuildingType.SALTERN,
    BuildingType.RICE_PADDY,
    BuildingType.COCOA_PLANT,
    BuildingType.RUM_DISTILLERY,
    BuildingType.SOYBEAN_FARM,
    BuildingType.SUGAR_CANE_PLANTATION,
    BuildingType.GOLD_MINE,
    BuildingType.GOLDSMITH,
])
