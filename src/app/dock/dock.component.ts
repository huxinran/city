import { ChangeDetectionStrategy, Component, inject, Input,  } from '@angular/core';

import { Tile } from '../tile';
import { StateService } from '../state.service';
import { CityName, Resource } from '../types'
import { Route, Ship } from '../building';
import { Item } from '../storage';
import { StorageItems } from '../utils';
import { City } from '../city';
import { repaintOn } from '../live';

import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-dock',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockComponent {
  @Input() tile!: Tile
  from? : City
  to? : City
  resource?: Item
  amount : number = 0
  ship? : Ship
  state  =  inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  get Cities() : string[] { return Object.keys(CityName) }

  get Resources() : string[] { return Object.keys(Resource) }

  items(): Item[] {
    return StorageItems(this.state.state.current_city!.storage)
  }

  CreateRoute() {
    let new_route = new Route(this.from!.name, this.to!.name, this.resource!.type, this.amount, this.ship)
    this.state.state.current_city!.routes.push(new_route)
  }
}
