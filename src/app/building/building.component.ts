import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';

import { ProductionComponent } from "../production/production.component";
import { HouseComponent } from '../house/house.component';
import { ServiceComponent } from '../service/service.component';
import { WarehouseComponent } from '../warehouse/warehouse.component';
import { Tile } from '../tile';
import { ShipyardComponent } from '../shipyard/shipyard.component';
import { DockComponent } from '../dock/dock.component';
import { UniversityComponent } from '../university/university.component';
import { StateService } from '../state.service';
import { repaintOn } from '../live';

@Component({
  selector: 'app-building',
  imports: [ProductionComponent, HouseComponent, ServiceComponent, WarehouseComponent, ShipyardComponent, DockComponent, UniversityComponent],
  templateUrl: './building.component.html',
  styleUrl: './building.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingComponent {
  @Input() tile!: Tile
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame, s.mapVersion]) }
}
