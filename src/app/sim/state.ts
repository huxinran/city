import { City } from "./city"
import { BuildingType, Terrain, Feature } from "./types"
import { CITY_ROSTER, STARTING_GOLD } from "./config/cities.config"

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
          // The regions that make up a new game come from CITY_ROSTER; the build
          // palette is the same full catalog in every city.
          for (const region of CITY_ROSTER) {
            this.cities.push(new City(region.name, region.h, region.w))
          }
          this.current_city = this.cities[0]
          this.gold = STARTING_GOLD
      }
}
