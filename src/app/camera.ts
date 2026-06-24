// Shared 2D camera for the map. `x`/`y` are the world-pixel coordinate shown at
// the viewport's top-left corner; `zoom` scales world pixels to screen pixels.
// The map canvas, cart canvas, and the DOM overlay layer all read this one
// object so they stay perfectly aligned while panning/zooming.
//
//   screen = (world - {x,y}) * zoom
//   world  = {x,y} + screen / zoom
export interface Camera { x: number, y: number, zoom: number }

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;

// Clamp zoom to its range and keep the camera from panning past the map edges
// (when the world is smaller than the viewport on an axis it pins to 0).
export function clampCamera(cam: Camera, viewportW: number, viewportH: number, worldW: number, worldH: number) {
  cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom));
  const visibleW = viewportW / cam.zoom, visibleH = viewportH / cam.zoom;
  cam.x = Math.max(0, Math.min(cam.x, Math.max(0, worldW - visibleW)));
  cam.y = Math.max(0, Math.min(cam.y, Math.max(0, worldH - visibleH)));
}

// --- The single source of truth for the screen<->world mapping. ---
// Every renderer (map canvas, cart canvas, DOM overlay) and hit-test must derive
// its transform from these, so they can never drift out of alignment.

// A screen point (offset from the canvas top-left, in CSS px) -> world px.
export function screenToWorld(cam: Camera, screenX: number, screenY: number): { x: number, y: number } {
  return { x: cam.x + screenX / cam.zoom, y: cam.y + screenY / cam.zoom };
}

// Apply the camera to a 2D context as a world-px -> device-px transform.
// Clear in device space (resetTransform) BEFORE calling this.
export function applyCameraTransform(ctx: CanvasRenderingContext2D, cam: Camera, dpr: number) {
  ctx.setTransform(cam.zoom * dpr, 0, 0, cam.zoom * dpr, -cam.x * cam.zoom * dpr, -cam.y * cam.zoom * dpr);
}

// The equivalent CSS transform for a DOM layer whose children are positioned in
// world px (used by the placement/road overlays so they track the canvases).
export function cameraCssTransform(cam: Camera): string {
  return `translate(${-cam.x * cam.zoom}px, ${-cam.y * cam.zoom}px) scale(${cam.zoom})`;
}
