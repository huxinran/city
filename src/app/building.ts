import { Storage, Item } from "./storage"
import { Tile } from "./tile"
import { TakeItems } from "./utils"
import { Resource, HouseType, Resident, ProductionStatus, ServiceType, ShippingTaskType, BuildingType, ShipType, CityName } from "./types"


export class Building {
    constructor(
        public type: BuildingType,
        public material: Item[] = [],
        public house?: House,
        public production?: Production,
        public service?: Service,
        public warehouse?: Warehouse,
        public shipyard?: Shipyard,
        public dock?: Dock,
    ) {}
}


export function RefreshHouse(house: House) {
    house.max_occupant = house.tier * 10
    house.resident_type = GetResidentType(house.tier)
    house.type = GetHouseType(house.tier)
    house.current_max_occupant = GetCurrentMaxOccupant(house.tier, house.happiness)
    house.resource_needs = GetResourceNeed(house.tier)
    house.service_needs = GetServiceNeed(house.tier)
} 


export class House {
    constructor(
        public tier: number = 1,
        public happiness: number = 0,
        public occupant: number = 0,
        public type: HouseType = GetHouseType(tier),
        public current_max_occupant: number = GetCurrentMaxOccupant(tier, happiness),
        public max_occupant: number = 10,
        public resource_needs: ResourceNeed[] = GetResourceNeed(tier),
        public service_needs: ServiceNeed[] = GetServiceNeed(tier),
        public resident_type: Resident = Resident.FARMER,
        public storage: Storage = new Storage()
    ) {
        RefreshHouse(this)
    }
}

export class Ship {
    constructor(
        public type: ShipType,
        public max_cargo: number,
        public speed: number,
        public cargo: Storage = new Storage, 
        public status: ShippingTaskType = ShippingTaskType.READY,
    ) {}
}

export class ShipBlueprint {
    constructor(
        public type: ShipType, 
        public speed: number, 
        public max_cargo: number, 
        public cost: Item[], 
        public build_time: number,
    ) {}
}


export class Shipyard {
    constructor(
        public tier: number = 1,
        public status: ProductionStatus = ProductionStatus.READY,
        public progress: number = 0.0,
        public blueprints: ShipBlueprint[] = [],
        public selected?: ShipBlueprint,
        public storage: Storage = new Storage(),
    ) {
        this.blueprints = [new ShipBlueprint(ShipType.CARGO, 1.5, 100, [new Item(Resource.WOOD, 10)], 60), new ShipBlueprint(ShipType.CLIPPER, 2.0, 60, [new Item(Resource.WOOD, 10)], 90), new ShipBlueprint(ShipType.GRAND, 1.0, 300, [new Item(Resource.WOOD, 10)], 120)]
    }
}

export class Dock {
    constructor(
        public tier: number = 1,
        public from?: CityName,
        public to?: CityName,
        public resource?: Resource,
        public num : number = 0,
    ) {}
}



