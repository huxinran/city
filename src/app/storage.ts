export class Storage {
    items: Items[] = []

    constructor() {
        for (let type of ResourceName) {
            this.items.push(new Items(type, 0))
        }
    }
}


export class Items {
    type: string
    num : number

    constructor(type: string, num: number) {
        this.type = type
        this.num = num
    }
}

export var ResourceName = ["Wood", "Wheat", "Flour", "Bread", "Pork", "Sausage"]

