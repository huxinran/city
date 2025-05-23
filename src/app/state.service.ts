import { Injectable } from '@angular/core';
import { State } from './state';
import { Storage, Item, ResourceName } from './storage';
import { AddItem, FindNeighbours, TakeItems, ProvideService, CountItem, Transfer, shuffle, AddItems, Distance} from './utils';
import { Building, House, Production } from './building'
import { City } from './city';

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
    this.SortTiles(this.state.current_city!)
    this.UpdateEmployment(this.state.current_city!)
    this.UpdateProduction(this.state.current_city!)
    this.UpdateWarehouses(this.state.current_city!)
    this.UpdateHouses(this.state.current_city!)
    this.UpdatePopulation(this.state.current_city!)
    this.UpdateService(this.state.current_city!)
    this.UpdateGold(this.state.current_city!)
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

  public SortTiles(city: City) {
    let houses = []
    let productions = []
    let productions_done = []
    let productions_pending = []
    let services = []
    let warehouses = []
    for (let t of city.tiles) {
      if (t.building == undefined) {
        continue
      }

      if (t.building.house) {
        houses.push(t)
      } else if (t.building.production) {
        productions.push(t)
        let status = t.building!.production!.status 
        if (status == "Waiting") {
          productions_pending.push(t)
        } else if (status == "Finished") {
          productions_done.push(t)
        }
      } else if (t.building.service) {
        services.push(t)
      } else if (t.building.warehouse) {
        warehouses.push(t)
      }
    }

    city.houses = shuffle(houses)
    city.productions = shuffle(productions)
    city.productions_done = shuffle(productions_done)
    city.productions_pending = shuffle(productions_pending)
    city.services = shuffle(services)
    city.warehouses = shuffle(warehouses)
  }

  public UpdateService(city: City) {
    for (let t of city.services) {
      let service = t.building!.service!
      let neighbours = FindNeighbours(city, t, t.building!.service!.radius)
      for (let n of neighbours) {
        ProvideService(n, service.need_provided)
      }
    }

  }

  public UpdateProduction(city: City) {
    for (let t of city.productions) {
      let production = t.building!.production!
      if (production.status == "Waiting") {
        if (TakeItems(city.storage, production.ingredient)) {
          production.status = "In Progress";
        }
      } else if (production.status == "In Progress") {
        production.progress = Math.min(production.progress + production.full_efficiency * production.worker / production.worker_needed, 100.0)
        if (production.progress == 100.0) {
          production.status = "Finished"
          return
        }
      } else if (production.status == "Finished") {
        //for (let i of production.product) {
        //  AddItem(city.storage, i)
        //}
        //production.progress = 0.0
        //production.status = "Waiting"
      }
    }
  }

  public UpdateHouses(city: City) {
    for (let t of city.houses) {
      let house = t.building!.house!
      for (let n of house.needs) {
        let cnt = CountItem(house.storage, n.type)
        if (cnt == undefined) {
          continue      
        }
        if (cnt <= 1.0) {
          Transfer(city.storage, house.storage, [new Item(n.type, 1)])
        }
        n.satisfied = TakeItems(house.storage, [new Item(n.type, 0.01)])
      }
    }
  }
  
  public UpdateWarehouses(city: City) {
    let idle_carts = []
    let idle_warehouses = []
    for (let t of city.warehouses) {
      let warehouse = t.building!.warehouse!
      for (let c of warehouse.carts) {
        if (c.status == "Picking Up") {
          c.progress = Math.min(c.progress + c.speed, c.distance)
          if (c.progress == c.distance) {
            c.status = "Returning"
            c.progress = 0
            c.destination!.building!.production!.progress = 0
            c.destination!.building!.production!.status = "Waiting"
          }
          return 
        } if (c.status == "Returning") {
          c.progress = Math.min(c.progress + c.speed, c.distance)
          if (c.progress == c.distance) {
            AddItems(city.storage, c.cargo)
            c.status = "Idle"
            c.progress = 0
            c.distance = 0
            c.cargo = []
          }
        } 
        else {
          idle_carts.push(c)
          idle_warehouses.push(t)
        }
      }
    }
    for (let i = 0; i < Math.min(city.productions_done.length); ++i) {
      if (idle_carts.length == 0) {
        break
      } 
      let production = city.productions_done[i]
      let min_dist = 100000
      let min_dist_idx = 0
      for (let j = 0; j < idle_carts.length; ++j) {
        let d = Distance(production, idle_warehouses[j])
        if (d < min_dist) {
          min_dist = d
          min_dist_idx = j
        }
      }
      let choosen_cart = idle_carts[min_dist_idx]
      choosen_cart.cargo = production.building!.production!.product
      choosen_cart.destination = production
      choosen_cart.progress = 0
      choosen_cart.distance = min_dist
      choosen_cart.status = "Picking Up"
      production.building!.production!.status = "Waiting for Pick Up"
      idle_carts = [...idle_carts.slice(0, min_dist), ...idle_carts.slice(min_dist + 1)]
      idle_warehouses = [...idle_warehouses.slice(0, min_dist), ...idle_warehouses.slice(min_dist + 1)]
    }
  }

  public UpdatePopulation(city: City) {
    let population = 0
    for (let t of city.houses) {
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
    city.population = population
  }

  public UpdateEmployment(city: City) {
    let worker_needed = 0
    for (let t of city.productions) {

      let production = t.building!.production!
      worker_needed += production.worker_needed
    }
    city.worker_needed = worker_needed

    // set worker to base_ratio 
    let base_ratio = Math.min(1.0, city.population / city.worker_needed)
    let new_employed = 0 
    for (let t of city.productions) {
      let production = t.building!.production!
      let new_employee = Math.floor(production.worker_needed * base_ratio)
      production.worker = new_employee 
      new_employed += new_employee
    }
    if (base_ratio == 1.0) {
      return
    }

    city.worker_employed = new_employed
    let employee_needed = city.worker_needed - city.worker_employed
    let unemployed = city.population - city.worker_employed
    if (unemployed > city.productions.length) {
      for (let t of city.productions) {
        t.building!.production!.worker += 1
      } 
    } else {
      let chance = unemployed / city.productions.length
      for (let t of city.productions) {
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


  public UpdateGold(city: City) {
    this.state.gold += city.population * 0.1
  }
}
