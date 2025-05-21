import { Component, Input } from '@angular/core';
import { Building } from '../building';
import { ProductionComponent } from "../production/production.component";
import { HouseComponent } from '../house/house.component';
import { NgIf } from '@angular/common';
import { Tile } from '../tile';

@Component({
  selector: 'app-building',
  imports: [ProductionComponent, ProductionComponent, HouseComponent, NgIf],
  templateUrl: './building.component.html',
  styleUrl: './building.component.css'
})
export class BuildingComponent {
  @Input() tile!: Tile
}
