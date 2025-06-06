import { Injectable } from '@angular/core';
import { State } from './state';
import { Item, Storage } from './storage';
import { FindNeighbours, TakeItems, ProvideService, Transfer, shuffle, AddItems, Distance, CountItem, TakeItemsAsPossible} from './utils';
import { GetCurrentMaxOccupant, Ship, ShippingTask } from './building'
import { City, Map,  } from './city';
import { Population,  } from './population';
import { Resident, ProductionStatus, ShippingTaskType, BuildingType, Terrain, CityName } from './types'
import { Tile } from './tile';

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
    }, 200)
  }

  public Save() {
    localStorage.setItem("state", JSON.stringify(this.state))
    this.SaveMap()
  }


  public Load() {
    let saved_state = localStorage.getItem("state")
    if (saved_state) {
      this.state = JSON.parse(saved_state)
    }
    this.LoadMap()
  }

  public SaveMap() {
    for (let city of this.state.cities) {
      localStorage.setItem("map" + city.name, JSON.stringify(new Map(city.h, city.w, city.tiles))) 
    }
  }
  public LoadMap() {
    for (let city of this.state.cities) {
      let saved_map = localStorage.getItem("map" + city.name)
      if (saved_map && city.name == "Anrelia") {
        let saved_map_obj = JSON.parse(saved_map)
        city.h = saved_map_obj.h
        city.w = saved_map_obj.w
        for (let i = 0; i < city.tiles.length; ++i) {
          city.tiles[i].terrain = saved_map_obj.tiles[i].terrain
        }
      }
    }
  }
  public Restart() {
    this.state = new State()
    this.LoadMap()
  }
  
  public Reset() {
    this.state = new State()
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
    this.UpdatePopulation(this.state.current_city!)
    this.UpdateProduction(this.state.current_city!)
    this.UpdateWarehouses(this.state.current_city!)
    this.UpdateHouses(this.state.current_city!)
    this.UpdateShipyard(this.state.current_city!)
    this.UpdateEmployment(this.state.current_city!)
    this.HandleShipTasks(this.state.current_city!)
    this.UpdateService(this.state.current_city!)
    this.UpdateGold(this.state.current_city!)
  }

  public ClearSelection() {
    this.ClearBuildType()
    this.ClearTerrainType()
  }
  
  public SetBuildType(type: BuildingType) {
    this.state.build_type = type
  }
  public ClearBuildType() {
    this.state.build_type = undefined
  }

  public SetTerrainType(type: Terrain) {
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
    let shipyards = []
    let docks = []
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
      } else if (t.building.shipyard) {
        shipyards.push(t)
      } else if (t.building.dock) {
        docks.push(t)
      }
    }

    city.houses = shuffle(houses)
    city.productions = shuffle(productions)
    city.services = shuffle(services)
    city.warehouses = shuffle(warehouses)
    city.shipyards = shuffle(shipyards)
    city.docks = shuffle(shipyards)
    
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
      for (let n of house.resource_needs!) {
        let cnt = CountItem(house.storage, n.type)
        if (cnt! <= 1.0) {
          n.satisfied = Transfer(city.storage, house.storage, [new Item(n.type, 1)])
        }   
        n.satisfied = TakeItems(house.storage, [new Item(n.type, 0.002)])  
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

  public UpdateShipyard(city: City) {
    for (let t of city.shipyards) {
      let shipyard = t.building!.shipyard!
      let blueprint = shipyard.selected
      if (shipyard.status == ProductionStatus.IN_PROGRESS) {
        shipyard.progress = Math.min(1.0, shipyard.progress += 1.0 / blueprint!.build_time)
      }

      if (shipyard.progress == 1.0) {
        shipyard.progress = 0
        shipyard.status = ProductionStatus.READY
        let ship = new Ship(blueprint!.type, blueprint!.max_cargo, blueprint!.speed)
        city.ships.push(ship)
      }
    }
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
      city.carts = [...city.carts.slice(0, min_idx!), ...city.carts.slice(min_idx! + 1)]
    }
  }

  public UpdatePopulation(city: City) {
    for (let t of city.houses) {
      let house = t.building!.house! 
      let needs_satified = 0
      for (let e of house.service_needs) {
        if (e.satisfied) {
          needs_satified += 1
        }
      }
      for (let e of house.resource_needs) {
        if (e.satisfied) {
          needs_satified += 1
        }
      }
      let total_needs = house.service_needs.length + house.resource_needs.length
      house.happiness = total_needs == 0 ? 1.0 : needs_satified / total_needs

      house.current_max_occupant = GetCurrentMaxOccupant(house.tier, house.happiness)
      if (house.occupant < house.current_max_occupant) {
        house.occupant += 1
      }
    }
  }

  public UpdateEmploymentPerTier(has: number, needed: number, productions: Tile[]) {
    let base_ratio = Math.min(1.0, has / needed)
    let new_employed = 0 
    for (let t of productions) {
      let production = t.building!.production!
      let new_employee = Math.floor(production.worker_needed * base_ratio)
      production.worker = new_employee 
      new_employed += new_employee
    }
    if (base_ratio == 1.0) {
      return
    }
    let unemployed = has - new_employed
    while (unemployed > 0) {
      for (let t of productions) {
        let production = t.building!.production!
        production.worker += 1
        unemployed -= 1
        if (unemployed == 0) {
          break
        }
      }      
    }
  }

