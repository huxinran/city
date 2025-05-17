import { Building } from "./building"

export class Tile {
    i = 0
    j = 0
    type? : string
    building? : Building
    
    constructor(i: number, j: number, type: string) {
        this.i = i;
        this.j = j;
        this.type = type
    }

    public tick() {

    }
}
