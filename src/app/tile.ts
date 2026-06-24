import { Building } from "./building"
import { Terrain, Feature } from "./types"

export class Tile {
    i = 0
    j = 0
    terrain : Terrain
    // Natural feature (tree / rock) on this tile, sitting on top of the terrain
    // like a building. Undefined for a bare tile.
    feature? : Feature
    building? : Building
    // When this tile is part of a larger building anchored elsewhere,
    // `covered` is true and anchor_i/anchor_j point to the anchor tile.
    covered = false
    anchor_i = -1
    anchor_j = -1
    // Terrain saved here when a house is placed on the tile, restored on removal.
    original_terrain?: Terrain

    constructor(i: number, j: number, terrain: Terrain) {
        this.i = i;
        this.j = j;
        this.terrain = terrain
    }
}
