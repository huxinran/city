import { Injectable } from '@angular/core';
import { State } from './state';
import { Storage, Item, ResourceName } from './storage';
import { AddItem, FindNeighbours, TakeItems, ProvideService} from './utils';
import { Building, House, Production } from './building'

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public state: State

  constructor() { 
    this.state = new State()
    AddItem(this.state.storage, new Item("Wood", 50))
    setInterval(() => {
      this.Tick(); 
    }, 500)
  }

  public Tick() {
    this.state.time += 1
    this.state.houses = this.GetHouses()
    this.state.productions = this.GetProductions()
    this.state.services = this.GetServices()
    this.state.population = this.CountPopulation()
    this.state.worker_needed = this.CountWorkerNeeded()
    this.state.worker_employed = this.CountWorkerEmployed()
    this.UpdateEmployment()
    this.UpdateProduction()
    this.UpdatePopulation()
    this.UpdateService()
    this.UpdateGold()
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


  public GetHouses() {
    let houses = []
    for (let t of this.state.city.tiles) {
      if (t.building?.house) {
        houses.push(t)
      }
    }
    return houses
  }

  public GetProductions() {
    let productions = []
    for (let t of this.state.city.tiles) {
      if (t.building?.production) {
        productions.push(t)
      }
    }
    return productions
  }

  public GetServices() {
    let services = []
    for (let t of this.state.city.tiles) {
      if (t.building?.service) {
        services.push(t)
      }
    }
    return services
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
    for (let t of this.state.houses) {
      total += t.building!.house!.occupant
    }
    return total
  }

  public CountWorkerNeeded() {
    let total = 0
    for (let t of this.state.productions) {
      total += t.building!.production!.worker_needed
    }
    return total
  }

  public CountWorkerEmployed() {
    let total = 0
    for (let t of this.state.productions) {
      total += t.building!.production!.worker
    }
    return total
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
