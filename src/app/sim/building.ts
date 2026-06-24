import { Storage, Item } from "./storage"
import { Tile } from "./tile"
import { TakeItems } from "./utils"
import { BALANCE } from "./balance"
import { Resource, HouseType, Resident, ProductionStatus, ServiceType, ShippingTaskType, BuildingType, ShipType, CityName, Terrain, Feature } from "./types"

// Shorthand for the many Item literals in the building registry below.
const I = (type: Resource, num = 1) => new Item(type, num)
const cloneItems = (items: Item[]) => items.map(it => new Item(it.type, it.num))


// --- Resident / house tier ladders -------------------------------------------
// A house's tier (1..6) maps straight onto its resident class and house art.
const RESIDENT_BY_TIER: Resident[] = [
    Resident.MAGNATE /* 0 unused */, Resident.FARMER, Resident.WORKER,
    Resident.ARTISAN, Resident.SCHOLAR, Resident.ENTREPRENEUR, Resident.MAGNATE,
]
const HOUSE_TYPE_BY_TIER: HouseType[] = [
    HouseType.ESTATE /* 0 unused */, HouseType.COTTAGE, HouseType.TENEMENT,
    HouseType.HOUSE, HouseType.VILLA, HouseType.MANSION, HouseType.ESTATE,
]

export function GetResidentType(tier: number): Resident {
    return RESIDENT_BY_TIER[tier] ?? Resident.MAGNATE
}

export function GetHouseType(tier: number): HouseType {
    return HOUSE_TYPE_BY_TIER[tier] ?? HouseType.ESTATE
}

export function GetCurrentMaxOccupant(tier: number, happiness: number) {
    let min = Math.max(2, (tier - 1) * 10)
    let max = tier * 10
    let range = max - min
    return Math.floor(min + range * happiness)
}

