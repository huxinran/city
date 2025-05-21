import { Need } from './building'
import { City } from './city'
import {Storage, Item} from './storage'
import { Tile } from './tile'

export function  GetResource(storage: Storage, type: string): number {
    for (let item of storage.items) {
      if (item.type == type) {
        return item.num
      }
    }
    return 0
  }

export function AddItem(storage: Storage, item: Item) {
    for (let i of storage.items) {
      if (i.type == item.type) {
        i.num += item.num
        return
      }
    }
}

export function TryTakeItem(storage: Storage, item: Item): boolean {
    return GetResource(storage, item.type) >= item.num
}

export function TakeItem(storage: Storage, item: Item) {
    for (let i of storage.items) {
        if (i.type == item.type) {
            i.num -= item.num
        }
    }
}

export function TakeItems(storage: Storage, items: Item[]): boolean {
    for (let item of items) {
        if (!TryTakeItem(storage, item)) {
        return false
        }
    }

    for (let item of items) {
        TakeItem(storage, item)
    }
    return true  
}

export function ProvideService(tile: Tile, need: string) {
  if (tile.building == undefined) {
    return
  }

  for (let e of tile.building!.needs) {
    if (e.type == need) {
      e.satisfied = true
    }
  }
}

export function FindNeighbours(city: City, tile: Tile, l: number) {
  let i = tile.i 
  let j = tile.j
  let m = city.h
  let n = city.w
  let neighbours = []
  for (let x = i - l; x <= i + l; ++x) {
    for (let y = j - l; y <= j + l; ++y) {
      if (x < 0 || x >= m || y < 0 || y >= n) {
        continue;
      }
      let distance = Math.abs(x - i) + Math.abs(y - j)
      if (distance > l) {
        continue
      }
      let index = x * m + y
      neighbours.push(city.tiles[index])
    }
  }
  return neighbours
}