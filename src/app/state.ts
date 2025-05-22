import { Tile } from "./tile"
import { City } from "./city"
import { Item, Storage } from "./storage"
import { AddItem } from "./utils"
export class State {
       constructor(
        public city : City = new City(20, 20),
        public storage : Storage = new Storage(),
        public time : number = 0,
        public gold : number = 0,
        public houses : Tile[] = [],
        public productions : Tile[] = [],
        public services: Tile[] = [],
        public warehouses: Tile[] = [],
        public population : number = 0,
        public worker_needed : number = 0,
        public worker_employed: number = 0,
        public build_type? : string, 
        public terrain_type? : string,
        public focus_tile?: Tile) {
          AddItem(this.storage, new Item("Wood", 50))
      }
}
