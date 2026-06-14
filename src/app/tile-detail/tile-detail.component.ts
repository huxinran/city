import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Tile } from '../tile';
import { BuildingComponent } from '../building/building.component';
import { StateService } from '../state.service';
import { repaintOn } from '../live';

@Component({
  selector: 'app-tile-detail',
  imports: [BuildingComponent],
  templateUrl: './tile-detail.component.html',
  styleUrl: './tile-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileDetailComponent {
  @Input() tile?: Tile
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame, s.mapVersion]) }
}

