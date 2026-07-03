import { City } from '../city'
import { Tile } from '../tile'
import { TakeItems, AddItems } from '../utils'
import { ProductionStatus, ShippingTaskType } from '../types'
import { RoadDistanceField, BuildRoadPath, WarehouseRoadDistance } from '../pathfinding'

// Advance every cart along its task; on arrival, apply the delivery and free the
// cart. Rebuilds city.carts as the list of warehouses that have an idle cart, so
// HandleShipTasks can hand out this tick's tasks.
export function UpdateWarehouses(city: City) {
    const idle_carts: Tile[] = []
    for (const t of city.warehouses) {
        for (const c of t.building!.warehouse!.carts) {
            if (c.task == undefined) {
                idle_carts.push(t)
                continue
            }
            c.task.progress = Math.min(c.task.progress + c.speed, c.task.distance)
            if (c.task.progress == c.task.distance) {
                if (c.task.type == ShippingTaskType.DELIVERING) {
                    c.task.type = ShippingTaskType.RETURNING
                    c.task.progress = 0
                    c.task.cargo = []
                    c.task.dst.building!.production!.status = ProductionStatus.IN_PROGRESS
                } else if (c.task.type == ShippingTaskType.STOCKING) {
                    // Deposit extra sources into the building's local buffer.
                    AddItems(c.task.dst.building!.production!.storage, c.task.cargo)
                    c.task.dst.building!.production!.stocking_in_progress = false
                    c.task.type = ShippingTaskType.RETURNING
                    c.task.progress = 0
                    c.task.cargo = []
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


// Assign each pending shipping task to the nearest warehouse with an idle cart.
// Tasks that can't be served this tick (no idle cart, no road path, or the
// outbound cargo isn't in storage) are carried over to the next tick.
export function HandleShipTasks(city: City) {
    if (city.carts.length === 0) return

    // One road BFS per distinct destination, cached on the city across ticks and
    // invalidated (road_version / road_fields cleared) whenever the road network
    // changes. A single building often queues several tasks to the same tile.
    const fieldFor = (dst: Tile) => {
        const cached = city.road_fields.get(dst)
        if (cached && cached.version === city.road_version) return cached.field
        const field = RoadDistanceField(city, dst)
        city.road_fields.set(dst, { version: city.road_version, field })
        return field
    }

    const remaining = []
    for (const task of city.shipping_tasks) {
        // Drop tasks whose destination building has been removed.
        if (!task.dst.building) continue
        // Out of idle carts: carry this and every later task to the next tick.
        if (city.carts.length === 0) { remaining.push(task); continue }

        const field = fieldFor(task.dst)
        let min_dist = Infinity
        let min_idx = -1
        for (let j = 0; j < city.carts.length; ++j) {
            const dist = WarehouseRoadDistance(city, field, city.carts[j])
            if (dist < min_dist) { min_dist = dist; min_idx = j }
        }
        // No road path to any warehouse yet: leave the task pending.
        if (min_idx < 0 || min_dist === Infinity) { remaining.push(task); continue }

        // Outbound tasks must pull their cargo from city storage first.
        if (task.type === ShippingTaskType.DELIVERING || task.type === ShippingTaskType.STOCKING) {
            if (!TakeItems(city.storage, task.cargo)) { remaining.push(task); continue }
        }

        const warehouse = city.carts[min_idx]
        task.distance = min_dist
        task.progress = 0
        task.path = BuildRoadPath(city, field, warehouse, task.dst)
        for (const c of warehouse.building!.warehouse!.carts) {
            if (c.task === undefined) { c.task = task; break }
        }
        city.carts.splice(min_idx, 1)
    }
    city.shipping_tasks = remaining
}
