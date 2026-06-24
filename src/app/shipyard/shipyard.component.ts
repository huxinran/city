import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Tile } from '../sim/tile';
import { StateService } from '../state.service';
import { TakeItems } from '../sim/utils';
import { ProductionStatus } from '../sim/types';
import { repaintOn } from '../live';

@Component({
  selector: 'app-shipyard',
  imports: [PercentPipe, FormsModule],
  templateUrl: './shipyard.component.html',
  styleUrl: './shipyard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipyardComponent {
  @Input() tile!: Tile

  state  =  inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  public BuildShip() {
    if (!this.tile?.building?.shipyard?.selected) {
      return
    }

    let shipyard = this.tile!.building!.shipyard!
    if (TakeItems(this.state.state.current_city!.storage, shipyard.selected!.cost)) {
      shipyard.status = ProductionStatus.IN_PROGRESS
      ProductionStatus.READY
    }
  }

  get ProductionStatus(): typeof ProductionStatus { return ProductionStatus}
}
