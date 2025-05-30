import { Component, inject, Input } from '@angular/core';
import { Ship, ShipBlueprint, Shipyard } from '../building';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { PercentPipe } from '@angular/common';
import { MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TakeItems } from '../utils';
import { ProductionStatus } from '../types';

@Component({
  selector: 'app-shipyard',
  imports: [MatFormFieldModule, MatSelectModule, PercentPipe],
  templateUrl: './shipyard.component.html',
  styleUrl: './shipyard.component.css'
})
export class ShipyardComponent {
  @Input() tile!: Tile
  
  state  =  inject(StateService)
  

  public Build(blueprint?: ShipBlueprint) {
    if (!blueprint) {
      return 
    }
    
    let shipyard = this.tile!.building!.shipyard!
    if (TakeItems(this.state.state.current_city!.storage, blueprint.cost)) {
      shipyard.status = ProductionStatus.IN_PROGRESS
      ProductionStatus.READY
    }
  }

  get ProductionStatus(): typeof ProductionStatus { return ProductionStatus}
}
