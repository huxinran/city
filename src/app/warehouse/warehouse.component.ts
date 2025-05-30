import { Component, Input } from '@angular/core';
import { Tile } from '../tile';
import { PercentPipe } from '@angular/common';
import { RefreshWarehouse } from '../building';
@Component({
  selector: 'app-warehouse',
  imports: [PercentPipe],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {
  @Input() tile!: Tile;
  
  public Upgrade() {
    let warehouse = this.tile!.building!.warehouse!
    warehouse.tier += 1
    RefreshWarehouse(warehouse)
  }

}