export class Production {
    constructor(
        public worker_needed: number, 
        public worker_type: Resident,
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
        public type: Resource,
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

function GetNumOfCarts(tier: number) {
    if (tier == 1) {
        return 4
    } else if (tier == 2) {
        return 6
    } else {
        return 8
    }
}

function GetCartSpeed(tier: number) {
    if (tier == 1) {
        return 1.0
    } else if (tier == 2) {
        return 1.5
    } else {
        return 2.0
    }
}

export function RefreshWarehouse(warehouse: Warehouse) {
    warehouse.num_carts = GetNumOfCarts(warehouse.tier)
    warehouse.cart_speed = GetCartSpeed(warehouse.tier)
    for (let i = warehouse.carts.length; i < warehouse.num_carts; ++i) {
        warehouse.carts.push(new Cart(1))
    }
    for (let cart of warehouse.carts) {
        cart.speed = warehouse.cart_speed
    }
}


export class Warehouse {
    constructor(
        public tier: number = 1,
        public num_carts: number = GetNumOfCarts(tier),
        public cart_speed: number = GetCartSpeed(tier),
        public carts : Cart[] = []
    ) {
        RefreshWarehouse(this)
    }
}

export function GetResidentType(tier: number) {
    if (tier == 1) {
        return Resident.FARMER
    } else if (tier == 2) {
        return Resident.WORKER
    } else if  (tier == 3) {
        return Resident.ARTISAN
    } else if (tier == 4) {
        return Resident.SCHOLAR
    } else if (tier == 5) {
        return Resident.ENTREPRENEUR
    } else {
        return Resident.MAGNATE
    }
}

export function GetHouseType(tier: number) {
    if (tier == 1) {
        return HouseType.COTTAGE
    } else if (tier == 2) {
        return HouseType.TENEMENT
    } else if  (tier == 3) {
        return HouseType.HOUSE
    } else if (tier == 4) {
        return HouseType.VILLA
    } else if (tier == 5) {
        return HouseType.MANSION
    } else {
        return HouseType.ESTATE
    }
}

export function GetCurrentMaxOccupant(tier: number, happiness:number) {
    let min = Math.max(2, (tier - 1) * 10)
    let max = tier * 10
    let range = max - min
    return Math.round(min + range * happiness)
}


export function GetResourceNeed(tier: number) {
    if (tier == 1) {
        return [new ResourceNeed(Resource.FISH), new ResourceNeed(Resource.OVERALL)]
    } else if (tier == 2) {
        return [new ResourceNeed(Resource.OVERALL), new ResourceNeed(Resource.SAUSAGE), new ResourceNeed(Resource.CABBAGE), new ResourceNeed(Resource.CHEESE)]
    } else if  (tier == 3) {
        return [new ResourceNeed(Resource.CHEESE), new ResourceNeed(Resource.BREAD), new ResourceNeed(Resource.CIDER), new ResourceNeed(Resource.POTTERY)]
    } else if (tier == 4) {
        return [new ResourceNeed(Resource.SAUSAGE), new ResourceNeed(Resource.CABBAGE), new ResourceNeed(Resource.BREAD), new ResourceNeed(Resource.CHEESE), new ResourceNeed(Resource.APPLE), new ResourceNeed(Resource.POTTERY)]
    } else if (tier == 5) {
        return [new ResourceNeed(Resource.SAUSAGE), new ResourceNeed(Resource.CABBAGE), new ResourceNeed(Resource.BREAD), new ResourceNeed(Resource.CHEESE), new ResourceNeed(Resource.APPLE), new ResourceNeed(Resource.POTTERY), new ResourceNeed(Resource.CIGAR)]
    } else {
        return []
    } 
}

export function GetServiceNeed(tier: number) {
    if (tier == 1) {
        return [new ServiceNeed(ServiceType.WATER)]
    } else if (tier == 2) {
        return [new ServiceNeed(ServiceType.WATER), new ServiceNeed(ServiceType.FIRE), new ServiceNeed(ServiceType.POLICE)]
    } else if  (tier == 3) {
        return [new ServiceNeed(ServiceType.WATER), new ServiceNeed(ServiceType.FIRE), new ServiceNeed(ServiceType.POLICE), new ServiceNeed(ServiceType.SCHOOL)]
    } else if (tier == 4) {
        return [new ServiceNeed(ServiceType.WATER)]
    } else {
        return [new ServiceNeed(ServiceType.WATER)]
    }
}

export function CreateBuilding(type: BuildingType, storage: Storage) {
    let new_building
    if (type == BuildingType.HOUSE) {
        new_building = new Building(type, [new Item(Resource.WOOD, 5)], new House(), undefined, undefined,)
    } else if (type == BuildingType.LUMBER_HUT) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.WOOD, 1)]))    
    } else if (type == BuildingType.STONE_QUARRY) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.STONE, 1)]))    
    } else if (type == BuildingType.CLAY_PIT) {
        new_building = new Building(type, [new Item(Resource.STONE, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.CLAY, 1)]))    
    } else if (type == BuildingType.COAL_KILN) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.COAL, 1)]))    
    } else if (type == BuildingType.WHEAT_FARM) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.WHEAT, 1)]))   
    } else if (type == BuildingType.WIND_MILL) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.WHEAT, 1)], [new Item(Resource.FLOUR, 1)]))   
    } else if (type == BuildingType.BAKERY) {
        new_building = new Building(type, [new Item(Resource.STONE, 10)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.FLOUR, 1)], [new Item(Resource.BREAD, 1)]))    
    } else if (type == BuildingType.PIG_FARM) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.PORK, 1)]))     
    } else if (type == BuildingType.BUTCHERY) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.PORK, 1)], [new Item(Resource.SAUSAGE, 1)]))     
    } else if (type == BuildingType.FISHERY) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.FISH, 1)])) 
    } else if (type == BuildingType.CABBAGE_PATCH) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.CABBAGE, 1)])) 
    } else if (type == BuildingType.APPLE_ORCHARD) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.APPLE, 1)])) 
    } else if (type == BuildingType.TOBACCO_PLANTATION) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.TOBACCO, 1)])) 
    } else if (type == BuildingType.DIARY_FARM) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.MILK, 1)])) 
    } else if (type == BuildingType.SHEEP_FARM) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, new Production(10, Resident.FARMER, 10.0, [], [new Item(Resource.WOOL, 1)])) 
    } else if (type == BuildingType.CIDERY) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.APPLE, 1)], [new Item(Resource.CIDER, 1)])) 
    } else if (type == BuildingType.CREAMERY) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.MILK, 1)], [new Item(Resource.CHEESE, 1)])) 
    } else if (type == BuildingType.POTTERY_SHOP) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, new Production(10, Resident.WORKER, 10.0, [new Item(Resource.CLAY, 1)], [new Item(Resource.POTTERY, 1)])) 
    } else if (type == BuildingType.OVERALL_FACTORY) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, new Production(10, Resident.FARMER, 10.0, [new Item(Resource.WOOL, 1)], [new Item(Resource.OVERALL, 1)])) 
    } else if (type == BuildingType.CIGAR_FACTORY) {
        new_building = new Building(type, [new Item(Resource.STONE, 20)], undefined, new Production(10, Resident.ARTISAN, 10.0, [new Item(Resource.TOBACCO, 1)], [new Item(Resource.CIGAR, 1)])) 
    } else if (type == BuildingType.WELL) {
        new_building = new Building(type, [new Item(Resource.WOOD, 10)], undefined, undefined, new Service(ServiceType.WATER, 5))    
    } else if (type == BuildingType.FIRE_STATION) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, undefined, new Service(ServiceType.FIRE, 6))    
    } else if (type == BuildingType.POLICE_STATION) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, undefined, new Service(ServiceType.POLICE, 6))    
    } else if (type == BuildingType.SCHOOL) {
        new_building = new Building(type, [new Item(Resource.STONE, 30)], undefined, undefined, new Service(ServiceType.SCHOOL, 8))    
    } else if (type == BuildingType.WAREHOUSE) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, undefined, undefined, new Warehouse())
    } else if (type == BuildingType.SHIPYARD) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, undefined, undefined, undefined, new Shipyard())
    } else if (type == BuildingType.DOCK) {
        new_building = new Building(type, [new Item(Resource.WOOD, 20)], undefined, undefined, undefined, undefined, undefined, new Dock())
    } 
    if (new_building == undefined) {
        return undefined
    }

    if (TakeItems(storage, new_building!.material)) {
        return new_building
    }
    return undefined
}