// Gold collected from one resident per tick at full (100%) tax, by tier.
// Wealthier residents are taxed more heavily than farmers.
const TAX_PER_RESIDENT: { [key in Resident]: number } = {
    [Resident.FARMER]:       0.002,
    [Resident.WORKER]:       0.004,
    [Resident.ARTISAN]:      0.007,
    [Resident.SCHOLAR]:      0.011,
    [Resident.ENTREPRENEUR]: 0.016,
    [Resident.MAGNATE]:      0.022,
}
export function GetTaxPerResident(tier: Resident): number {
    return TAX_PER_RESIDENT[tier] ?? 0.002
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


// --- Data-model classes ------------------------------------------------------
// A Building is a small bag of optional sub-systems; exactly one of house /
// production / service / warehouse / shipyard / dock / university is populated
// (roads carry none). Constructed via a named-field options object so adding a
// new sub-system never reshuffles positional arguments at the call site.
export class Building {
    type: BuildingType
    material: Item[]
    house?: House
    production?: Production
    service?: Service
    warehouse?: Warehouse
    shipyard?: Shipyard
    dock?: Dock
    university?: University

    constructor(opts: {
        type: BuildingType
        material?: Item[]
        house?: House
        production?: Production
        service?: Service
        warehouse?: Warehouse
        shipyard?: Shipyard
        dock?: Dock
        university?: University
    }) {
        this.type = opts.type
        this.material = opts.material ?? []
        this.house = opts.house
        this.production = opts.production
        this.service = opts.service
        this.warehouse = opts.warehouse
        this.shipyard = opts.shipyard
        this.dock = opts.dock
        this.university = opts.university
    }
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

// --- Happiness model ---------------------------------------------------------
// Tuning knobs live in BALANCE.happiness (see balance.ts). Base happiness
// (0..1) is the weighted fraction of a house's service and goods needs that are
// currently satisfied.
export function ComputeBaseHappiness(house: House): number {
    let satisfiedWeight = 0
    let totalWeight = 0
    for (let n of house.service_needs) {
        totalWeight += BALANCE.happiness.serviceWeight
        if (n.satisfied) satisfiedWeight += BALANCE.happiness.serviceWeight
    }
    for (let n of house.resource_needs) {
        totalWeight += BALANCE.happiness.goodsWeight
        if (n.satisfied) satisfiedWeight += BALANCE.happiness.goodsWeight
    }
    return totalWeight === 0 ? 1.0 : satisfiedWeight / totalWeight
}

// --- House upgrade condition -------------------------------------------------
// The rule lives in BALANCE.houseUpgrade (see balance.ts). The UI just calls
// CanUpgradeHouse().

// Fraction of a need list currently satisfied (1.0 when the list is empty).
function satisfiedRatio(needs: { satisfied: boolean }[]): number {
    if (needs.length === 0) return 1.0
    let met = 0
    for (let n of needs) if (n.satisfied) met++
    return met / needs.length
}

// Whether a house meets the configured condition to upgrade to the next tier.
// Pure function of the house + BALANCE.houseUpgrade — cheap to call every frame.
export function CanUpgradeHouse(house: House): boolean {
    if (house.tier >= GetCityMaxTier(house.city_type)) return false
    const r = BALANCE.houseUpgrade
    return satisfiedRatio(house.service_needs) >= r.minServiceRatio
        && satisfiedRatio(house.resource_needs) >= r.minGoodsRatio
        && house.happiness >= r.minHappiness
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
    if (tier == 1) return 4
    else if (tier == 2) return 6
    else return 8
}

// Tiles travelled per tick. Kept well below 1 so carts step a fraction of a
// tile each tick — slower journeys and smooth, granular motion between tiles.
function GetCartSpeed(tier: number) {
    if (tier == 1) return 0.3
    else if (tier == 2) return 0.45
    else return 0.6
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
interface Recipe {
    workers: number
    worker_type: Resident
    efficiency: number
    in: Item[]
    out: Item[]
    coal?: boolean   // adds a required Coal extra source (kiln/forge/steelwork)
}
interface BuildingDef {
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
function rawFarm(icon: string, out: Resource, opts: Partial<BuildingDef> = {}): BuildingDef {
    return {
        size: 3, farm: true, material: [I(Resource.TIMBER, 10)], icon,
        recipe: { workers: 10, worker_type: Resident.FARMER, efficiency: 10, in: [], out: [I(out)] },
        ...opts,
    }
}

const BUILDING_DEFS: Partial<Record<BuildingType, BuildingDef>> = {
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
    [BuildingType.DIARY_FARM]:        rawFarm('🐄', Resource.MILK,  { animal: true }),
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
    [BuildingType.CANDLE_Manufactory]:{ size: 2, material: [I(Resource.SLATE, 10)], icon: '🪔', productIcon: '🕯️', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.WAX)], out: [I(Resource.CANDLE)] } },
    [BuildingType.GLASSWORK]:   { size: 2, material: [I(Resource.BRICK, 20)], icon: '🫧', productIcon: '🪟', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.SAND)], out: [I(Resource.GLASS)] } },
    [BuildingType.GLAZIER]:     { size: 2, material: [I(Resource.BRICK, 20)], icon: '🪟', productIcon: '🪟', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GLASS)], out: [I(Resource.WINDOW)] } },
    [BuildingType.MASON_SHOP]:  { size: 2, material: [I(Resource.TIMBER, 10)], icon: '🏛️', productIcon: '🪨', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.STONE)], out: [I(Resource.SLATE)] } },
    [BuildingType.CONCRETE_PLANT]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🏗️', productIcon: '🧱', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.STONE), I(Resource.SAND)], out: [I(Resource.CONCRETE)] } },
    [BuildingType.SCULPTOR]:    { size: 2, material: [I(Resource.STEEL, 20)], icon: '🗿', productIcon: '🗿', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.STONE), I(Resource.TOOL)], out: [I(Resource.STATUE)] } },
    [BuildingType.CANNERY]:     { size: 2, material: [I(Resource.SLATE, 10)], icon: '🍎', productIcon: '🫙', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.APPLE)], out: [I(Resource.JAM)] } },
    [BuildingType.BRANDY_DISTILLERY]:{ size: 2, material: [I(Resource.BRICK, 20)], icon: '🧪', productIcon: '🍾', recipe: { workers: 10, worker_type: Resident.ARTISAN, efficiency: 10, in: [I(Resource.GRAPE)], out: [I(Resource.BRANDY)] } },
    [BuildingType.BRICKYARY]:   { size: 2, material: [I(Resource.SLATE, 20)], icon: '🏭', productIcon: '🧱', recipe: { workers: 10, worker_type: Resident.WORKER, efficiency: 10, in: [I(Resource.CLAY)], out: [I(Resource.BRICK)], coal: true } },
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


