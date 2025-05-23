import { City } from './city'
import {Storage, Item} from './storage'
import { Tile } from './tile'

export function GetResource(storage: Storage, type: string): number {
    for (let item of storage.items) {
      if (item.type == type) {
        return item.num
      }
    }
    return 0
}

export function CountItem(storage: Storage, type: string) {
  for (let item of storage.items) {
    if (item.type == type) {
      return item.num
    }
  }
  return undefined
}

export function AddItem(storage: Storage, item: Item) {
    for (let i of storage.items) {
      if (i.type == item.type) {
        i.num += item.num
        return
      }
    }
}
export function AddItems(storage: Storage, items: Item[]) {
  for (let i of items) {
    AddItem(storage, i)
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

export function shuffle(array: any[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array
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

export function Transfer(src: Storage, dst: Storage, items: Item[]) {
  if (TakeItems(src, items)) {
    AddItems(dst, items)
    return true
  }
  return false
}


export function ProvideService(tile: Tile, need: string) {
  if (tile.building?.house == undefined) {
    return
  }
  let house = tile.building!.house!
  for (let e of house.needs) {
    if (e.type == need) {
      e.satisfied = true
    }
  }
}

export function Distance(a: Tile, b: Tile) {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j)
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