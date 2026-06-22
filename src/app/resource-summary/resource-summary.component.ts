import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { StateService } from '../state.service';
import { StorageItems } from '../utils';
import { Item } from '../storage';
import { repaintOn } from '../live';
import { Resource } from '../types';

const RESOURCE_ICON_BASE = 'assets/resource-icons-cute-64/'
const RESOURCE_ICON_FILES: { [key: string]: string } = {
  [Resource.APPLE]:  'apple.png',
  [Resource.BREAD]:  'bread.png',
  [Resource.CABBAGE]: 'lettuce.png',
  [Resource.EGG]:    'chicken.png',
  [Resource.FLOUR]:  'flour.png',
  [Resource.GRAPE]:  'grape.png',
  [Resource.MILK]:   'cow.png',
  [Resource.OLIVE]:  'olive.png',
  [Resource.PORK]:   'pig.png',
  [Resource.WHEAT]:  'wheat.png',
  [Resource.WOOL]:   'sheep.png',
}


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
    return StorageItems(this.state.state.current_city!.storage)
  }

  iconSrc(type: Resource): string | undefined {
    const file = RESOURCE_ICON_FILES[type]
    return file ? `${RESOURCE_ICON_BASE}${file}` : undefined
  }

}
