import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { clampCamera } from './camera';
import { CityComponent } from './city/city.component';
import { MenuComponent } from './menu/menu.component';
import { PaletteComponent } from './palette/palette.component';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { StatusSummaryComponent } from './status-summary/status-summary.component';
import { TileDetailComponent } from './tile-detail/tile-detail.component';
import { StateService } from './state.service';
import { repaintOn } from './live';
import { isoWorldSize } from './isometric';
@Component({
  selector: 'app-root',
  imports: [CityComponent, TileDetailComponent, MenuComponent, PaletteComponent, ResourceSummaryComponent, StatusSummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'city sim';
  public state  =  inject(StateService)
  rightCollapsed = signal(false)
  constructor() { repaintOn(s => [s.mapVersion]) }

  toggleRightMenu() {
    this.rightCollapsed.update(v => !v)
  }

  // --- Click-and-drag panning of the map ---
  // Left-drag on empty map space pans the camera. A real click (no drag) still
  // builds/selects; grabbing a building (draggable) still moves it. (Wheel-zoom
  // lives in the map canvas; both mutate the same shared camera.)
  private panBox?: HTMLElement
  private panDown = false
  private panMoved = false
  private panStart = { x: 0, y: 0, camX: 0, camY: 0 }
  private readonly PAN_THRESHOLD = 4

  public onMapPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    // Let buildings be dragged (moved) with the native HTML5 drag instead.
    if ((event.target as HTMLElement).closest('[draggable="true"]')) return
    this.panBox = event.currentTarget as HTMLElement
    const cam = this.state.camera
    this.panStart = { x: event.clientX, y: event.clientY, camX: cam.x, camY: cam.y }
    this.panDown = true
    this.panMoved = false
  }

  public onMapPointerMove(event: PointerEvent) {
    if (!this.panDown || !this.panBox) return
    let dx = event.clientX - this.panStart.x
    let dy = event.clientY - this.panStart.y
    if (!this.panMoved && Math.hypot(dx, dy) < this.PAN_THRESHOLD) return
    if (!this.panMoved) {
      this.panMoved = true
      this.panBox.setPointerCapture(event.pointerId)
      this.panBox.style.cursor = 'grabbing'
    }
    const cam = this.state.camera
    const city = this.state.state.current_city!
    cam.x = this.panStart.camX - dx / cam.zoom
    cam.y = this.panStart.camY - dy / cam.zoom
    const world = isoWorldSize(city.w, city.h)
    clampCamera(cam, this.panBox.clientWidth, this.panBox.clientHeight, world.width, world.height)
    this.state.bumpCamera()
  }

  public onMapPointerUp() {
    if (this.panBox) this.panBox.style.cursor = ''
    // A drag-pan ends with a click event on the tile under the cursor; swallow
    // it so panning doesn't also build or select.
    if (this.panMoved) {
      window.addEventListener('click', this.swallowClick, true)
    }
    this.panDown = false
    this.panBox = undefined
  }

  private swallowClick = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    window.removeEventListener('click', this.swallowClick, true)
  }
}
