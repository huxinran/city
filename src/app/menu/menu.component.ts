import { Component, inject } from '@angular/core';
import { StateService } from '../state.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BuildingType, Terrain } from '../types'
@Component({
  selector: 'app-menu',
  imports: [MatButtonModule, MatMenuModule, MatCardModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  state = inject(StateService)

  get BuildingType() : typeof BuildingType { return BuildingType}

  get Terrain() : typeof Terrain { return Terrain}
}