// --- Derived membership sets & lookups ---------------------------------------
const DEF_ENTRIES = Object.entries(BUILDING_DEFS) as [BuildingType, BuildingDef][]
function defsWhere(pred: (d: BuildingDef) => boolean): Set<BuildingType> {
    return new Set(DEF_ENTRIES.filter(([, d]) => pred(d)).map(([t]) => t))
}

// Farm-type buildings get a special "farmhouse + produce" map rendering.
export const FARM_BUILDINGS = defsWhere(d => !!d.farm)
export const ANIMAL_FARM_BUILDINGS = defsWhere(d => !!d.animal)
// Raw resource extraction buildings that use the mine-camp art as background.
export const MINE_CAMP_BUILDINGS = defsWhere(d => !!d.mine)
// Anything that runs a production recipe and isn't a farm is a "workshop".
export const WORKSHOP_BUILDINGS = defsWhere(d => !!d.recipe && !d.farm)

export function IsFarmBuilding(type: BuildingType): boolean { return FARM_BUILDINGS.has(type) }
export function IsAnimalFarm(type: BuildingType): boolean { return ANIMAL_FARM_BUILDINGS.has(type) }
export function IsMineCampBuilding(type: BuildingType): boolean { return MINE_CAMP_BUILDINGS.has(type) }
export function IsWorkshopBuilding(type: BuildingType): boolean { return WORKSHOP_BUILDINGS.has(type) }

// Roads/houses/services are 1x1, workshops are 2x2, farms are 3x3.
export function GetBuildingSize(type: BuildingType): number {
    return BUILDING_DEFS[type]?.size ?? 3
}

// Gold charged (in addition to materials) to construct each building.
export function GetBuildingGoldCost(type: BuildingType): number {
    if (type === BuildingType.DELETE) return 0
    const def = BUILDING_DEFS[type]
    if (def?.gold !== undefined) return def.gold
    if (def?.size === 3) return 100         // farms
    if (def?.recipe) return 150             // other production (workshops/mines)
    return 100
}

const LAND_TERRAINS = [Terrain.GRASS, Terrain.SAND, Terrain.DIRT]

// Water buildings need water; everything else sits on open land. Mines/lumber
// additionally need a rock/tree feature nearby (not under) — see GetRequiredNearbyFeature.
export function GetRequiredTerrains(type: BuildingType): Terrain[] {
    return BUILDING_DEFS[type]?.sea ? [Terrain.WATER] : LAND_TERRAINS
}

// Whether a tile's natural feature allows this building to sit on it. Every
// building must be placed on open land (no tree/rock on the tile itself).
export function FeatureMatches(type: BuildingType, feature?: Feature): boolean {
    return feature == undefined
}

// The feature that must exist on a tile near (not under) this building: rock for
// mines, trees for lumber/foraging. Undefined for buildings with no such need.
export function GetRequiredNearbyFeature(type: BuildingType): Feature | undefined {
    return BUILDING_DEFS[type]?.near
}

// The terrain that must exist on a tile near this building: the sand pit digs
// from a nearby sand deposit while sitting on solid ground.
export function GetRequiredNearbyTerrain(type: BuildingType): Terrain | undefined {
    return BUILDING_DEFS[type]?.nearSand ? Terrain.SAND : undefined
}

// Houses and production buildings must be built touching a road (carts only
// travel on roads). Roads, services and port buildings have no such need.
export function RequiresRoad(type: BuildingType): boolean {
    if (type === BuildingType.DELETE) return false
    return !BUILDING_DEFS[type]?.noRoad
}

// Emoji shown for each building on the map and in the build palette.
export function GetBuildingIcon(type: BuildingType): string {
    if (type === BuildingType.DELETE) return '🗑️'
    return BUILDING_DEFS[type]?.icon ?? '🏗️'
}

