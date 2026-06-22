import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StateService } from '../state.service';
import { DecimalPipe } from '@angular/common';
import { repaintOn } from '../live';
import { GetResidentIconAsset } from '../building';
import { CountItem } from '../utils';
import { Resource } from '../types';
@Component({
  selector: 'app-status-summary',
  imports: [DecimalPipe],
  templateUrl: './status-summary.component.html',
  styleUrl: './status-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSummaryComponent {
  state  =  inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  icon = GetResidentIconAsset

  // City picker dropdown (opened by clicking the city name).
  citiesOpen = signal(false)
  toggleCities() { this.citiesOpen.update(o => !o) }
  closeCities() { this.citiesOpen.set(false) }
  selectCity(name: string) { this.state.ChangeCity(name); this.closeCities() }

  // Primary construction materials shown in the top bar for quick reference.
  materials = [
    { type: Resource.WOOD, icon: '🪵' },
    { type: Resource.STONE, icon: '🪨' },
    { type: Resource.BRICK, icon: '🧱' },
    { type: Resource.GLASS, icon: '🪟' },
    { type: Resource.STATUE, icon: '🗿' },
  ]

  count(type: Resource): number {
    return CountItem(this.state.state.current_city!.storage, type)
  }
}
