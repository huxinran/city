import { Component, Input } from '@angular/core';
import { ProductionBuilding } from '../building';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-production',
  imports: [PercentPipe ],
  templateUrl: './production.component.html',
  styleUrl: './production.component.css'
})
export class ProductionComponent {
  @Input() production!: ProductionBuilding
}
