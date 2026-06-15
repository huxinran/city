import { BuildingType } from './types'

// Maps each building to a Lucide icon name (process/appearance icon).
export const BUILDING_ICON_NAMES: { [key: string]: string } = {
    [BuildingType.ROAD]:                    'lucideRoute',
    // Farms — icon = what grows / lives there
    [BuildingType.WHEAT_FARM]:            'lucideWheat',
    [BuildingType.RICE_PADDY]:            'lucideDroplets',
    [BuildingType.APPLE_ORCHARD]:         'lucideApple',
    [BuildingType.ORANGE_ORCHARD]:        'lucideApple',
    [BuildingType.CABBAGE_PATCH]:         'lucideLeafyGreen',
    [BuildingType.PIG_FARM]:              'lucideBone',
    [BuildingType.DIARY_FARM]:            'lucideMilk',
    [BuildingType.SHEEP_FARM]:            'lucideScissors',
    [BuildingType.FISHERY]:               'lucideHook',
    [BuildingType.POTATO_FARM]:           'lucideShovel',
    [BuildingType.MELON_GARDEN]:          'lucideLeaf',
    [BuildingType.TOMATO_FIELD]:          'lucideCherry',
    [BuildingType.CHICKEN_COOP]:          'lucideBird',
    [BuildingType.CORN_FIELD]:            'lucidePopcorn',
    [BuildingType.BANANA_PLANTATION]:     'lucideBanana',
    [BuildingType.ONION_FIELD]:           'lucideLeafyGreen',
    [BuildingType.BERRY_GROVE]:           'lucideCherry',
    [BuildingType.VINEYARD]:              'lucideGrape',
    [BuildingType.OLIVE_GROVE]:           'lucideLeaf',
    [BuildingType.PUMPKIN_PATCH]:         'lucideSparkle',
    [BuildingType.SOYBEAN_FARM]:          'lucideBean',
    [BuildingType.COCOA_PLANT]:           'lucideCoffee',
    [BuildingType.SUGAR_CANE_PLANTATION]: 'lucideWheat',
    [BuildingType.TOBACCO_PLANTATION]:    'lucideLeaf',
    [BuildingType.COTTON_FIELD]:          'lucideSparkles',
    [BuildingType.RUBBER_PLANTATION]:     'lucideTreePalm',
    [BuildingType.TRAPLINE]:              'lucidePawPrint',
    [BuildingType.APIARY]:                'lucideEgg',
    // Raw material extraction
    [BuildingType.LUMBER_HUT]:            'lucideTreePine',
    [BuildingType.STONE_QUARRY]:          'lucideMountain',
    [BuildingType.CLAY_PIT]:              'lucideShovel',
    [BuildingType.SAND_PIT]:              'lucideMountainSnow',
    [BuildingType.COAL_KILN]:             'lucideFlameKindling',
    [BuildingType.IRON_MINE]:             'lucidePickaxe',
    [BuildingType.GOLD_MINE]:             'lucideCoins',
    [BuildingType.GEM_MINE]:              'lucideGem',
    [BuildingType.SALTERN]:               'lucideDroplets',
    // Workshops — left (process) icon
    [BuildingType.WIND_MILL]:             'lucideWind',
    [BuildingType.BAKERY]:                'lucideChefHat',
    [BuildingType.BUTCHERY]:              'lucideBone',
    [BuildingType.CIDERY]:                'lucideCupSoda',
    [BuildingType.OVERALL_FACTORY]:       'lucideScissors',
    [BuildingType.CIGAR_FACTORY]:         'lucideLeaf',
    [BuildingType.CREAMERY]:              'lucideMilk',
    [BuildingType.POTTERY_SHOP]:          'lucideWeight',
    [BuildingType.BRANDY_DISTILLERY]:     'lucideFlaskConical',
    [BuildingType.CANDLE_Manufactory]:    'lucideSparkle',
    [BuildingType.GLASSWORK]:             'lucideGlassWater',
    [BuildingType.STEELWORK]:             'lucideHammer',
    [BuildingType.SAWMILL]:               'lucideAxe',
    [BuildingType.BRICKYARY]:             'lucideFactory',
    [BuildingType.MASON_SHOP]:            'lucideMountain',
    [BuildingType.CANNERY]:               'lucideApple',
    [BuildingType.FORGE]:                 'lucideFlame',
    [BuildingType.GOLDSMITH]:             'lucideCoins',
    [BuildingType.TOOLSMITH]:             'lucideWrench',
    [BuildingType.JEWELER]:               'lucideGem',
    [BuildingType.CARPENTER_SHOP]:        'lucideAnvil',
    // Infrastructure
    [BuildingType.HOUSE]:                 'lucideHouse',
    [BuildingType.WELL]:                  'lucideDroplets',
    [BuildingType.FIRE_STATION]:          'lucideBell',
    [BuildingType.POLICE_STATION]:        'lucideScale',
    [BuildingType.SCHOOL]:                'lucideScrollText',
    [BuildingType.WAREHOUSE]:             'lucideWarehouse',
    [BuildingType.SHIPYARD]:              'lucideAnchor',
    [BuildingType.DOCK]:                  'lucideSailboat',
    [BuildingType.DELETE]:                'lucideTrash2',
}

