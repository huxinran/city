import { Component, inject, Input } from '@angular/core';

import { ProductionComponent } from "../production/production.component";
import { HouseComponent } from '../house/house.component';
import { ServiceComponent } from '../service/service.component';
import { WarehouseComponent } from '../warehouse/warehouse.component';
import { Tile } from '../tile';
import { ShipyardComponent } from '../shipyard/shipyard.component';
import { DockComponent } from '../dock/dock.component';
import { StateService } from '../state.service';

@Component({
  selector: 'app-building',
  imports: [ProductionComponent, ProductionComponent, HouseComponent, ServiceComponent, WarehouseComponent, ShipyardComponent, DockComponent],
  templateUrl: './building.component.html',
  styleUrl: './building.component.css'
})
export class BuildingComponent {
  @Input() tile!: Tile
  state = inject(StateService)
}
