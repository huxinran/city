export class Storage {
    items: Item[] = []

    constructor() {
        for (let type of ResourceName) {
            this.items.push(new Item(type, 0))
        }
    }
}


export class Item {
    type: string
    num : number

    constructor(type: string, num: number) {
        this.type = type
        this.num = num
    }
}

export var ResourceName = ["Wood", "Wheat", "Flour", "Bread", "Pork", "Sausage", "Vegetable", "Fruit", "Cow", "Fish"]