// Right-side product icon for each workshop (what it outputs).
export const WORKSHOP_PRODUCT_ICON_NAMES: { [key: string]: string } = {
    // Extraction — output raw material
    [BuildingType.FISHERY]:            'lucideFish',
    [BuildingType.LUMBER_HUT]:         'lucidePackage',
    [BuildingType.STONE_QUARRY]:       'lucideBrickWall',
    [BuildingType.CLAY_PIT]:           'lucideCookingPot',
    [BuildingType.SAND_PIT]:           'lucideWaves',
    [BuildingType.COAL_KILN]:          'lucideZap',
    [BuildingType.IRON_MINE]:          'lucideDisc',
    [BuildingType.GOLD_MINE]:          'lucideStar',
    [BuildingType.GEM_MINE]:           'lucideDiamond',
    [BuildingType.SALTERN]:            'lucideDroplet',
    [BuildingType.WIND_MILL]:          'lucideWheat',         // flour
    [BuildingType.BAKERY]:             'lucideCroissant',     // bread
    [BuildingType.BUTCHERY]:           'lucideSandwich',      // sausage
    [BuildingType.CIDERY]:             'lucideBeer',          // cider
    [BuildingType.OVERALL_FACTORY]:    'lucideSparkles',      // pants / cloth
    [BuildingType.CIGAR_FACTORY]:      'lucideFlameKindling', // lit cigar
    [BuildingType.CREAMERY]:           'lucideEggFried',      // dairy product
    [BuildingType.POTTERY_SHOP]:       'lucideCookingPot',    // pottery vessel
    [BuildingType.BRANDY_DISTILLERY]:  'lucideWine',          // brandy glass
    [BuildingType.CANDLE_Manufactory]: 'lucideWandSparkles',  // lit candle
    [BuildingType.GLASSWORK]:          'lucideGlasses',       // glass product
    [BuildingType.STEELWORK]:          'lucideWeight',        // steel ingot
    [BuildingType.SAWMILL]:            'lucideTreeDeciduous', // timber
    [BuildingType.BRICKYARY]:          'lucideBrickWall',     // fired brick
    [BuildingType.MASON_SHOP]:         'lucideMountainSnow',  // hewn slate
    [BuildingType.CANNERY]:            'lucideFlaskRound',    // jam jar
    [BuildingType.FORGE]:              'lucideDumbbell',      // iron bar
    [BuildingType.GOLDSMITH]:          'lucideHandCoins',     // refined gold
    [BuildingType.TOOLSMITH]:          'lucideHammer',        // tool
    [BuildingType.JEWELER]:            'lucideCrown',         // jewelry
    [BuildingType.CARPENTER_SHOP]:     'lucideArmchair',      // furniture
}

export function GetBuildingIconName(type: BuildingType): string {
    return BUILDING_ICON_NAMES[type] ?? 'lucideBuilding2'
}

export function GetWorkshopProductIconName(type: BuildingType): string {
    return WORKSHOP_PRODUCT_ICON_NAMES[type] ?? 'lucidePackage'
}

