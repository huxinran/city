import { Component, Input } from '@angular/core';
import { Production } from '../building';
import { PercentPipe } from '@angular/common';
import { Tile } from '../tile';

@Component({
  selector: 'app-production',
  imports: [PercentPipe ],
  templateUrl: './production.component.html',
  styleUrl: './production.component.css'
})
export class ProductionComponent {
  @Input() tile!: Tile
}
