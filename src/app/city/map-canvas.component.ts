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
import {
  GRID_TILE, ISO_TILE_W, ISO_TILE_H, applyIsoGridCameraTransform,
  gridToIso, isoToGrid, isoVisibleGridRange, isoWorldSize, tileFootprintPolygon,
} from '../isometric';

const TILE = GRID_TILE;
// Buildings anchor up to (maxSize-1) tiles outside the visible range can still
// poke into view; pad the culled range so their footprints draw. Max size is 3.
const CULL_PAD = 3;

type MapObjectDraw = {
  kind: 'feature' | 'building';
  tile: Tile;
  building?: Building;
  depth: number;
  order: number;
};

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

// Solid fallback colour per terrain, painted under a render tile only until its
// blend sprite has streamed in.
const TERRAIN_COLOR: { [key: string]: string } = {
  [Terrain.WATER]: '#47c9ff',
  [Terrain.GRASS]: '#a9d86b',
  [Terrain.SAND]:  '#ffe48b',
  [Terrain.DIRT]:  '#c4956a',
};

// Terrain blending via DUAL-GRID corner-Wang (marching-squares) tile sets, one
// per boundary in the layer stack sea → sand → grass → dirt. The render grid is
// offset half a tile from the data grid, so each render tile sits on a shared
// corner of four data tiles and is chosen by which of those four are the higher
// terrain (NW=1, NE=2, SE=4, SW=8 → a 0..F hex mask matching the filenames).
const TERRAIN_PRECEDENCE: { [key: string]: number } = {
  [Terrain.WATER]: 0, // sea, the base
  [Terrain.SAND]:  1,
  [Terrain.GRASS]: 2,
  [Terrain.DIRT]:  3, // top
};

