import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileComponent } from '../tile/tile.component';
import { City } from '../city';
import { Cart, GetBuildingSize } from '../building';
import { StateService } from '../state.service';
import { ShippingTaskType, BuildingType } from '../types';
import { repaintOn } from '../live';

const TILE = 30;

@Component({
  selector: 'app-city',
  imports: [TileComponent, CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityComponent {
  @Input() city!: City;

  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame, s.mapVersion]) }

  // Footprint preview shown under the cursor while dragging a building.
  public dropHi?: { i: number, j: number, size: number }

  private tileFromEvent(event: DragEvent): { i: number, j: number } | undefined {
    let el = (event.target as HTMLElement)?.closest('[data-i]') as HTMLElement | null
    if (!el) {
      return undefined
    }
    return { i: +el.getAttribute('data-i')!, j: +el.getAttribute('data-j')! }
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault()
    let pos = this.tileFromEvent(event)
    if (!pos) {
      this.dropHi = undefined
      return
    }
    let type = this.state.state.build_type
    let size = type ? GetBuildingSize(type) : 1
    this.dropHi = { i: pos.i, j: pos.j, size }
  }

  public onDrop(event: DragEvent) {
    event.preventDefault()
    let pos = this.tileFromEvent(event)
    this.dropHi = undefined
    this.state.dragging = false
    if (!pos) {
      this.state.move_source = undefined
      return
    }
    let tile = this.state.GetTile(this.city, pos.i, pos.j)
    if (this.state.move_source) {
      this.state.MoveBuildingTo(this.state.move_source, tile)
      this.state.move_source = undefined
    } else {
      this.state.ApplyBuild(tile)
    }
  }

  public dropHiStyle() {
    let d = this.dropHi!
    return {
      left: d.j * TILE + 'px',
      top: d.i * TILE + 'px',
      width: d.size * TILE + 'px',
      height: d.size * TILE + 'px',
    }
  }

  public isRoadArmed(): boolean {
    return this.state.state.build_type == BuildingType.ROAD && !!this.state.road_start
  }

  public roadStartStyle() {
    let s = this.state.road_start!
    return {
      left: s.j * TILE + 'px',
      top: s.i * TILE + 'px',
      width: TILE + 'px',
      height: TILE + 'px',
    }
  }

  public getStyle() {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.city.w}, ${TILE}px)`,
      'grid-template-rows': `repeat(${this.city.h}, ${TILE}px)`,
      gap: '0px',
    };
  }

  // All carts currently carrying out a task (and therefore on the road).
  public getActiveCarts(): Cart[] {
    let carts: Cart[] = []
    for (let t of this.city.warehouses) {
      let warehouse = t.building?.warehouse
      if (!warehouse) {
        continue
      }
      for (let c of warehouse.carts) {
        if (c.task && c.task.path && c.task.path.length > 1) {
          carts.push(c)
        }
      }
    }
    return carts
  }

  // Interpolate the cart's pixel position along its road path.
  public cartStyle(cart: Cart) {
    let task = cart.task!
    let path = task.path
    let f = task.distance > 0 ? task.progress / task.distance : 0
    if (task.type == ShippingTaskType.RETURNING) {
      f = 1 - f
    }
    f = Math.max(0, Math.min(1, f))

    let pos = (path.length - 1) * f
    let idx = Math.floor(pos)
    let frac = pos - idx
    let a = path[idx]
    let b = path[Math.min(idx + 1, path.length - 1)]
    let i = a.i + (b.i - a.i) * frac
    let j = a.j + (b.j - a.j) * frac

    return {
      left: (j + 0.5) * TILE + 'px',
      top: (i + 0.5) * TILE + 'px',
    }
  }
}
