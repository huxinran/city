import { Component, inject, Input,  } from '@angular/core';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { CityName, Resource } from '../types'
import { Dock } from '../building';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
  selector: 'app-dock',
  imports: [MatSelectModule, MatFormFieldModule, MatInputModule, MatExpansionModule],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css'
})
export class DockComponent {
  @Input() tile!: Tile
  from? : CityName 
  to? : CityName
  resource?: Resource
  num : number = 0
  state  =  inject(StateService)

  get Cities() : string[] { return Object.keys(CityName) }

  get Resources() : string[] { return Object.keys(Resource) }

  CreateRoute() {

  }
}
