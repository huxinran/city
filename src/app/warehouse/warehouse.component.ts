import { Component, Input } from '@angular/core';
import { Tile } from '../tile';

@Component({
  selector: 'app-warehouse',
  imports: [],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {
  @Input() tile!: Tile;
}
