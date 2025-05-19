import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { Building, CreateBuilding } from '../building';
import { Items } from '../storage'

@Component({
  selector: 'app-tile',
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css'
})
export class TileComponent {
  @Input() tile!: Tile
  @Input() state!: StateService

  constructor() {

  }

  HandleClick() {
    this.state.state.focus_tile = this.tile
    if (this.tile.building) {
      return
    }
    
    let building_type = this.state.state.buildType
    if (building_type == undefined) {
      return
    }
    this.tile.building = CreateBuilding(building_type!)
  }

  public getStyle() {
    if (this.tile.type == "Land") {
      return {
        'background-color' : 'lightgreen' 
      }
    } else if (this.tile.type == "Sea") {
        return {
          'background-color' : 'lightblue'
        }
    }
    return {
      'background-color' : 'yellow'
    }
  }
}
