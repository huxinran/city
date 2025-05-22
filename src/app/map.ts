import {Tile} from "./tile"

export class Map {
    constructor(
        public h: number, 
        public w: number,
        public tiles : Tile[] = []
    ) {
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                this.tiles.push(new Tile(i, j, "Land"))
            }
        }
    }
}
