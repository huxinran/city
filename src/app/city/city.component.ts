import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileComponent } from '../tile/tile.component';
import { CartLayerComponent } from './cart-layer.component';
import { City } from '../city';
import { GetBuildingSize } from '../building';
import { StateService } from '../state.service';
import { BuildingType } from '../types';
import { repaintOn } from '../live';

const TILE = 30;

@Component({
  selector: 'app-city',
  imports: [TileComponent, CartLayerComponent, CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityComponent {
  @Input() city!: City;

  state = inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }

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

}
