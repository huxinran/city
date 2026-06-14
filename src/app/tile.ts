import { Building } from "./building"
import { Terrain } from "./types"

export class Tile {
    i = 0
    j = 0
    terrain : Terrain
    building? : Building
    // When this tile is part of a larger building anchored elsewhere,
    // `covered` is true and anchor_i/anchor_j point to the anchor tile.
    covered = false
    anchor_i = -1
    anchor_j = -1

    constructor(i: number, j: number, terrain: Terrain) {
        this.i = i;
        this.j = j;
        this.terrain = terrain
    }
}
