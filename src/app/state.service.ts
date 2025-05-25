import { Injectable } from '@angular/core';
import { State } from './state';
import { Storage, Item, ResourceName } from './storage';
import { AddItem, FindNeighbours, TakeItems, ProvideService, CountItem, Transfer, shuffle, AddItems, Distance} from './utils';
import { Building, House, Production, ProductionStatus, ShippingTask, ShippingTaskType } from './building'
import { City, Map } from './city';
import { S } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public state: State

  constructor() { 
    this.state = new State()
    this.Load()
    this.LoadMap()
    setInterval(() => {
      this.Tick(); 
    }, 1000)
  }

  public Save() {
    localStorage.setItem("state", JSON.stringify(this.state))
  }

  public SaveMap() {
    for (let city of this.state.cities) {
      localStorage.setItem("map" + city.name, JSON.stringify(new Map(city.h, city.w, city.tiles))) 
    }
  }

  public Load() {
    let saved_state = localStorage.getItem("state")
    if (saved_state) {
      this.state = JSON.parse(saved_state)
    }
  }

  public LoadMap() {
    for (let city of this.state.cities) {
      localStorage.setItem("map" + city.name, JSON.stringify(new Map(city.h, city.w, city.tiles))) 
      let saved_map = localStorage.getItem("map" + city.name)
      if (saved_map) {
        let saved_map_obj = JSON.parse(saved_map)
        city.h = saved_map_obj.h
        city.w = saved_map_obj.w
        for (let i = 0; i < city.tiles.length; ++i) {
          city.tiles[i].type = saved_map_obj.tiles[i].type
        }
      }
    }
  }

  public Reset() {
    this.state = new State()
    this.Save()
  }
  
  public ChangeCity(name: string) {
    for (let city of this.state.cities) {
      if (city.name == name) {
        this.state.current_city = city
        return
      }
    }
  }

  public Tick() {
    this.state.time += 1
    this.SortTiles(this.state.current_city!)
    this.UpdateEmployment(this.state.current_city!)
    this.UpdateProduction(this.state.current_city!)
    this.UpdateWarehouses(this.state.current_city!)
    this.UpdateHouses(this.state.current_city!)
    this.UpdatePopulation(this.state.current_city!)
    this.HandleShipTasks(this.state.current_city!)
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
      } else if (t.building.service) {
        services.push(t)
      } else if (t.building.warehouse) {
        warehouses.push(t)
      }
    }

    city.houses = shuffle(houses)
    city.productions = shuffle(productions)
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
      if (production.status == ProductionStatus.READY) {
        if (production.ingredient.length == 0) {
          production.status = ProductionStatus.IN_PROGRESS
        } else {
          let shipping_task = new ShippingTask(ShippingTaskType.DELIVERYING, t, production.ingredient)
          city.shipping_tasks.push(shipping_task)
          production.status = ProductionStatus.WAITING_DELIVERY
        }
      } else if (production.status == ProductionStatus.IN_PROGRESS) {
        production.progress = Math.min(production.progress + production.full_efficiency * production.worker / production.worker_needed, 100.0)
        if (production.progress == 100.0) {
          production.status = ProductionStatus.FINISHED
        }
      } else if (production.status == ProductionStatus.FINISHED) {
        let shipping_task = new ShippingTask(ShippingTaskType.PICKING_UP, t, production.product)
        city.shipping_tasks.push(shipping_task)
        production.status = ProductionStatus.WAITING_PICK_UP
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
    for (let t of city.warehouses) {
      for (let c of t.building!.warehouse!.carts) {
        if (c.task == undefined) {
          idle_carts.push(t)
          continue
        }
        c.task.progress = Math.min(c.task.progress + c.speed, c.task.distance)
        if (c.task.progress == c.task.distance) {
          if (c.task.type == ShippingTaskType.DELIVERYING) {
            c.task.type = ShippingTaskType.RETURNING
            c.task.progress = 0
            c.task.cargo = []
            c.task.dst.building!.production!.status = ProductionStatus.IN_PROGRESS
          } else if (c.task.type == ShippingTaskType.PICKING_UP) {
            c.task.type = ShippingTaskType.RETURNING
            c.task.progress = 0
            c.task.dst.building!.production!.status = ProductionStatus.READY
            c.task.dst.building!.production!.progress = 0
          } else {
            AddItems(city.storage, c.task.cargo)
            c.task = undefined
          }
        }
      }
    }
    city.carts = idle_carts     
  }

  public HandleShipTasks(city: City) {
    let i = 0
    while (i < city.shipping_tasks.length) {
      if (city.carts.length == 0) {
        break
      }

      let task = city.shipping_tasks[i]
      if (task.type == ShippingTaskType.DELIVERYING) {
        if (!TakeItems(city.storage, task.cargo)) {
          ++i
          continue
        }
      }
      let min_dist = Infinity
      let min_idx = undefined
      for (let j = 0; j < city.carts.length; ++j) {
        let cart = city.carts[j]
        let dist = Distance(task.dst, cart)
        if (dist < min_dist) {
          min_dist = dist
          min_idx = j
        }
      }
      let cart = city.carts[min_idx!]
      task.distance = min_dist
      task.progress = 0
      for (let c of cart.building!.warehouse!.carts) {
        if (c.task == undefined) {
          c.task = task
          break
        }
      }
      city.shipping_tasks = [...city.shipping_tasks.slice(0, i), ...city.shipping_tasks.slice(i + 1)]
      city.carts = [...city.carts.slice(0, min_dist), ...city.carts.slice(min_dist + 1)]
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
