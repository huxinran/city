
export enum ResourceType {
    APPLE = "Apple",
    BANANA = "Banana",
    BERRY = "Berry",
    BRANDY = "Brandy",
    BREAD = "Bread",
    BRICK = "Brick",
    CABBAGE = "Cabbage",
    CANDLE = "Candle",
    CHEESE = "Cheese",
    CIGAR = "CIGAR",
    CLAY = "Clay",
    COAL = "Coal",
    COCOA = "Cocoa",
    CORN = "Corn",    
    COTTON = "Cotton",
    EGG = "Egg",
    FISH = "Fish",
    FLOUR = "Flour",
    FUR = "Fur",
    GEM = "Gem",
    GLASS = "Glass",
    GOLD = "Gold",
    GRAPE = "Grape",
    IRON = "Iron",
    JAM = "Jam",
    MELON = "Melon",
    MILK = "Milk",
    OLIVE = "Olive",
    ORANGE = "Orange",
    ONION = "Onio",
    PLANK = "Plank",
    PORK = "Pork",
    POTATO = "Potato",
    POTTERY = "Pottery",
    PUMPKIN = "Pumpkin",
    SALT = "Salt",
    SAND = "Sand",
    SAUSAGE = "Sausage",
    SLATE = "Slate",
    SOYBEAN = "Soybean",
    STEEL = "Steel",
    STONE = "Stone",
    SUGAR_CANE = "SugarCane",
    RICE = "Rice",
    RUBBER= "RUBBER",
    TOBACCO = "Tobacco",
    TOMATO = "Tomato",
    WAX = "Wax",
    WHEAT = "Wheat",
    WOOD = "Wood",
    WOOL = "Wool",
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
