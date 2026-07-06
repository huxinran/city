import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { City } from '../sim/city';
import { Cart } from '../sim/building';
import { GetBuildingSize, IsAnimalFarm } from '../sim/building';
import { CityName, ShippingTaskType, Terrain } from '../sim/types';
import { StateService } from '../state.service';
import { GetBuildingMapIconSrc } from '../building-icons';
import { applyCameraTransform } from '../camera';
import { GRID_TILE, ISO_TILE_H, ISO_TILE_W, gridToIso } from '../isometric';

const TILE = GRID_TILE;
// Matches the old DOM `transition: left/top 0.2s linear`. The sim updates a
// cart's progress ~5x/sec; we tween between those samples over this window so
// the canvas draws smooth 60fps motion instead of stepping 5x/sec.
const TWEEN_MS = 200;

// Ambient decoration: a single sailing ship that drifts back and forth along the
// top ocean band (row ~1, always water for every generated map). Purely visual —
// not a real game ship. The art faces left, so it's flipped when sailing right.
const SHIP_ICON = 'assets/used/actors/ship.png';
const SHIP_ROW = 1.6;          // world tile row (centre) — inside the 3-tile sea
const SHIP_SIZE = TILE * 2.2;  // drawn footprint
const SHIP_SPEED = 1.1;        // tiles per second
const SHIP_MARGIN = 2.5;       // tiles kept clear of the left/right map edges

// Ambient flotsam: small climate-themed objects that drift slowly across open
// water and respawn on a fresh water tile when they run aground or leave the
// map. Art is grouped by climate — ice only in the cold north, coconuts only
// in the warm south, driftwood/leaves elsewhere.
const FLOTSAM_ROOT = 'assets/used/actors/flotsam/';
type FlotsamArt = { file: string, size: number }  // size = drawn width in tiles
const FLOTSAM_TEMPERATE: FlotsamArt[] = [
  { file: 'driftwood-1.png', size: 0.55 },
  { file: 'leaf-1.png', size: 0.34 },
];
const FLOTSAM_BY_CITY: Partial<Record<CityName, FlotsamArt[]>> = {
  [CityName.MINTAKA]: [
    { file: 'ice-1.png', size: 0.74 },
    { file: 'ice-2.png', size: 0.62 },
  ],
  [CityName.SOLARA]: [
    { file: 'coconut-1.png', size: 0.30 },
    { file: 'coconut-2.png', size: 0.40 },
  ],
};
const FLOTSAM_COUNT = 9;          // drifting items per map
const FLOTSAM_MIN_SPEED = 0.04;   // tiles per second
const FLOTSAM_MAX_SPEED = 0.10;
const FLOTSAM_FADE_MS = 1600;     // fade-in after a respawn

interface Flotsam {
  x: number; y: number;    // world tile coords (fractional; x=j, y=i)
  vx: number; vy: number;  // tiles per second
  art: FlotsamArt;
  phase: number;           // desyncs the bob/rock cycles
  bornAt: number;
}

// A cart's visual state, derived from its current task.
type CartVisual = { icon: string, emoji: string }
const CART_VISUALS = {
  fetching: { icon: 'assets/used/actors/cart-fetching.png', emoji: '🛺' },
  loaded:   { icon: 'assets/used/actors/cart-loaded.png',   emoji: '📦' },
  empty:    { icon: 'assets/used/actors/cart-empty.png',    emoji: '🛒' },
} satisfies Record<string, CartVisual>
const CART_SIZE = TILE * 0.72;
const CART_Y_OFFSET = -TILE * 0.12;

// Per-cart animation state. `to` is the latest position the sim implies; `cx/cy`
// is where we actually drew last frame; on a new `to` we tween from cx/cy.
interface CartAnim { fromX: number, fromY: number, toX: number, toY: number, start: number, cx: number, cy: number }
interface AnimalAnim { x: number, y: number, tx: number, ty: number, nextAt: number, flip: boolean }
interface AnimalSprite {
  key: string;
  img: HTMLImageElement;
  x: number;
  y: number;
  size: number;
}

