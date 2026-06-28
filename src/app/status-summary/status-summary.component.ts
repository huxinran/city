import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StateService } from '../state.service';
import { DecimalPipe } from '@angular/common';
import { repaintOn } from '../live';
import { GetResidentIconAsset } from '../sim/building';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';
import { GetCityCrestSrc } from '../city-icons';
import { CountItem } from '../sim/utils';
import { Resource } from '../sim/types';
import { IconComponent } from '../icon/icon.component';
@Component({
  selector: 'app-status-summary',
  imports: [DecimalPipe, IconComponent],
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
  crest(name: string): string | undefined { return GetCityCrestSrc(name) }

  // Primary construction materials shown in the top bar for quick reference.
  materials: Resource[] = [
    Resource.TIMBER,
    Resource.STONE_BLOCKS,
    Resource.BRICK,
    Resource.STEEL,
    Resource.WINDOW,
  ]

  // Gold is the currency, rendered with the coin icon.
  goldType = Resource.GOLD

  resSrc(type: Resource): string | undefined { return GetResourceIconSrc(type) }
  resEmoji(type: Resource): string { return GetResourceEmoji(type) }

  count(type: Resource): number {
    return CountItem(this.state.state.current_city!.storage, type)
  }
}
