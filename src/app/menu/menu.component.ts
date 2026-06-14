import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { StateService } from '../state.service';
import { BuildingType, Terrain } from '../types'
import { repaintOn } from '../live';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  state = inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }

  // Custom dropdown state (replaces Angular Material's mat-menu).
  open = signal(false)
  submenu = signal<string | null>(null)

  get BuildingType() : typeof BuildingType { return BuildingType}

  get Terrain() : typeof Terrain { return Terrain}

  toggle() {
    this.open.update(o => !o)
    this.submenu.set(null)
  }

  close() {
    this.open.set(false)
    this.submenu.set(null)
  }

  showSub(name: string) {
    this.submenu.update(s => s === name ? null : name)
  }

  setTerrain(t: Terrain) { this.state.SetTerrainType(t); this.close() }
  changeCity(name: string) { this.state.ChangeCity(name); this.close() }
  save() { this.state.Save(); this.close() }
  load() { this.state.Load(); this.close() }
  restart() { this.state.Restart(); this.close() }
  reset() { this.state.Reset(); this.close() }
}
