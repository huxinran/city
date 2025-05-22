
export var ResourceName = ["Wood", "Wheat", "Flour", "Bread", "Pork", "Sausage", "Vegetable", "Fruit", "Cow", "Fish"]

export class Storage {
    items: Item[] = []

    constructor() {
        for (let type of ResourceName) {
            this.items.push(new Item(type))
        }
    }
}


export class Item {
    constructor(
        public type: string, 
        public num: number = 0,
    ) {}
}
