import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';

import { Tile } from '../sim/tile';
import { ExtraSource } from '../sim/building';
import { GetResidentIcon, GetResidentIconAsset, IsFarmBuilding } from '../sim/building';
import { Resident, Resource } from '../sim/types';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';
import { IconComponent } from '../icon/icon.component';
import { CountItem } from '../sim/utils';
import { repaintOn } from '../live';

@Component({
  selector: 'app-production',
  imports: [PercentPipe, IconComponent],
  templateUrl: './production.component.html',
  styleUrl: './production.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionComponent {
  @Input() tile!: Tile
  constructor() { repaintOn(s => [s.frame]) }

  isFarm(): boolean {
    return IsFarmBuilding(this.tile.building!.type)
  }

  getStockpile(es: ExtraSource): number {
    return CountItem(this.tile.building!.production!.storage, es.resource)
  }

  workerSrc(t: Resident): string { return GetResidentIconAsset(t) }
  workerEmoji(t: Resident): string { return GetResidentIcon(t) }
  resSrc(t: Resource): string | undefined { return GetResourceIconSrc(t) }
  resEmoji(t: Resource): string { return GetResourceEmoji(t) }
}
