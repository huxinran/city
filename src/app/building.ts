import { Storage, Item, ResourceType } from "./storage"
import { Tile } from "./tile"
import { TakeItems } from "./utils"
import { ResidentTier } from "./population"


export enum ProductionStatus {
    READY = "Ready",
    WAITING_DELIVERY="Waiting Delivery",
    IN_PROGRESS = "In Progress",
    FINISHED = "Finished",
    WAITING_PICK_UP="Waiting Pick Up"
}

export enum ShippingTaskType {
    PICKING_UP="Picking Up",
    DELIVERYING="Deliverying",
    RETURNING="Returning",
}

export enum ServiceType {
    WATER = "Water",


}


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
        public service_needs: ServiceNeed[] = [],
        public resource_needs: ResourceNeed[] = [],
        public tier: number = 1,
        public resident_type: ResidentTier = ResidentTier.FARMER,
        public occupant: number = 0,
        public happiness: number = 0,
        public storage: Storage = new Storage()
    ) {
        resident_type = GetResidentType(tier)
        resource_needs = GetResourceNeed(tier)
    }

    public Upgrade() {
        this.tier += 1
        this.max_occupant = this.tier * 10
        this.resident_type = GetResidentType(this.tier)
        this.resource_needs = GetResourceNeed(this.tier)
        this.service_needs = GetServiceNeed(this.tier)
    }

    public Downgrade() {
        this.tier -= 1
        this.max_occupant = this.tier * 10
        this.resident_type = GetResidentType(this.tier)
        this.resource_needs = GetResourceNeed(this.tier)
        this.service_needs = GetServiceNeed(this.tier)
    }
}




export class Production {
    constructor(
        public worker_needed: number, 
        public worker_type: ResidentTier,
        public full_efficiency: number, 
        public ingredient: Item[], 
        public product: Item[],
        public worker: number = 0,
        public progress: number = 0,
        public storage: Storage = new Storage(),
        public status: ProductionStatus = ProductionStatus.READY,
    ) {}
}

export class Service {
    constructor(
        public need_provided : ServiceType,
        public radius: number 
    ) {}

}


export class ServiceNeed {
    constructor(
        public type: ServiceType,
        public satisfied : boolean = false
    ) {}
}

export class ResourceNeed {
    constructor(
        public type: ResourceType,
        public satisfied : boolean = false
    ) {}
}

export class Cart {
    constructor(
        public speed: number,
        public task?: ShippingTask,
    ) {}
}

export class ShippingTask {
    constructor(
        public type: ShippingTaskType,
        public dst: Tile,
        public cargo: Item[],
        public distance: number = 0,
        public progress: number = 0,
    ) {}

}

export class Warehouse {
    constructor(
        public num: number,
        public carts : Cart[] = []
    ) {
        for (let i = 0; i < num; ++i) {
            carts.push(new Cart(1))
        }
    }
}

export function GetResidentType(tier: number) {
    if (tier == 1) {
        return ResidentTier.FARMER
    } else if (tier == 2) {
        return ResidentTier.WORKER
    } else if  (tier == 3) {
        return ResidentTier.CLERK
    } else if (tier == 4) {
        return ResidentTier.SCHOLAR
    } else {
        return ResidentTier.NOBEL
    }
}

