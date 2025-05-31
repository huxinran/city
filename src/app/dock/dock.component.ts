import { Component, inject, Input,  } from '@angular/core';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { CityName, Resource } from '../types'
import { Route, Ship } from '../building';
import { Item } from '../storage';
import { City } from '../city';

import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-dock',
  imports: [ScrollPanelModule, SelectModule, ButtonModule, AccordionModule, FormsModule, InputNumberModule, TableModule, PanelModule],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css'
})
export class DockComponent {
  @Input() tile!: Tile
  from? : City 
  to? : City
  resource?: Item
  amount : number = 0
  ship? : Ship
  state  =  inject(StateService)

  get Cities() : string[] { return Object.keys(CityName) }

  get Resources() : string[] { return Object.keys(Resource) }

  CreateRoute() {
    let new_route = new Route(this.from!.name, this.to!.name, this.resource!.type, this.amount, this.ship)
    this.state.state.current_city!.routes.push(new_route)
  }
}
