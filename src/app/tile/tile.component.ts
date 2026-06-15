import { ChangeDetectionStrategy, Component, inject, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { Tile } from '../tile';
import { StateService } from '../state.service';
import { BuildingType, Terrain } from '../types'
import { GetBuildingSize, IsFarmBuilding, IsWorkshopBuilding } from '../building'
import { GetBuildingIconName, GetWorkshopProductIconName } from '../building-icons'

@Component({
  selector: 'app-tile',
  imports: [CommonModule, NgIconComponent],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileComponent {
  @Input() tile!: Tile
  state  =  inject(StateService)

  get size(): number {
    return this.tile.building ? GetBuildingSize(this.tile.building.type) : 1
  }

  get isRoad(): boolean {
    return this.tile.building?.type == BuildingType.ROAD
  }

  get isFarm(): boolean {
    let type = this.tile.building?.type
    return type != undefined && IsFarmBuilding(type)
  }

  get isWorkshop(): boolean {
    let type = this.tile.building?.type
    return type != undefined && IsWorkshopBuilding(type)
  }


  // Place every tile explicitly on the grid so multi-tile buildings can span
  // their footprint. Covered tiles are hidden; the anchor spans over them.
  @HostBinding('style.grid-row-start') get rowStart() { return this.tile.i + 1 }
  @HostBinding('style.grid-column-start') get colStart() { return this.tile.j + 1 }
  @HostBinding('style.grid-row-end') get rowEnd() { return 'span ' + this.size }
  @HostBinding('style.grid-column-end') get colEnd() { return 'span ' + this.size }
  @HostBinding('style.display') get hostDisplay() { return this.tile.covered ? 'none' : 'block' }

  public onBuildingDragStart(event: DragEvent) {
    if (!this.tile.building || this.isRoad) return
    event.dataTransfer?.setData('text/plain', 'move')
    this.state.SetBuildType(this.tile.building.type)  // clears move_source
    this.state.move_source = this.tile
    this.state.dragging = true
  }

  public onBuildingDragEnd() {
    this.state.dragging = false
    this.state.move_source = undefined
  }

  public HandleClick() {
    let city = this.state.state.current_city!
    let building_type = this.state.state.build_type
    let terrain_type = this.state.state.terrain_type

    if (building_type) {
      this.state.ApplyBuild(this.tile)
      return
    }
    if (terrain_type) {
      this.tile.terrain = terrain_type
      city.focus_tile = this.tile
      this.state.bumpMap()
      return
    }
    // Plain selection: focus the building's anchor if a covered tile was clicked.
    city.focus_tile = this.tile.covered
      ? this.state.GetTile(city, this.tile.anchor_i, this.tile.anchor_j)
      : this.tile
    this.state.bumpMap()
  }

  public GetType() {
    if (this.tile.building?.house != undefined) {
      return this.tile.building?.house?.type
    }
    return this.tile.building?.type
  }

  public GetIconName(): string {
    let type = this.tile.building?.type
    if (type == undefined) return ''
    return GetBuildingIconName(type)
  }

  public GetProductIconName(): string {
    let type = this.tile.building?.type
    if (type == undefined) return ''
    return GetWorkshopProductIconName(type)
  }

  get isTerrainTree(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.terrain == Terrain.TREE
  }

  get isTerrainRock(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.terrain == Terrain.ROCK
  }

  // Scales the icon with building footprint size.
  public get iconSize(): string {
    return `${this.size * 14 + 8}px`
  }

  public get isFocused(): boolean {
    let f = this.state.state.current_city!.focus_tile
    return f?.i == this.tile.i && f?.j == this.tile.j
  }

  private GetBuildingColor(): string {
    let b = this.tile.building!
    if (b.house) return 'linear-gradient(145deg, #f6d79b, #e0a85a)'
    if (b.production) return 'linear-gradient(145deg, #e6b483, #c47f4d)'
    if (b.service) return 'linear-gradient(145deg, #aee0f0, #6fa8c9)'
    if (b.warehouse) return 'linear-gradient(145deg, #d8c8ac, #ab9576)'
    if (b.shipyard || b.dock) return 'linear-gradient(145deg, #c0cdd6, #8298a8)'
    if (b.type == BuildingType.ROAD) return 'linear-gradient(145deg, #b8b3a8, #948e82)'
    return 'linear-gradient(145deg, #e3d2b0, #c9b48c)'
  }

  private _terrain?: Terrain
  private _terrainStyle: any
  private _buildingKey?: string
  private _buildingStyle: any

  private TerrainBackground(terrain: Terrain): string {
    if (terrain == Terrain.GRASS) return 'linear-gradient(135deg, #b6e08a, #8ec96a)'
    if (terrain == Terrain.SEA) return 'linear-gradient(135deg, #8fd3f0, #56a9d6)'
    if (terrain == Terrain.ROCK) return 'linear-gradient(135deg, #c4c2bd, #97948d)'
    if (terrain == Terrain.LAND) return 'linear-gradient(135deg, #efe6b8, #ddcf8c)'
    if (terrain == Terrain.TREE) return 'linear-gradient(135deg, #5aa05a, #3c7a3c)'
    return 'lightgreen'
  }

  // Cache styles so a stable object reference is returned when nothing changed,
  // letting ngStyle skip work across thousands of tiles each tick.
  public GetTerrainStyle() {
    this.state.mapVersion()  // repaint this tile on map edits (OnPush dependency)
    if (this._terrain !== this.tile.terrain) {
      this._terrain = this.tile.terrain
      this._terrainStyle = { 'background': this.TerrainBackground(this.tile.terrain) }
    }
    return this._terrainStyle
  }

  public GetBuildingStyle() {
    let key = this.tile.building?.type ?? ''
    if (this._buildingKey !== key) {
      this._buildingKey = key
      // Roads get their background from the .cobble class instead.
      this._buildingStyle = key == BuildingType.ROAD ? {} : { 'background': this.GetBuildingColor() }
    }
    return this._buildingStyle
  }
}
