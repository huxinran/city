import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Tile } from '../sim/tile';
import { BuildingComponent } from '../building/building.component';
import { IconComponent } from '../icon/icon.component';
import { GetBuildingIconSrc, GetHouseMapIconSrc } from '../building-icons';
import { StateService } from '../state.service';
import { repaintOn } from '../live';

@Component({
  selector: 'app-tile-detail',
  imports: [BuildingComponent, IconComponent],
  templateUrl: './tile-detail.component.html',
  styleUrl: './tile-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileDetailComponent {
  @Input() tile?: Tile
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame, s.mapVersion]) }

  // Icon for the Selection header. A house uses its tier-specific art so an
  // upgraded house looks different; other buildings use their menu icon.
  headingSrc(tile: Tile): string | undefined {
    const b = tile.building!
    return b.house ? GetHouseMapIconSrc(b.house.tier) : GetBuildingIconSrc(b.type)
  }

  // Header label. A house shows its specific tier name (Cottage/Villa/…)
  // rather than the generic "House" building type.
  headingLabel(tile: Tile): string {
    const b = tile.building!
    return b.house ? b.house.type : b.type
  }
}

