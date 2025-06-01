import { Component, inject, Input } from '@angular/core';
import { Tile } from '../tile';
import { BuildingComponent } from '../building/building.component';
import { StateService } from '../state.service';

@Component({
  selector: 'app-tile-detail',
  imports: [BuildingComponent],
  templateUrl: './tile-detail.component.html',
  styleUrl: './tile-detail.component.css'
})
export class TileDetailComponent {
  @Input() tile?: Tile
  state = inject(StateService)
}

