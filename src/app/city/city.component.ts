import { ChangeDetectionStrategy, Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapCanvasComponent } from './map-canvas.component';
import { CartLayerComponent } from './cart-layer.component';
import { City } from '../city';
import { GetBuildingSize } from '../building';
import { StateService } from '../state.service';
import { BuildingType } from '../types';
import { repaintOn } from '../live';

const TILE = 48;

@Component({
  selector: 'app-city',
  imports: [MapCanvasComponent, CartLayerComponent, CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityComponent {
  @Input() city!: City;

  @ViewChild(MapCanvasComponent) private mapCanvas?: MapCanvasComponent;

  state = inject(StateService)
  // Only repaint the tile grid on map/selection edits. Per-tick live motion
  // (carts) lives in app-cart-layer, which repaints itself on `frame` — so the
  // whole grid no longer re-checks 5x/second, which made cart motion stutter.
  constructor() { repaintOn(s => [s.mapVersion]) }

  // Footprint preview shown under the cursor while dragging a building.
  public dropHi?: { i: number, j: number, size: number }

  private tileFromEvent(event: DragEvent): { i: number, j: number } | undefined {
    // The map is a single canvas now, so hit-test by pixel position via the
    // map-canvas component rather than reading per-tile data attributes.
    return this.mapCanvas?.tileAt(event.clientX, event.clientY)
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

}
