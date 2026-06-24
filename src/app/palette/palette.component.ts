import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../state.service';
import { BuildingType, Resource, Resident, CityName, CITY_EXCLUSIVE_BUILDINGS } from '../sim/types';
import { GetBuildingIcon, MakeBuilding, GetBuildingGoldCost, GetBuildingTier, GetResidentIconAsset } from '../sim/building';
import { GetBuildingIconSrc } from '../building-icons';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';
import { Item } from '../sim/storage';
import { IconComponent } from '../icon/icon.component';
import { repaintOn } from '../live';

// Always-available buildings shown under "Basics" (and excluded from the
// categorized tier groups so they aren't listed twice).
const BASIC_BUILDINGS = [BuildingType.ROAD, BuildingType.HOUSE, BuildingType.WAREHOUSE, BuildingType.DELETE]

const HIDDEN_BUILDINGS = new Set<BuildingType>([BuildingType.COMPOST_PIT, BuildingType.UNIVERSITY])

// All city-exclusive buildings across every themed city (derived from shared constants).
const ALL_CITY_EXCLUSIVE_BUILDINGS = new Set<BuildingType>(
    Object.values(CITY_EXCLUSIVE_BUILDINGS).flat() as BuildingType[]
)

// Display order within a tier group: raw materials before the products they
// feed. Buildings not listed keep their enum order, after the listed ones.
const PALETTE_ORDER: BuildingType[] = [
  // Farmer
  BuildingType.LUMBER_HUT,      // wood
  BuildingType.SAWMILL,         // timber
  BuildingType.FISHERY,         // fish
  BuildingType.SHEEP_FARM,      // sheep -> wool
  BuildingType.PANT_SHOP, // pant
  // Worker
  BuildingType.STONE_QUARRY,    // stone
  BuildingType.MASON_SHOP,      // slate / stone block
  BuildingType.CLAY_PIT,        // clay
  BuildingType.POTTERY_SHOP,    // pottery
  BuildingType.BRICKYARY,       // brick
  BuildingType.COTTON_FIELD,    // cotton
  BuildingType.SHIRT_SHOP,      // shirt
  BuildingType.CABBAGE_PATCH,   // cabbage
  BuildingType.PIG_FARM,        // pig -> pork
  BuildingType.BUTCHERY,        // sausage
  // Artisan
  BuildingType.IRON_MINE,       // iron ore
  BuildingType.FORGE,           // iron ingot
  BuildingType.STEELWORK,       // steel
  BuildingType.WHEAT_FARM,      // wheat
  BuildingType.WIND_MILL,       // flour
  BuildingType.BAKERY,          // bread
  BuildingType.TRAPLINE,        // fur
  BuildingType.BOOT_SHOP,       // boot
  BuildingType.OLIVE_GROVE,     // olive
  BuildingType.OIL_PRESS,       // oil
  BuildingType.TOOLSMITH,       // tool
]
function paletteOrder(t: BuildingType): number {
  let i = PALETTE_ORDER.indexOf(t)
  return i === -1 ? Number.POSITIVE_INFINITY : i
}

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

  // Group sections are expanded by default; "Basics" is pinned open. We track
  // which groups the user has collapsed.
  private collapsed = new Set<string>()
  public isCollapsed(name: string): boolean {
    return name !== 'Basics' && this.collapsed.has(name)
  }
  public toggleGroup(name: string) {
    if (name === 'Basics') return
    if (this.collapsed.has(name)) this.collapsed.delete(name)
    else this.collapsed.add(name)
  }

  // Building groups re-computed on every render so city switches take effect.
  get groups(): PaletteGroup[] {
    const cityName = this.state.state.current_city?.name as CityName | undefined
    const cityBuildings = cityName ? (CITY_EXCLUSIVE_BUILDINGS[cityName] ?? []) : []

    let groups: PaletteGroup[] = [
      { name: 'Basics', items: [...BASIC_BUILDINGS] },
    ]
    // Exclude basics and ALL city-exclusive buildings from the shared tier buckets.
    let all = (Object.values(BuildingType) as BuildingType[])
      .filter(t => !BASIC_BUILDINGS.includes(t) && !ALL_CITY_EXCLUSIVE_BUILDINGS.has(t) && !HIDDEN_BUILDINGS.has(t))
    let tierNames = [Resident.FARMER, Resident.WORKER, Resident.ARTISAN, Resident.SCHOLAR, Resident.ENTREPRENEUR, Resident.MAGNATE]
    for (let i = 0; i < tierNames.length; i++) {
      let items = all.filter(t => GetBuildingTier(t) === i + 1)
      items.sort((a, b) => paletteOrder(a) - paletteOrder(b))
      if (items.length) groups.push({ name: tierNames[i], items })
    }
    let other = all.filter(t => GetBuildingTier(t) === undefined)
    if (other.length) groups.push({ name: 'Other', items: other })
    // Show the current city's exclusive buildings only if it has any.
    if (cityBuildings.length > 0) {
      groups.push({ name: cityName!, items: cityBuildings })
    }
    return groups
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

  // Gold/currency, shown alongside material in the cost row.
  public goldType = Resource.GOLD

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
