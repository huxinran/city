import { City } from './city'
import {Storage, Item} from './storage'
import { Tile } from './tile'

export function GetResource(storage: Storage, type: string): number {
    return storage.amounts[type] ?? 0
}

export function CountItem(storage: Storage, type: string): number {
    return storage.amounts[type] ?? 0
}

export function AddItem(storage: Storage, item: Item) {
    storage.amounts[item.type] = (storage.amounts[item.type] ?? 0) + item.num
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
    storage.amounts[item.type] = (storage.amounts[item.type] ?? 0) - item.num
}

// A list view of a storage's non-empty-or-all entries as Items, for templates
// and for code that needs to iterate (e.g. shipping a ship's whole cargo).
export function StorageItems(storage: Storage): Item[] {
    let items: Item[] = []
    for (let type in storage.amounts) {
        items.push(new Item(type as any, storage.amounts[type]))
    }
    return items
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

export function TakeItemsAsPossible(storage: Storage, items: Item[]): Item[] {
  let taken: Item[] = []
  for (let item of items) {
    let available = storage.amounts[item.type] ?? 0
    let taken_amount = Math.min(item.num, available)
    if (taken_amount > 0) {
      storage.amounts[item.type] = available - taken_amount
      taken.push(new Item(item.type, taken_amount))
    }
  }
  return taken
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
  for (let e of house.service_needs) {
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
      let index = x * n + y
      neighbours.push(city.tiles[index])
    }
  }
  return neighbours
}