public ResetPopulation(population: Population) {
    for (let t of population.tiers) {
        t.has = 0
        t.needed = 0
        t.houses = []
        t.productions = []
    }
  }

 public AddProduction(population: Population, production: Tile) {
    let tier = production.building!.production!.worker_type
    let needed = production.building!.production!.worker_needed
    for (let t of population.tiers) {
        if (t.tier == tier) {
            t.needed += needed
            t.productions.push(production)
        }
    }
}

public AddHouse(population: Population, house: Tile) {
    let tier = house.building!.house!.resident_type
    let has = house.building!.house!.occupant
    for (let t of population.tiers) {
        if (t.tier == tier) {
            t.has += has
            t.houses.push(house)
        }
    }
}

public GetCity(cities: City[], city_name: CityName) {
  for (let c of cities) {
    if (c.name == city_name) {
      return c
    }
  }
  return undefined
}



public GetWorkerNeeded(population: Population, tier: Resident, num: number) {
    for (let t of population.tiers) {
        if (t.tier == tier) {
           return t.needed
        }
    }
    return 0
}

  public UpdateEmployment(city: City) {
    let population = new Population()
    for (let t of city.productions) {
      this.AddProduction(population, t)
    }

    for (let t of city.houses) {
      this.AddHouse(population, t)
    }

    for (let tier of population.tiers) {
      this.UpdateEmploymentPerTier(tier.has, tier.needed, tier.productions)
    }
    city.population = population
  }


  public UpdateGold(city: City) {
    for (let t of city.population.tiers) {
      this.state.gold += t.has * 0.001 
    } 
  }

  public UpdateRoute(city: City, other_cities: City[]) {
    for (let r of city.routes) {
      if (!r.ship) {
        continue
      }

      if (r.from != city.name) {
        continue
      }

      let ship = r.ship
      if (ship.status == ShippingTaskType.READY) {
        let cargo = TakeItemsAsPossible(city.storage, [new Item(r.resource, r.amount)])
        AddItems(ship.cargo, cargo)
      } else if (ship.status == ShippingTaskType.DELIVERYING) {
        r.progress = Math.min(1.0, r.progress + ship.speed / 100.0)
        if (r.progress == 1.0) {
          r.progress = 0.0
          ship.status = ShippingTaskType.RETURNING
          let dst_city = this.GetCity(other_cities, r.to)
          AddItems(dst_city!.storage, ship.cargo.items)
          ship.cargo = new Storage() 
        }
      } else if (ship.status == ShippingTaskType.RETURNING) {
        r.progress = Math.min(1.0, r.progress + ship.speed / 100.0)
        if (r.progress == 1.0) {
          r.progress = 0.0
          ship.status = ShippingTaskType.READY
        }
      }
    } 
  }
}


