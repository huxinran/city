import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { StateService } from '../state.service';
import { Item } from '../storage';
import { repaintOn } from '../live';
import { Resource, CityName, CITY_EXCLUSIVE_RESOURCES } from '../types';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';


@Component({
  selector: 'app-resource-summary',
  imports: [DecimalPipe],
  templateUrl: './resource-summary.component.html',
  styleUrl: './resource-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceSummaryComponent {
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  items(): Item[] {
    const city = this.state.state.current_city!
    const otherCityResources = new Set<Resource>(
      Object.values(CityName)
        .filter(n => n !== city.name)
        .flatMap(n => CITY_EXCLUSIVE_RESOURCES[n] ?? [])
    )
    return Object.values(Resource)
      .filter(r => !otherCityResources.has(r))
      .map(type => new Item(type, city.storage.amounts[type] ?? 0))
  }

  // Shared lookup so the panel shows every mapped PNG (and any future ones).
  iconSrc(type: Resource): string | undefined {
    return GetResourceIconSrc(type)
  }

  emoji(type: Resource): string {
    return GetResourceEmoji(type)
  }

}
