import { Tile } from "./tile"
import { City } from "./city"
import { Storage } from "./storage"
import { Building } from "./building"

export class State {
      public city : City
      public storage : Storage
      public time : number
      public gold : number
      public houses : Building[]
      public productions : Building[]
      public population : number
      public worker_needed : number
      public worker_employed: number
      public buildType? : string
      public focus_tile?: Tile

      constructor() {
        this.city = new City(20, 20)
        this.storage = new Storage
        this.time = 0
        this.gold = 0
        this.houses = []
        this.productions = []
        this.population = 0
        this.worker_needed = 0
        this.worker_employed = 0
      }

}
