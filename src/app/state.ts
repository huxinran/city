import { City } from "./city"
import { BuildingType, Terrain } from "./types"

export class State {
       constructor(
        public cities : City[] = [],
        public current_city? : City,
        public time : number = 0,
        public gold : number = 0,
        public build_type? : BuildingType, 
        public terrain_type? : Terrain,) {
          this.cities.push(new City("Anrelia", 30, 30, [BuildingType.WHEAT_FARM, BuildingType.APPLE_ORCHARD, BuildingType.CABBAGE_PATCH, BuildingType.PIG_FARM, BuildingType.DIARY_FARM, BuildingType.SHEEP_FARM, BuildingType.FISHERY], [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT], [BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.CIDERY, BuildingType.OVERALL_FACTORY, BuildingType.CIGAR_FACTORY]))
          this.cities.push(new City("EagleFall", 30, 30, [BuildingType.POTATO_FARM, BuildingType.MELON_GARDEN, BuildingType.TOMATO_FIELD, BuildingType.PIG_FARM, BuildingType.CHICKEN_COOP, BuildingType.FISHERY], [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT], [BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.CIDERY, BuildingType.OVERALL_FACTORY, BuildingType.CIGAR_FACTORY]))
          this.cities.push(new City("JadeWind", 30, 30, [BuildingType.RICE_PADDY, BuildingType.ORANGE_ORCHARD, BuildingType.CABBAGE_PATCH, BuildingType.PIG_FARM, BuildingType.DIARY_FARM, BuildingType.SHEEP_FARM, BuildingType.FISHERY], [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT], [BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.CIDERY, BuildingType.OVERALL_FACTORY, BuildingType.CIGAR_FACTORY]))
          this.cities.push(new City("Matugar", 30, 30, [BuildingType.CORN_FIELD, BuildingType.BANANA_PLANTATION, BuildingType.ONION_FIELD, BuildingType.PIG_FARM, BuildingType.DIARY_FARM, BuildingType.SHEEP_FARM, BuildingType.FISHERY], [BuildingType.LUMBER_HUT, BuildingType.STONE_QUARRY, BuildingType.CLAY_PIT, BuildingType.SAND_PIT], [BuildingType.WIND_MILL, BuildingType.BAKERY, BuildingType.BUTCHERY, BuildingType.CIDERY, BuildingType.OVERALL_FACTORY, BuildingType.CIGAR_FACTORY]))
          this.current_city = cities[0]
          this.gold = 1000
      }
}
