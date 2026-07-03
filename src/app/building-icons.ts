import { BuildingType, ServiceType } from './sim/types'

// Maps each building to a Lucide icon name (process/appearance icon).
export const BUILDING_ICON_NAMES: { [key: string]: string } = {
    [BuildingType.ROAD]:                    'lucideRoute',
    // Farms — icon = what grows / lives there
    [BuildingType.WHEAT_FARM]:            'lucideWheat',
    [BuildingType.RICE_PADDY]:            'lucideDroplets',
    [BuildingType.APPLE_ORCHARD]:         'lucideApple',
    [BuildingType.ORANGE_ORCHARD]:        'lucideApple',
    [BuildingType.CABBAGE_PATCH]:         'lucideSalad',
    [BuildingType.PIG_FARM]:              'lucidePiggyBank',
    [BuildingType.DAIRY_FARM]:            'lucideMilk',
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
    [BuildingType.HORSE_FARM]:            'lucideHorse',
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
    [BuildingType.PANT_SHOP]:       'lucideScissors',
    [BuildingType.SHIRT_SHOP]:      'lucideShirt',
    [BuildingType.BOOT_SHOP]:       'lucideFootprints',
    [BuildingType.CIGAR_FACTORY]:         'lucideLeaf',
    [BuildingType.CREAMERY]:              'lucideMilk',
    [BuildingType.POTTERY_SHOP]:          'lucideWeight',
    [BuildingType.PAPER_MILL]:            'lucideScrollText',
    [BuildingType.INK_WORKSHOP]:          'lucidePenLine',
    [BuildingType.DYE_WORKSHOP]:          'lucidePalette',
    [BuildingType.PICKLERY]:              'lucideCookingPot',
    [BuildingType.DUMPLING_KITCHEN]:      'lucideChefHat',
    [BuildingType.SUSHI_BAR]:             'lucideUtensils',
    [BuildingType.ICE_CREAMERY]:          'lucideMilk',
    [BuildingType.BRANDY_DISTILLERY]:     'lucideFlaskConical',
    [BuildingType.CANDLE_MANUFACTORY]:    'lucideSparkle',
    [BuildingType.SOAP_WORKS]:            'lucideBubbles',
    [BuildingType.GLASSWORK]:             'lucideGlassWater',
    [BuildingType.BOTTLEWORKS]:           'lucideWine',
    [BuildingType.GLAZIER]:               'lucideAppWindow',
    [BuildingType.APOTHECARY]:            'lucideStethoscope',
    [BuildingType.PERFUMERY]:             'lucideFlower2',
    [BuildingType.STEELWORK]:             'lucideHammer',
    [BuildingType.SAWMILL]:               'lucideAxe',
    [BuildingType.BRICKYARD]:             'lucideFactory',
    [BuildingType.MASON_SHOP]:            'lucideMountain',
    [BuildingType.CONCRETE_PLANT]:        'lucideFactory',
    [BuildingType.SCULPTOR]:              'lucideAxe',
    [BuildingType.CANNERY]:               'lucideApple',
    [BuildingType.FORGE]:                 'lucideFlame',
    [BuildingType.GOLDSMITH]:             'lucideCoins',
    [BuildingType.TOOLSMITH]:             'lucideWrench',
    [BuildingType.MACHINE_SHOP]:          'lucideCog',
    [BuildingType.JEWELER]:               'lucideGem',
    [BuildingType.WATCHMAKER]:            'lucideWatch',
    [BuildingType.CARPENTER_SHOP]:        'lucideAnvil',
    [BuildingType.PAINTER_STUDIO]:        'lucidePalette',
    [BuildingType.WINERY]:                'lucideGrape',
    [BuildingType.OIL_PRESS]:             'lucideLeaf',
    [BuildingType.RUM_DISTILLERY]:        'lucideFlaskConical',
    // Infrastructure
    [BuildingType.HOUSE]:                 'lucideHouse',
    [BuildingType.WELL]:                  'lucideDroplets',
    [BuildingType.FIRE_STATION]:          'lucideBell',
    [BuildingType.POLICE_STATION]:        'lucideScale',
    [BuildingType.SCHOOL]:                'lucideScrollText',
    [BuildingType.MARKETPLACE]:           'lucideStore',
    [BuildingType.TAVERN]:                'lucideBeer',
    [BuildingType.CHAPEL]:                'lucideChurch',
    [BuildingType.CLINIC]:                'lucideStethoscope',
    [BuildingType.COURTHOUSE]:            'lucideGavel',
    [BuildingType.ENGINEER_STATION]:      'lucideWrench',
    [BuildingType.UNIVERSITY]:            'lucideGraduationCap',
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
    [BuildingType.PANT_SHOP]:    'lucideSparkles',      // pants / cloth
    [BuildingType.SHIRT_SHOP]:   'lucideShirt',         // shirt
    [BuildingType.BOOT_SHOP]:    'lucideFootprints',    // boot
    [BuildingType.CIGAR_FACTORY]:      'lucideFlameKindling', // lit cigar
    [BuildingType.CREAMERY]:           'lucideEggFried',      // dairy product
    [BuildingType.POTTERY_SHOP]:       'lucideCookingPot',    // pottery vessel
    [BuildingType.PAPER_MILL]:         'lucideFileText',
    [BuildingType.INK_WORKSHOP]:       'lucidePenTool',
    [BuildingType.DYE_WORKSHOP]:       'lucidePaintbrush',
    [BuildingType.PICKLERY]:           'lucideCookingPot',
    [BuildingType.DUMPLING_KITCHEN]:   'lucideSoup',
    [BuildingType.SUSHI_BAR]:          'lucideFish',
    [BuildingType.ICE_CREAMERY]:       'lucideDessert',
    [BuildingType.BRANDY_DISTILLERY]:  'lucideWine',          // brandy glass
    [BuildingType.CANDLE_MANUFACTORY]: 'lucideWandSparkles',  // lit candle
    [BuildingType.SOAP_WORKS]:         'lucideBubbles',
    [BuildingType.GLASSWORK]:          'lucideGlasses',       // glass product
    [BuildingType.BOTTLEWORKS]:        'lucideWine',
    [BuildingType.GLAZIER]:            'lucideAppWindow',     // window
    [BuildingType.APOTHECARY]:         'lucidePill',
    [BuildingType.PERFUMERY]:          'lucideSprayCan',
    [BuildingType.STEELWORK]:          'lucideWeight',        // steel ingot
    [BuildingType.SAWMILL]:            'lucideTreeDeciduous', // timber
    [BuildingType.BRICKYARD]:          'lucideBrickWall',     // fired brick
    [BuildingType.MASON_SHOP]:         'lucideMountainSnow',  // hewn stone blocks
    [BuildingType.CONCRETE_PLANT]:     'lucideBrickWall',     // concrete
    [BuildingType.SCULPTOR]:           'lucideCrown',         // statue
    [BuildingType.CANNERY]:            'lucideFlaskRound',    // jam jar
    [BuildingType.FORGE]:              'lucideDumbbell',      // iron bar
    [BuildingType.GOLDSMITH]:          'lucideHandCoins',     // refined gold
    [BuildingType.TOOLSMITH]:          'lucideHammer',        // tool
    [BuildingType.MACHINE_SHOP]:       'lucideCog',
    [BuildingType.JEWELER]:            'lucideCrown',         // jewelry
    [BuildingType.WATCHMAKER]:         'lucideWatch',
    [BuildingType.CARPENTER_SHOP]:     'lucideArmchair',      // furniture
    [BuildingType.PAINTER_STUDIO]:     'lucideImage',
    [BuildingType.WINERY]:             'lucideWine',          // wine
    [BuildingType.OIL_PRESS]:          'lucideDroplet',       // olive oil
    [BuildingType.RUM_DISTILLERY]:     'lucideMartini',       // rum
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
// Map art uses assets/used/buildings/<slug>.png. Menu/product overlays prefer
// resource output art where available so production state remains readable.
// ---------------------------------------------------------------------------
const BUILDING_IMAGE_SLUGS: { [key: string]: string } = {
    [BuildingType.ROAD]:                  'road',
    // Farms
    [BuildingType.WHEAT_FARM]:            'wheat-farm',
    [BuildingType.RICE_PADDY]:            'rice-paddy',
    [BuildingType.APPLE_ORCHARD]:         'apple-orchard',
    [BuildingType.ORANGE_ORCHARD]:        'orange-orchard',
    [BuildingType.CABBAGE_PATCH]:         'cabbage-patch',
    [BuildingType.PIG_FARM]:              'pig-farm',
    [BuildingType.DAIRY_FARM]:            'dairy-farm',
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
    [BuildingType.HORSE_FARM]:            'horse-farm',
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
    [BuildingType.PANT_SHOP]:       'pant-shop',
    [BuildingType.SHIRT_SHOP]:      'shirt-shop',
    [BuildingType.BOOT_SHOP]:       'boot-shop',
    [BuildingType.CIGAR_FACTORY]:         'cigar-factory',
    [BuildingType.CREAMERY]:              'creamery',
    [BuildingType.POTTERY_SHOP]:          'pottery-shop',
    [BuildingType.PAPER_MILL]:            'paper-mill',
    [BuildingType.INK_WORKSHOP]:          'ink-workshop',
    [BuildingType.DYE_WORKSHOP]:          'dye-workshop',
    [BuildingType.PICKLERY]:              'picklery',
    [BuildingType.DUMPLING_KITCHEN]:      'dumpling-kitchen',
    [BuildingType.SUSHI_BAR]:             'sushi-bar',
    [BuildingType.ICE_CREAMERY]:          'ice-creamery',
    [BuildingType.BRANDY_DISTILLERY]:     'brandy-distillery',
    [BuildingType.CANDLE_MANUFACTORY]:    'candle-manufactory',
    [BuildingType.SOAP_WORKS]:            'soap-works',
    [BuildingType.GLASSWORK]:             'glassworks',
    [BuildingType.BOTTLEWORKS]:           'bottleworks',
    [BuildingType.GLAZIER]:               'glazier',
    [BuildingType.APOTHECARY]:            'apothecary',
    [BuildingType.PERFUMERY]:             'perfumery',
    [BuildingType.STEELWORK]:             'steelworks',
    [BuildingType.SAWMILL]:               'sawmill',
    [BuildingType.BRICKYARD]:             'brickyard',
    [BuildingType.MASON_SHOP]:            'mason-shop',
    [BuildingType.CONCRETE_PLANT]:        'concrete-plant',
    [BuildingType.SCULPTOR]:              'sculptor',
    [BuildingType.CANNERY]:               'preserve-shop',
    [BuildingType.FORGE]:                 'forge',
    [BuildingType.GOLDSMITH]:             'goldsmith',
    [BuildingType.TOOLSMITH]:             'toolsmith',
    [BuildingType.MACHINE_SHOP]:          'machine-shop',
    [BuildingType.JEWELER]:               'jeweler',
    [BuildingType.WATCHMAKER]:            'watchmaker',
    [BuildingType.CARPENTER_SHOP]:        'carpenter-shop',
    [BuildingType.PAINTER_STUDIO]:        'painter-studio',
    [BuildingType.WINERY]:                'winery',
    [BuildingType.OIL_PRESS]:             'oil-press',
    [BuildingType.RUM_DISTILLERY]:        'rum-distillery',
    // Infrastructure
    [BuildingType.HOUSE]:                 'house',
    [BuildingType.WELL]:                  'well',
    [BuildingType.FIRE_STATION]:          'fire-station',
    [BuildingType.POLICE_STATION]:        'police-station',
    [BuildingType.SCHOOL]:                'school',
    [BuildingType.MARKETPLACE]:           'marketplace',
    [BuildingType.TAVERN]:                'tavern',
    [BuildingType.CHAPEL]:                'chapel',
    [BuildingType.CLINIC]:                'clinic',
    [BuildingType.COURTHOUSE]:            'courthouse',
    [BuildingType.ENGINEER_STATION]:      'engineer-station',
    [BuildingType.UNIVERSITY]:            'university-map',
    [BuildingType.WAREHOUSE]:             'warehouse',
    [BuildingType.SHIPYARD]:              'shipyard',
    [BuildingType.DOCK]:                  'dock',
    [BuildingType.DELETE]:                'delete',
    // Themed-city and shared utility buildings
    [BuildingType.TEA_GARDEN]:            'tea-garden',
    [BuildingType.SILK_FARM]:             'silk-farm',
    [BuildingType.TOFU_SHOP]:             'tofu-shop',
    [BuildingType.KILN]:                  'kiln',
    [BuildingType.NOODLE_SHOP]:           'noodle-shop',
    [BuildingType.TANNERY]:               'tannery',
    [BuildingType.COPPER_MINE]:           'copper-mine',
    [BuildingType.INCENSE_GROVE]:         'incense-grove',
    [BuildingType.IVORY_CAMP]:            'ivory-camp',
    [BuildingType.REINDEER_FARM]:         'reindeer-farm',
    [BuildingType.FUR_WORKSHOP]:          'fur-workshop',
    [BuildingType.SMOKEHOUSE]:            'smokehouse',
    [BuildingType.WHALING_POST]:          'whaling-post',
    [BuildingType.COMPOST_PIT]:           'compost-pit',
}

const BUILDING_ICON_BASE = 'assets/used/buildings/'
const RESOURCE_ICON_BASE = 'assets/used/resources/'

// Maps buildings to the resource icon PNG of their primary output product.
// Only lists buildings where a matching resource PNG already exists.
const BUILDING_PRODUCT_ICONS: { [key: string]: string } = {
    [BuildingType.WHEAT_FARM]: 'wheat-sheaf-v3.png',
    [BuildingType.RICE_PADDY]: 'rice.png',
    [BuildingType.APPLE_ORCHARD]: 'apple.png',
    [BuildingType.ORANGE_ORCHARD]: 'orange.png',
    [BuildingType.CABBAGE_PATCH]: 'lettuce.png',
    [BuildingType.PIG_FARM]: 'pig.png',
    [BuildingType.DAIRY_FARM]: 'cow.png',
    [BuildingType.SHEEP_FARM]: 'sheep.png',
    [BuildingType.FISHERY]: 'fish.png',
    [BuildingType.POTATO_FARM]: 'potato.png',
    [BuildingType.MELON_GARDEN]: 'melon.png',
    [BuildingType.TOMATO_FIELD]: 'tomato.png',
    [BuildingType.CHICKEN_COOP]: 'chicken.png',
    [BuildingType.CORN_FIELD]: 'corn.png',
    [BuildingType.BANANA_PLANTATION]: 'banana.png',
    [BuildingType.ONION_FIELD]: 'onion.png',
    [BuildingType.BERRY_GROVE]: 'berry.png',
    [BuildingType.VINEYARD]: 'grape.png',
    [BuildingType.OLIVE_GROVE]: 'olive.png',
    [BuildingType.PUMPKIN_PATCH]: 'pumpkin.png',
    [BuildingType.SOYBEAN_FARM]: 'soybean.png',
    [BuildingType.COCOA_PLANT]: 'cocoa.png',
    [BuildingType.SUGAR_CANE_PLANTATION]: 'sugar-cane.png',
    [BuildingType.TOBACCO_PLANTATION]: 'tobacco.png',
    [BuildingType.COTTON_FIELD]: 'cotton.png',
    [BuildingType.RUBBER_PLANTATION]: 'rubber.png',
    [BuildingType.HORSE_FARM]: 'horse.png',
    [BuildingType.TRAPLINE]: 'fur.png',
    [BuildingType.APIARY]: 'wax.png',
    [BuildingType.LUMBER_HUT]: 'wood.png',
    [BuildingType.STONE_QUARRY]: 'stone.png',
    [BuildingType.CLAY_PIT]: 'clay.png',
    [BuildingType.SAND_PIT]: 'sand.png',
    [BuildingType.COAL_KILN]: 'coal.png',
    [BuildingType.IRON_MINE]: 'iron-ore.png',
    [BuildingType.GOLD_MINE]: 'gold-ore.png',
    [BuildingType.GEM_MINE]: 'gem.png',
    [BuildingType.SALTERN]: 'salt.png',
    [BuildingType.WIND_MILL]: 'flour.png',
    [BuildingType.BAKERY]: 'bread.png',
    [BuildingType.BUTCHERY]: 'sausage.png',
    [BuildingType.CIDERY]: 'cider.png',
    [BuildingType.PANT_SHOP]: 'pant.png',
    [BuildingType.SHIRT_SHOP]: 'shirt.png',
    [BuildingType.BOOT_SHOP]: 'boot.png',
    [BuildingType.CIGAR_FACTORY]: 'cigar.png',
    [BuildingType.CREAMERY]: 'cheese.png',
    [BuildingType.POTTERY_SHOP]: 'pottery.png',
    [BuildingType.PAPER_MILL]: 'paper.png',
    [BuildingType.INK_WORKSHOP]: 'ink.png',
    [BuildingType.DYE_WORKSHOP]: 'dye.png',
    [BuildingType.PICKLERY]: 'pickles.png',
    [BuildingType.DUMPLING_KITCHEN]: 'dumplings.png',
    [BuildingType.SUSHI_BAR]: 'sushi.png',
    [BuildingType.ICE_CREAMERY]: 'ice-cream.png',
    [BuildingType.BRANDY_DISTILLERY]: 'brandy.png',
    [BuildingType.CANDLE_MANUFACTORY]: 'candle.png',
    [BuildingType.SOAP_WORKS]: 'soap.png',
    [BuildingType.GLASSWORK]: 'glass.png',
    [BuildingType.BOTTLEWORKS]: 'glass-bottle.png',
    [BuildingType.GLAZIER]: 'window.png',
    [BuildingType.APOTHECARY]: 'medicine.png',
    [BuildingType.PERFUMERY]: 'perfume.png',
    [BuildingType.STEELWORK]: 'steel.png',
    [BuildingType.SAWMILL]: 'timber.png',
    [BuildingType.BRICKYARD]: 'brick.png',
    [BuildingType.MASON_SHOP]: 'stone-blocks.png',
    [BuildingType.CONCRETE_PLANT]: 'concrete.png',
    [BuildingType.SCULPTOR]: 'marble-statue.png',
    [BuildingType.CANNERY]: 'jam.png',
    [BuildingType.FORGE]: 'iron-ingot.png',
    [BuildingType.GOLDSMITH]: 'coin.png',
    [BuildingType.TOOLSMITH]: 'tool.png',
    [BuildingType.MACHINE_SHOP]: 'machine-parts.png',
    [BuildingType.JEWELER]: 'jewelry.png',
    [BuildingType.WATCHMAKER]: 'watch.png',
    [BuildingType.CARPENTER_SHOP]: 'furniture.png',
    [BuildingType.PAINTER_STUDIO]: 'paintings.png',
    [BuildingType.WINERY]: 'wine.png',
    [BuildingType.OIL_PRESS]: 'olive-oil.png',
    [BuildingType.RUM_DISTILLERY]: 'rum.png',
    [BuildingType.TEA_GARDEN]: 'tea.png',
    [BuildingType.SILK_FARM]: 'silk.png',
    [BuildingType.TOFU_SHOP]: 'tofu.png',
    [BuildingType.KILN]: 'porcelain.png',
    [BuildingType.NOODLE_SHOP]: 'noodle.png',
    [BuildingType.TANNERY]: 'leather.png',
    [BuildingType.COPPER_MINE]: 'copper.png',
    [BuildingType.INCENSE_GROVE]: 'incense.png',
    [BuildingType.IVORY_CAMP]: 'ivory.png',
    [BuildingType.REINDEER_FARM]: 'deer.png',
    [BuildingType.FUR_WORKSHOP]: 'fur-coat.png',
    [BuildingType.SMOKEHOUSE]: 'smoked-fish.png',
    [BuildingType.WHALING_POST]: 'whale-oil.png',
    [BuildingType.COMPOST_PIT]: 'fertilizer.png',
}

// Palette/menu icon: production buildings use their product art; service and
// infrastructure buildings use their dedicated building art.
export function GetBuildingIconSrc(type: BuildingType): string | undefined {
    const resourceFile = BUILDING_PRODUCT_ICONS[type]
    if (resourceFile) return `${RESOURCE_ICON_BASE}${resourceFile}`
    const slug = BUILDING_IMAGE_SLUGS[type]
    if (slug) return `${BUILDING_ICON_BASE}${slug}.png`
    return undefined
}

export function GetBuildingProductIconSrc(type: BuildingType): string | undefined {
    const resourceFile = BUILDING_PRODUCT_ICONS[type]
    return resourceFile ? `${RESOURCE_ICON_BASE}${resourceFile}` : undefined
}

// Slugs for buildings that should render a different art asset on the map than
// the icon shown in the building menu. Falls back to GetBuildingIconSrc.
const BUILDING_MAP_IMAGE_SLUGS: { [key: string]: string } = {
    [BuildingType.UNIVERSITY]: 'university-map',
    [BuildingType.WAREHOUSE]: 'warehouse-map',
}

// Map-tile art for a placed building. Uses the map-specific override when one
// exists, otherwise the dedicated building art.
export function GetBuildingMapIconSrc(type: BuildingType): string | undefined {
    const slug = BUILDING_MAP_IMAGE_SLUGS[type]
    if (slug) return `${BUILDING_ICON_BASE}${slug}.png`
    const buildingSlug = BUILDING_IMAGE_SLUGS[type]
    if (buildingSlug) return `${BUILDING_ICON_BASE}${buildingSlug}.png`
    return undefined
}

// Map-tile art for a house, chosen by its tier (1..6) so upgraded houses show
// the next-tier building. Art is the v5 housing set.
export function GetHouseMapIconSrc(tier: number): string {
    const t = Math.max(1, Math.min(6, tier))
    return `${BUILDING_ICON_BASE}house-tier-${t}.png`
}

// Each service need is represented by the building that provides it, so a
// house's service needs can be shown as building icons instead of text.
const SERVICE_BUILDING: { [key in ServiceType]: BuildingType } = {
    [ServiceType.WATER]:    BuildingType.WELL,
    [ServiceType.FIRE]:     BuildingType.FIRE_STATION,
    [ServiceType.POLICE]:   BuildingType.POLICE_STATION,
    [ServiceType.SCHOOL]:   BuildingType.SCHOOL,
    [ServiceType.MARKET]:   BuildingType.MARKETPLACE,
    [ServiceType.TAVERN]:   BuildingType.TAVERN,
    [ServiceType.CHURCH]:   BuildingType.CHAPEL,
    [ServiceType.HEALTH]:   BuildingType.CLINIC,
    [ServiceType.JUSTICE]:  BuildingType.COURTHOUSE,
    [ServiceType.ENGINEER]: BuildingType.ENGINEER_STATION,
}

const SERVICE_EMOJI: { [key in ServiceType]: string } = {
    [ServiceType.WATER]:    '🪣',
    [ServiceType.FIRE]:     '🔔',
    [ServiceType.POLICE]:   '⚖️',
    [ServiceType.SCHOOL]:   '📜',
    [ServiceType.MARKET]:   '🏪',
    [ServiceType.TAVERN]:   '🍺',
    [ServiceType.CHURCH]:   '⛪',
    [ServiceType.HEALTH]:   '🏥',
    [ServiceType.JUSTICE]:  '⚖️',
    [ServiceType.ENGINEER]: '🔧',
}

// PNG URL of the building that provides a service, or undefined → emoji.
export function GetServiceIconSrc(type: ServiceType): string | undefined {
    const building = SERVICE_BUILDING[type]
    return building ? GetBuildingIconSrc(building) : undefined
}

export function GetServiceEmoji(type: ServiceType): string {
    return SERVICE_EMOJI[type] ?? '🏛️'
}
