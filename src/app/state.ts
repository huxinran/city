import { City } from "./city"
export class State {
       constructor(
        public cities : City[] = [],
        public current_city? : City,
        public time : number = 0,
        public gold : number = 0,
        public build_type? : string, 
        public terrain_type? : string,) {
          this.cities.push(new City("Anrelia", 50, 50))
          this.cities.push(new City("EagleFall", 50, 50))
          this.cities.push(new City("JadeWind", 50, 50))
          this.cities.push(new City("Matugar", 50, 50))
          this.current_city = cities[0]
      }
}
