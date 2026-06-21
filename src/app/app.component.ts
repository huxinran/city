import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CityComponent } from './city/city.component';
import { MenuComponent } from './menu/menu.component';
import { PaletteComponent } from './palette/palette.component';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { StatusSummaryComponent } from './status-summary/status-summary.component';
import { TileDetailComponent } from './tile-detail/tile-detail.component';
import { StateService } from './state.service';
import { repaintOn } from './live';
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
  constructor() { repaintOn(s => [s.mapVersion]) }

  // --- Click-and-drag panning of the map ---
  // Left-drag on empty map space scrolls the viewport. A real click (no drag)
  // still builds/selects; grabbing a building (draggable) still moves it.
  private panBox?: HTMLElement
  private panDown = false
  private panMoved = false
  private panStart = { x: 0, y: 0, left: 0, top: 0 }
  private readonly PAN_THRESHOLD = 4

  public onMapPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    // Let buildings be dragged (moved) with the native HTML5 drag instead.
    if ((event.target as HTMLElement).closest('[draggable="true"]')) return
    this.panBox = event.currentTarget as HTMLElement
    this.panStart = { x: event.clientX, y: event.clientY, left: this.panBox.scrollLeft, top: this.panBox.scrollTop }
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
    this.panBox.scrollLeft = this.panStart.left - dx
    this.panBox.scrollTop = this.panStart.top - dy
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
