
export enum ResourceType {
    WHEAT = "Wheat",
    RICE = "Rice",
    CORN = "Corn",
    YUM = "Yum",
    POTATO = "Potato",
    APPLE = "Apple",
    ORANGE = "Orange",
    BANANA = "Banana",
    WATERMELON = "Watermelon",
    CABBAGE = "Cabbage",
    TOMATO = "Tomato",
    SOYBEAN = "Soybean",
    EGGPLANT = "Eggplant",
    GRAPE = "Grape",
    OLIVE = "Olive",
    SUGAR_CANE = "SugarCane",
    COCOA = "Cocoa",
    TOBACCO = "Tobacco",
    COTTON = "Cotton",
    FISH = "Fish",
    EGG = "Egg",
    PORK = "Pork",
    MILK = "Milk",
    WOOL = "Wool",
    WAX = "Wax",
    SAUSAGE = "Sausage",
    CHEESE = "Cheese",
    SALT = "Salt",
    FLOUR = "Flour",
    BREAD = "Bread",
    BRANDY = "Brandy",
    WOOD = "Wood",
    PLANK = "Plank",
    STONE = "Stone",
    IRON = "Iron",
    GOLD = "Gold",
    SAND = "Sand",
    GLASS = "Glass",
    COAL = "Coal",
    STEEL = "Steel",
    CLAY = "Clay",
    BRICK = "Brick",
    POTTERY = "Pottery",
    GEM = "Gem",
}


export class Storage {
    items: Item[] = []

    constructor() {
        let type: keyof typeof ResourceType;
        for (type in ResourceType) {
            this.items.push(new Item(ResourceType[type]))
        }
    }
}


export class Item {
    constructor(
        public type: ResourceType, 
        public num: number = 0,
    ) {}
}