// Output-product icon for each workshop building, shown alongside the process icon.
export function GetWorkshopProductIcon(type: BuildingType): string {
    return BUILDING_DEFS[type]?.productIcon ?? ''
}

// Build a building's blueprint (its material cost and production recipe) without
// charging anything. Pure — safe to call for previews/tooltips. CreateBuilding
// wraps this and deducts the cost from storage.
export function MakeBuilding(type: BuildingType): Building | undefined {
    const def = BUILDING_DEFS[type]
    if (!def) return undefined
    const material = cloneItems(def.material)
    let b: Building
    switch (def.special) {
        case 'house':      b = new Building({ type, material, house: new House() }); break
        case 'warehouse':  b = new Building({ type, material, warehouse: new Warehouse() }); break
        case 'shipyard':   b = new Building({ type, material, shipyard: new Shipyard() }); break
        case 'dock':       b = new Building({ type, material, dock: new Dock() }); break
        case 'university': b = new Building({ type, material, university: new University() }); break
        case 'road':       b = new Building({ type, material }); break
        default:
            if (def.service) {
                b = new Building({ type, material, service: new Service(def.service.need, def.service.radius) })
            } else if (def.recipe) {
                const r = def.recipe
                const p = new Production(r.workers, r.worker_type, r.efficiency, cloneItems(r.in), cloneItems(r.out))
                if (r.coal) p.extra_sources = [new ExtraSource(Resource.COAL, 1, true)]
                b = new Building({ type, material, production: p })
            } else {
                b = new Building({ type, material })
            }
    }
    b.material = BuildMaterial(type, b.material)
    // All farms (except the compost pit) get an optional fertilizer boost,
    // gated behind the Fertilizer Application research.
    if (b.production && def.farm && type !== BuildingType.COMPOST_PIT) {
        b.production.extra_sources = [
            new ExtraSource(Resource.FERTILIZER, 1, false, 1.5, 5, Technology.FERTILIZER_APPLICATION),
        ]
    }
    return b
}

// Construction-material ladder, lowest tier first. A building's tier maps onto a
// rung: tier 1 -> timber, 2 -> brick, 3 -> slate, 4+ -> steel (capped at the top).
const BUILD_MATERIAL_LADDER = [Resource.TIMBER, Resource.BRICK, Resource.SLATE, Resource.STEEL]
// Ladder position of a resource (1-based); 0 if it is not a construction material.
function materialLevel(r: Resource): number { return BUILD_MATERIAL_LADDER.indexOf(r) + 1 }
function materialForTier(tier: number): Resource {
    return BUILD_MATERIAL_LADDER[Math.min(Math.max(tier, 1), BUILD_MATERIAL_LADDER.length) - 1]
}

