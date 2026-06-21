import { City } from './city'
import { Tile } from './tile'
import { BuildingType } from './types'
import { GetBuildingSize } from './building'

// Road-network pathfinding for cart logistics. All functions are pure: they
// read the city grid and return route data without mutating anything, so they
// can be unit-tested in isolation from the simulation/rendering loop.

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

function tileAt(city: City, i: number, j: number): Tile {
  return city.tiles[i * city.w + j]
}

function key(city: City, i: number, j: number): number {
  return i * city.w + j
}

function inBounds(city: City, i: number, j: number): boolean {
  return i >= 0 && j >= 0 && i < city.h && j < city.w
}

// Road tiles orthogonally adjacent to the footprint of a size x size building
// anchored at (i, j).
export function AdjacentRoadTiles(city: City, i: number, j: number, size: number): Tile[] {
  let roads: Tile[] = []
  let seen = new Set<number>()
  for (let di = 0; di < size; ++di) {
    for (let dj = 0; dj < size; ++dj) {
      for (let d of DIRS) {
        let ni = i + di + d[0]
        let nj = j + dj + d[1]
        if (!inBounds(city, ni, nj)) {
          continue
        }
        let k = key(city, ni, nj)
        if (seen.has(k)) {
          continue
        }
        let t = tileAt(city, ni, nj)
        if (t.building?.type == BuildingType.ROAD) {
          seen.add(k)
          roads.push(t)
        }
      }
    }
  }
  return roads
}

// BFS over the road network from the roads touching `building`, returning the
// road-step distance to every reachable road tile (keyed by tile index).
export function RoadDistanceField(city: City, building: Tile): { [key: number]: number } {
  let size = GetBuildingSize(building.building!.type)
  let dist: { [key: number]: number } = {}
  let queue: Tile[] = []
  for (let r of AdjacentRoadTiles(city, building.i, building.j, size)) {
    let k = key(city, r.i, r.j)
    if (dist[k] == undefined) {
      dist[k] = 1
      queue.push(r)
    }
  }
  let head = 0
  while (head < queue.length) {
    let t = queue[head++]
    let d = dist[key(city, t.i, t.j)]
    for (let dir of DIRS) {
      let ni = t.i + dir[0]
      let nj = t.j + dir[1]
      if (!inBounds(city, ni, nj)) {
        continue
      }
      let k = key(city, ni, nj)
      if (dist[k] != undefined) {
        continue
      }
      let n = tileAt(city, ni, nj)
      if (n.building?.type == BuildingType.ROAD) {
        dist[k] = d + 1
        queue.push(n)
      }
    }
  }
  return dist
}

export function BuildingCenter(building: Tile): { i: number, j: number } {
  let size = GetBuildingSize(building.building!.type)
  return { i: building.i + (size - 1) / 2, j: building.j + (size - 1) / 2 }
}

// Reconstruct the shortest road path warehouse -> destination by descending
// the distance field one road step at a time. Returns tile centers to follow.
export function BuildRoadPath(city: City, field: { [key: number]: number }, warehouse: Tile, dst: Tile): { i: number, j: number }[] {
  let size = GetBuildingSize(warehouse.building!.type)
  let entry: Tile | undefined = undefined
  let entryVal = Infinity
  for (let r of AdjacentRoadTiles(city, warehouse.i, warehouse.j, size)) {
    let v = field[key(city, r.i, r.j)]
    if (v != undefined && v < entryVal) {
      entryVal = v
      entry = r
    }
  }
  if (!entry) {
    return []
  }
  let roads: Tile[] = [entry]
  let current = entry
  while (field[key(city, current.i, current.j)] > 1) {
    let cv = field[key(city, current.i, current.j)]
    let next: Tile | undefined = undefined
    for (let dir of DIRS) {
      let ni = current.i + dir[0]
      let nj = current.j + dir[1]
      if (!inBounds(city, ni, nj)) {
        continue
      }
      let n = tileAt(city, ni, nj)
      if (n.building?.type == BuildingType.ROAD && field[key(city, ni, nj)] == cv - 1) {
        next = n
        break
      }
    }
    if (!next) {
      break
    }
    roads.push(next)
    current = next
  }
  let path = [BuildingCenter(warehouse)]
  for (let r of roads) {
    path.push({ i: r.i, j: r.j })
  }
  path.push(BuildingCenter(dst))
  return path
}

// Shortest road distance from a warehouse to the building described by `field`.
export function WarehouseRoadDistance(city: City, field: { [key: number]: number }, warehouse: Tile): number {
  if (!warehouse.building) {
    return Infinity
  }
  let size = GetBuildingSize(warehouse.building.type)
  let best = Infinity
  for (let r of AdjacentRoadTiles(city, warehouse.i, warehouse.j, size)) {
    let d = field[key(city, r.i, r.j)]
    if (d != undefined) {
      best = Math.min(best, d + 1)
    }
  }
  return best
}
