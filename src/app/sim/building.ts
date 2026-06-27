import { Storage, Item } from "./storage"
import { Tile } from "./tile"
import { TakeItems } from "./utils"
import { BALANCE } from "./balance"
import { Resource, HouseType, Resident, ProductionStatus, ServiceType, ShippingTaskType, BuildingType, ShipType, CityName, Terrain, Feature } from "./types"
import { Technology, ResearchProject, ALL_RESEARCH } from "./config/research.config"
import { BuildingDef, Recipe, BUILDING_DEFS, BOOTSTRAP_MATERIAL } from "./config/buildings.config"
import { UpgradeBasket, EMPTY_BASKET, CityProfile, CITY_PROFILES } from "./config/cities.config"

// Config tables live in ./config/*; re-exported here so existing importers
// (components, state service) keep their `./sim/building` import paths.
export { Technology, ResearchProject, ALL_RESEARCH }
export type { BuildingDef, Recipe, UpgradeBasket, CityProfile }
export { BUILDING_DEFS }

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
    const { minOccupantFloor, occupantsPerTier } = BALANCE.housing
    let min = Math.max(minOccupantFloor, (tier - 1) * occupantsPerTier)
    let max = tier * occupantsPerTier
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
    [Resident.FARMER]:       'assets/used/population/busts/farmer-bust-v2-clean-alpha.png',
    [Resident.WORKER]:       'assets/used/population/busts/worker-bust-v2-clean-alpha.png',
    [Resident.ARTISAN]:      'assets/used/population/busts/artisan-bust-v2-clean-alpha.png',
    [Resident.SCHOLAR]:      'assets/used/population/busts/scholar-bust-v2-clean-alpha.png',
    [Resident.ENTREPRENEUR]: 'assets/used/population/busts/entrepreneur-bust-v2-clean-alpha.png',
    [Resident.MAGNATE]:      'assets/used/population/busts/magnate-bust-v2-clean-alpha.png',
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
    house.max_occupant = house.tier * BALANCE.housing.occupantsPerTier
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
        // The fields below are all (re)derived by RefreshHouse(this) in the
        // constructor body and again on every upgrade; the values here are just
        // cheap placeholders, never the real defaults (don't recompute twice).
        public type: HouseType = HouseType.COTTAGE,
        public current_max_occupant: number = 0,
        public max_occupant: number = 10,
        public resource_needs: ResourceNeed[] = [],
        public service_needs: ServiceNeed[] = [],
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

// Ship blueprints offered at every shipyard. Build cost scales with cargo
// capacity. Returns fresh instances so each shipyard owns its own objects.
export function MakeShipBlueprints(): ShipBlueprint[] {
    return [
        new ShipBlueprint(ShipType.CARGO,   1.5, 100, [new Item(Resource.WOOD, 10)],  60),
        new ShipBlueprint(ShipType.CLIPPER, 2.0,  60, [new Item(Resource.WOOD, 15)],  90),
        new ShipBlueprint(ShipType.GRAND,   1.0, 300, [new Item(Resource.WOOD, 30)], 120),
    ]
}

export class Shipyard {
    constructor(
        public tier: number = 1,
        public status: ProductionStatus = ProductionStatus.READY,
        public progress: number = 0.0,
        public blueprints: ShipBlueprint[] = MakeShipBlueprints(),
        public selected?: ShipBlueprint,
        public storage: Storage = new Storage(),
    ) {}
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

// Cart count / speed per warehouse tier come from BALANCE.warehouse; tiers above
// the table length reuse the last entry. Speed is tiles travelled per tick, kept
// well below 1 so carts step a fraction of a tile each tick (smooth motion).
function tierEntry<T>(table: T[], tier: number): T {
    return table[Math.min(Math.max(tier, 1), table.length) - 1]
}
function GetNumOfCarts(tier: number) {
    return tierEntry(BALANCE.warehouse.cartsByTier, tier)
}
function GetCartSpeed(tier: number) {
    return tierEntry(BALANCE.warehouse.speedByTier, tier)
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


// Building registry & build-cost overrides live in ./config/buildings.config.

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

// Whether a tile's natural feature allows a building to sit on it. Every
// building must be placed on open land (no tree/rock/bush on the tile itself);
// the required adjacent feature (for mines/lumber) is checked separately.
export function CanPlaceOnFeature(feature?: Feature): boolean {
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

// Construction material cost, overriding the per-building `material` declared in
// BUILDING_DEFS:
//  - explicit overrides come from BOOTSTRAP_MATERIAL (timber/free for chains
//    that must be startable from nothing); farms always cost a single timber;
//  - a building that PRODUCES a construction material is built from the rung
//    just below its output (never its own output or higher);
//  - every other building may use its own tier's material but nothing higher
//    (e.g. a Well, a tier-1 service, never demands slate/steel).
function BuildMaterial(type: BuildingType, current: Item[]): Item[] {
    const override = BOOTSTRAP_MATERIAL[type]
    if (override) return cloneItems(override)
    if (FARM_BUILDINGS.has(type)) return [new Item(Resource.TIMBER, 1)]

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
    [BuildingType.BRICKYARD]:  3,   // brick  (Artisan; brick itself is a tier-3 build good)
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


// House-upgrade baskets & per-city profiles live in ./config/cities.config.

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


// --- Dev-time config validation ----------------------------------------------
// Catches the common ways the building/city tables drift out of sync as content
// is added: a recipe ingredient nothing produces, a house need / upgrade good
// nothing produces, a BuildingType with no def, or a def with no icon. Returns a
// list of human-readable problems (empty when the config is sound). Call once at
// startup in dev (see StateService) — it's pure and side-effect free.
export function ValidateConfig(): string[] {
    const problems: string[] = []

    // Every resource produced by some building recipe (raw extractors included —
    // they have an `out` and no `in`).
    const produced = new Set<Resource>()
    for (const [, def] of DEF_ENTRIES) {
        for (const p of def.recipe?.out ?? []) produced.add(p.type)
    }

    // Recipe ingredients (plus coal for coal-fired recipes) must have a producer.
    for (const [type, def] of DEF_ENTRIES) {
        const ins = [
            ...(def.recipe?.in ?? []).map(i => i.type),
            ...(def.recipe?.coal ? [Resource.COAL] : []),
        ]
        for (const r of ins) {
            if (!produced.has(r)) problems.push(`${type}: ingredient "${r}" is produced by no building`)
        }
    }

    // House consumption needs and upgrade-basket goods must have a producer.
    for (const cityType of Object.values(CityName)) {
        const profile = CITY_PROFILES[cityType]
        for (const n of profile.needs) {
            if (!produced.has(n.resource)) problems.push(`${cityType}: need "${n.resource}" is produced by no building`)
        }
        for (const [tier, basket] of Object.entries(profile.upgrades)) {
            for (const it of [...basket.food, ...basket.daily, ...basket.luxury, ...basket.build]) {
                if (!produced.has(it.type)) problems.push(`${cityType} upgrade T${tier}: good "${it.type}" is produced by no building`)
            }
        }
    }

    // Every BuildingType (except the Delete tool) needs a def with an icon.
    for (const type of Object.values(BuildingType)) {
        if (type === BuildingType.DELETE) continue
        const def = BUILDING_DEFS[type]
        if (!def) { problems.push(`${type}: has no BUILDING_DEFS entry`); continue }
        if (!def.icon) problems.push(`${type}: has no icon`)
    }

    return problems
}