// One opaque 16-tile set per ADJACENT pair, keyed by the higher terrain of the
// pair. `bit1` decides which corners set their mask bit; per each set's README:
//   sand-sea   bit 1 = SEA  (the lower)  — a corner is "bit 1" when it is sea
//   grass-sand bit 1 = GRASS (the higher)
//   dirt-grass bit 1 = DIRT  (the higher)
// `atLeast` collapses any terrain at/above that precedence to the bit-1 side, so
// a dirt corner reads as grass at the grass/sand boundary, etc.
// Each set lives in blend/<pair>/ as 0.png .. F.png (the hex corner mask).
const TERRAIN_BLEND_BASE = MAP_TILE_BASE + 'blend/';
const TERRAIN_SETS: { [higher: string]: { dir: string, bit1: 'low' | 'high', atLeast: number } } = {
  [Terrain.SAND]:  { dir: 'sand-sea/',   bit1: 'low',  atLeast: 1 },
  [Terrain.GRASS]: { dir: 'grass-sand/', bit1: 'high', atLeast: 2 },
  [Terrain.DIRT]:  { dir: 'dirt-grass/', bit1: 'high', atLeast: 3 },
};
// Resolved image path per set per mask, built once: TERRAIN_TILE_SRC[higher][0..15].
// Avoids rebuilding the same 48 path strings every render tile, every repaint.
const HEX = '0123456789ABCDEF';
const TERRAIN_TILE_SRC: { [higher: string]: string[] } = (() => {
  const table: { [higher: string]: string[] } = {};
  for (const higher of Object.keys(TERRAIN_SETS)) {
    table[higher] = [];
    for (let m = 0; m < 16; m++) table[higher][m] = TERRAIN_BLEND_BASE + TERRAIN_SETS[higher].dir + HEX[m] + '.png';
  }
  return table;
})();

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
  private redrawScheduled = false;
  private resizeObserver?: ResizeObserver;
  private cameraInitialized = false;

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

  private worldW() { return isoWorldSize(this.city.w, this.city.h).width; }
  private worldH() { return isoWorldSize(this.city.w, this.city.h).height; }

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
    const iso = screenToWorld(this.state.camera, clientX - rect.left, clientY - rect.top);
    const w = isoToGrid(this.city.h, iso.x, iso.y);
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
    this.ensureInitialCamera(cssW, cssH);
    // Keep the camera valid (covers viewport resizes that shrink the world view).
    clampCamera(cam, cssW, cssH, this.worldW(), this.worldH());

    // Clear in device space, then switch to world space via the camera transform.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Visible tile range (padded so off-screen building anchors still draw).
    const { i0, i1, j0, j1 } = isoVisibleGridRange(cam, cssW, cssH, city.w, city.h, CULL_PAD);
    const at = (i: number, j: number) => city.tiles[i * city.w + j];

    applyIsoGridCameraTransform(ctx, cam, dpr, city.h);

    // 1) terrain, drawn on the DUAL grid: render tiles are offset half a tile so
    // each sits on a corner shared by four data tiles. Range extends one tile
    // past the visible data range (a render tile covers data rows/cols ri-1..ri).
    const ri1 = Math.min(city.h, i1 + 1), rj1 = Math.min(city.w, j1 + 1);
    for (let ri = i0; ri <= ri1; ++ri) for (let rj = j0; rj <= rj1; ++rj) this.drawTerrainCorner(ri, rj);
    // 2) roads are flat tile overlays, so they use the same grid->iso transform
    // as terrain and can keep reusing the current square auto-tile sprites.
    for (let i = i0; i <= i1; ++i) for (let j = j0; j <= j1; ++j) {
      const t = at(i, j);
      if (t.building?.type === BuildingType.ROAD) this.drawRoad(t, t.j * TILE, t.i * TILE);
    }

    applyCameraTransform(ctx, cam, dpr);
    ctx.imageSmoothingEnabled = false;

    // 3) upright world objects, back-to-front by grid depth. They are positioned
    // in projected iso space so existing building art remains readable.
    for (const item of this.objectDrawList(i0, i1, j0, j1)) {
      if (item.kind === 'feature') this.drawFeature(item.tile);
      else this.drawBuilding(item.tile, item.building!);
    }
    // 4) selection outline.
    const f = city.focus_tile;
    if (f) {
      const size = f.building ? GetBuildingSize(f.building.type) : 1;
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 2;
      this.strokeFootprint(f.i, f.j, size);
    }
  }

  // One dual-grid render tile, anchored on the corner shared by the four data
  // tiles NW=(ri-1,rj-1) NE=(ri-1,rj) SE=(ri,rj) SW=(ri,rj-1) and drawn offset
  // half a tile up/left of that corner. The corner-Wang set for the HIGHEST
  // terrain present is picked, and the 0..F mask says which corners are on that
  // set's bit-1 side — so the seam between the two terrains lands mid-tile.
  private drawTerrainCorner(ri: number, rj: number) {
    // Four data tiles sharing this corner (NW, NE, SE, SW); off-grid clamps to edge.
    const nw = this.terrainAtClamped(ri - 1, rj - 1), ne = this.terrainAtClamped(ri - 1, rj);
    const se = this.terrainAtClamped(ri, rj),         sw = this.terrainAtClamped(ri, rj - 1);
    const pnw = TERRAIN_PRECEDENCE[nw] ?? 0, pne = TERRAIN_PRECEDENCE[ne] ?? 0;
    const pse = TERRAIN_PRECEDENCE[se] ?? 0, psw = TERRAIN_PRECEDENCE[sw] ?? 0;
    // Highest-precedence terrain present picks the boundary set. Sea is the base,
    // so default to SAND → an all-sea tile uses sand-sea's all-sea mask.
    let higher: string = Terrain.SAND, hPrec = 1;
    if (pnw > hPrec) { hPrec = pnw; higher = nw; }
    if (pne > hPrec) { hPrec = pne; higher = ne; }
    if (pse > hPrec) { hPrec = pse; higher = se; }
    if (psw > hPrec) { hPrec = psw; higher = sw; }
    // Mask bit per corner (NW=1, NE=2, SE=4, SW=8): set when the corner is on the
    // set's bit-1 side — sea for sand-sea (bit1 'low'), the higher terrain otherwise.
    const set = TERRAIN_SETS[higher], lo = set.bit1 === 'low', a = set.atLeast;
    let mask = 0;
    if (lo ? pnw < a : pnw >= a) mask |= 1;
    if (lo ? pne < a : pne >= a) mask |= 2;
    if (lo ? pse < a : pse >= a) mask |= 4;
    if (lo ? psw < a : psw >= a) mask |= 8;
    const x = rj * TILE - TILE / 2, y = ri * TILE - TILE / 2;
    const im = this.img(TERRAIN_TILE_SRC[higher][mask]);
    if (ready(im)) { this.ctx.drawImage(im!, x, y, TILE, TILE); return; }
    // Solid placeholder (the anchor/SE tile's colour) until the sprite streams in.
    this.ctx.fillStyle = TERRAIN_COLOR[se] ?? TERRAIN_COLOR[Terrain.GRASS];
    this.ctx.fillRect(x, y, TILE, TILE);
  }

  // Terrain of the data tile at (ii,jj), clamped to the grid edge so dual-grid
  // render tiles straddling the border read the edge tile rather than off-grid.
  private terrainAtClamped(ii: number, jj: number): Terrain {
    const city = this.city;
    const ci = ii < 0 ? 0 : ii >= city.h ? city.h - 1 : ii;
    const cj = jj < 0 ? 0 : jj >= city.w ? city.w - 1 : jj;
    return city.tiles[ci * city.w + cj].terrain;
  }

  private ensureInitialCamera(viewportW: number, viewportH: number) {
    if (this.cameraInitialized || viewportW <= 0 || viewportH <= 0) return;
    const cam = this.state.camera;
    const world = isoWorldSize(this.city.w, this.city.h);
    cam.x = Math.max(0, (world.width - viewportW / cam.zoom) / 2);
    cam.y = Math.max(0, (world.height - viewportH / cam.zoom) / 2);
    clampCamera(cam, viewportW, viewportH, world.width, world.height);
    this.cameraInitialized = true;
    this.state.bumpCamera();
  }

  private objectDrawList(i0: number, i1: number, j0: number, j1: number): MapObjectDraw[] {
    const city = this.city;
    const items: MapObjectDraw[] = [];
    for (let i = i0; i <= i1; ++i) for (let j = j0; j <= j1; ++j) {
      const tile = city.tiles[i * city.w + j];
      if (tile.feature && !tile.building && !tile.covered) {
        items.push({ kind: 'feature', tile, depth: i + j, order: i * city.w + j });
      }
      if (tile.building && tile.building.type !== BuildingType.ROAD) {
        items.push({
          kind: 'building',
          tile,
          building: tile.building,
          depth: this.buildingDepth(tile, tile.building),
          order: i * city.w + j,
        });
      }
    }
    items.sort((a, b) => a.depth - b.depth || a.order - b.order);
    return items;
  }

  private buildingDepth(t: Tile, b: Building): number {
    const size = GetBuildingSize(b.type);
    return (t.i + size - 1) + (t.j + size - 1);
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
    if (ready(im)) {
      const p = this.tileObjectBase(t.i, t.j, 1);
      const w = ISO_TILE_W * 0.72, h = ISO_TILE_H * 1.7;
      this.drawContain(im!, p.x - w / 2, p.y - h, w, h);
    }
  }

  private drawBuilding(t: Tile, b: Building) {
    const type = b.type;
    const size = GetBuildingSize(type);
    const base = this.tileObjectBase(t.i, t.j, size);
    const W = size * ISO_TILE_W * 0.96;
    const H = Math.max(size * ISO_TILE_H * 1.8, size * TILE * 0.96);
    const x = base.x - W / 2, y = base.y - H;

    if (type === BuildingType.ROAD) {
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

  private tileObjectBase(i: number, j: number, size: number): { x: number, y: number } {
    const center = gridToIso(this.city.h, (j + size / 2) * TILE, (i + size / 2) * TILE);
    return { x: center.x, y: center.y + size * ISO_TILE_H / 2 };
  }

  private strokeFootprint(i: number, j: number, size: number) {
    const pts = tileFootprintPolygon(this.city.h, i, j, size);
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
    ctx.closePath();
    ctx.stroke();
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
      im.onload = () => this.requestRedraw();
      im.src = src;
      this.images.set(src, im);
    }
    return im;
  }
}

function ready(im: HTMLImageElement | undefined): boolean {
  return !!im && im.complete && im.naturalWidth > 0;
}
