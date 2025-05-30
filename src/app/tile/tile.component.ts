import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { Building, CreateBuilding } from '../building';
import { Item } from '../storage'
import { BuildingType, Terrain } from '../types'

@Component({
  selector: 'app-tile',
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css'
})
export class TileComponent {
  @Input() tile!: Tile
  state  =  inject(StateService)
  
  public HandleClick() {
    this.state.state.current_city!.focus_tile = this.tile
    let building_type = this.state.state.build_type
    let terrain_type = this.state.state.terrain_type
    if (building_type == undefined && terrain_type == undefined) {
      return
    }

    if (building_type) {
      if (building_type == BuildingType.DELETE) {
        this.tile.building = undefined
        return
      }
      if (this.tile.building) {
        return
      }
      this.tile.building = CreateBuilding(building_type!, this.state.state.current_city!.storage)
    } else if (terrain_type) {
      this.tile.type = terrain_type
    }

  }
  public GetType() {
    if (this.tile.building?.house != undefined) {
      return this.tile.building?.house?.type
    }
    return this.tile.building?.type
  }


  public GetStyle() {
    let color = undefined
    let type = this.tile.type
    if (type == Terrain.GRASS) {
      color = 'lightgreen'
    } else if (type == Terrain.SEA) {
      color = 'lightblue'
    } else if (type == Terrain.MOUNTAIN) {
      color = 'lightgrey'
    } else if (type == Terrain.LAND) {
      color = 'lightyellow'
    } else if (type == Terrain.FOREST) {
      color = 'green'
    }
    let border = undefined
    if (this.state.state.current_city!.focus_tile?.i == this.tile.i && this.state.state.current_city!.focus_tile?.j == this.tile.j) {
      border = "2px dashed red"
    }
    return {
      'background-color' : color,
      'border' : border,
    }
  }
}
