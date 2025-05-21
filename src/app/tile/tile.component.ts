import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { Building, CreateBuilding } from '../building';
import { Item } from '../storage'

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

  public HandleClick() {
    this.state.state.focus_tile = this.tile
    let building_type = this.state.state.build_type
    let terrain_type = this.state.state.terrain_type
    if (building_type == undefined && terrain_type == undefined) {
      return
    }

    if (building_type) {
      if (this.tile.building) {
        return
      }
      this.tile.building = CreateBuilding(building_type!, this.state.state.storage)
    } else if (terrain_type) {
      this.tile.type = terrain_type
    }

  }

  public GetStyle() {
    let color = undefined
    let type = this.tile.type
    if (type == "Land") {
      color = 'lightgreen'
    } else if (type == "Sea") {
      color = 'lightblue'
    } else if (type == "Mountain") {
      color = 'lightgrey'
    } else if (type == "Sand") {
      color = 'lightyellow'
    } else if (type == "Forest") {
      color = 'green'
    }
    let border = undefined
    if (this.state.state.focus_tile?.i == this.tile.i && this.state.state.focus_tile?.j == this.tile.j) {
      border = "2px dashed red"
    }
    return {
      'background-color' : color,
      'border' : border,
    }
  }
}
