import { ShippingTask, Cart } from "./building"
import { Storage, Item } from "./storage"
import {Tile} from "./tile"
import { AddItem } from "./utils"

export class Map {
    constructor (
        public h: number,
        public w: number,
        public tiles : Tile[],
    ) {}
}

export class City {
    constructor(
        public name: string,
        public h: number, 
        public w: number,
        public tiles : Tile[] = [],
        public storage : Storage = new Storage(),
        public houses : Tile[] = [],
        public productions : Tile[] = [],
        public productions_done: Tile[] = [],
        public productions_pending: Tile[] = [],
        public services: Tile[] = [],
        public warehouses: Tile[] = [],
        public shipping_tasks: ShippingTask[] = [],
        public carts: Tile[] = [],
        public population : number = 0,
        public worker_needed : number = 0,
        public worker_employed: number = 0,
        public focus_tile?: Tile
    ) {
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                this.tiles.push(new Tile(i, j, "Land"))
            }
        }
        AddItem(this.storage, new Item("Wood", 50))
    }
}


