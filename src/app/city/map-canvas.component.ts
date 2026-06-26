import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { City } from '../sim/city';
import { Tile } from '../sim/tile';
import { Building } from '../sim/building';
import { StateService } from '../state.service';
import { BuildingType, Terrain, Feature } from '../sim/types';
import {
  GetBuildingSize, GetBuildingIcon, IsFarmBuilding, IsAnimalFarm,
  IsWorkshopBuilding, IsMineCampBuilding,
} from '../sim/building';
import { GetBuildingMapIconSrc, GetHouseMapIconSrc } from '../building-icons';
import { clampCamera, screenToWorld, applyCameraTransform } from '../camera';

const TILE = 48;
// Buildings anchor up to (maxSize-1) tiles outside the visible range can still
// poke into view; pad the culled range so their footprints draw. Max size is 3.
const CULL_PAD = 3;

// Composite background art for multi-tile buildings (same assets the old DOM
// tile used).
const CROP_FARM_ICON = 'assets/used/buildings/crop-farm.png';
const ANIMAL_FARM_ICON = 'assets/used/buildings/animal-farm.png';
const WORKSHOP_ICON = 'assets/used/buildings/workshop.png';
const MINE_CAMP_ICON = 'assets/used/buildings/mine-camp.png';

const MAP_TILE_BASE = 'assets/used/map-tiles/';
const TERRAIN_OBJECT_BASE = 'assets/used/terrain/';

// Cursor shown while the Delete tool is active: the shovel icon, hinting "dig
// this out". The hotspot (6 34) is the blade tip at the bottom-left, so the tile
// that gets removed is the one under the blade. The 40px PNG is a downscale of
// the Delete tool icon (assets/used/buildings/delete.png) — browsers cap cursor
// images at ~128px, so the full-size art can't be used directly.
const SHOVEL_CURSOR = `url("assets/used/cursors/shovel.png") 6 34, crosshair`;

// Road auto-tiling. A road's look depends on which of its 4 orthogonal
// neighbours are also roads, encoded as a bitmask N=1, E=2, S=4, W=8. Rather
// than draw all 16 combinations, six base sprites (in a fixed canonical
// orientation) are reused for every combination via 90° clockwise rotation.
// Drop transparent PNGs here so the road sits ON TOP of the terrain:
//   isolated.png  no connections (a lone node / patch)
//   end.png       connects N only  — road reaches the TOP edge, capped
//   straight.png  connects N+S     — vertical road, top edge to bottom edge
//   corner.png    connects N+E     — elbow from the TOP edge to the RIGHT edge
//   tee.png       connects N+E+S   — T-junction, flat (closed) side on the LEFT
//   cross.png     connects N+E+S+W — four-way
// Each sprite's road should reach the tile edge at the midpoint so neighbours
// line up seamlessly. Square + transparent (e.g. 64x64, like the terrain set).
const ROAD_BASE = 'assets/used/map-tiles/road/';
const ROAD_SHAPES = {
  isolated: ROAD_BASE + 'isolated.png',
  end:      ROAD_BASE + 'end.png',
  straight: ROAD_BASE + 'straight.png',
  corner:   ROAD_BASE + 'corner.png',
  tee:      ROAD_BASE + 'tee.png',
  cross:    ROAD_BASE + 'cross.png',
};

// neighbour-mask -> { src, rot } where rot is the number of 90° CW rotations to
// apply. Built once from the six canonical shapes; rotating a shape through its
// distinct orientations covers all 16 masks.
const ROAD_TILE_BY_MASK = ((): Map<number, { src: string, rot: number }> => {
  const rotCW = (m: number) => ((m << 1) | (m >> 3)) & 0xF; // N->E->S->W->N
  const bases: [number, string][] = [
    [0b0000, ROAD_SHAPES.isolated], // -
    [0b0001, ROAD_SHAPES.end],      // N
    [0b0101, ROAD_SHAPES.straight], // N+S
    [0b0011, ROAD_SHAPES.corner],   // N+E
    [0b0111, ROAD_SHAPES.tee],      // N+E+S
    [0b1111, ROAD_SHAPES.cross],    // N+E+S+W
  ];
  const table = new Map<number, { src: string, rot: number }>();
  for (const [canon, src] of bases) {
    let m = canon;
    for (let rot = 0; rot < 4; rot++) {
      if (!table.has(m)) table.set(m, { src, rot });
      m = rotCW(m);
    }
  }
  return table;
})();