// Carts are drawn onto a single <canvas> from a requestAnimationFrame loop that
// runs OUTSIDE Angular. This replaces a per-cart DOM element + Angular change
// detection: moving a cart now never marks the tile grid dirty (which made the
// whole @for re-evaluate every frame and the map stutter), and the entire cart
// layer is one element instead of one <div> per cart.
@Component({
  selector: 'app-cart-layer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  `],
  template: ``,
})
export class CartLayerComponent implements OnInit, OnDestroy {
  @Input() city!: City;

  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private state = inject(StateService);
  private zone = inject(NgZone);
  private raf = 0;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private anims = new Map<Cart, CartAnim>();
  private activeCarts = new Set<Cart>();
  private animalAnims = new Map<string, AnimalAnim>();
  private animalSprites: AnimalSprite[] = [];
  private animalSpriteVersion = -1;
  private animalSpriteCity?: City;
  private images = new Map<string, HTMLImageElement>();

  // Ambient ship state: x position (in tiles), travel direction, last timestamp.
  private shipX = SHIP_MARGIN;
  private shipDir = 1;
  private shipLast = 0;

  // Ambient flotsam state, rebuilt whenever the displayed city changes.
  private flotsam: Flotsam[] = [];
  private flotsamCity?: City;
  private flotsamLast = 0;

