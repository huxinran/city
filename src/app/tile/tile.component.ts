import { ChangeDetectionStrategy, Component, inject, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Tile } from '../tile';
import { StateService } from '../state.service';
import { BuildingType, Terrain, Feature } from '../types'
import { GetBuildingSize, GetBuildingIcon, IsFarmBuilding, IsAnimalFarm, IsWorkshopBuilding, IsMineCampBuilding } from '../building'
import { GetBuildingMapIconSrc, GetHouseMapIconSrc } from '../building-icons'
import { IconComponent } from '../icon/icon.component'

const CROP_FARM_ICON = 'assets/used/buildings/crop-farm.png'
const ANIMAL_FARM_ICON = 'assets/used/buildings/animal-farm.png'
const WORKSHOP_ICON = 'assets/used/buildings/workshop.png'
const MINE_CAMP_ICON = 'assets/used/buildings/mine-camp.png'

const MAP_TILE_ASSETS: { [key: string]: { file: string, color: string } } = {
  [Terrain.WATER]: { file: 'sea.png',  color: '#47c9ff' },
  [Terrain.GRASS]: { file: 'grass.png', color: '#a9d86b' },
  [Terrain.SAND]:  { file: 'sand.png', color: '#ffe48b' },
  [Terrain.DIRT]:  { file: 'dirt.png', color: '#c4956a' },
}

const MAP_TILE_BASE = 'assets/used/map-tiles/'
const ROAD_TILE_ASSET = MAP_TILE_BASE + 'cobblestone-road-light-48-v3.png'
const TERRAIN_OBJECT_BASE = 'assets/used/terrain/'

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

  public workshopSrc = WORKSHOP_ICON
  public mineCampSrc = MINE_CAMP_ICON

  get isMineCamp(): boolean {
    let type = this.tile.building?.type
    return type != undefined && IsMineCampBuilding(type)
  }

  // Full-tile background art for a farm plot: pasture for animal farms,
  // plowed fields for crop farms.
  public get farmBgSrc(): string {
    let type = this.tile.building?.type
    return type != undefined && IsAnimalFarm(type) ? ANIMAL_FARM_ICON : CROP_FARM_ICON
  }

  // Produce/animal icons overlaid on the farm background (one row of three).
  public readonly farmProduceCells: number[] = [0, 1, 2]

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
      // Clicking an occupied tile while a non-delete build tool is active:
      // clear the selection and focus the existing building instead.
      if (building_type !== BuildingType.DELETE) {
        let anchor = this.tile.covered
          ? this.state.GetTile(city, this.tile.anchor_i, this.tile.anchor_j)
          : this.tile
        if (anchor.building) {
          this.state.ClearSelection()
          city.focus_tile = anchor
          return
        }
      }
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

  public GetIcon(): string {
    let type = this.tile.building?.type
    if (type == undefined) return ''
    return GetBuildingIcon(type)
  }

  // Image URL for the building icon, or undefined to fall back to the emoji.
  public get buildingIconSrc(): string | undefined {
    let building = this.tile.building
    if (!building) return undefined
    // Houses render tier-specific art so an upgrade shows the next-tier building.
    if (building.house) return GetHouseMapIconSrc(building.house.tier)
    return GetBuildingMapIconSrc(building.type)
  }

  get isFeatureTree(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.feature == Feature.TREE
  }

  get isFeatureRock(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.feature == Feature.ROCK
  }

  get isFeatureBush(): boolean {
    return !this.tile.building && !this.tile.covered && this.tile.feature == Feature.BUSH
  }

  public get terrainFeatureSrc(): string | undefined {
    if (this.isFeatureTree) return TERRAIN_OBJECT_BASE + 'tree.png'
    if (this.isFeatureRock) return TERRAIN_OBJECT_BASE + 'rock.png'
    if (this.isFeatureBush) return TERRAIN_OBJECT_BASE + 'bush.png'
    return undefined
  }

  public get isFocused(): boolean {
    let f = this.state.state.current_city!.focus_tile
    return f?.i == this.tile.i && f?.j == this.tile.j
  }

  private _terrain?: Terrain
  private _terrainSize = 0
  private _terrainStyle: any
  private _buildingKey?: string
  private _buildingStyle: any

  private TerrainStyle(terrain: Terrain, size: number): any {
    let asset = MAP_TILE_ASSETS[terrain] ?? MAP_TILE_ASSETS[Terrain.GRASS]
    // A multi-tile building's anchor spans its whole footprint, so tile the
    // terrain image once per cell (instead of stretching one across the span)
    // to match the surrounding 1x1 tiles.
    let pct = 100 / size
    return {
      'background-color': asset.color,
      'background-image': `url("${MAP_TILE_BASE}${asset.file}")`,
      'background-size': `${pct}% ${pct}%`,
      'background-repeat': 'repeat',
      'image-rendering': 'pixelated',
    }
  }

  // Cache styles so a stable object reference is returned when nothing changed,
  // letting ngStyle skip work across thousands of tiles each tick.
  public GetTerrainStyle() {
    this.state.mapVersion()  // repaint this tile on map edits (OnPush dependency)
    let size = this.size
    if (this._terrain !== this.tile.terrain || this._terrainSize !== size) {
      this._terrain = this.tile.terrain
      this._terrainSize = size
      this._terrainStyle = this.TerrainStyle(this.tile.terrain, size)
    }
    return this._terrainStyle
  }

  public GetBuildingStyle() {
    let key = this.tile.building?.type ?? ''
    if (this._buildingKey !== key) {
      this._buildingKey = key
      this._buildingStyle = key == BuildingType.ROAD
        ? {
            'background-color': '#b9b3a4',
            'background-image': `url("${ROAD_TILE_ASSET}")`,
            'background-size': '100% 100%',
            'background-repeat': 'no-repeat',
            'image-rendering': 'pixelated',
          }
        : {}  // no card background — the building icon shows directly on terrain
    }
    return this._buildingStyle
  }
}