const MAP_TILE_ASSETS: { [key: string]: { file: string, color: string } } = {
  [Terrain.WATER]: { file: 'sea.png',   color: '#47c9ff' },
  [Terrain.GRASS]: { file: 'grass.png', color: '#a9d86b' },
  [Terrain.SAND]:  { file: 'sand.png',  color: '#ffe48b' },
  [Terrain.DIRT]:  { file: 'dirt.png',  color: '#c4956a' },
};

// Terrain blending: a fixed LAYER STACK sea → sand → grass → dirt. A tile paints
// its own texture, then any neighbour whose terrain is HIGHER in the stack
// feathers its edge inward over this tile — so the higher layer bleeds onto the
// lower (one-sided), blending instead of meeting at a hard grid edge. Only
// ACTUALLY-adjacent terrains blend (===).
const TERRAIN_PRECEDENCE: { [key: string]: number } = {
  [Terrain.WATER]: 0, // base, never overlays
  [Terrain.SAND]:  1,
  [Terrain.GRASS]: 2,
  [Terrain.DIRT]:  3, // top: dirt patches feather onto grass
};
// Overlaying layers in ASCENDING order so the highest paints last (on top).
const TERRAIN_OVERLAY_ORDER = [Terrain.SAND, Terrain.GRASS, Terrain.DIRT];

// The boundary SHAPE is the same for every layer, so each layer's flat texture
// is stamped through reusable alpha MASKS at load time. Directional masks keep
// each authored tileable axis intact instead of rotating one canonical source.
// Edges are ordered N,E,S,W. Corners are ordered NE,SE,SW,NW.
const BLEND_EDGE_MASKS = [
  MAP_TILE_BASE + 'blend/edge-n.png',
  MAP_TILE_BASE + 'blend/edge-e.png',
  MAP_TILE_BASE + 'blend/edge-s.png',
  MAP_TILE_BASE + 'blend/edge-w.png',
] as const;
const BLEND_CORNER_MASKS = [
  MAP_TILE_BASE + 'blend/corner-ne.png',
  MAP_TILE_BASE + 'blend/corner-se.png',
  MAP_TILE_BASE + 'blend/corner-sw.png',
  MAP_TILE_BASE + 'blend/corner-nw.png',
] as const;
const TERRAIN_BLEND_TEXTURE: { [key: string]: string } = {
  [Terrain.SAND]:  MAP_TILE_BASE + 'sand.png',
  [Terrain.GRASS]: MAP_TILE_BASE + 'grass.png',
  [Terrain.DIRT]:  MAP_TILE_BASE + 'dirt.png',
};
// Shrink factor for the convex-corner nub (authored masks are ~85% radius, which
// bulges coastline corners). Lower = smaller nub. Tune to taste.
const CORNER_SCALE = 0.55;

const TERRAIN_DETAIL_COLORS: { [key: string]: string[] } = {
  [Terrain.WATER]: ['#2cb8df', '#6fe6ff', '#1e94c4'],
  [Terrain.SAND]: ['#f8d07a', '#fff0aa', '#d9ad57'],
  [Terrain.GRASS]: ['#79b84f', '#b6e978', '#5d9d3f'],
  [Terrain.DIRT]: ['#a96f48', '#d09a62', '#7f533a'],
};

const TERRAIN_BOUNDARY_COLORS: { [key: string]: string[] } = {
  [`${Terrain.WATER}|${Terrain.SAND}`]: ['#6cced6', '#fff1b7', '#d9b264'],
  [`${Terrain.SAND}|${Terrain.GRASS}`]: ['#9bc864', '#f1d58a', '#6fab47'],
  [`${Terrain.GRASS}|${Terrain.DIRT}`]: ['#9d744e', '#75af4c', '#c7925f'],
};

