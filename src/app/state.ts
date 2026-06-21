import { City } from "./city"
import { BuildingType, Terrain, Feature, CityName } from "./types"

export class State {
       constructor(
        public cities : City[] = [],
        public current_city? : City,
        public time : number = 0,
        public gold : number = 0,
        public build_type? : BuildingType,
        public terrain_type? : Terrain,
        public feature_type? : Feature,
        // Residential tax rate (0..1). Higher rates earn more gold per resident
        // but lower happiness. Adjustable from the status panel.
        public tax_rate : number = 0.3,) {
          // Five regions, each specialised so the cities depend on sea trade.
          // The build palette of each city is limited to its themed buildings.

          // CENTER — Anrelia: temperate capital, a balanced & self-sufficient breadbasket.
          this.cities.push(new City(CityName.ANRELIA, 80, 80,
            [BuildingType.WHEAT_FARM, BuildingType.APPLE_ORCHARD, BuildingType.CABBAGE_PATCH, BuildingType.PIG_FARM, BuildingType.DIARY_FARM, BuildingType.CHICKEN_COOP, BuildingType.VINEYARD, BuildingType.OLIVE_GROVE, BuildingType.FISHERY],
            [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT],
            [BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.CIDERY, BuildingType.CREAMERY, BuildingType.POTTERY_SHOP, BuildingType.WINERY, BuildingType.OIL_PRESS, BuildingType.SAWMILL, BuildingType.CARPENTER_SHOP]))

          // NORTH — Mintaka: cold frontier of hardy crops, herding, mining and metalwork.
          this.cities.push(new City(CityName.MINTAKA, 80, 80,
            [BuildingType.POTATO_FARM, BuildingType.CABBAGE_PATCH, BuildingType.SHEEP_FARM, BuildingType.BERRY_GROVE, BuildingType.TRAPLINE, BuildingType.PIG_FARM, BuildingType.FISHERY],
            [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.COAL_KILN, BuildingType.IRON_MINE],
            [BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.OVERALL_FACTORY, BuildingType.FORGE, BuildingType.STEELWORK, BuildingType.TOOLSMITH]))

          // EAST — Jinlin: agrarian river delta of rice, soy, citrus and tobacco.
          this.cities.push(new City(CityName.JINLIN, 80, 80,
            [BuildingType.RICE_PADDY, BuildingType.ORANGE_ORCHARD, BuildingType.SOYBEAN_FARM, BuildingType.ONION_FIELD, BuildingType.TOBACCO_PLANTATION, BuildingType.PIG_FARM, BuildingType.FISHERY],
            [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT],
            [BuildingType.BUTCHERY, BuildingType.CIGAR_FACTORY, BuildingType.POTTERY_SHOP, BuildingType.GLASSWORK]))

          // WEST — Columbia: the American frontier — corn & wheat plains, cotton,
          // cattle ranching & meatpacking, steel mills and a gold rush.
          this.cities.push(new City(CityName.COLUMBIA, 80, 80,
            [BuildingType.CORN_FIELD, BuildingType.WHEAT_FARM, BuildingType.COTTON_FIELD, BuildingType.PIG_FARM, BuildingType.DIARY_FARM, BuildingType.CHICKEN_COOP, BuildingType.FISHERY],
            [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.IRON_MINE, BuildingType.GOLD_MINE],
            [BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.CREAMERY, BuildingType.FORGE, BuildingType.STEELWORK, BuildingType.GOLDSMITH]))

          // SOUTH — Solara: tropical plantations of banana, sugar, cocoa, cotton and rubber.
          this.cities.push(new City(CityName.SOLARA, 80, 80,
            [BuildingType.BANANA_PLANTATION, BuildingType.SUGAR_CANE_PLANTATION, BuildingType.COCOA_PLANT, BuildingType.COTTON_FIELD, BuildingType.RUBBER_PLANTATION, BuildingType.CORN_FIELD, BuildingType.FISHERY],
            [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT],
            [BuildingType.BAKERY, BuildingType.CANNERY, BuildingType.SAWMILL, BuildingType.CARPENTER_SHOP, BuildingType.RUM_DISTILLERY]))

          this.current_city = cities[0]
          this.gold = 1000
      }
}
