import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { clampCamera } from './camera';
import { CityComponent } from './city/city.component';
import { MenuComponent } from './menu/menu.component';
import { PaletteComponent } from './palette/palette.component';
import { StatusSummaryComponent } from './status-summary/status-summary.component';
import { TileDetailComponent } from './tile-detail/tile-detail.component';
import { StateService } from './state.service';
import { repaintOn } from './live';
import { isoWorldSize } from './isometric';
@Component({
  selector: 'app-root',
  imports: [CityComponent, TileDetailComponent, MenuComponent, PaletteComponent, StatusSummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'city sim';
  public state  =  inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }

  closeInfoPopup() {
    this.state.state.current_city!.focus_tile = undefined
    this.state.bumpMap()
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
  private activePointers = new Map<number, { x: number, y: number }>()
  private lastPanPoint?: { x: number, y: number }
  private lastPinchDistance?: number

  public onMapPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // Let buildings be dragged (moved) with the native HTML5 drag instead.
    if ((event.target as HTMLElement).closest('[draggable="true"]')) return
    this.panBox = event.currentTarget as HTMLElement
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const cam = this.state.camera
    this.panStart = { x: event.clientX, y: event.clientY, camX: cam.x, camY: cam.y }
    this.panDown = true
    this.panMoved = false
    this.lastPanPoint = { x: event.clientX, y: event.clientY }
    this.lastPinchDistance = this.pinchDistance()
  }

  public onMapPointerMove(event: PointerEvent) {
    if (!this.panDown || !this.panBox) return
    if (!this.activePointers.has(event.pointerId)) return
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (this.activePointers.size >= 2) {
      event.preventDefault()
      this.pinchZoom()
      return
    }

    const point = this.activePointers.values().next().value as { x: number, y: number } | undefined
    if (!point || !this.lastPanPoint) return

    let dx = point.x - this.lastPanPoint.x
    let dy = point.y - this.lastPanPoint.y
    let totalDx = point.x - this.panStart.x
    let totalDy = point.y - this.panStart.y
    if (!this.panMoved && Math.hypot(totalDx, totalDy) < this.PAN_THRESHOLD) return
    event.preventDefault()
    if (!this.panMoved) {
      this.panMoved = true
      this.panBox.setPointerCapture(event.pointerId)
    }
    this.panBox.style.cursor = 'grabbing'

    const cam = this.state.camera
    const city = this.state.state.current_city!
    cam.x -= dx / cam.zoom
    cam.y -= dy / cam.zoom
    const world = isoWorldSize(city.w, city.h)
    clampCamera(cam, this.panBox.clientWidth, this.panBox.clientHeight, world.width, world.height)
    this.lastPanPoint = point
    this.state.bumpCamera()
  }

  public onMapPointerUp(event?: PointerEvent) {
    if (event) {
      this.activePointers.delete(event.pointerId)
      try { this.panBox?.releasePointerCapture(event.pointerId) } catch {}
    }
    if (this.activePointers.size === 1) {
      const point = this.activePointers.values().next().value as { x: number, y: number }
      this.lastPanPoint = point
      this.panStart = { x: point.x, y: point.y, camX: this.state.camera.x, camY: this.state.camera.y }
      this.lastPinchDistance = undefined
      return
    }
    if (this.activePointers.size >= 2) {
      this.lastPinchDistance = this.pinchDistance()
      return
    }

    this.activePointers.clear()
    this.lastPanPoint = undefined
    this.lastPinchDistance = undefined
    if (this.panBox) this.panBox.style.cursor = ''
    // A drag-pan ends with a click event on the tile under the cursor; swallow
    // it so panning doesn't also build or select.
    if (this.panMoved) {
      window.addEventListener('click', this.swallowClick, true)
    }
    this.panDown = false
    this.panBox = undefined
  }

  private pinchZoom() {
    if (!this.panBox) return
    const distance = this.pinchDistance()
    const midpoint = this.pinchMidpoint()
    if (!distance || !midpoint) return

    if (!this.lastPinchDistance) {
      this.lastPinchDistance = distance
      return
    }

    const rect = this.panBox.getBoundingClientRect()
    const sx = midpoint.x - rect.left
    const sy = midpoint.y - rect.top
    const cam = this.state.camera
    const city = this.state.state.current_city!
    const anchor = { x: cam.x + sx / cam.zoom, y: cam.y + sy / cam.zoom }
    cam.zoom *= distance / this.lastPinchDistance
    const world = isoWorldSize(city.w, city.h)
    clampCamera(cam, this.panBox.clientWidth, this.panBox.clientHeight, world.width, world.height)
    cam.x = anchor.x - sx / cam.zoom
    cam.y = anchor.y - sy / cam.zoom
    clampCamera(cam, this.panBox.clientWidth, this.panBox.clientHeight, world.width, world.height)
    this.lastPinchDistance = distance
    this.panMoved = true
    this.state.bumpCamera()
  }

  private pinchDistance(): number | undefined {
    const points = [...this.activePointers.values()]
    if (points.length < 2) return undefined
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
  }

  private pinchMidpoint(): { x: number, y: number } | undefined {
    const points = [...this.activePointers.values()]
    if (points.length < 2) return undefined
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
  }

  private swallowClick = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    window.removeEventListener('click', this.swallowClick, true)
  }
}
