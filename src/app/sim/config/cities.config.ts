// Per-city gameplay config — each region's consumption needs, required services,
// and house-upgrade baskets, plus its tier cap. Pure data; edit here to retune a
// region. Re-exported from building.ts so existing importers keep their paths.
import { Item } from "../storage"
import { Resource, ServiceType, CityName } from "../types"

// Shorthand for the many Item literals below.
const I = (type: Resource, num = 1) => new Item(type, num)

// To upgrade a house INTO a tier you must supply a basket of goods, grouped into
// Food / Daily / Luxury / build materials. The basket grows in quantity and
// variety each step. (Services are required separately and gate happiness, which
// itself gates the upgrade.)
export interface UpgradeBasket {
    food: Item[]
    daily: Item[]
    luxury: Item[]
    build: Item[]
}

export const EMPTY_BASKET: UpgradeBasket = { food: [], daily: [], luxury: [], build: [] }

// Each region defines its own consumption needs, required services and house
// upgrade baskets. `needs`/`services` are ordered lists tagged with the earliest
// tier that requires them; a house of tier N gets every entry with tier <= N
// (preserving list order). Non-Anrelia regions cap at tier 3.
export interface CityProfile {
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

export const CITY_PROFILES: Record<CityName, CityProfile> = {
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
            2: { food: [I(Resource.BREAD, 10)], daily: [I(Resource.POTTERY, 8)], luxury: [], build: [I(Resource.STONE_BLOCKS, 10)] },
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
            2: { food: [I(Resource.TOFU, 8)], daily: [I(Resource.SILK, 6)], luxury: [], build: [I(Resource.STONE_BLOCKS, 10)] },
            3: { food: [I(Resource.NOODLE, 10)], daily: [I(Resource.PORCELAIN, 8)], luxury: [I(Resource.TEA, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
    [CityName.COLUMBIA]: {
        maxTier: 3,
        needs: [
            { resource: Resource.CORN,      tier: 1 },
            { resource: Resource.SAUSAGE,   tier: 3 },
            { resource: Resource.LEATHER,   tier: 1 },
            { resource: Resource.SHIRT,     tier: 2 },
            { resource: Resource.FURNITURE, tier: 3 },
            { resource: Resource.CIDER,     tier: 2 },
            { resource: Resource.BRANDY,    tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.CORN, 8)], daily: [I(Resource.LEATHER, 6)], luxury: [], build: [I(Resource.STONE_BLOCKS, 10)] },
            3: { food: [I(Resource.SAUSAGE, 10)], daily: [I(Resource.SHIRT, 8)], luxury: [I(Resource.CIDER, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
    [CityName.SOLARA]: {
        maxTier: 3,
        needs: [
            { resource: Resource.BANANA,      tier: 1 },
            { resource: Resource.COCOA,       tier: 2 },
            { resource: Resource.PORK,        tier: 3 },
            { resource: Resource.OIL,         tier: 1 },
            { resource: Resource.COPPER,      tier: 2 },
            { resource: Resource.POTTERY,     tier: 3 },
            { resource: Resource.INCENSE,     tier: 2 },
            { resource: Resource.IVORY,       tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.COCOA, 8)], daily: [I(Resource.OIL, 6)], luxury: [], build: [I(Resource.STONE_BLOCKS, 10)] },
            3: { food: [I(Resource.PORK, 10)], daily: [I(Resource.COPPER, 8)], luxury: [I(Resource.INCENSE, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
    [CityName.MINTAKA]: {
        maxTier: 3,
        needs: [
            { resource: Resource.SMOKED_FISH,   tier: 1 },
            { resource: Resource.DEER,          tier: 2 },
            { resource: Resource.CHEESE,        tier: 3 },
            { resource: Resource.FUR_COAT,      tier: 1 },
            { resource: Resource.WHALE_OIL,     tier: 2 },
            { resource: Resource.TOOL,          tier: 3 },
            { resource: Resource.RUM,           tier: 2 },
            { resource: Resource.GEM,           tier: 3 },
        ],
        services: THEMED_SERVICES,
        upgrades: {
            2: { food: [I(Resource.SMOKED_FISH, 8)], daily: [I(Resource.FUR_COAT, 6)], luxury: [], build: [I(Resource.STONE_BLOCKS, 10)] },
            3: { food: [I(Resource.DEER, 10)], daily: [I(Resource.WHALE_OIL, 8)], luxury: [I(Resource.RUM, 8)], build: [I(Resource.BRICK, 15)] },
        },
    },
}
