
import { Resource } from "./types";

export class Storage {
    items: Item[] = []
    constructor() {
        let type: keyof typeof Resource;
        for (type in Resource) {
            this.items.push(new Item(Resource[type]))
        }
    }
}

export class Item {
    constructor(
        public type: Resource, 
        public num: number = 0,
    ) {}
}
