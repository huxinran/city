import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { City } from '../city';
import { Cart } from '../building';
import { ShippingTaskType } from '../types';
import { repaintOn } from '../live';

const TILE = 48;

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
    .cart-svg { width: 22px; height: 22px; display: block; }
  `],
  template: `
    @for (cart of activeCarts; track cart) {
      <div class="cart" [ngStyle]="cartStyle(cart)">
        <svg class="cart-svg" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="1" x2="5" y2="9" stroke="#3a2208" stroke-width="2" stroke-linecap="round"/>
          <rect x="4" y="7" width="13" height="9" fill="#c8872a" stroke="#5a3200" stroke-width="1.5" rx="1"/>
          <line x1="7" y1="16" x2="15" y2="16" stroke="#3a2208" stroke-width="1.5"/>
          <circle cx="7" cy="19" r="2.5" fill="#3a2208"/>
          <circle cx="15" cy="19" r="2.5" fill="#3a2208"/>
        </svg>
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
