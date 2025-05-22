import { Injectable } from '@angular/core';
import { State } from './state';
import { Storage, Item, ResourceName } from './storage';
import { AddItem, FindNeighbours, TakeItems, ProvideService, CountItem, Transfer, shuffle} from './utils';
import { Building, House, Production } from './building'

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public state: State

  constructor() { 
    this.state = new State()
    this.Load()
    setInterval(() => {
      this.Tick(); 
    }, 500)
  }

  public Save() {
    localStorage.setItem("state", JSON.stringify(this.state))
  }

  public Load() {
    let saved_state = localStorage.getItem("state")
    if (saved_state) {
      this.state = JSON.parse(saved_state)
    }
  }

  public Reset() {
    this.state = new State()
    this.Save()
  }


  public Tick() {
    this.state.time += 1
    this.SortTiles()
    this.UpdateEmployment()
    this.UpdateProduction()
    this.UpdateHouses()
    this.UpdatePopulation()
    this.UpdateService()
    this.UpdateGold()
  }

  public ClearSelection() {
    this.ClearBuildType()
    this.ClearTerrainType()
  }
  
  public SetBuildType(type: string) {
    this.state.build_type = type
  }
  public ClearBuildType() {
    this.state.build_type = undefined
  }

  public SetTerrainType(type: string) {
    this.state.terrain_type = type
  }
  public ClearTerrainType() {
    this.state.terrain_type = undefined
  }

  public SortTiles() {
    let houses = []
    let productions = []
    let services = []
    let warehouses = []
    for (let t of this.state.city.tiles) {
      if (t.building == undefined) {
        continue
      }

      if (t.building.house) {
        houses.push(t)
      } else if (t.building.production) {
        productions.push(t)
      } else if (t.building.service) {
        services.push(t)
      } else if (t.building.warehouse) {
        warehouses.push(t)
      }
    }

    this.state.houses = shuffle(houses)
    this.state.productions = shuffle(productions)
    this.state.services = shuffle(services)
    this.state.warehouses = shuffle(warehouses)
  }

  public UpdateService() {
    for (let t of this.state.services) {
      let service = t.building!.service!
      let neighbours = FindNeighbours(this.state.city, t, t.building!.service!.radius)
      for (let n of neighbours) {
        ProvideService(n, service.need_provided)
      }
    }

  }

  public UpdateProduction() {
    for (let t of this.state.productions) {
      let production = t.building!.production!
      if (production.status == "Waiting") {
        if (TakeItems(this.state.storage, production.ingredient)) {
          production.status = "In Progress";
        }
      } else if (production.status == "In Progress") {
        production.progress = Math.min(production.progress + production.full_efficiency * production.worker / production.worker_needed, 100.0)
        if (production.progress == 100.0) {
          production.status = "Finished"
        }
      } else if (production.status == "Finished") {
        for (let i of production.product) {
          AddItem(this.state.storage, i)
        }
        production.progress = 0.0
        production.status = "Waiting"
      }
    }
  }

  public UpdateHouses() {
    for (let t of this.state.houses) {
      let house = t.building!.house!
      for (let n of house.needs) {
        let cnt = CountItem(house.storage, n.type)
        if (cnt == undefined) {
          continue      
        }
        if (cnt <= 1.0) {
          Transfer(this.state.storage, house.storage, [new Item(n.type, 1)])
        }
        n.satisfied = TakeItems(house.storage, [new Item(n.type, 0.01)])
      }
    }
  }

  public UpdatePopulation() {
    let population = 0
    for (let t of this.state.houses) {
      let house = t.building!.house! 

      let needs_satified = 0
      for (let e of house.needs) {
        if (e.satisfied) {
          needs_satified += 1
        }
      }
      house.happiness = house.needs.length == 0 ? 1.0 : needs_satified / house.needs.length
      if (house.occupant < house.max_occupant) {
        house.occupant += 1
      }
      population += house.occupant
    }
    this.state.population = population
  }

  public UpdateEmployment() {
    let worker_needed = 0
    for (let t of this.state.productions) {

      let production = t.building!.production!
      worker_needed += production.worker_needed
    }
    this.state.worker_needed = worker_needed

    // set worker to base_ratio 
    let base_ratio = Math.min(1.0, this.state.population / this.state.worker_needed)
    let new_employed = 0 
    for (let t of this.state.productions) {
      let production = t.building!.production!
      let new_employee = Math.floor(production.worker_needed * base_ratio)
      production.worker = new_employee 
      new_employed += new_employee
    }
    if (base_ratio == 1.0) {
      return
    }

    this.state.worker_employed = new_employed
    let employee_needed = this.state.worker_needed - this.state.worker_employed
    let unemployed = this.state.population - this.state.worker_employed
    if (unemployed > this.state.productions.length) {
      for (let t of this.state.productions) {
        t.building!.production!.worker += 1
      } 
    } else {
      let chance = unemployed / this.state.productions.length
      for (let t of this.state.productions) {
        if (Math.random() < chance) {
          t.building!.production!.worker += 1
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