  ngOnInit() {
    this.canvas = document.createElement('canvas');
    // Inline sizing so the JS-created canvas fills the host regardless of view
    // encapsulation (see map-canvas for the full explanation) — keeps the cart
    // layer aligned with the map canvas at dpr≠1.
    Object.assign(this.canvas.style, {
      position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%',
    });
    this.ctx = this.canvas.getContext('2d')!;
    this.host.appendChild(this.canvas);
    this.zone.runOutsideAngular(() => {
      const loop = () => { this.frame(); this.raf = requestAnimationFrame(loop); };
      this.raf = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
  }

  // One animation frame: size the canvas to the viewport, apply the shared
  // camera transform, clear, then tween and draw every active cart in world
  // coordinates. No Angular involvement.
  private frame() {
    this.ensureSize();
    const ctx = this.ctx, cam = this.state.camera;
    const dpr = window.devicePixelRatio || 1;
    const now = performance.now();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    applyCameraTransform(ctx, cam, dpr);
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    this.drawAnimalFarms(now);

    this.activeCarts.clear();
    for (const t of this.city.warehouses) {
      const warehouse = t.building?.warehouse;
      if (!warehouse) continue;
      for (const c of warehouse.carts) {
        if (!c.task?.path || c.task.path.length <= 1) continue;
        this.activeCarts.add(c);
        this.drawCart(c, now);
      }
    }
    // Drop animation state for carts that are no longer active.
    for (const cart of this.anims.keys()) {
      if (!this.activeCarts.has(cart)) this.anims.delete(cart);
    }

    // Ambient water decoration: drifting flotsam, then the sailing ship on top.
    this.drawFlotsam(now);
    this.drawShip(now);
  }

  // Advance and draw the drifting flotsam. Items move in a fixed slow direction;
  // one that drifts onto land, under a bridge/building, or off the map quietly
  // respawns on a random open-water tile and fades back in.
  private drawFlotsam(now: number) {
    if (this.flotsamCity !== this.city) {
      this.flotsamCity = this.city;
      this.flotsamLast = now;
      this.flotsam = [];
      for (let k = 0; k < FLOTSAM_COUNT; k++) {
        const f = this.spawnFlotsam(now);
        if (!f) break;
        f.bornAt = now - FLOTSAM_FADE_MS; // initial population needs no fade-in
        this.flotsam.push(f);
      }
    }
    const dt = Math.min(0.05, (now - this.flotsamLast) / 1000); // clamp tab-switch jumps
    this.flotsamLast = now;

    for (let k = 0; k < this.flotsam.length; k++) {
      let f = this.flotsam[k];
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (!this.isOpenWater(Math.round(f.y), Math.round(f.x))) {
        const next = this.spawnFlotsam(now);
        if (!next) continue;
        this.flotsam[k] = f = next;
      }
      const img = this.image(FLOTSAM_ROOT + f.art.file);
      if (!img.complete || img.naturalWidth === 0) continue;
      const p = gridToIso(this.city.h, (f.x + 0.5) * TILE, (f.y + 0.5) * TILE);
      const w = f.art.size * TILE;
      const h = w * img.naturalHeight / img.naturalWidth;
      const bob = Math.sin(now / 700 + f.phase) * 1.6;
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (now - f.bornAt) / FLOTSAM_FADE_MS);
      ctx.translate(p.x, p.y + bob);
      ctx.rotate(Math.sin(now / 1100 + f.phase) * 0.06); // gentle rock
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  // A fresh flotsam item on a random open-water tile, with climate-appropriate
  // art. Undefined when no water tile is found (a map with next to no water).
  private spawnFlotsam(now: number): Flotsam | undefined {
    const arts = FLOTSAM_BY_CITY[this.city.name] ?? FLOTSAM_TEMPERATE;
    for (let tries = 0; tries < 60; tries++) {
      const i = Math.floor(Math.random() * this.city.h);
      const j = Math.floor(Math.random() * this.city.w);
      if (!this.isOpenWater(i, j)) continue;
      const angle = Math.random() * Math.PI * 2;
      const speed = FLOTSAM_MIN_SPEED + Math.random() * (FLOTSAM_MAX_SPEED - FLOTSAM_MIN_SPEED);
      return {
        x: j, y: i,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6, // currents run mostly sideways
        art: arts[Math.floor(Math.random() * arts.length)],
        phase: Math.random() * Math.PI * 2,
        bornAt: now,
      };
    }
    return undefined;
  }

  private isOpenWater(i: number, j: number): boolean {
    if (i < 0 || j < 0 || i >= this.city.h || j >= this.city.w) return false;
    const t = this.state.GetTile(this.city, i, j);
    return t.terrain === Terrain.WATER && !t.building && !t.covered;
  }

  // Advance and draw the decorative ship: it cruises along the top ocean band,
  // reversing (and flipping the sprite) when it reaches either side, with a
  // gentle bob so it feels alive.
  private drawShip(now: number) {
    if (this.shipLast === 0) this.shipLast = now;
    const dt = Math.min(0.05, (now - this.shipLast) / 1000); // clamp tab-switch jumps
    this.shipLast = now;

    const minX = SHIP_MARGIN, maxX = Math.max(minX, this.city.w - SHIP_MARGIN);
    this.shipX += this.shipDir * SHIP_SPEED * dt;
    if (this.shipX >= maxX) { this.shipX = maxX; this.shipDir = -1; }
    else if (this.shipX <= minX) { this.shipX = minX; this.shipDir = 1; }

    const img = this.image(SHIP_ICON);
    if (!img.complete || img.naturalWidth === 0) return;

    const p = gridToIso(this.city.h, this.shipX * TILE, (SHIP_ROW + 0.5) * TILE);
    const cx = p.x;
    const cy = p.y + Math.sin(now / 650) * 3;  // bob
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(now / 800) * 0.025);                       // slight rock
    if (this.shipDir > 0) ctx.scale(-1, 1);                        // face travel dir (art faces left)
    ctx.drawImage(img, -SHIP_SIZE / 2, -SHIP_SIZE / 2, SHIP_SIZE, SHIP_SIZE);
    ctx.restore();
  }

  private drawAnimalFarms(now: number) {
    this.refreshAnimalSprites();
    for (const sprite of this.animalSprites) {
      this.drawAnimalSprite(sprite.key, sprite.img, sprite.x, sprite.y, sprite.size, now);
    }
  }

  private refreshAnimalSprites() {
    const version = this.state.mapVersion();
    if (this.animalSpriteCity === this.city && this.animalSpriteVersion === version) return;

    const sprites: AnimalSprite[] = [];
    const liveKeys = new Set<string>();
    for (const t of this.city.productions) {
      if (!t.building || !IsAnimalFarm(t.building.type)) continue;
      const src = GetBuildingMapIconSrc(t.building.type);
      if (!src) continue;
      const img = this.image(src);
      const size = GetBuildingSize(t.building.type);
      const base = this.tileObjectBase(t.i, t.j, size);
      const farmW = size * ISO_TILE_W * 0.94;
      const farmH = Math.max(size * ISO_TILE_H * 3.0, size * TILE * 1.6);
      const farmX = base.x - farmW / 2;
      const farmY = base.y - farmH * 0.71;
      const isz = farmW * 0.16;
      const cx = farmX + farmW / 2, cy = farmY + farmH * 0.60;
      const gap = isz * 1.1;
      const sideLift = isz * 0.45;
      for (let k = 0; k < 3; ++k) {
        const key = `${t.i}:${t.j}:${k}`;
        liveKeys.add(key);
        sprites.push({
          key,
          img,
          x: cx + (k - 1) * gap,
          y: cy - (k === 1 ? 0 : sideLift),
          size: isz,
        });
      }
    }
    for (const key of this.animalAnims.keys()) {
      if (!liveKeys.has(key)) this.animalAnims.delete(key);
    }
    this.animalSprites = sprites;
    this.animalSpriteVersion = version;
    this.animalSpriteCity = this.city;
  }

  private drawAnimalSprite(key: string, img: HTMLImageElement, px: number, py: number, size: number, now: number) {
    let a = this.animalAnims.get(key);
    if (!a) {
      a = { x: 0, y: 0, tx: 0, ty: 0, nextAt: 0, flip: Math.random() < 0.5 };
      this.animalAnims.set(key, a);
    }
    if (now >= a.nextAt) {
      a.tx = (Math.random() - 0.5) * size * 0.42;
      a.ty = (Math.random() - 0.5) * size * 0.30;
      if (Math.abs(a.tx - a.x) > size * 0.08) a.flip = a.tx < a.x;
      else if (Math.random() < 0.25) a.flip = !a.flip;
      a.nextAt = now + 900 + Math.random() * 1500;
    }
    a.x += (a.tx - a.x) * 0.025;
    a.y += (a.ty - a.y) * 0.025;

    const bob = Math.sin(now / 420 + key.length) * size * 0.025;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(px + a.x, py + a.y + bob);
    if (a.flip) ctx.scale(-1, 1);
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    } else {
      ctx.font = `${Math.round(size)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐾', 0, 0);
    }
    ctx.restore();
  }

  // Size the backing store to the viewport (host) in device pixels. The camera
  // transform and smoothing flag are reapplied each frame in frame().
  private ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.max(1, Math.round(this.host.clientWidth * dpr));
    const bh = Math.max(1, Math.round(this.host.clientHeight * dpr));
    if (this.canvas.width !== bw) this.canvas.width = bw;
    if (this.canvas.height !== bh) this.canvas.height = bh;
  }

  private tileObjectBase(i: number, j: number, size: number): { x: number, y: number } {
    const center = gridToIso(this.city.h, (j + size / 2) * TILE, (i + size / 2) * TILE);
    return { x: center.x, y: center.y + size * ISO_TILE_H / 2 };
  }

  private drawCart(cart: Cart, now: number) {
    const visual = this.visual(cart);
    const [tx, ty] = this.target(cart);

    let a = this.anims.get(cart);
    if (!a) {
      a = { fromX: tx, fromY: ty, toX: tx, toY: ty, start: now, cx: tx, cy: ty };
      this.anims.set(cart, a);
    } else if (tx !== a.toX || ty !== a.toY) {
      // New sim sample: start a fresh linear tween from where we are now.
      a.fromX = a.cx; a.fromY = a.cy;
      a.toX = tx; a.toY = ty;
      a.start = now;
    }
    const f = Math.max(0, Math.min(1, (now - a.start) / TWEEN_MS));
    a.cx = a.fromX + (a.toX - a.fromX) * f;
    a.cy = a.fromY + (a.toY - a.fromY) * f;

    const img = this.image(visual.icon);
    const drawY = a.cy + CART_Y_OFFSET;
    if (img.complete && img.naturalWidth > 0) {
      const scale = CART_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      this.ctx.drawImage(img, a.cx - w / 2, drawY - h / 2, w, h);
    } else {
      // Fallback to the emoji while the sprite loads or if it 404s.
      this.ctx.font = `${Math.round(CART_SIZE * 0.46)}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(visual.emoji, a.cx, drawY);
    }
  }

  // Center pixel of the cart for its current path progress.
  private target(cart: Cart): [number, number] {
    const task = cart.task!;
    const path = task.path;
    let f = task.distance > 0 ? task.progress / task.distance : 0;
    if (task.type === ShippingTaskType.RETURNING) f = 1 - f;
    f = Math.max(0, Math.min(1, f));
    const pos = (path.length - 1) * f;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = path[idx];
    const b = path[Math.min(idx + 1, path.length - 1)];
    const gridX = (a.j + (b.j - a.j) * frac + 0.5) * TILE;
    const gridY = (a.i + (b.i - a.i) * frac + 0.5) * TILE;
    const p = gridToIso(this.city.h, gridX, gridY);
    return [p.x, p.y];
  }

  private image(src: string): HTMLImageElement {
    let img = this.images.get(src);
    if (!img) { img = new Image(); img.src = src; this.images.set(src, img); }
    return img;
  }

  private visual(cart: Cart): CartVisual {
    const task = cart.task!;
    if (task.type === ShippingTaskType.PICKING_UP) return CART_VISUALS.fetching;
    if (task.cargo.length > 0) return CART_VISUALS.loaded;
    return CART_VISUALS.empty;
  }
}
