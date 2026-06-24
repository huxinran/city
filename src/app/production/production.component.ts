import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';

import { Tile } from '../tile';
import { ExtraSource } from '../building';
import { CountItem } from '../utils';
import { repaintOn } from '../live';

@Component({
  selector: 'app-production',
  imports: [PercentPipe],
  templateUrl: './production.component.html',
  styleUrl: './production.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionComponent {
  @Input() tile!: Tile
  constructor() { repaintOn(s => [s.frame]) }

  getStockpile(es: ExtraSource): number {
    return CountItem(this.tile.building!.production!.storage, es.resource)
  }
}
