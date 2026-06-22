import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileComponent } from '../tile/tile.component';
import { CartLayerComponent } from './cart-layer.component';
import { City } from '../city';
import { GetBuildingSize } from '../building';
import { StateService } from '../state.service';
import { BuildingType } from '../types';
import { repaintOn } from '../live';

const TILE = 48;

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

  // Size of the building currently being dragged (placed from palette or moved).
  private draggedSize(): number {
    let type = this.state.move_source
      ? this.state.move_source.building!.type
      : this.state.state.build_type
    return type ? GetBuildingSize(type) : 1
  }

  // Anchor (top-left) so the cursor tile sits at the footprint's center, clamped
  // to stay on the grid. For 1x1 this is a no-op (so road drawing is unaffected).
  private centeredAnchor(pos: { i: number, j: number }, size: number): { i: number, j: number } {
    let off = Math.round((size - 1) / 2)
    let i = Math.max(0, Math.min(pos.i - off, this.city.h - size))
    let j = Math.max(0, Math.min(pos.j - off, this.city.w - size))
    return { i, j }
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault()
    let pos = this.tileFromEvent(event)
    if (!pos) {
      this.dropHi = undefined
      return
    }
    let size = this.draggedSize()
    let anchor = this.centeredAnchor(pos, size)
    this.dropHi = { i: anchor.i, j: anchor.j, size }
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
    let anchor = this.centeredAnchor(pos, this.draggedSize())
    let tile = this.state.GetTile(this.city, anchor.i, anchor.j)
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
