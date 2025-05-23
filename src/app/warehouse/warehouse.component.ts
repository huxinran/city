import { Component, Input } from '@angular/core';
import { Tile } from '../tile';
import { PercentPipe } from '@angular/common';
@Component({
  selector: 'app-warehouse',
  imports: [PercentPipe],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {
  @Input() tile!: Tile;
}
