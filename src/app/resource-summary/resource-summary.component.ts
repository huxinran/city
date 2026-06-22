import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { StateService } from '../state.service';
import { StorageItems } from '../utils';
import { Item } from '../storage';
import { repaintOn } from '../live';
import { Resource } from '../types';
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
    return StorageItems(this.state.state.current_city!.storage)
  }

  // Shared lookup so the panel shows every mapped PNG (and any future ones).
  iconSrc(type: Resource): string | undefined {
    return GetResourceIconSrc(type)
  }

  emoji(type: Resource): string {
    return GetResourceEmoji(type)
  }

}
