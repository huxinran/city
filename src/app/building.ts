import { Storage, Item } from "./storage"
import { Tile } from "./tile"
import { TakeItems } from "./utils"

export class Building {
    constructor(
        public type: string,
        public material: Item[] = [],
        public house?: House,
        public production?: Production,
        public service?: Service,
        public warehouse?: Warehouse,
    ) {}
}

export class House {
    constructor(
        public max_occupant: number,
        public needs: Need[] = [],
        public occupant: number = 0,
        public happiness: number = 0,
        public storage: Storage = new Storage()
    ) {}
}

export class Production {
    constructor(
        public worker_needed: number, 
        public full_efficiency: number, 
        public ingredient: Item[], 
        public product: Item[],
        public worker: number = 0,
        public progress: number = 0,
        public storage: Storage = new Storage(),
        public status: string = "Waiting",
    ) {}
}

export class Service {
    constructor(
        public need_provided : string,
        public radius: number 
    ) {}

}

export class Need {
    constructor(
        public type: string,
        public satisfied : boolean = false
    ) {}
}

export class Cart {
    constructor(
        public speed: number = 1,
        public status: string = "Idle",
        public src?: Tile,
        public dst?: Tile,
        public cargo: Item[] = [],
        public progress: number = 0,
        public distance: number = 0,
    ) {}

}

export class Warehouse {
    constructor(
        public num: number,
        public carts : Cart[] = []
    ) {
        for (let i = 0; i < num; ++i) {
            carts.push(new Cart())
        }
    }
}



export function CreateBuilding(type: string, storage: Storage) {
    let new_building = undefined
    if (type == "House") {
        new_building = new Building(type, [new Item("Wood", 1)], new House(10, [new Need("Water"), new Need("Fish")]), undefined, undefined,)
    } else if (type == "LumberHut") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [], [new Item("Wood", 1)]))    
    } else if (type == "WheatFarm") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [], [new Item("Wheat", 1)]))   
    } else if (type == "WindMill") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [new Item("Wheat", 1)], [new Item("Flour", 1)]))   
    } else if (type == "Bakery") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [new Item("Flour", 1)], [new Item("Bread", 1)]))    
    } else if (type == "PigFarm") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [], [new Item("Pork", 1)]))     
    } else if (type == "SausageShop") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [new Item("Pork", 1)], [new Item("Sausage", 1)]))     
    } else if (type == "FishPier") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, new Production(10, 10.0, [], [new Item("Fish", 1)])) 
    } else if (type == "Well") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, undefined, new Service("Water", 5))    
    } else if (type == "Warehouse") {
        new_building = new Building(type, [new Item("Wood", 1)], undefined, undefined, undefined, new Warehouse(4))
    }
    if (TakeItems(storage, new_building!.material)) {
        return new_building
    }
    return undefined
}