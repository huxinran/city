import { Building } from "./building"
import { Terrain } from "./types"

export class Tile {
    i = 0
    j = 0
    type? : Terrain
    building? : Building
    
    constructor(i: number, j: number, type: Terrain) {
        this.i = i;
        this.j = j;
        this.type = type
    }
}
