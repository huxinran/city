import { Injectable } from '@angular/core';
import { City } from './city'
import { Tile } from './tile';
import { State } from './state';
import { Storage, Items, ResourceName } from './storage';
import { N } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public state: State

  constructor() { 
    this.state = new State()
    setInterval(() => {
      this.Tick(); 
    }, 1000)
  }

  public Tick() {
    this.state.time += 1
    this.state.houses = this.GetHouses()
    this.state.productions = this.GetProductions()
    this.UpdateProduction()
    this.UpdatePopulation()
    this.UpdateGold()
    this.state.population = this.CountPopulation()
    this.state.worker_needed = this.CountWorkerNeeded()
    this.state.worker_employed = this.CountWorkerEmployed()
    this.UpdateEmployment()
  }

  public SetBuildType(type: string) {
      this.state.buildType = type
  }

  public ClearBuildType() {
      this.state.buildType = undefined
  }
  public GetHouses() {
    let houses = []
    for (let t of this.state.city.tiles) {
      if (t.building?.house) {
        houses.push(t.building)
      }
    }
    return houses
  }

  public GetProductions() {
    let productions = []
    for (let t of this.state.city.tiles) {
      if (t.building?.production) {
        productions.push(t.building)
      }
    }
    return productions
  }

  public CountBuildings(type: string) {
    let total = 0
    for (let t of this.state.city.tiles) {
      if (t.building?.type == type) {
        total += 1
      }
    }
    return total
  }

  public CountPopulation() {
    let total = 0
    for (let t of this.state.city.tiles) {
      if (t.building?.house) {
        total += t.building!.house!.occupant
      }
    }
    return total
  }

  public CountWorkerNeeded() {
    let total = 0
    for (let t of this.state.city.tiles) {
      if (t.building?.production) {
        total += t.building!.production!.max_worker
      }
    }
    return total
  }

  public CountWorkerEmployed() {
    let total = 0
    for (let t of this.state.city.tiles) {
      if (t.building?.production) {
        total += t.building!.production!.worker
      }
    }
    return total
  }

  public GetResource(type: string): number {
      if (type == "Wood") {
        return this.state.storage.wood
      } else if (type == "Wheat") {
        return this.state.storage.wheat
      }
      return 0
  }


  public GetResourceName() {
    return ResourceName
  }

  public AddItem(storage: Storage, items: Items) {
    if (items.type == "Wood") {
      storage.wood += items.num
    } else if (items.type == "Wheat") {
      storage.wheat += items.num
    }
  }

  public TryTakeItem(storage: Storage, items: Items) {
    return this.GetResource(items.type) >= items.num
  }

  public TakeItem(storage: Storage, items: Items) {
    if (items.type == "Wood") {
      storage.wood -= items.num
    }

  }

  public UpdateProduction() {
    for (let t of this.state.city.tiles) {
      if (t.building == undefined || t.building.production == undefined) {
        continue
      }
      let production = t.building.production 
      production.current_progress = Math.min(production.current_progress + production.full_efficiency, 100.0)
      
      if (production.current_progress == 100.0) {
        production.current_progress = 0.0
        for (let i of production.product) {
          this.AddItem(this.state.storage, i)
        }
      }
    }
  }

  public UpdatePopulation() {
    for (let t of this.state.city.tiles) {
      if (t.building == undefined || t.building.house == undefined) {
        continue
      }
      let house = t.building.house 
      if (house.occupant < house.max_occupant) {
        house.occupant += 1
      }
    }
  }

  public UpdateEmployment() {

    // set worker to base_ratio 
    let base_ratio = this.state.population / this.state.worker_employed
    let new_employed = 0 
    for (let p of this.state.productions) {
      let new_employee = Math.floor(p.production!.max_worker * base_ratio)
      p.production!.worker = new_employee 
      new_employed += new_employee
    }
    this.state.worker_employed = new_employed
    
    let employee_needed = this.state.worker_needed - this.state.worker_employed
    let unemployed = this.state.population - this.state.worker_employed
    if (unemployed > this.state.productions.length) {
      for (let p of this.state.productions) {
        p.production!.worker += 1
      } 
    } else {
      let chance = unemployed / this.state.productions.length
      for (let p of this.state.productions) {
        if (Math.random() < chance) {
          p.production!.worker += 1
          unemployed -= 1
        }
        if (unemployed == 0) {
          break
        } 
      }
    }
  }


  public UpdateGold() {
    this.state.gold += this.state.population * 0.1
  }
}
