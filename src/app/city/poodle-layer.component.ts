import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { applyCameraTransform } from '../camera';
import { GRID_TILE, gridToIso } from '../isometric';
import { City } from '../sim/city';
import { StateService } from '../state.service';

const TILE = GRID_TILE;
const POODLE_SHEETS = {
  se: 'assets/used/actors/poodle-walk-se.png',
  sw: 'assets/used/actors/poodle-walk-sw.png',
  ne: 'assets/used/actors/poodle-walk-ne.png',
  nw: 'assets/used/actors/poodle-walk-nw.png',
};
const FRAME_SIZE = 96;
const FRAME_COUNT = 4;
const DRAW_SIZE = 42;
const SPEED_TILES_PER_SECOND = 3.0;
const ANIM_MS = 140;

@Component({
  selector: 'app-poodle-layer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { position: absolute; inset: 0; pointer-events: none; z-index: 6; }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  `],
  template: ``,
})
export class PoodleLayerComponent implements OnInit, OnDestroy {
  @Input() city!: City;

  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private state = inject(StateService);
  private zone = inject(NgZone);
  private raf = 0;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private sheets = new Map<string, HTMLImageElement>();
  private last = 0;

  ngOnInit() {
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
      position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%',
    });
    this.ctx = this.canvas.getContext('2d')!;
    this.host.appendChild(this.canvas);
    for (const src of Object.values(POODLE_SHEETS)) {
      const img = new Image();
      img.src = src;
      this.sheets.set(src, img);
    }
    this.zone.runOutsideAngular(() => {
      const loop = (now: number) => { this.frame(now); this.raf = requestAnimationFrame(loop); };
      this.raf = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
  }

  private frame(now: number) {
    this.ensureSize();
    const dpr = window.devicePixelRatio || 1;
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.state.poodle.mode) return;

    const dt = this.last === 0 ? 0 : Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.state.EnsurePoodleOnCurrentCity();
    this.advance(dt);

    applyCameraTransform(ctx, this.state.camera, dpr);
    ctx.imageSmoothingEnabled = false;
    this.drawPoodle(now);
  }

  private advance(dt: number) {
    const poodle = this.state.poodle;
    const target = poodle.path[0];
    if (!target) return;

    const dx = target.j - poodle.x;
    const dy = target.i - poodle.y;
    const dist = Math.hypot(dx, dy);
    const step = SPEED_TILES_PER_SECOND * dt;
    poodle.facing = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'se' : 'nw')
      : (dy >= 0 ? 'sw' : 'ne');
    if (dist <= step || dist < 0.001) {
      poodle.x = target.j;
      poodle.y = target.i;
      poodle.i = target.i;
      poodle.j = target.j;
      poodle.path.shift();
      return;
    }
    poodle.x += dx / dist * step;
    poodle.y += dy / dist * step;
  }

  private drawPoodle(now: number) {
    const poodle = this.state.poodle;
    const p = gridToIso(this.city.h, (poodle.x + 0.5) * TILE, (poodle.y + 0.5) * TILE);
    const moving = poodle.path.length > 0;
    const frame = moving ? Math.floor(now / ANIM_MS) % FRAME_COUNT : 0;
    const bob = moving ? Math.sin(now / 95) * 1.5 : 0;
    const img = this.sheets.get(POODLE_SHEETS[poodle.facing]);
    const ctx = this.ctx;
    const x = p.x - DRAW_SIZE / 2;
    const y = p.y - DRAW_SIZE + 6 + bob;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.38)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    if (img?.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, x, y, DRAW_SIZE, DRAW_SIZE);
    } else {
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐩', p.x, p.y - 18);
    }
    ctx.restore();
  }

  private ensureSize() {
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.max(1, Math.round(this.host.clientWidth * dpr));
    const bh = Math.max(1, Math.round(this.host.clientHeight * dpr));
    if (this.canvas.width !== bw) this.canvas.width = bw;
    if (this.canvas.height !== bh) this.canvas.height = bh;
  }
}