// Construction material cost, overriding the per-building defaults above:
//  - the wood/timber producers cost only money (no material), so the timber
//    supply chain can be bootstrapped from nothing;
//  - farms cost a single timber; the warehouse costs 10;
//  - a building that PRODUCES a construction material is built from the rung
//    just below its output (never its own output or higher);
//  - every other building may use its own tier's material but nothing higher
//    (e.g. a Well, a tier-1 service, never demands slate/steel).
function BuildMaterial(type: BuildingType, current: Item[]): Item[] {
    if (type == BuildingType.ROAD) return []
    if (type == BuildingType.LUMBER_HUT || type == BuildingType.SAWMILL) return []
    if (type == BuildingType.HOUSE) return [new Item(Resource.TIMBER, 1)]
    if (FARM_BUILDINGS.has(type)) return [new Item(Resource.TIMBER, 1)]
    if (type == BuildingType.WAREHOUSE) return [new Item(Resource.TIMBER, 10)]
    // Mason shop bootstraps the stone-block chain from timber, not brick.
    if (type == BuildingType.MASON_SHOP) return [new Item(Resource.TIMBER, 10)]
    // Themed city workshops also bootstrap cheaply from timber
    if (type == BuildingType.TOFU_SHOP || type == BuildingType.NOODLE_SHOP) return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.CORN_MILL || type == BuildingType.TANNERY)     return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.PALM_OIL_PRESS || type == BuildingType.COCOA_SHOP) return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.FUR_WORKSHOP || type == BuildingType.SMOKEHOUSE) return [new Item(Resource.TIMBER, 5)]
    if (type == BuildingType.BLUBBER_PRESS) return [new Item(Resource.TIMBER, 5)]

    const def = BUILDING_DEFS[type]
    // Material-producer buildings build from the previous rung of the ladder.
    const product = def?.recipe?.out?.[0]?.type
    const outLevel = product !== undefined ? materialLevel(product) : 0
    if (outLevel > 0) {
        if (outLevel === 1) return []                  // timber producer bootstraps free
        const prev = BUILD_MATERIAL_LADDER[outLevel - 2]
        return [new Item(prev, current[0]?.num ?? 20)]
    }
    // Other buildings: clamp any material above the building's own tier down to it.
    const tier = GetBuildingTier(type)
    if (tier === undefined) return current
    const cap = materialForTier(tier)
    const capLevel = materialLevel(cap)
    return current.map(it => materialLevel(it.type) > capLevel ? new Item(cap, it.num) : it)
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
    // Collect every production recipe (ingredient list -> product list). Read
    // straight from the defs rather than MakeBuilding so this stays independent
    // of BuildMaterial (which itself consults building tiers).
    let recipes: { ingredients: string[], products: string[] }[] = []
    for (let [, def] of DEF_ENTRIES) {
        if (def.recipe) {
            recipes.push({
                ingredients: [
                    ...def.recipe.in.map(i => i.type),
                    ...(def.recipe.coal ? [Resource.COAL] : []),
                ],
                products: def.recipe.out.map(p => p.type),
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
    [BuildingType.BRICKYARY]:  3,   // brick  (Artisan; brick itself is a tier-3 build good)
    [BuildingType.STONE_QUARRY]: 2, // stone       (Worker)
    [BuildingType.MASON_SHOP]:   2, // slate/stone block (Worker)
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

// Buildings forced out of the tier groups into the palette's "Other" bucket,
// regardless of what their output resource would imply.
const FORCE_OTHER_BUILDINGS = new Set<BuildingType>([
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

export function GetBuildingTier(type: BuildingType): number | undefined {
    if (FORCE_OTHER_BUILDINGS.has(type)) return undefined
    if (type in BUILDING_TIER_OVERRIDE) return BUILDING_TIER_OVERRIDE[type]
    const def = BUILDING_DEFS[type]
    if (!def) return undefined
    if (def.service) return SERVICE_UNLOCK_TIER[def.service.need]
    if (def.recipe) {
        let map = resourceTierMap()
        let tiers = def.recipe.out
            .map(p => map[p.type])
            .filter((t): t is number => t !== undefined)
        if (tiers.length) return Math.min(...tiers)
    }
    return undefined
}


// --- House upgrade costs -----------------------------------------------------
// To upgrade a house INTO the given tier you must supply a basket of goods,
// grouped into Food / Daily / Luxury / build materials. The basket grows in both
// quantity and variety each step. (Services are required separately — see
// GetServiceNeed — and gate happiness, which itself gates the upgrade.)
export interface UpgradeBasket {
    food: Item[]
    daily: Item[]
    luxury: Item[]
    build: Item[]
}

const EMPTY_BASKET: UpgradeBasket = { food: [], daily: [], luxury: [], build: [] }


// --- Per-city profiles -------------------------------------------------------
// Each region defines its own consumption needs, required services and house
// upgrade baskets. `needs`/`services` are ordered lists tagged with the earliest
// tier that requires them; a house of tier N gets every entry with tier <= N
// (preserving list order). Non-Anrelia regions cap at tier 3.
interface CityProfile {
    maxTier: number
    needs: { resource: Resource, tier: number }[]
    services: { service: ServiceType, tier: number }[]
    upgrades: { [tier: number]: UpgradeBasket }
}

// Services for the 3-tier themed regions (shared by all non-Anrelia cities).
const THEMED_SERVICES: { service: ServiceType, tier: number }[] = [
    { service: ServiceType.WATER,  tier: 1 },
    { service: ServiceType.MARKET, tier: 2 },
    { service: ServiceType.HEALTH, tier: 2 },
    { service: ServiceType.FIRE,   tier: 3 },
    { service: ServiceType.SCHOOL, tier: 3 },
]

const CITY_PROFILES: Record<CityName, CityProfile> = {
    [CityName.ANRELIA]: {
        maxTier: 6,
        needs: [
            { resource: Resource.FISH,      tier: 1 },
            { resource: Resource.SAUSAGE,   tier: 2 },
            { resource: Resource.CABBAGE,   tier: 2 },
            { resource: Resource.BREAD,     tier: 3 },
            { resource: Resource.CHEESE,    tier: 4 },
            { resource: Resource.PANT,      tier: 1 },
            { resource: Resource.POTTERY,   tier: 2 },
            { resource: Resource.FURNITURE, tier: 5 },
            { resource: Resource.CIDER,     tier: 3 },
            { resource: Resource.WINE,      tier: 4 },
            { resource: Resource.BRANDY,    tier: 6 },
        ],
        services: [
            { service: ServiceType.WATER,    tier: 1 },
            { service: ServiceType.MARKET,   tier: 2 },
            { service: ServiceType.FIRE,     tier: 3 },
            { service: ServiceType.POLICE,   tier: 3 },
            { service: ServiceType.HEALTH,   tier: 3 },
            { service: ServiceType.SCHOOL,   tier: 4 },
            { service: ServiceType.JUSTICE,  tier: 4 },
            { service: ServiceType.TAVERN,   tier: 5 },
            { service: ServiceType.ENGINEER, tier: 5 },
            { service: ServiceType.CHURCH,   tier: 6 },
        ],
        upgrades: {
            // Cottage -> Tenement (Farmer -> Worker): first comforts.
            2: { food: [I(Resource.BREAD, 10)], daily: [I(Resource.POTTERY, 8)], luxury: [], build: [I(Resource.TIMBER, 10)] },
            // Tenement -> House (Worker -> Artisan): a furnished household.
            3: { food: [I(Resource.SAUSAGE, 10), I(Resource.CHEESE, 10)], daily: [I(Resource.PANT, 8)], luxury: [I(Resource.CIDER, 8)], build: [I(Resource.BRICK, 15)] },
            // House -> Villa (Artisan -> Scholar): a refined home.
            4: { food: [I(Resource.CHEESE, 12), I(Resource.APPLE, 12)], daily: [I(Resource.FURNITURE, 10), I(Resource.GLASS, 8)], luxury: [I(Resource.WINE, 10)], build: [I(Resource.STEEL, 12)] },
            // Villa -> Mansion (Scholar -> Entrepreneur): a gentleman's estate.
            5: { food: [I(Resource.SAUSAGE, 15), I(Resource.JAM, 12)], daily: [I(Resource.FURNITURE, 15), I(Resource.GLASS, 12)], luxury: [I(Resource.WINE, 15), I(Resource.BRANDY, 12)], build: [I(Resource.WINDOW, 15)] },
            // Mansion -> Estate (Entrepreneur -> Magnate): the grandest residence.
            6: { food: [I(Resource.CHEESE, 18), I(Resource.APPLE, 18)], daily: [I(Resource.FURNITURE, 20), I(Resource.GLASS, 18)], luxury: [I(Resource.BRANDY, 25), I(Resource.WINE, 20), I(Resource.OIL, 15)], build: [I(Resource.STATUE, 10)] },
        },
    },
    [CityName.JINLIN]: {
        maxTier: 3,
        needs: [
            { resource: Resource.RICE,      tier: 1 },
            { resource: Resource.FISH,      tier: 1 },
            { resource: Resource.TOFU,      tier: 2 },
            { resource: Resource.NOODLE,    tier: 3 },
            { resource: Resource.PANT,      tier: 1 },
            { resource: Resource.SILK,      tier: 2 },
            { resource: Resource.PORCELAIN, tier: 3 },
            { resource: Resource.TEA,       tier: 2 },
            { resource: Resource.WINE,      tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.TOFU, 8)], daily: [I(Resource.SILK, 6)], luxury: [], build: [I(Resource.TIMBER, 10)] },
            3: { food: [I(Resource.NOODLE, 10)], daily: [I(Resource.PORCELAIN, 8)], luxury: [I(Resource.TEA, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
    [CityName.COLUMBIA]: {
        maxTier: 3,
        needs: [
            { resource: Resource.CORNBREAD, tier: 1 },
            { resource: Resource.BEEF,      tier: 2 },
            { resource: Resource.SAUSAGE,   tier: 3 },
            { resource: Resource.LEATHER,   tier: 1 },
            { resource: Resource.DENIM,     tier: 2 },
            { resource: Resource.FURNITURE, tier: 3 },
            { resource: Resource.WHISKEY,   tier: 2 },
            { resource: Resource.BRANDY,    tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.CORNBREAD, 8)], daily: [I(Resource.LEATHER, 6)], luxury: [], build: [I(Resource.TIMBER, 10)] },
            3: { food: [I(Resource.BEEF, 10)], daily: [I(Resource.DENIM, 8)], luxury: [I(Resource.WHISKEY, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
    [CityName.SOLARA]: {
        maxTier: 3,
        needs: [
            { resource: Resource.BANANA,      tier: 1 },
            { resource: Resource.COCOA_DRINK, tier: 2 },
            { resource: Resource.PORK,        tier: 3 },
            { resource: Resource.PALM_OIL,    tier: 1 },
            { resource: Resource.BRONZE,      tier: 2 },
            { resource: Resource.POTTERY,     tier: 3 },
            { resource: Resource.INCENSE,     tier: 2 },
            { resource: Resource.GOLD,        tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.COCOA_DRINK, 8)], daily: [I(Resource.PALM_OIL, 6)], luxury: [], build: [I(Resource.TIMBER, 10)] },
            3: { food: [I(Resource.PORK, 10)], daily: [I(Resource.BRONZE, 8)], luxury: [I(Resource.INCENSE, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
    [CityName.MINTAKA]: {
        maxTier: 3,
        needs: [
            { resource: Resource.SMOKED_FISH,   tier: 1 },
            { resource: Resource.REINDEER_MEAT, tier: 2 },
            { resource: Resource.CHEESE,        tier: 3 },
            { resource: Resource.FUR_COAT,      tier: 1 },
            { resource: Resource.WHALE_OIL,     tier: 2 },
            { resource: Resource.TOOL,          tier: 3 },
            { resource: Resource.RUM,           tier: 2 },
            { resource: Resource.AMBER,         tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.SMOKED_FISH, 8)], daily: [I(Resource.FUR_COAT, 6)], luxury: [], build: [I(Resource.TIMBER, 10)] },
            3: { food: [I(Resource.REINDEER_MEAT, 10)], daily: [I(Resource.WHALE_OIL, 8)], luxury: [I(Resource.RUM, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
}

function profileFor(cityType?: CityName): CityProfile {
    return CITY_PROFILES[cityType ?? CityName.ANRELIA] ?? CITY_PROFILES[CityName.ANRELIA]
}

// Max tier per city: non-Anrelia cities cap at 3.
export function GetCityMaxTier(cityType?: CityName): number {
    return profileFor(cityType).maxTier
}

// Goods a house consumes continuously (drives happiness, which gates upgrades).
export function GetResourceNeed(tier: number, cityType?: CityName): ResourceNeed[] {
    return profileFor(cityType).needs
        .filter(n => tier >= n.tier)
        .map(n => new ResourceNeed(n.resource))
}

// Services a house of the given tier requires (coverage from service buildings).
export function GetServiceNeed(tier: number, cityType?: CityName): ServiceNeed[] {
    return profileFor(cityType).services
        .filter(s => tier >= s.tier)
        .map(s => new ServiceNeed(s.service))
}

// The categorized basket required to upgrade a house into `targetTier`.
export function GetUpgradeCost(targetTier: number, cityType?: CityName): UpgradeBasket {
    return profileFor(cityType).upgrades[targetTier] ?? EMPTY_BASKET
}

// Flattened list of every item in the upgrade basket, for affordability checks
// and charging in one shot.
export function GetUpgradeItems(targetTier: number, cityType?: CityName): Item[] {
    let b = GetUpgradeCost(targetTier, cityType)
    return [...b.food, ...b.daily, ...b.luxury, ...b.build]
}

