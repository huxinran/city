import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { City } from '../city';
import { Cart } from '../building';
import { ShippingTaskType } from '../types';
import { repaintOn } from '../live';

const TILE = 48;

// A cart's visual state, derived from its current task. Add a new state here
// (icon + emoji) and map to it in cartState() — the template needs no changes.
type CartVisual = { icon: string, emoji: string }
const CART_VISUALS = {
  fetching: { icon: 'assets/used/buildings/cart-fetching.png', emoji: '🛺' },
  loaded:   { icon: 'assets/used/buildings/cart-loaded.png',   emoji: '📦' },
  empty:    { icon: 'assets/used/buildings/cart-empty.png',    emoji: '🛒' },
} satisfies Record<string, CartVisual>

@Component({
  selector: 'app-cart-layer',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
    .cart {
      position: absolute; transform: translate(-50%, -50%);
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.65));
      transition: left 0.2s linear, top 0.2s linear;
      will-change: left, top;
    }
    .cart-img { width: 48px; height: 48px; display: block; image-rendering: pixelated; object-fit: contain; }
    .cart-fallback { display: none; font-size: 22px; line-height: 1; }
  `],
  template: `
    @for (cart of activeCarts; track cart) {
      <div class="cart" [ngStyle]="cartStyle(cart)">
        <img class="cart-img" [src]="cartState(cart).icon" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <span class="cart-fallback">{{ cartState(cart).emoji }}</span>
      </div>
    }
  `,
})
export class CartLayerComponent {
  @Input() city!: City;
  constructor() { repaintOn(s => [s.frame]) }

  get activeCarts(): Cart[] {
    const carts: Cart[] = []
    for (const t of this.city.warehouses) {
      const warehouse = t.building?.warehouse
      if (!warehouse) continue
      for (const c of warehouse.carts) {
        if (c.task?.path && c.task.path.length > 1) carts.push(c)
      }
    }
    return carts
  }

  // Loaded going out to deliver, empty heading back, or off to fetch a pickup.
  cartState(cart: Cart): CartVisual {
    const task = cart.task!
    if (task.type === ShippingTaskType.PICKING_UP) return CART_VISUALS.fetching
    if (task.cargo.length > 0) return CART_VISUALS.loaded
    return CART_VISUALS.empty
  }

  cartStyle(cart: Cart) {
    const task = cart.task!
    const path = task.path
    let f = task.distance > 0 ? task.progress / task.distance : 0
    if (task.type === ShippingTaskType.RETURNING) f = 1 - f
    f = Math.max(0, Math.min(1, f))
    const pos = (path.length - 1) * f
    const idx = Math.floor(pos)
    const frac = pos - idx
    const a = path[idx]
    const b = path[Math.min(idx + 1, path.length - 1)]
    return {
      left: (a.j + (b.j - a.j) * frac + 0.5) * TILE + 'px',
      top:  (a.i + (b.i - a.i) * frac + 0.5) * TILE + 'px',
    }
  }
}
