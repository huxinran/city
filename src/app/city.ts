import { Ship, ShippingTask, Route } from "./building"
import { Storage, Item } from "./storage"
import { Tile} from "./tile"
import { Population } from "./population"
import { AddItem } from "./utils"
import { CityName, Resource, Terrain } from "./types"
import { BuildingType } from "./types"

export class Map {
    constructor (
        public h: number,
        public w: number,
        public tiles : Tile[],
    ) {}
}

// Build a terrain layout: ocean surrounding the land, a grassland interior,
// with scattered rock outcrops (for mines) and stands of trees (for lumber).
// Trees and rocks are removable: clear them with the Delete tool to free the land.
export function GenerateTerrain(h: number, w: number): Terrain[] {
    const seaThickness = 3
    const grid: Terrain[] = []
    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            const edge = Math.min(i, j, h - 1 - i, w - 1 - j)
            grid.push(edge < seaThickness ? Terrain.SEA : Terrain.GRASS)
        }
    }

    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
    const stamp = (ci: number, cj: number, r: number, terrain: Terrain) => {
        for (let i = ci - r; i <= ci + r; ++i) {
            for (let j = cj - r; j <= cj + r; ++j) {
                if (i < 0 || j < 0 || i >= h || j >= w) continue
                if ((i - ci) * (i - ci) + (j - cj) * (j - cj) > r * r) continue
                const idx = i * w + j
                if (grid[idx] === Terrain.SEA) continue // don't carve into the ocean
                grid[idx] = terrain
            }
        }
    }

    const lo = seaThickness + 3
    const hiI = h - seaThickness - 4
    const hiJ = w - seaThickness - 4
    const area = (h - 2 * seaThickness) * (w - 2 * seaThickness)
    const rocks = Math.max(2, Math.round(area / 450))
    const trees = Math.max(3, Math.round(area / 280))
    for (let k = 0; k < rocks; ++k) {
        stamp(rand(lo, hiI), rand(lo, hiJ), rand(3, 5), Terrain.ROCK)
    }
    for (let k = 0; k < trees; ++k) {
        stamp(rand(lo, hiI), rand(lo, hiJ), rand(3, 5), Terrain.TREE)
    }
    return grid
}

export class City {
    constructor(
        public name: CityName,
        public h: number, 
        public w: number,
        public farms: BuildingType[],
        public materials: BuildingType[],
        public workshops: BuildingType[],
        public infrastructure: BuildingType[] = [],
        public tiles : Tile[] = [], 
        public storage : Storage = new Storage(),
        public houses : Tile[] = [],
        public productions : Tile[] = [],
        public services: Tile[] = [],
        public warehouses: Tile[] = [],
        public shipyards: Tile[] = [],
        public docks: Tile[] = [],
        public shipping_tasks: ShippingTask[] = [],
        public carts: Tile[] = [],
        public ships: Ship[] = [],
        public routes: Route[] = [],
        public population : Population = new Population(),
        public focus_tile?: Tile
    ) {
        let terrain = GenerateTerrain(h, w)
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                this.tiles.push(new Tile(i, j, terrain[i * w + j]))
            }
        }
        AddItem(this.storage, new Item(Resource.WOOD, 500))
        this.infrastructure  = [...this.infrastructure, BuildingType.WELL, BuildingType.FIRE_STATION, BuildingType.POLICE_STATION, BuildingType.SCHOOL, BuildingType.SHIPYARD, BuildingType.DOCK]
    }
}
