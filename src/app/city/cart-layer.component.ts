import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { City } from '../city';
import { Cart } from '../building';
import { ShippingTaskType } from '../types';

const TILE = 48;
// Matches the old DOM `transition: left/top 0.2s linear`. The sim updates a
// cart's progress ~5x/sec; we tween between those samples over this window so
// the canvas draws smooth 60fps motion instead of stepping 5x/sec.
const TWEEN_MS = 200;

// A cart's visual state, derived from its current task.
type CartVisual = { icon: string, emoji: string }
const CART_VISUALS = {
  fetching: { icon: 'assets/used/buildings/cart-fetching.png', emoji: '🛺' },
  loaded:   { icon: 'assets/used/buildings/cart-loaded.png',   emoji: '📦' },
  empty:    { icon: 'assets/used/buildings/cart-empty.png',    emoji: '🛒' },
} satisfies Record<string, CartVisual>

// Per-cart animation state. `to` is the latest position the sim implies; `cx/cy`
// is where we actually drew last frame; on a new `to` we tween from cx/cy.
interface CartAnim { fromX: number, fromY: number, toX: number, toY: number, start: number, cx: number, cy: number }

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
    canvas { position: absolute; top: 0; left: 0; }
  `],
  template: ``,
})
export class CartLayerComponent implements OnInit, OnDestroy {
  @Input() city!: City;

  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private zone = inject(NgZone);
  private raf = 0;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private anims = new Map<Cart, CartAnim>();
  private images = new Map<string, HTMLImageElement>();

  ngOnInit() {
    this.canvas = document.createElement('canvas');
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

  // One animation frame: size the canvas to the grid, clear it, then tween and
  // draw every active cart. No Angular involvement.
  private frame() {
    this.ensureSize();
    const ctx = this.ctx;
    const now = performance.now();
    ctx.clearRect(0, 0, this.city.w * TILE, this.city.h * TILE);
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const seen = new Set<Cart>();
    for (const t of this.city.warehouses) {
      const warehouse = t.building?.warehouse;
      if (!warehouse) continue;
      for (const c of warehouse.carts) {
        if (!c.task?.path || c.task.path.length <= 1) continue;
        seen.add(c);
        this.drawCart(c, now);
      }
    }
    // Drop animation state for carts that are no longer active.
    for (const cart of this.anims.keys()) {
      if (!seen.has(cart)) this.anims.delete(cart);
    }
  }

  // Backing store must track the grid pixel size and devicePixelRatio so pixel
  // art stays crisp. Setting canvas.width/height resets context state, so the
  // transform + smoothing flag are reapplied here.
  private ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.city.w * TILE, h = this.city.h * TILE;
    if (this.canvas.width === Math.round(w * dpr) && this.canvas.height === Math.round(h * dpr)) return;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
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
    if (img.complete && img.naturalWidth > 0) {
      this.ctx.drawImage(img, a.cx - TILE / 2, a.cy - TILE / 2, TILE, TILE);
    } else {
      // Fallback to the emoji while the sprite loads or if it 404s.
      this.ctx.font = '22px serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(visual.emoji, a.cx, a.cy);
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
    const x = (a.j + (b.j - a.j) * frac + 0.5) * TILE;
    const y = (a.i + (b.i - a.i) * frac + 0.5) * TILE;
    return [x, y];
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
