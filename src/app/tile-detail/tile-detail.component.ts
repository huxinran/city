import { Component, Input } from '@angular/core';
import { Tile } from '../tile';
import { MatCardModule} from '@angular/material/card';
import { NgIf } from '@angular/common';
import { BuildingComponent } from '../building/building.component';

@Component({
  selector: 'app-tile-detail',
  imports: [MatCardModule, NgIf, BuildingComponent],
  templateUrl: './tile-detail.component.html',
  styleUrl: './tile-detail.component.css'
})
export class TileDetailComponent {
  @Input() tile?: Tile

  constructor() {

  }
}
