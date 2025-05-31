import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { BuildingType, Terrain } from '../types'
import { CreateBuilding } from '../building'

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
      this.tile.terrain = terrain_type
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
    let terrain = this.tile.terrain
    if (terrain == Terrain.GRASS) {
      color = 'lightgreen'
    } else if (terrain == Terrain.SEA) {
      color = 'lightblue'
    } else if (terrain == Terrain.MOUNTAIN) {
      color = 'lightgrey'
    } else if (terrain == Terrain.LAND) {
      color = 'lightyellow'
    } else if (terrain == Terrain.FOREST) {
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