// ---------------------------------------------------------------------------
// Image-based icons
// Each value is a filename slug (no extension, no path prefix).
// The loader tries  assets/icons/buildings/<slug>.png  then  .jpg  in order.
// If neither exists the SVG fallback from BUILDING_ICON_NAMES is shown.
// ---------------------------------------------------------------------------
const BUILDING_IMAGE_SLUGS: { [key: string]: string } = {
    // Farms
    [BuildingType.WHEAT_FARM]:            'wheat-farm',
    [BuildingType.RICE_PADDY]:            'rice-paddy',
    [BuildingType.APPLE_ORCHARD]:         'apple-orchard',
    [BuildingType.ORANGE_ORCHARD]:        'orange-orchard',
    [BuildingType.CABBAGE_PATCH]:         'cabbage-patch',
    [BuildingType.PIG_FARM]:              'pig-farm',
    [BuildingType.DIARY_FARM]:            'dairy-farm',
    [BuildingType.SHEEP_FARM]:            'sheep-farm',
    [BuildingType.FISHERY]:               'fishery',
    [BuildingType.POTATO_FARM]:           'potato-farm',
    [BuildingType.MELON_GARDEN]:          'melon-garden',
    [BuildingType.TOMATO_FIELD]:          'tomato-field',
    [BuildingType.CHICKEN_COOP]:          'chicken-coop',
    [BuildingType.CORN_FIELD]:            'corn-field',
    [BuildingType.BANANA_PLANTATION]:     'banana-plantation',
    [BuildingType.ONION_FIELD]:           'onion-field',
    [BuildingType.BERRY_GROVE]:           'berry-grove',
    [BuildingType.VINEYARD]:              'vineyard',
    [BuildingType.OLIVE_GROVE]:           'olive-grove',
    [BuildingType.PUMPKIN_PATCH]:         'pumpkin-patch',
    [BuildingType.SOYBEAN_FARM]:          'soybean-farm',
    [BuildingType.COCOA_PLANT]:           'cocoa-plant',
    [BuildingType.SUGAR_CANE_PLANTATION]: 'sugar-cane-plantation',
    [BuildingType.TOBACCO_PLANTATION]:    'tobacco-plantation',
    [BuildingType.COTTON_FIELD]:          'cotton-field',
    [BuildingType.RUBBER_PLANTATION]:     'rubber-plantation',
    [BuildingType.TRAPLINE]:              'trapline',
    [BuildingType.APIARY]:                'apiary',
    // Raw materials
    [BuildingType.LUMBER_HUT]:            'lumber-hut',
    [BuildingType.STONE_QUARRY]:          'stone-quarry',
    [BuildingType.CLAY_PIT]:              'clay-pit',
    [BuildingType.SAND_PIT]:              'sand-pit',
    [BuildingType.COAL_KILN]:             'coal-kiln',
    [BuildingType.IRON_MINE]:             'iron-mine',
    [BuildingType.GOLD_MINE]:             'gold-mine',
    [BuildingType.GEM_MINE]:              'gem-mine',
    [BuildingType.SALTERN]:               'saltern',
    // Workshops
    [BuildingType.WIND_MILL]:             'wind-mill',
    [BuildingType.BAKERY]:                'bakery',
    [BuildingType.BUTCHERY]:              'butchery',
    [BuildingType.CIDERY]:                'cidery',
    [BuildingType.OVERALL_FACTORY]:       'tailor-shop',
    [BuildingType.CIGAR_FACTORY]:         'cigar-factory',
    [BuildingType.CREAMERY]:              'creamery',
    [BuildingType.POTTERY_SHOP]:          'pottery-shop',
    [BuildingType.BRANDY_DISTILLERY]:     'brandy-distillery',
    [BuildingType.CANDLE_Manufactory]:    'candle-manufactory',
    [BuildingType.GLASSWORK]:             'glassworks',
    [BuildingType.STEELWORK]:             'steelworks',
    [BuildingType.SAWMILL]:               'sawmill',
    [BuildingType.BRICKYARY]:             'brickyard',
    [BuildingType.MASON_SHOP]:            'mason-shop',
    [BuildingType.CANNERY]:               'preserve-shop',
    [BuildingType.FORGE]:                 'forge',
    [BuildingType.GOLDSMITH]:             'goldsmith',
    [BuildingType.TOOLSMITH]:             'toolsmith',
    [BuildingType.JEWELER]:               'jeweler',
    [BuildingType.CARPENTER_SHOP]:        'carpenter-shop',
    // Infrastructure
    [BuildingType.HOUSE]:                 'house',
    [BuildingType.WELL]:                  'well',
    [BuildingType.FIRE_STATION]:          'fire-station',
    [BuildingType.POLICE_STATION]:        'police-station',
    [BuildingType.SCHOOL]:                'school',
    [BuildingType.WAREHOUSE]:             'warehouse',
    [BuildingType.SHIPYARD]:              'shipyard',
    [BuildingType.DOCK]:                  'dock',
}

const BASE = 'assets/icons/buildings/'

// Returns candidate URLs to try in order: .png first, then .jpg.
export function GetBuildingImageCandidates(type: BuildingType): string[] {
    const slug = BUILDING_IMAGE_SLUGS[type]
    if (!slug) return []
    return [`${BASE}${slug}.png`, `${BASE}${slug}.jpg`]
}
