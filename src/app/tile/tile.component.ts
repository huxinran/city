import { ChangeDetectionStrategy, Component, inject, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Tile } from '../tile';
import { StateService } from '../state.service';
import { BuildingType, Terrain, Feature } from '../types'
import { GetBuildingSize, IsFarmBuilding, IsWorkshopBuilding, GetBuildingIcon, GetWorkshopProductIcon } from '../building'
import { GetBuildingIconSrc } from '../building-icons'
import { IconComponent } from '../icon/icon.component'

const MAP_TILE_ASSETS: { [key: string]: { file: string, color: string } } = {
  [Terrain.WATER]: { file: 'sea.png', color: '#4ba6d4' },
  [Terrain.GRASS]: { file: 'grass.png', color: '#8ec96a' },
  [Terrain.SAND]:  { file: 'sand.png', color: '#f0dd99' },
}

const MAP_TILE_BASE = 'assets/map-tiles-cute-64/'
const ROAD_TILE_ASSET = MAP_TILE_BASE + 'cobblestone-road.png'

@Component({
  selector: 'app-tile',
  imports: [CommonModule, IconComponent],
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
    let feature_type = this.state.state.feature_type

    if (building_type) {
      this.state.ApplyBuild(this.tile)
      return
    }
    if (feature_type) {
      // Features paint onto bare land only — not water, not occupied tiles.
      if (this.tile.terrain != Terrain.WATER && !this.tile.building && !this.tile.covered) {
        this.tile.feature = feature_type
        city.focus_tile = this.tile
        this.state.bumpMap()
      }
      return
    }
    if (terrain_type) {
      this.tile.terrain = terrain_type
      // Water can't hold a tree/rock feature.
      if (terrain_type == Terrain.WATER) {
        this.tile.feature = undefined
      }
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

  public GetIcon(): string {
    let type = this.tile.building?.type
    if (type == undefined) return ''
    return GetBuildingIcon(type)
  }

  // Image URL for the building icon, or undefined to fall back to the emoji.
  public get buildingIconSrc(): string | undefined {
    let type = this.tile.building?.type
    return type ? GetBuildingIconSrc(type) : undefined
  }

  public GetProductIcon(): string {
    let type = this.tile.building?.type
    if (type == undefined) return ''
    return GetWorkshopProductIcon(type)
  }

  get isFeatureTree(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.feature == Feature.TREE
  }

  get isFeatureRock(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.feature == Feature.ROCK
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

  private TerrainStyle(terrain: Terrain): any {
    let asset = MAP_TILE_ASSETS[terrain] ?? MAP_TILE_ASSETS[Terrain.GRASS]
    return {
      'background-color': asset.color,
      'background-image': `url("${MAP_TILE_BASE}${asset.file}")`,
      'background-size': '100% 100%',
      'background-repeat': 'no-repeat',
      'image-rendering': 'pixelated',
    }
  }

  // Cache styles so a stable object reference is returned when nothing changed,
  // letting ngStyle skip work across thousands of tiles each tick.
  public GetTerrainStyle() {
    this.state.mapVersion()  // repaint this tile on map edits (OnPush dependency)
    if (this._terrain !== this.tile.terrain) {
      this._terrain = this.tile.terrain
      this._terrainStyle = this.TerrainStyle(this.tile.terrain)
    }
    return this._terrainStyle
  }

  public GetBuildingStyle() {
    let key = this.tile.building?.type ?? ''
    if (this._buildingKey !== key) {
      this._buildingKey = key
      this._buildingStyle = key == BuildingType.ROAD
        ? {
            'background-color': '#8f897d',
            'background-image': `url("${ROAD_TILE_ASSET}")`,
            'background-size': '100% 100%',
            'background-repeat': 'no-repeat',
            'image-rendering': 'pixelated',
          }
        : { 'background': this.GetBuildingColor() }
    }
    return this._buildingStyle
  }
}
