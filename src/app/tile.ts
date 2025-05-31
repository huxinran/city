import { Building } from "./building"
import { Terrain } from "./types"

export class Tile {
    i = 0
    j = 0
    terrain : Terrain
    building? : Building
    
    constructor(i: number, j: number, terrain: Terrain) {
        this.i = i;
        this.j = j;
        this.terrain = terrain
    }
}
