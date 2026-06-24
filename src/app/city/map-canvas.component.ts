import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, effect, inject } from '@angular/core';
import { City } from '../city';
import { Tile } from '../tile';
import { Building } from '../building';
import { StateService } from '../state.service';
import { BuildingType, Terrain, Feature } from '../types';
import {
  GetBuildingSize, GetBuildingIcon, IsFarmBuilding, IsAnimalFarm,
  IsWorkshopBuilding, IsMineCampBuilding,
} from '../building';
import { GetBuildingMapIconSrc, GetHouseMapIconSrc } from '../building-icons';

const TILE = 48;

// Composite background art for multi-tile buildings (same assets the old DOM
// tile used).
const CROP_FARM_ICON = 'assets/used/buildings/crop-farm.png';
const ANIMAL_FARM_ICON = 'assets/used/buildings/animal-farm.png';
const WORKSHOP_ICON = 'assets/used/buildings/workshop.png';
const MINE_CAMP_ICON = 'assets/used/buildings/mine-camp.png';

const MAP_TILE_BASE = 'assets/used/map-tiles/';
const ROAD_TILE_ASSET = MAP_TILE_BASE + 'cobblestone-road-light-48-v3.png';
const TERRAIN_OBJECT_BASE = 'assets/used/terrain/';

const MAP_TILE_ASSETS: { [key: string]: { file: string, color: string } } = {
  [Terrain.WATER]: { file: 'sea.png',   color: '#47c9ff' },
  [Terrain.GRASS]: { file: 'grass.png', color: '#a9d86b' },
  [Terrain.SAND]:  { file: 'sand.png',  color: '#ffe48b' },
  [Terrain.DIRT]:  { file: 'dirt.png',  color: '#c4956a' },
};

// The whole map (terrain + features + buildings) is drawn onto a single
// <canvas>, replacing ~one Angular component per tile. It repaints only when
// `mapVersion` changes (a user map/selection edit) — never on the per-tick
// `frame` heartbeat — so the sim running has zero rendering cost here. Live
// motion (carts) lives in the separate app-cart-layer canvas on top.
@Component({
  selector: 'app-map-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    canvas { display: block; }
  `],
  template: ``,
})
export class MapCanvasComponent implements OnInit {
  @Input() city!: City;

  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private state = inject(StateService);
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();
  private redrawScheduled = false;

  constructor() {
    // Repaint whenever a user edit bumps the map version. (Reading the signal
    // inside the effect is what subscribes us to it.)
    effect(() => { this.state.mapVersion(); this.requestRedraw(); });
  }

  ngOnInit() {
    this.canvas = document.createElement('canvas');
    this.canvas.draggable = true;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('click', e => this.onClick(e));
    this.canvas.addEventListener('dragstart', e => this.onDragStart(e));
    this.canvas.addEventListener('dragend', () => this.onDragEnd());
    this.host.appendChild(this.canvas);
    this.requestRedraw();
  }

  // Translate a viewport point to a grid tile, or undefined if off-grid.
  // Used by CityComponent for drag-over/drop hit testing too.
  public tileAt(clientX: number, clientY: number): { i: number, j: number } | undefined {
    const rect = this.canvas.getBoundingClientRect();
    const j = Math.floor((clientX - rect.left) / TILE);
    const i = Math.floor((clientY - rect.top) / TILE);
    if (i < 0 || j < 0 || i >= this.city.h || j >= this.city.w) return undefined;
    return { i, j };
  }

  private onClick(e: MouseEvent) {
    const pos = this.tileAt(e.clientX, e.clientY);
    if (!pos) return;
    this.state.HandleTileClick(this.state.GetTile(this.city, pos.i, pos.j));
  }

  // Start moving an already-placed building. Mirrors the old per-tile
  // draggable building element: grab the anchor (resolving covered tiles),
  // skip roads and empty land. preventDefault() cancels the drag so a plain
  // click on empty/road tiles still registers.
  private onDragStart(e: DragEvent) {
    const pos = this.tileAt(e.clientX, e.clientY);
    if (!pos) { e.preventDefault(); return; }
    const tile = this.state.GetTile(this.city, pos.i, pos.j);
    const anchor = tile.covered ? this.state.GetTile(this.city, tile.anchor_i, tile.anchor_j) : tile;
    if (!anchor.building || anchor.building.type === BuildingType.ROAD) { e.preventDefault(); return; }
    e.dataTransfer?.setData('text/plain', 'move');
    // Suppress the full-map drag ghost the browser would otherwise snapshot.
    const ghost = document.createElement('canvas'); ghost.width = ghost.height = 1;
    e.dataTransfer?.setDragImage(ghost, 0, 0);
    this.state.SetBuildType(anchor.building.type); // clears move_source
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

  private ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.city.w * TILE, h = this.city.h * TILE;
    if (this.canvas.width === Math.round(w * dpr) && this.canvas.height === Math.round(h * dpr)) return;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private draw() {
    if (!this.ctx) return;
    const city = this.city, ctx = this.ctx;
    this.ensureSize();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, city.w * TILE, city.h * TILE);

    // 1) terrain under every tile (including tiles a building covers).
    for (const t of city.tiles) this.drawTerrain(t);
    // 2) removable tree/rock/bush decorations on bare land.
    for (const t of city.tiles) {
      if (t.feature && !t.building && !t.covered) this.drawFeature(t);
    }
    // 3) buildings (anchor tiles only — covered tiles carry no building).
    for (const t of city.tiles) {
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
      this.ctx.fillStyle = '#b9b3a4';
      this.ctx.fillRect(x, y, TILE, TILE);
      const im = this.img(ROAD_TILE_ASSET);
      if (ready(im)) this.ctx.drawImage(im!, x, y, TILE, TILE);
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