export function GetResourceNeed(tier: number) {
    if (tier == 1) {
        return [new ResourceNeed(ResourceType.FISH), new ResourceNeed(ResourceType.OVERALL)]
    } else if (tier == 2) {
        return [new ResourceNeed(ResourceType.SAUSAGE), new ResourceNeed(ResourceType.OVERALL), new ResourceNeed(ResourceType.CABBAGE), new ResourceNeed(ResourceType.CHEESE)]
    } else if  (tier == 3) {
        return [new ResourceNeed(ResourceType.SAUSAGE), new ResourceNeed(ResourceType.CABBAGE), new ResourceNeed(ResourceType.BREAD), new ResourceNeed(ResourceType.CHEESE), new ResourceNeed(ResourceType.FUR)]
    } else if (tier == 4) {
        return [new ResourceNeed(ResourceType.SAUSAGE), new ResourceNeed(ResourceType.CABBAGE), new ResourceNeed(ResourceType.BREAD), new ResourceNeed(ResourceType.CHEESE), new ResourceNeed(ResourceType.APPLE), new ResourceNeed(ResourceType.POTTERY)]
    } else {
        return [new ResourceNeed(ResourceType.SAUSAGE), new ResourceNeed(ResourceType.CABBAGE), new ResourceNeed(ResourceType.BREAD), new ResourceNeed(ResourceType.CHEESE), new ResourceNeed(ResourceType.APPLE), new ResourceNeed(ResourceType.POTTERY), new ResourceNeed(ResourceType.CIGAR)]
    }
}

export function GetServiceNeed(tier: number) {
    if (tier == 1) {
        return [new ServiceNeed(ServiceType.WATER)]
    } else if (tier == 2) {
        return [new ServiceNeed(ServiceType.WATER)]
    } else if  (tier == 3) {
        return [new ServiceNeed(ServiceType.WATER)]
    } else if (tier == 4) {
        return [new ServiceNeed(ServiceType.WATER)]
    } else {
        return [new ServiceNeed(ServiceType.WATER)]
    }
}

export function GetResource(tier: number) {
    if (tier == 1) {
        return []
    } else if (tier == 2) {
        return ResidentTier.WORKER
    } else if  (tier == 3) {
        return ResidentTier.CLERK
    } else if (tier == 4) {
        return ResidentTier.SCHOLAR
    } else {
        return ResidentTier.NOBEL
    }
}

export function CreateBuilding(type: string, storage: Storage) {
    let new_building
    if (type == "House") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], new House(10, [new ServiceNeed(ServiceType.WATER)], [new ResourceNeed(ResourceType.FISH)]), undefined, undefined,)
    } else if (type == "LumberHut") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.WOOD, 1)]))    
    } else if (type == "ClayPit") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.CLAY, 1)]))    
    } else if (type == "Coal Klin") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.COAL, 1)]))    
    } else if (type == "WheatFarm") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.WHEAT, 1)]))   
    } else if (type == "WindMill") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [new Item(ResourceType.WHEAT, 1)], [new Item(ResourceType.FLOUR, 1)]))   
    } else if (type == "Bakery") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [new Item(ResourceType.FLOUR, 1)], [new Item(ResourceType.BREAD, 1)]))    
    } else if (type == "PigFarm") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.PORK, 1)]))     
    } else if (type == "SausageShop") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [new Item(ResourceType.PORK, 1)], [new Item(ResourceType.SAUSAGE, 1)]))     
    } else if (type == "FishPier") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.FISH, 1)])) 
    } else if (type == "CabbageFarm") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.CABBAGE, 1)])) 
    } else if (type == "AppleFarm") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.APPLE, 1)])) 
    } else if (type == "CowFarm") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [], [new Item(ResourceType.MILK, 1)])) 
    } else if (type == "CheeseFactory") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [new Item(ResourceType.MILK, 1)], [new Item(ResourceType.CHEESE, 1)])) 
    } else if (type == "PotteryFactory") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [new Item(ResourceType.CLAY, 1)], [new Item(ResourceType.POTTERY, 1)])) 
    } else if (type == "ClothingFactory") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, new Production(10, ResidentTier.FARMER, 10.0, [new Item(ResourceType.WOOL, 1)], [new Item(ResourceType.OVERALL, 1)])) 
    } else if (type == "Well") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, undefined, new Service(ServiceType.WATER, 5))    
    } else if (type == "Warehouse") {
        new_building = new Building(type, [new Item(ResourceType.WOOD, 1)], undefined, undefined, undefined, new Warehouse(4))
    } 
    if (TakeItems(storage, new_building!.material)) {
        return new_building
    }
    return undefined
}