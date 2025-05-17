export class Storage {
    wood: number = 0
    wheat: number = 0
    flour: number = 0
    bread: number = 0
    pork: number = 0
    sausage: number = 0
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
