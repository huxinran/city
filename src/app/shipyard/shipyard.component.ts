import { Component, inject, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Tile } from '../tile';
import { StateService } from '../state.service';
import { TakeItems } from '../utils';
import { ProductionStatus } from '../types';

import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-shipyard',
  imports: [PercentPipe, FormsModule, SelectModule, ButtonModule, PanelModule],
  templateUrl: './shipyard.component.html',
  styleUrl: './shipyard.component.css'
})
export class ShipyardComponent {
  @Input() tile!: Tile
  
  state  =  inject(StateService)

  public BuildShip() {
    console.log("a")
    if (!this.tile?.building?.shipyard?.selected) {
      console.log("exit")
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
