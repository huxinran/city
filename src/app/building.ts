import { N } from "@angular/cdk/keycodes"
import { Items } from "./storage"

export class ProductionBuilding {
    max_worker: number
    worker: number
    full_efficiency: number
    current_progress: number
    ingredient : Items[]
    product: Items[]
    status: string

    constructor(max_worker: number, full_efficiency: number, ingredient: Items[], product: Items[]) {
        this.max_worker = max_worker
        this.worker = 0
        this.full_efficiency = full_efficiency
        this.current_progress = 0
        this.ingredient = ingredient
        this.product = product
        this.status = "Waiting"
    }
}

export class Need {
    type: string
    satisfied: boolean

    constructor(type: string) {
        this.type = type
        this.satisfied = false
    }
}

export class House {
    type: string
    max_occupant: number
    occupant: number
    needs : Need[] 

    constructor(type: string, max_occupant: number, needs: Need[]) {
        this.type = type
        this.max_occupant = max_occupant
        this.occupant = 0
        this.needs = needs
    }
}

export class Building {
    type: string
    build_cost: Items[]
    production? : ProductionBuilding
    house?: House

    constructor(type: string, build_cost: Items[], production?: ProductionBuilding, house?: House) {
        this.type = type
        this.build_cost = build_cost
        this.production = production
        this.house = house
    }
}


export function CreateBuilding(type: string) {
    if (type == "House") {
        return new Building(type, [new Items("Wood", 1)], undefined, new House("House", 10, [new Need("water"), new Need("fish")]))
    } else if (type == "LumberJack") {
        return new Building(type, [new Items("Wood", 1)], new ProductionBuilding(10, 10.0, [], [new Items("Wood", 1)]), undefined)    
    } else if (type == "WheatFarm") {
        return new Building(type, [new Items("Wood", 1)], new ProductionBuilding(10, 10.0, [], [new Items("Wheat", 1)]), undefined)    
    } else if (type == "WindMill") {
        return new Building(type, [new Items("Wood", 1)], new ProductionBuilding(10, 10.0, [new Items("Wheat", 1)], [new Items("Flour", 1)]), undefined)    
    } else if (type == "Bakery") {
        return new Building(type, [new Items("Wood", 1)], new ProductionBuilding(10, 10.0, [new Items("Flour", 1)], [new Items("Bread", 1)]), undefined)    
    } else if (type == "PigFarm") {
        return new Building(type, [new Items("Wood", 1)], new ProductionBuilding(10, 10.0, [], [new Items("Pork", 1)]), undefined)    
    } else if (type == "SausageShop") {
        return new Building(type, [new Items("Wood", 1)], new ProductionBuilding(10, 10.0, [new Items("Pork", 1)], [new Items("Sausage", 1)]), undefined)    
    }
    return undefined
}