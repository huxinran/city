import { Camera } from './camera';

export const GRID_TILE = 48;
export const ISO_TILE_W = 64;
export const ISO_TILE_H = 32;
export const ISO_PAD = 96;

const ISO_X = ISO_TILE_W / (2 * GRID_TILE);
const ISO_Y = ISO_TILE_H / (2 * GRID_TILE);

export type Point = { x: number, y: number };

export function isoOrigin(rows: number): Point {
  return { x: rows * ISO_TILE_W / 2 + ISO_PAD, y: ISO_PAD };
}

export function gridToIso(rows: number, gridX: number, gridY: number): Point {
  const origin = isoOrigin(rows);
  return {
    x: (gridX - gridY) * ISO_X + origin.x,
    y: (gridX + gridY) * ISO_Y + origin.y,
  };
}

export function isoToGrid(rows: number, isoX: number, isoY: number): Point {
  const origin = isoOrigin(rows);
  const u = (isoX - origin.x) / ISO_X;
  const v = (isoY - origin.y) / ISO_Y;
  return { x: (u + v) / 2, y: (v - u) / 2 };
}

export function isoWorldSize(cols: number, rows: number): { width: number, height: number } {
  return {
    width: (cols + rows) * ISO_TILE_W / 2 + ISO_PAD * 2,
    height: (cols + rows) * ISO_TILE_H / 2 + ISO_PAD * 2,
  };
}

export function isoVisibleGridRange(
  cam: Camera,
  viewportW: number,
  viewportH: number,
  cols: number,
  rows: number,
  padTiles: number,
): { i0: number, i1: number, j0: number, j1: number } {
  const left = cam.x;
  const top = cam.y;
  const right = cam.x + viewportW / cam.zoom;
  const bottom = cam.y + viewportH / cam.zoom;
  const corners = [
    isoToGrid(rows, left, top),
    isoToGrid(rows, right, top),
    isoToGrid(rows, right, bottom),
    isoToGrid(rows, left, bottom),
  ];
  const minX = Math.min(...corners.map(p => p.x));
  const maxX = Math.max(...corners.map(p => p.x));
  const minY = Math.min(...corners.map(p => p.y));
  const maxY = Math.max(...corners.map(p => p.y));
  return {
    j0: Math.max(0, Math.floor(minX / GRID_TILE) - padTiles),
    j1: Math.min(cols - 1, Math.floor(maxX / GRID_TILE) + padTiles),
    i0: Math.max(0, Math.floor(minY / GRID_TILE) - padTiles),
    i1: Math.min(rows - 1, Math.floor(maxY / GRID_TILE) + padTiles),
  };
}

export function applyIsoGridCameraTransform(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  dpr: number,
  rows: number,
) {
  const origin = isoOrigin(rows);
  const z = cam.zoom * dpr;
  ctx.setTransform(ISO_X * z, ISO_Y * z, -ISO_X * z, ISO_Y * z, (origin.x - cam.x) * z, (origin.y - cam.y) * z);
}

export function isoCameraCssTransform(cam: Camera, rows: number): string {
  const origin = isoOrigin(rows);
  const a = ISO_X * cam.zoom;
  const b = ISO_Y * cam.zoom;
  const c = -ISO_X * cam.zoom;
  const d = ISO_Y * cam.zoom;
  const e = (origin.x - cam.x) * cam.zoom;
  const f = (origin.y - cam.y) * cam.zoom;
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
}

export function tileFootprintPolygon(rows: number, i: number, j: number, size: number): Point[] {
  const x0 = j * GRID_TILE;
  const y0 = i * GRID_TILE;
  const x1 = (j + size) * GRID_TILE;
  const y1 = (i + size) * GRID_TILE;
  return [
    gridToIso(rows, x0, y0),
    gridToIso(rows, x1, y0),
    gridToIso(rows, x1, y1),
    gridToIso(rows, x0, y1),
  ];
}
