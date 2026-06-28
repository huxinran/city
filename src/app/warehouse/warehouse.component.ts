import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Tile } from '../sim/tile';
import { RefreshWarehouse } from '../sim/building';
import { repaintOn } from '../live';
import { ResourceSummaryComponent } from '../resource-summary/resource-summary.component';
@Component({
  selector: 'app-warehouse',
  imports: [ResourceSummaryComponent],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseComponent {
  @Input() tile!: Tile;
  constructor() { repaintOn(s => [s.frame]) }

  readyCarts(): number {
    return this.tile.building!.warehouse!.carts.filter(cart => !cart.task).length
  }

  public Upgrade() {
    let warehouse = this.tile!.building!.warehouse!
    warehouse.tier += 1
    RefreshWarehouse(warehouse)
  }

}
