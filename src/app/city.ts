import { Ship, ShippingTask } from "./building"
import { Storage, Item } from "./storage"
import { Tile} from "./tile"
import { Population } from "./population"
import { AddItem } from "./utils"
import { CityName, Resource, Terrain } from "./types"
import { BuildingType } from "./types"

export class Map {
    constructor (
        public h: number,
        public w: number,
        public tiles : Tile[],
    ) {}
}

export class City {
    constructor(
        public name: CityName,
        public h: number, 
        public w: number,
        public farms: BuildingType[],
        public materials: BuildingType[],
        public workshops: BuildingType[],
        public infrastructure: BuildingType[] = [],
        public tiles : Tile[] = [], 
        public storage : Storage = new Storage(),
        public houses : Tile[] = [],
        public productions : Tile[] = [],
        public services: Tile[] = [],
        public warehouses: Tile[] = [],
        public shipyards: Tile[] = [],
        public docks: Tile[] = [],
        public shipping_tasks: ShippingTask[] = [],
        public carts: Tile[] = [],
        public ships: Ship[] = [],
        public population : Population = new Population(),
        public focus_tile?: Tile
    ) {
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                this.tiles.push(new Tile(i, j, Terrain.GRASS))
            }
        }
        AddItem(this.storage, new Item(Resource.WOOD, 500))
        this.infrastructure  = [...this.infrastructure, BuildingType.WELL, BuildingType.FIRE_STATION, BuildingType.POLICE_STATION, BuildingType.SCHOOL, BuildingType.SHIPYARD, BuildingType.DOCK]
    }
}
