import { Ship, ShippingTask, Route, Technology } from "./building"
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

    // Grass tiles touching a tile of the given terrain, using 8-connectivity
    // (orthogonal + DIAGONAL). The diagonal check matters: the terrain renderer
    // blends on a dual grid where each blend tile straddles a 2x2 of map tiles,
    // and it can't show three terrains at once. If grass sits only diagonally
    // next to sea (a 1-tile pinch), that 2x2 holds sea+sand+grass and the blend
    // falls back to a hard, square edge. Treating diagonals as "touching" sands
    // those pinches so grass is never within one tile of sea in any direction.
    const grassTouching = (terrain: Terrain) => {
        const tiles: number[] = []
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                const idx = i * w + j
                if (grid[idx] !== Terrain.GRASS) continue
                let touches = false
                for (let di = -1; di <= 1 && !touches; ++di) {
                    for (let dj = -1; dj <= 1; ++dj) {
                        if (di === 0 && dj === 0) continue
                        const ni = i + di, nj = j + dj
                        if (ni < 0 || nj < 0 || ni >= h || nj >= w) continue
                        if (grid[ni * w + nj] === terrain) { touches = true; break }
                    }
                }
                if (touches) tiles.push(idx)
            }
        }
        return tiles
    }
    // Sand rim: a guaranteed minimum-width beach. The first pass sands grass
    // touching water; each further pass sands grass touching the new sand. With
    // grassTouching being 8-connected, this is a clean dilation that keeps grass
    // at least SAND_RING_MIN tiles from the water in every direction — so a blend
    // tile's 2x2 never holds both sea and grass (the case that renders as a hard,
    // square coastline edge). Bump this if thin spots still show square edges.
    const SAND_RING_MIN = 1
    // Pass 0 sands grass touching water; each later pass sands grass touching the
    // sand grown so far — SAND_RING_MIN dilations in total.
    let dilateFrom = Terrain.WATER
    for (let pass = 0; pass < SAND_RING_MIN; ++pass) {
        for (const idx of grassTouching(dilateFrom)) grid[idx] = Terrain.SAND
        dilateFrom = Terrain.SAND
    }

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

    // Cap the beach depth: no sand deeper than SAND_RING_MAX tiles from water.
    // Multi-source 8-connected BFS gives each land tile its distance to the
    // nearest sea; any sand beyond the cap reverts to grass (it's deep inland,
    // ringed by sand, so no new coastline is created).
    const SAND_RING_MAX = 3
    const dist = new Array(h * w).fill(Infinity)
    let frontier: number[] = []
    for (let k = 0; k < h * w; ++k) if (grid[k] === Terrain.WATER) { dist[k] = 0; frontier.push(k) }
    while (frontier.length) {
        const next: number[] = []
        for (const idx of frontier) {
            const i = (idx / w) | 0, j = idx % w, d = dist[idx]
            for (let di = -1; di <= 1; ++di) {
                for (let dj = -1; dj <= 1; ++dj) {
                    if (di === 0 && dj === 0) continue
                    const ni = i + di, nj = j + dj
                    if (ni < 0 || nj < 0 || ni >= h || nj >= w) continue
                    const nIdx = ni * w + nj
                    if (grid[nIdx] === Terrain.WATER || dist[nIdx] <= d + 1) continue
                    dist[nIdx] = d + 1
                    next.push(nIdx)
                }
            }
        }
        frontier = next
    }
    for (let k = 0; k < h * w; ++k) if (grid[k] === Terrain.SAND && dist[k] > SAND_RING_MAX) grid[k] = Terrain.GRASS

    const lo = seaThickness + 3
    const hiI = h - seaThickness - 4
    const hiJ = w - seaThickness - 4
    const area = (h - 2 * seaThickness) * (w - 2 * seaThickness)

    // The feature layer: tree / rock / bush patches scattered over the land. Grown as
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

    const rocks = Math.max(2, Math.round(area / 1300))
    for (let k = 0; k < rocks; ++k) {
        blob(rand(lo, hiI), rand(lo, hiJ), rand(20, 45), Feature.ROCK)
    }
    const forests = Math.max(3, Math.round(area / 400))
    for (let k = 0; k < forests; ++k) {
        blob(rand(lo, hiI), rand(lo, hiJ), rand(20, 45), Feature.TREE)
    }
    // Bushes: small scattered shrub patches, smaller and sparser than forests.
    const bushes = Math.max(2, Math.round(area / 1100))
    for (let k = 0; k < bushes; ++k) {
        blob(rand(lo, hiI), rand(lo, hiJ), rand(8, 20), Feature.BUSH)
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
        public universities: Tile[] = [],
        public unlocked_techs: Technology[] = [],
        public shipping_tasks: ShippingTask[] = [],
        public carts: Tile[] = [],
        public ships: Ship[] = [],
        public routes: Route[] = [],
        public population : Population = new Population(),
        public focus_tile?: Tile
    ) {
        // Tiles start as open water. Terrain is filled in afterwards — either by
        // GenerateCityMap (first ever load, or Reset) or restored from a saved,
        // locked-in map (ordinary reload) — so a fresh map isn't generated and
        // thrown away on every load.
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                this.tiles.push(new Tile(i, j, Terrain.WATER))
            }
        }
        AddItem(this.storage, new Item(Resource.TIMBER, 100))
        // Each city starts with a small cache of its signature food so the first
        // houses can be fed immediately while production gets established.
        if (name === CityName.JINLIN) {
            AddItem(this.storage, new Item(Resource.RICE,    50))
            AddItem(this.storage, new Item(Resource.FISH,    30))
        } else if (name === CityName.COLUMBIA) {
            AddItem(this.storage, new Item(Resource.CORN,    50))
            AddItem(this.storage, new Item(Resource.BEEF,    20))
        } else if (name === CityName.SOLARA) {
            AddItem(this.storage, new Item(Resource.BANANA,  50))
            AddItem(this.storage, new Item(Resource.PALM_FRUIT, 20))
        } else if (name === CityName.MINTAKA) {
            AddItem(this.storage, new Item(Resource.FISH,    50))
            AddItem(this.storage, new Item(Resource.FUR,     20))
        }
    }
}

// Fill a city's tiles with a freshly generated terrain + feature layout. Kept
// out of the constructor so a city can instead reuse its saved, locked-in map;
// generation then runs only on first load and on Reset, never on a plain reload.
export function GenerateCityMap(city: City) {
    const generated = GenerateTerrain(city.h, city.w)
    for (let i = 0; i < city.h; ++i) {
        for (let j = 0; j < city.w; ++j) {
            const idx = i * city.w + j
            city.tiles[idx].terrain = generated.terrain[idx]
            city.tiles[idx].feature = generated.feature[idx]
        }
    }
}
