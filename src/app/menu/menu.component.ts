import { Component, inject } from '@angular/core';

import { StateService } from '../state.service';
import { BuildingType, Terrain } from '../types'

import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-menu',
  imports: [MatMenuModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  state = inject(StateService)

  get BuildingType() : typeof BuildingType { return BuildingType}

  get Terrain() : typeof Terrain { return Terrain}
}