// The whole map (terrain + features + buildings) is drawn onto a single
// viewport-sized <canvas>, replacing ~one Angular component per tile. It
// repaints only when `mapVersion` or the camera changes — never on the per-tick
// `frame` heartbeat — so the sim running has zero rendering cost here. The
// camera (pan/zoom) transform is applied to the context and only the visible
// tile range is drawn (culling), so map size barely affects cost. Live motion
// (carts) lives in the separate app-cart-layer canvas on top, sharing the camera.
@Component({
  selector: 'app-map-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { position: absolute; inset: 0; }
    canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
  `],
  template: ``,
})
export class MapCanvasComponent implements OnInit, OnDestroy {
  @Input() city!: City;

  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private state = inject(StateService);
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();
  private imageVersion = 0;
  private terrainSurface?: HTMLCanvasElement;
  private terrainSurfaceKey = '';
  private redrawScheduled = false;
  private resizeObserver?: ResizeObserver;

  constructor() {
    // Repaint whenever a user edit or a camera pan/zoom happens. (Reading the
    // signals inside the effect is what subscribes us to them.)
    effect(() => { this.state.mapVersion(); this.state.cameraVersion(); this.requestRedraw(); this.updateCursor(); });
  }

  ngOnInit() {
    this.canvas = document.createElement('canvas');
    // Size the canvas to fill the host via INLINE styles. The component's
    // encapsulated `canvas { width:100%;height:100% }` rule is rewritten by
    // Angular to a `canvas[_ngcontent-…]` selector that never matches a canvas
    // we create with document.createElement, so without this the canvas would
    // lay out at its backing-store pixel size. At dpr=1 that equals the host
    // size (so it looked fine), but at dpr≠1 (e.g. Windows 125%/150% scaling)
    // the canvas overflowed and the screen↔world mapping broke — placing
    // buildings far from the cursor. Inline styles bypass encapsulation.
    Object.assign(this.canvas.style, {
      position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%',
    });
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('click', e => this.onClick(e));
    this.canvas.addEventListener('contextmenu', e => this.onContextMenu(e));
    this.canvas.addEventListener('dragstart', e => this.onDragStart(e));
    this.canvas.addEventListener('dragend', () => this.onDragEnd());
    this.canvas.addEventListener('wheel', e => this.onWheel(e), { passive: false });
    // The canvas is draggable ONLY while hovering a movable building, so empty
    // and road tiles stay non-draggable and the click-drag panning (which skips
    // [draggable=true] targets) works there.
    this.canvas.addEventListener('mousemove', e => this.updateDraggable(e));
    this.canvas.addEventListener('mouseleave', () => { if (this.canvas.draggable) this.canvas.draggable = false; });
    this.host.appendChild(this.canvas);
    this.resizeObserver = new ResizeObserver(() => this.requestRedraw());
    this.resizeObserver.observe(this.host);
    this.requestRedraw();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private worldW() { return this.city.w * TILE; }
  private worldH() { return this.city.h * TILE; }

  // Mouse-wheel zoom, anchored on the point under the cursor (it stays put).
  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const cam = this.state.camera;
    const anchor = screenToWorld(cam, sx, sy); // world point under the cursor
    cam.zoom *= e.deltaY < 0 ? 1.1 : 1 / 1.1;
    clampCamera(cam, rect.width, rect.height, this.worldW(), this.worldH()); // clamps zoom
    cam.x = anchor.x - sx / cam.zoom; // keep that world point under the cursor
    cam.y = anchor.y - sy / cam.zoom;
    clampCamera(cam, rect.width, rect.height, this.worldW(), this.worldH()); // clamps pan
    this.state.bumpCamera();
  }

  // Show the shovel cursor while the Delete tool is selected, plain otherwise.
  // Driven by the same effect as the repaint, since selecting a tool bumps
  // mapVersion. Guarded because the effect can fire before the canvas exists.
  private updateCursor() {
    if (!this.canvas) return;
    const del = this.state.state.build_type === BuildingType.DELETE;
    this.canvas.style.cursor = del ? SHOVEL_CURSOR : '';
  }

  private updateDraggable(e: MouseEvent) {
    const movable = !!this.movableAnchor(e.clientX, e.clientY);
    if (this.canvas.draggable !== movable) this.canvas.draggable = movable;
  }

  // The anchor tile of a movable building under the cursor (resolving covered
  // tiles), or undefined for empty land / roads — which can't be moved.
  private movableAnchor(clientX: number, clientY: number): Tile | undefined {
    const pos = this.tileAt(clientX, clientY);
    if (!pos) return undefined;
    const tile = this.state.GetTile(this.city, pos.i, pos.j);
    const anchor = tile.covered ? this.state.GetTile(this.city, tile.anchor_i, tile.anchor_j) : tile;
    if (!anchor.building || anchor.building.type === BuildingType.ROAD) return undefined;
    return anchor;
  }

  // Translate a viewport point to a grid tile, or undefined if off-grid.
  // Inverts the camera transform. Used by CityComponent for drag hit-testing too.
  public tileAt(clientX: number, clientY: number): { i: number, j: number } | undefined {
    const rect = this.canvas.getBoundingClientRect();
    const w = screenToWorld(this.state.camera, clientX - rect.left, clientY - rect.top);
    const j = Math.floor(w.x / TILE), i = Math.floor(w.y / TILE);
    if (i < 0 || j < 0 || i >= this.city.h || j >= this.city.w) return undefined;
    return { i, j };
  }

  private onClick(e: MouseEvent) {
    const pos = this.tileAt(e.clientX, e.clientY);
    if (!pos) return;
    this.state.HandleTileClick(this.state.GetTile(this.city, pos.i, pos.j));
  }

  // Right-click anywhere on the map cancels whatever is selected (build tool,
  // in-progress road, pending move, focused building) and suppresses the
  // browser's context menu.
  private onContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.state.Deselect();
  }

  // Start moving an already-placed building. Mirrors the old per-tile
  // draggable building element: grab the anchor (resolving covered tiles),
  // skip roads and empty land. preventDefault() cancels the drag so a plain
  // click on empty/road tiles still registers.
  private onDragStart(e: DragEvent) {
    const anchor = this.movableAnchor(e.clientX, e.clientY);
    if (!anchor) { e.preventDefault(); return; }
    e.dataTransfer?.setData('text/plain', 'move');
    // Suppress the full-map drag ghost the browser would otherwise snapshot.
    const ghost = document.createElement('canvas'); ghost.width = ghost.height = 1;
    e.dataTransfer?.setDragImage(ghost, 0, 0);
    this.state.SetBuildType(anchor.building!.type); // clears move_source
    this.state.move_source = anchor;
    this.state.dragging = true;
  }

  private onDragEnd() {
    this.state.dragging = false;
    this.state.move_source = undefined;
  }

  // ---- rendering -----------------------------------------------------------

  private requestRedraw() {
    if (this.redrawScheduled || !this.ctx) return;
    this.redrawScheduled = true;
    requestAnimationFrame(() => { this.redrawScheduled = false; this.draw(); });
  }

  // Size the backing store to the viewport (host) in device pixels.
  private ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.max(1, Math.round(this.host.clientWidth * dpr));
    const bh = Math.max(1, Math.round(this.host.clientHeight * dpr));
    if (this.canvas.width !== bw) this.canvas.width = bw;
    if (this.canvas.height !== bh) this.canvas.height = bh;
  }

  private draw() {
    if (!this.ctx) return;
    const city = this.city, ctx = this.ctx, cam = this.state.camera;
    this.ensureSize();
    const dpr = window.devicePixelRatio || 1;
    const cssW = this.host.clientWidth, cssH = this.host.clientHeight;
    // Keep the camera valid (covers viewport resizes that shrink the world view).
    clampCamera(cam, cssW, cssH, this.worldW(), this.worldH());

    // Clear in device space, then switch to world space via the camera transform.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    applyCameraTransform(ctx, cam, dpr);
    ctx.imageSmoothingEnabled = false;

    // Visible tile range (padded so off-screen building anchors still draw).
    const j0 = Math.max(0, Math.floor(cam.x / TILE) - CULL_PAD);
    const i0 = Math.max(0, Math.floor(cam.y / TILE) - CULL_PAD);
    const j1 = Math.min(city.w - 1, Math.floor((cam.x + cssW / cam.zoom) / TILE) + CULL_PAD);
    const i1 = Math.min(city.h - 1, Math.floor((cam.y + cssH / cam.zoom) / TILE) + CULL_PAD);
    const at = (i: number, j: number) => city.tiles[i * city.w + j];

    // 1) terrain under every tile (including tiles a building covers).
    this.drawTerrainSurface(i0, j0, i1, j1);
    // 2) removable tree/rock/bush decorations on bare land.
    for (let i = i0; i <= i1; ++i) for (let j = j0; j <= j1; ++j) {
      const t = at(i, j);
      if (t.feature && !t.building && !t.covered) this.drawFeature(t);
    }
    // 3) buildings (anchor tiles only — covered tiles carry no building).
    for (let i = i0; i <= i1; ++i) for (let j = j0; j <= j1; ++j) {
      const t = at(i, j);
      if (t.building) this.drawBuilding(t, t.building);
    }
    // 4) selection outline.
    const f = city.focus_tile;
    if (f) {
      const size = f.building ? GetBuildingSize(f.building.type) : 1;
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 2;
      ctx.strokeRect(f.j * TILE + 1, f.i * TILE + 1, size * TILE - 2, size * TILE - 2);
    }
  }

  private drawTerrain(t: Tile) {
    const asset = MAP_TILE_ASSETS[t.terrain] ?? MAP_TILE_ASSETS[Terrain.GRASS];
    const x = t.j * TILE, y = t.i * TILE;
    this.ctx.fillStyle = asset.color;
    this.ctx.fillRect(x, y, TILE, TILE);
    const im = this.img(MAP_TILE_BASE + asset.file);
    if (ready(im)) this.ctx.drawImage(im!, x, y, TILE, TILE);
    this.drawBlend(t, x, y);
  }

  private drawTerrainSurface(i0: number, j0: number, i1: number, j1: number) {
    const surface = this.getTerrainSurface();
    const sx = j0 * TILE, sy = i0 * TILE;
    const sw = (j1 - j0 + 1) * TILE, sh = (i1 - i0 + 1) * TILE;
    this.ctx.drawImage(surface, sx, sy, sw, sh, sx, sy, sw, sh);
  }

  // Experimental terrain pass: render a continuous-looking painted surface once
  // per terrain edit, then crop from it during normal camera draws. Gameplay
  // remains tile-based; only the visual surface is richer.
  private getTerrainSurface(): HTMLCanvasElement {
    const city = this.city;
    const terrainKey = city.tiles.map(t => t.terrain.charAt(0)).join('');
    const key = `${city.w}x${city.h}|${this.imageVersion}|${terrainKey}`;
    if (this.terrainSurface && this.terrainSurfaceKey === key) return this.terrainSurface;

    const c = document.createElement('canvas');
    c.width = city.w * TILE;
    c.height = city.h * TILE;
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = false;

    this.paintTerrainBase(cx);
    this.paintTerrainBoundaries(cx);
    this.paintTerrainDetails(cx);

    this.terrainSurface = c;
    this.terrainSurfaceKey = key;
    return c;
  }

  private paintTerrainBase(ctx: CanvasRenderingContext2D) {
    const order = [Terrain.WATER, Terrain.SAND, Terrain.GRASS, Terrain.DIRT];
    for (const terrain of order) this.paintTerrainLayer(ctx, terrain, terrain === Terrain.WATER ? 0 : 9);
  }

  private paintTerrainLayer(ctx: CanvasRenderingContext2D, terrain: Terrain, blurPx: number) {
    const city = this.city;
    const layer = document.createElement('canvas');
    layer.width = city.w * TILE;
    layer.height = city.h * TILE;
    const lx = layer.getContext('2d')!;
    lx.imageSmoothingEnabled = false;

    const mask = document.createElement('canvas');
    mask.width = layer.width;
    mask.height = layer.height;
    const mx = mask.getContext('2d')!;
    mx.fillStyle = '#fff';

    const asset = MAP_TILE_ASSETS[terrain] ?? MAP_TILE_ASSETS[Terrain.GRASS];
    const im = this.img(MAP_TILE_BASE + asset.file);
    for (const t of city.tiles) {
      if (t.terrain !== terrain) continue;
      const x = t.j * TILE, y = t.i * TILE;
      lx.fillStyle = asset.color;
      lx.fillRect(x, y, TILE, TILE);
      if (ready(im)) lx.drawImage(im!, x, y, TILE, TILE);
      mx.fillRect(x, y, TILE, TILE);
    }

    const alpha = blurPx > 0 ? document.createElement('canvas') : mask;
    if (blurPx > 0) {
      alpha.width = mask.width;
      alpha.height = mask.height;
      const ax = alpha.getContext('2d')!;
      ax.filter = `blur(${blurPx}px)`;
      ax.drawImage(mask, 0, 0);
      ax.filter = 'none';
    }
    lx.globalCompositeOperation = 'destination-in';
    lx.drawImage(alpha, 0, 0);
    ctx.drawImage(layer, 0, 0);
  }

  private paintTerrainBoundaries(ctx: CanvasRenderingContext2D) {
    const city = this.city;
    const at = (i: number, j: number) => city.tiles[i * city.w + j];
    for (let i = 0; i < city.h; i++) {
      for (let j = 0; j < city.w; j++) {
        const t = at(i, j);
        if (j < city.w - 1) {
          const e = at(i, j + 1);
          if (e.terrain !== t.terrain) this.paintBoundaryEdge(ctx, (j + 1) * TILE, i * TILE, true, t.terrain, e.terrain, i * 928371 + j * 19237 + 17);
        }
        if (i < city.h - 1) {
          const s = at(i + 1, j);
          if (s.terrain !== t.terrain) this.paintBoundaryEdge(ctx, j * TILE, (i + 1) * TILE, false, t.terrain, s.terrain, i * 83719 + j * 53189 + 43);
        }
      }
    }
  }

  private paintBoundaryEdge(ctx: CanvasRenderingContext2D, x: number, y: number, vertical: boolean,
                            a: Terrain, b: Terrain, seed: number) {
    const colors = this.boundaryColors(a, b);
    const step = 8;
    const segments = Math.ceil(TILE / step);
    const points: { x: number, y: number }[] = [];
    for (let n = 0; n <= segments; n++) {
      const u = Math.min(TILE, n * step);
      const wobble = Math.round(this.signedNoise(seed, n, 5.5));
      points.push(vertical ? { x: x + wobble, y: y + u } : { x: x + u, y: y + wobble });
    }
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.strokeBoundaryPath(ctx, points, colors[0], 15, 0.48);
    this.strokeBoundaryPath(ctx, points, colors[1], 5, 0.78);
    for (let n = 0; n < segments; n++) {
      if (this.noise(seed, n, 3) > 0.45) {
        const dot = 2 + Math.floor(this.noise(seed, n, 4) * 3);
        const u = n * step + this.noise(seed, n, 5) * step;
        const drift = Math.round(this.signedNoise(seed, n, 6.5));
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = colors[2];
        ctx.fillRect(
          Math.round(vertical ? x + drift : x + u),
          Math.round(vertical ? y + u : y + drift),
          dot,
          dot
        );
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private strokeBoundaryPath(ctx: CanvasRenderingContext2D, points: { x: number, y: number }[],
                             color: string, width: number, alpha: number) {
    if (points.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  private paintTerrainDetails(ctx: CanvasRenderingContext2D) {
    for (const t of this.city.tiles) {
      const colors = TERRAIN_DETAIL_COLORS[t.terrain] ?? TERRAIN_DETAIL_COLORS[Terrain.GRASS];
      const seed = t.i * 73856093 ^ t.j * 19349663;
      const count = t.terrain === Terrain.WATER ? 2 : t.terrain === Terrain.GRASS ? 3 : 2;
      for (let k = 0; k < count; k++) {
        if (this.noise(seed, k, 0) < 0.35) continue;
        const x = t.j * TILE + 5 + Math.floor(this.noise(seed, k, 1) * (TILE - 10));
        const y = t.i * TILE + 5 + Math.floor(this.noise(seed, k, 2) * (TILE - 10));
        ctx.globalAlpha = 0.38 + this.noise(seed, k, 3) * 0.28;
        ctx.fillStyle = colors[k % colors.length];
        if (t.terrain === Terrain.WATER) {
          ctx.fillRect(x, y, 8, 2);
          ctx.fillRect(x + 3, y + 2, 5, 1);
        } else if (t.terrain === Terrain.GRASS) {
          ctx.fillRect(x, y + 3, 2, 4);
          ctx.fillRect(x + 2, y + 1, 2, 6);
          ctx.fillRect(x + 4, y + 4, 2, 3);
        } else {
          ctx.fillRect(x, y, 4, 3);
          ctx.fillRect(x + 4, y + 1, 2, 2);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  private boundaryColors(a: Terrain, b: Terrain): string[] {
    const pa = TERRAIN_PRECEDENCE[a] ?? 0;
    const pb = TERRAIN_PRECEDENCE[b] ?? 0;
    const lower = pa <= pb ? a : b;
    const upper = pa <= pb ? b : a;
    return TERRAIN_BOUNDARY_COLORS[`${lower}|${upper}`]
      ?? [TERRAIN_DETAIL_COLORS[upper]?.[0] ?? '#ffffff', TERRAIN_DETAIL_COLORS[lower]?.[1] ?? '#ffffff', TERRAIN_DETAIL_COLORS[upper]?.[1] ?? '#ffffff'];
  }

  private noise(seed: number, a: number, b = 0): number {
    let x = (seed ^ (a * 374761393) ^ (b * 668265263)) | 0;
    x = Math.imul(x ^ (x >>> 15), 2246822519);
    x = Math.imul(x ^ (x >>> 13), 3266489917);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
  }

  private signedNoise(seed: number, a: number, amplitude: number): number {
    return (this.noise(seed, a) * 2 - 1) * amplitude;
  }

  // Feather any higher-layer neighbouring terrain inward over this tile so
  // adjacent terrains blend. For each layer (low→high) that outranks ours, draw
  // its EDGE toward every side that touches it, and its CORNER at any diagonal
  // that touches it where neither framing side does (the convex-corner case).
  private drawBlend(t: Tile, x: number, y: number) {
    const city = this.city, i = t.i, j = t.j;
    const myPrec = TERRAIN_PRECEDENCE[t.terrain] ?? 0;
    // Off-grid neighbours read as our own terrain, so the map border never feathers.
    const terrAt = (ii: number, jj: number) =>
      (ii < 0 || jj < 0 || ii >= city.h || jj >= city.w) ? t.terrain : city.tiles[ii * city.w + jj].terrain;
    // Sides N,E,S,W and diagonals NE,SE,SW,NW.
    const side = [terrAt(i - 1, j), terrAt(i, j + 1), terrAt(i + 1, j), terrAt(i, j - 1)];
    const diag = [terrAt(i - 1, j + 1), terrAt(i + 1, j + 1), terrAt(i + 1, j - 1), terrAt(i - 1, j - 1)];
    // The two sides framing each diagonal (NE↔N,E  SE↔E,S  SW↔S,W  NW↔W,N).
    const framing = [[0, 1], [1, 2], [2, 3], [3, 0]];
    for (const X of TERRAIN_OVERLAY_ORDER) {
      if ((TERRAIN_PRECEDENCE[X] ?? 0) <= myPrec) continue;
      for (let d = 0; d < 4; d++) {
        if (side[d] === X) this.drawRotated(this.blendSprite(X, BLEND_EDGE_MASKS[d]), x, y, 0);
      }
      for (let c = 0; c < 4; c++) {
        const [a, b] = framing[c];
        if (diag[c] === X && side[a] !== X && side[b] !== X) {
          this.drawRotated(this.blendSprite(X, BLEND_CORNER_MASKS[c], c), x, y, 0);
        }
      }
    }
  }

  // The blend sprite for one layer = that layer's flat terrain texture stamped
  // through an alpha mask, baked once into an offscreen canvas and cached. The
  // organic mask set is reused by every terrain layer. Returns undefined until
  // both the texture and mask have loaded.
  private blendCache = new Map<string, HTMLCanvasElement>();
  private blendSprite(terrain: string, maskSrc: string, corner?: number): HTMLCanvasElement | undefined {
    const key = terrain + '|' + maskSrc;
    const hit = this.blendCache.get(key);
    if (hit) return hit;
    const tex = this.img(TERRAIN_BLEND_TEXTURE[terrain]);
    const mask = this.img(maskSrc);
    if (!ready(tex) || !ready(mask)) return undefined;
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const cx = c.getContext('2d')!;
    // Smooth the mask's alpha when scaling it down to TILE: the masks are 64px
    // with SOFT feathered edges, and nearest-neighbour downscaling crushes that
    // feather into hard jagged steps. The 48px texture draws 1:1 so it stays crisp.
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(tex!, 0, 0, TILE, TILE);
    cx.globalCompositeOperation = 'destination-in'; // keep texture only where the mask is opaque
    if (corner === undefined) {
      cx.drawImage(mask!, 0, 0, TILE, TILE);
    } else {
      // Convex-corner masks are authored very large (≈85% radius), which bulges
      // every coastline corner. Shrink the nub toward its anchor corner so it
      // reads as a small bit of the higher terrain peeking in. corner index:
      // 0=NE, 1=SE, 2=SW, 3=NW.
      const s = TILE * CORNER_SCALE;
      const ax = (corner === 0 || corner === 1) ? TILE - s : 0; // E side for NE/SE
      const ay = (corner === 1 || corner === 2) ? TILE - s : 0; // S side for SE/SW
      cx.drawImage(mask!, ax, ay, s, s);
    }
    this.blendCache.set(key, c);
    return c;
  }

  // Draw a tile-sized sprite at (x,y), rotated `rot` × 90° clockwise about its
  // centre. Shared by the road and terrain-blend auto-tiling. Accepts a still-
  // loading <img> (skipped) or a ready offscreen canvas.
  private drawRotated(im: CanvasImageSource | undefined, x: number, y: number, rot: number) {
    if (!im || (im instanceof HTMLImageElement && !ready(im))) return;
    const ctx = this.ctx;
    if (rot === 0) { ctx.drawImage(im, x, y, TILE, TILE); return; }
    ctx.save();
    ctx.translate(x + TILE / 2, y + TILE / 2);
    ctx.rotate(rot * Math.PI / 2);
    ctx.drawImage(im, -TILE / 2, -TILE / 2, TILE, TILE);
    ctx.restore();
  }

  private drawFeature(t: Tile) {
    const file = t.feature === Feature.TREE ? 'tree.png'
      : t.feature === Feature.ROCK ? 'rock.png'
      : t.feature === Feature.BUSH ? 'bush.png' : undefined;
    if (!file) return;
    const im = this.img(TERRAIN_OBJECT_BASE + file);
    if (ready(im)) this.drawContain(im!, t.j * TILE, t.i * TILE, TILE, TILE);
  }

  private drawBuilding(t: Tile, b: Building) {
    const type = b.type;
    const size = GetBuildingSize(type);
    const x = t.j * TILE, y = t.i * TILE, W = size * TILE, H = size * TILE;

    if (type === BuildingType.ROAD) {
      this.drawRoad(t, x, y);
      return;
    }
    if (IsFarmBuilding(type) && size > 1) {
      this.drawComposite(b, this.img(IsAnimalFarm(type) ? ANIMAL_FARM_ICON : CROP_FARM_ICON), x, y, W, H, 'farm');
      return;
    }
    if (IsMineCampBuilding(type) && size > 1) {
      this.drawComposite(b, this.img(MINE_CAMP_ICON), x, y, W, H, 'workshop');
      return;
    }
    if (IsWorkshopBuilding(type) && size > 1) {
      this.drawComposite(b, this.img(WORKSHOP_ICON), x, y, W, H, 'workshop');
      return;
    }
    // Single icon filling the footprint (houses use tier art via artSrc).
    const im = this.img(this.artSrc(b));
    if (ready(im)) this.drawContain(im!, x + 1, y + 1, W - 2, H - 2, true);
    else this.drawEmoji(GetBuildingIcon(type), x + W / 2, y + H / 2, size * 16);
  }

  // Auto-tiled road overlay. No opaque fill — a transparent sprite is drawn over
  // the already-painted terrain, picked + rotated from which neighbours are road
  // so the network connects (straights, corners, T-junctions, crossroads).
  private drawRoad(t: Tile, x: number, y: number) {
    const pick = ROAD_TILE_BY_MASK.get(this.roadMask(t.i, t.j))!;
    this.drawRotated(this.img(pick.src), x, y, pick.rot); // terrain shows through until the sprite loads
  }

  // Bitmask of which orthogonal neighbours are also roads: N=1, E=2, S=4, W=8.
  private roadMask(i: number, j: number): number {
    const city = this.city;
    const isRoad = (ii: number, jj: number) =>
      ii >= 0 && jj >= 0 && ii < city.h && jj < city.w &&
      city.tiles[ii * city.w + jj].building?.type === BuildingType.ROAD;
    return (isRoad(i - 1, j) ? 1 : 0) | (isRoad(i, j + 1) ? 2 : 0)
         | (isRoad(i + 1, j) ? 4 : 0) | (isRoad(i, j - 1) ? 8 : 0);
  }

  // Background art filling the footprint, with product icon(s) overlaid:
  // farms show a row of three produce icons; workshops/mine camps show one
  // product pinned bottom-right.
  private drawComposite(b: Building, bg: HTMLImageElement | undefined,
                        x: number, y: number, W: number, H: number, kind: 'farm' | 'workshop') {
    if (ready(bg)) {
      // Workshops overscan slightly (the old CSS inset:-4%); farms fill exactly.
      const o = kind === 'workshop' ? 0.04 : 0;
      this.drawContain(bg!, x - W * o, y - H * o, W * (1 + 2 * o), H * (1 + 2 * o), true);
    }
    const prod = this.img(this.artSrc(b));
    const emoji = GetBuildingIcon(b.type);
    if (kind === 'farm') {
      const isz = W * 0.24, padX = W * 0.08, usable = W - 2 * padX, cy = y + H * 0.66;
      for (let k = 0; k < 3; ++k) {
        const cx = x + padX + usable * (k + 0.5) / 3;
        if (ready(prod)) this.drawContain(prod!, cx - isz / 2, cy - isz / 2, isz, isz, true);
        else this.drawEmoji(emoji, cx, cy, isz);
      }
    } else {
      const isz = W * 0.38, px = x + W * 0.92 - isz, py = y + H * 0.80 - isz;
      if (ready(prod)) this.drawContain(prod!, px, py, isz, isz, true);
      else this.drawEmoji(emoji, px + isz / 2, py + isz / 2, isz);
    }
  }

  private artSrc(b: Building): string | undefined {
    if (b.house) return GetHouseMapIconSrc(b.house.tier);
    return GetBuildingMapIconSrc(b.type);
  }

  // Draw an image "object-fit: contain" within a box, optionally with the
  // subtle sprite shadow the DOM used.
  private drawContain(im: HTMLImageElement, dx: number, dy: number, dw: number, dh: number, shadow = false) {
    const s = Math.min(dw / im.naturalWidth, dh / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    const ox = dx + (dw - w) / 2, oy = dy + (dh - h) / 2;
    const ctx = this.ctx;
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 1; ctx.shadowOffsetY = 1; }
    ctx.drawImage(im, ox, oy, w, h);
    if (shadow) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
  }

  private drawEmoji(text: string, cx: number, cy: number, fontPx: number) {
    const ctx = this.ctx;
    ctx.font = `${fontPx}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
  }

  // Cached <img>. First load of any sprite schedules a redraw so the map fills
  // in as art streams in; thereafter it's served from cache with no redraw.
  private img(src?: string): HTMLImageElement | undefined {
    if (!src) return undefined;
    let im = this.images.get(src);
    if (!im) {
      im = new Image();
      im.onload = () => {
        this.imageVersion++;
        this.terrainSurfaceKey = '';
        this.requestRedraw();
      };
      im.src = src;
      this.images.set(src, im);
    }
    return im;
  }
}

function ready(im: HTMLImageElement | undefined): boolean {
  return !!im && im.complete && im.naturalWidth > 0;
}
