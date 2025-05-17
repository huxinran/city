import {Tile} from "./tile"

export class City {
    public h : number;
    public w : number;
    tiles : Tile[] = [];

    constructor(h: number, w: number) {
        this.h = h;
        this.w = w;
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                this.tiles.push(new Tile(i, j, "Land"))
            }
        }
    }
}
