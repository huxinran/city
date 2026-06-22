import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../state.service';
import { BuildingType, Resource, Resident } from '../types';
import { GetBuildingIcon, MakeBuilding, GetBuildingGoldCost, GetBuildingTier, GetResidentIconAsset, IsBuildingMaterial } from '../building';
import { City } from '../city';
import { GetBuildingIconSrc } from '../building-icons';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';
import { Item } from '../storage';
import { IconComponent } from '../icon/icon.component';
import { repaintOn } from '../live';

interface PaletteGroup {
  name: string;
  items: BuildingType[];
}

// Cost + recipe shown in the hover tooltip for a building.
interface BuildingInfo {
  gold: number;
  worker?: Resident;
  workerNeeded: number;
  cost: Item[];
  ingredient: Item[];
  product: Item[];
}

@Component({
  selector: 'app-palette',
  imports: [CommonModule, IconComponent],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteComponent {
  state = inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }

  get Delete(): BuildingType { return BuildingType.DELETE }

  // Group sections are collapsed by default; "Basics" is pinned open. We track
  // which groups the user has expanded.
  private expanded = new Set<string>()
  public isCollapsed(name: string): boolean {
    return name !== 'Basics' && !this.expanded.has(name)
  }
  public toggleGroup(name: string) {
    if (name === 'Basics') return
    if (this.expanded.has(name)) this.expanded.delete(name)
    else this.expanded.add(name)
  }

  // Highest residential tier currently reached in the city (1 if none built).
  // A tier group is shown only once you've unlocked it — i.e. you have houses of
  // the previous tier, so the next tier's buildings appear as you progress.
  private unlockedThrough(city: City): number {
    let maxTier = 1
    for (let t of city.houses) {
      let h = t.building?.house
      if (h && h.tier > maxTier) maxTier = h.tier
    }
    return Math.min(6, maxTier + 1)
  }

  // Cached so the getter (called on every change-detection pass) only rebuilds
  // the group arrays when the city or the unlocked tier actually changes.
  private _groupsCity?: object
  private _groupsUnlock = 0
  private _groups: PaletteGroup[] = []
  get groups(): PaletteGroup[] {
    let city = this.state.state.current_city!
    let unlock = this.unlockedThrough(city)
    if (this._groupsCity !== city || this._groupsUnlock !== unlock) {
      this._groupsCity = city
      this._groupsUnlock = unlock
      let groups: PaletteGroup[] = [
        { name: 'Basics', items: [BuildingType.ROAD, BuildingType.HOUSE, BuildingType.WAREHOUSE, BuildingType.DELETE] },
      ]
      let all = [...city.farms, ...city.materials, ...city.workshops, ...city.infrastructure]
      // Construction-goods producers get their own category.
      let materials = all.filter(t => IsBuildingMaterial(t))
      if (materials.length) groups.push({ name: 'Materials', items: materials })
      // Remaining buildings sit on the population upgrade path: each grouped
      // under the tier its output serves. Only show tiers you've unlocked.
      let consumer = all.filter(t => !IsBuildingMaterial(t))
      let tierNames = [Resident.FARMER, Resident.WORKER, Resident.ARTISAN, Resident.SCHOLAR, Resident.ENTREPRENEUR, Resident.MAGNATE]
      for (let i = 0; i < tierNames.length; i++) {
        if (i + 1 > unlock) break
        let items = consumer.filter(t => GetBuildingTier(t) === i + 1)
        if (items.length) groups.push({ name: tierNames[i], items })
      }
      // Anything whose output isn't a direct house need (ports, etc.).
      let other = consumer.filter(t => GetBuildingTier(t) === undefined)
      if (other.length) groups.push({ name: 'Other', items: other })
      this._groups = groups
    }
    return this._groups
  }

  public iconName(type: BuildingType): string {
    return GetBuildingIcon(type)
  }

  // Tooltip currently shown (the building being hovered), or undefined.
  public hovered?: BuildingType

  // Cache so a stable BuildingInfo reference is returned per type (avoids
  // rebuilding a throwaway Building on every change-detection pass).
  private _infoCache: { [key: string]: BuildingInfo | undefined } = {}
  public info(type: BuildingType): BuildingInfo | undefined {
    if (!(type in this._infoCache)) {
      let b = MakeBuilding(type)
      this._infoCache[type] = b
        ? {
            gold: GetBuildingGoldCost(type),
            worker: b.production?.worker_type,
            workerNeeded: b.production?.worker_needed ?? 0,
            cost: b.material,
            ingredient: b.production?.ingredient ?? [],
            product: b.production?.product ?? [],
          }
        : undefined
    }
    return this._infoCache[type]
  }

  // Screen position for the floating tooltip (fixed, so it escapes the
  // scrollable palette column without being clipped).
  public tipX = 0
  public tipY = 0
  public show(type: BuildingType, ev: MouseEvent) {
    this.hovered = type
    let r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
    this.tipX = r.right + 8
    this.tipY = r.top
  }
  public hide() { this.hovered = undefined }

  // Resource icon (PNG src + emoji fallback) for tooltip item chips.
  public resSrc(type: Resource): string | undefined { return GetResourceIconSrc(type) }
  public resEmoji(type: Resource): string { return GetResourceEmoji(type) }
  public workerIcon(type: Resident): string { return GetResidentIconAsset(type) }

  public iconSrc(type: BuildingType): string | undefined {
    return GetBuildingIconSrc(type)
  }

  public isSelected(type: BuildingType): boolean {
    return this.state.state.build_type == type
  }

  public select(type: BuildingType) {
    this.state.SetBuildType(type)
  }

  public onDragStart(type: BuildingType) {
    this.state.dragging = true
    this.state.SetBuildType(type)
  }

  public onDragEnd() {
    this.state.dragging = false
  }
}
