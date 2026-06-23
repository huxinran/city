import { Ship, ShippingTask, Route } from "./building"
import { Storage, Item } from "./storage"
import { Tile} from "./tile"
import { Population } from "./population"
import { AddItem } from "./utils"
import { CityName, Resource, Terrain, Feature } from "./types"
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
export function GenerateTerrain(h: number, w: number): { terrain: Terrain[], feature: (Feature | undefined)[] } {
    const seaThickness = 3
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

    // A wobbly coastline: each of the four edges gets a jitter array that
    // random-walks along its length, so the sea/land boundary zigzags in and
    // out instead of being a straight rectangular ring.
    const makeJitter = (len: number) => {
        const arr: number[] = []
        let v = rand(0, 4)
        for (let k = 0; k < len; ++k) {
            v = Math.min(6, Math.max(0, v + rand(-1, 1)))
            arr.push(v)
        }
        return arr
    }
    const topJ = makeJitter(w), botJ = makeJitter(w)
    const leftJ = makeJitter(h), rightJ = makeJitter(h)

    const grid: Terrain[] = []
    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            const isSea =
                i < seaThickness + topJ[j] ||
                (h - 1 - i) < seaThickness + botJ[j] ||
                j < seaThickness + leftJ[i] ||
                (w - 1 - j) < seaThickness + rightJ[i]
            grid.push(isSea ? Terrain.WATER : Terrain.GRASS)
        }
    }

    // Grass tiles touching a tile of the given terrain.
    const grassTouching = (terrain: Terrain) => {
        const tiles: number[] = []
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                const idx = i * w + j
                if (grid[idx] !== Terrain.GRASS) continue
                const touches =
                    (i > 0 && grid[(i - 1) * w + j] === terrain) ||
                    (i < h - 1 && grid[(i + 1) * w + j] === terrain) ||
                    (j > 0 && grid[i * w + j - 1] === terrain) ||
                    (j < w - 1 && grid[i * w + j + 1] === terrain)
                if (touches) tiles.push(idx)
            }
        }
        return tiles
    }
    // Layer 1: a continuous sand rim hugging the whole coastline.
    for (const idx of grassTouching(Terrain.WATER)) grid[idx] = Terrain.SAND

    // Thicken the beach in continuous stretches: walk along the inner edge of
    // the sand and, with some probability, start a run that extends the sand
    // inward for a few neighbouring tiles. A run thickens to 2, and less often
    // to 3, but always as a connected band rather than scattered specks.
    const thicken = (prob: number) => {
        const candidates = grassTouching(Terrain.SAND)
        const added: number[] = []
        let running = false
        for (const idx of candidates) {
            if (!running && Math.random() < prob) running = true
            else if (running && Math.random() < 0.35) running = false
            if (running) added.push(idx)
        }
        for (const idx of added) grid[idx] = Terrain.SAND
    }
    thicken(0.3)   // second layer (thicker patches)
    thicken(0.12)  // third layer (rarer, deeper patches)

    const lo = seaThickness + 3
    const hiI = h - seaThickness - 4
    const hiJ = w - seaThickness - 4
    const area = (h - 2 * seaThickness) * (w - 2 * seaThickness)

    // The feature layer: tree / rock outcrops scattered over the land. Grown as
    // irregular continuous blobs by random-walking outward from a seed, claiming
    // neighbouring (non-water, still-bare) tiles so the edge stays connected but
    // ragged (no clean circle).
    const feature: (Feature | undefined)[] = new Array(h * w).fill(undefined)
    const blob = (ci: number, cj: number, count: number, feat: Feature) => {
        const frontier: { i: number, j: number }[] = [{ i: ci, j: cj }]
        let placed = 0
        while (placed < count && frontier.length > 0) {
            const pick = frontier.splice(rand(0, frontier.length - 1), 1)[0]
            if (pick.i < 0 || pick.j < 0 || pick.i >= h || pick.j >= w) continue
            const idx = pick.i * w + pick.j
            if (grid[idx] === Terrain.WATER || feature[idx] !== undefined) continue
            feature[idx] = feat
            placed++
            frontier.push({ i: pick.i + 1, j: pick.j }, { i: pick.i - 1, j: pick.j },
                          { i: pick.i, j: pick.j + 1 }, { i: pick.i, j: pick.j - 1 })
        }
    }

    const rocks = Math.max(2, Math.round(area / 900))
    for (let k = 0; k < rocks; ++k) {
        blob(rand(lo, hiI), rand(lo, hiJ), rand(20, 45), Feature.ROCK)
    }
    const forests = Math.max(3, Math.round(area / 400))
    for (let k = 0; k < forests; ++k) {
        blob(rand(lo, hiI), rand(lo, hiJ), rand(20, 45), Feature.TREE)
    }
    // Strip any features that ended up on water tiles
    for (let i = 0; i < h * w; i++) {
        if (grid[i] === Terrain.WATER) feature[i] = undefined
    }
    return { terrain: grid, feature }
}

export class City {
    constructor(
        public name: CityName,
        public h: number,
        public w: number,
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
        let generated = GenerateTerrain(h, w)
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let idx = i * w + j
                let tile = new Tile(i, j, generated.terrain[idx])
                tile.feature = generated.feature[idx]
                this.tiles.push(tile)
            }
        }
        AddItem(this.storage, new Item(Resource.TIMBER, 100))
    }
}
