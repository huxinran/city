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
          // Five regions, themed by terrain/flavour. The build palette is the
          // same full catalog in every city.
          this.cities.push(new City(CityName.ANRELIA, 80, 80))   // CENTER — temperate capital, a balanced breadbasket.
          this.cities.push(new City(CityName.MINTAKA, 80, 80))   // NORTH — cold frontier of hardy crops, herding, mining.
          this.cities.push(new City(CityName.JINLIN, 80, 80))    // EAST — agrarian river delta of rice, soy, citrus.
          this.cities.push(new City(CityName.COLUMBIA, 80, 80))  // WEST — frontier plains: corn, cotton, cattle, steel.
          this.cities.push(new City(CityName.SOLARA, 80, 80))    // SOUTH — tropical plantations: banana, sugar, cocoa.

          this.current_city = cities[0]
          this.gold = 1000
      }
}
