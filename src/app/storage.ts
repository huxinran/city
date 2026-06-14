
import { Resource } from "./types";

// Storage holds a quantity per Resource as a plain object, giving O(1) lookups
// and clean JSON serialization. Kept method-free: all logic lives in utils.ts
// (see GetResource/AddItem/TakeItem/StorageItems), because state is persisted
// via JSON.stringify/parse which would strip any instance methods.
export class Storage {
    amounts: { [key: string]: number } = {}
    constructor() {
        let type: keyof typeof Resource;
        for (type in Resource) {
            this.amounts[Resource[type]] = 0
        }
    }
}

export class Item {
    constructor(
        public type: Resource,
        public num: number = 0,
    ) {}
}
