import { ChangeDetectionStrategy, Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapCanvasComponent } from './map-canvas.component';
import { CartLayerComponent } from './cart-layer.component';
import { City } from '../sim/city';
import { GetBuildingSize } from '../sim/building';
import { StateService } from '../state.service';
import { BuildingType } from '../sim/types';
import { repaintOn } from '../live';
import { GRID_TILE, isoCameraCssTransform } from '../isometric';

const TILE = GRID_TILE;

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
  // The map/carts paint themselves on their own canvases. This component only
  // hosts the DOM overlays (drop preview, road-start marker), which must repaint
  // on map edits AND camera pan/zoom so they track the world under the cursor.
  constructor() { repaintOn(s => [s.mapVersion, s.cameraVersion]) }

  // Footprint preview shown under the cursor while dragging a building.
  public dropHi?: { i: number, j: number, size: number }

  // CSS transform mapping the world-coordinate overlay layer onto the screen,
  // sharing the single camera-math source so it can't drift from the canvases.
  public worldTransform(): string {
    return isoCameraCssTransform(this.state.camera, this.city.h)
  }

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

  // Anchor (top-left) so the cursor tile sits at the footprint's center. Shares
  // StateService.CenteredAnchor so drag placement and click placement agree.
  private centeredAnchor(pos: { i: number, j: number }, size: number): { i: number, j: number } {
    return this.state.CenteredAnchor(this.city, pos.i, pos.j, size)
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
