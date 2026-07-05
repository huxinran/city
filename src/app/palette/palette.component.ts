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
const MOVE_TOOL = 'Move'
const UPGRADE_TOOL = 'Upgrade'
const DOWNGRADE_TOOL = 'Downgrade'
type PaletteTool = typeof MOVE_TOOL | typeof UPGRADE_TOOL | typeof DOWNGRADE_TOOL
type PaletteItem = BuildingType | PaletteTool

const BASIC_BUILDINGS: PaletteItem[] = [
  BuildingType.ROAD,
  BuildingType.HOUSE,
  BuildingType.WAREHOUSE,
  MOVE_TOOL,
  UPGRADE_TOOL,
  DOWNGRADE_TOOL,
  BuildingType.DELETE,
]

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
  BuildingType.DYE_WORKSHOP,    // dye
  BuildingType.FISHERY,         // fish
  BuildingType.SHEEP_FARM,      // sheep -> wool
  BuildingType.PANT_SHOP, // pant
  // Worker
  BuildingType.STONE_QUARRY,    // stone
  BuildingType.MASON_SHOP,      // stone blocks
  BuildingType.CLAY_PIT,        // clay
  BuildingType.POTTERY_SHOP,    // pottery
  BuildingType.BRICKYARD,       // brick
  BuildingType.COTTON_FIELD,    // cotton
  BuildingType.SHIRT_SHOP,      // shirt
  BuildingType.CABBAGE_PATCH,   // cabbage
  BuildingType.PICKLERY,        // pickles
  BuildingType.PIG_FARM,        // pig -> pork
  BuildingType.BUTCHERY,        // sausage
  // Artisan
  BuildingType.IRON_MINE,       // iron ore
  BuildingType.FORGE,           // iron ingot
  BuildingType.STEELWORKS,       // steel
  BuildingType.WHEAT_FARM,      // wheat
  BuildingType.WINDMILL,       // flour
  BuildingType.BAKERY,          // bread
  BuildingType.PAPER_MILL,      // paper
  BuildingType.INK_WORKSHOP,    // ink
  BuildingType.DUMPLING_KITCHEN,// dumplings
  BuildingType.SUSHI_BAR,       // sushi
  BuildingType.TRAPLINE,        // fur
  BuildingType.BOOT_SHOP,       // boot
  BuildingType.OLIVE_GROVE,     // olive
  BuildingType.OIL_PRESS,       // oil
  BuildingType.TOOLSMITH,       // tool
  BuildingType.BOTTLEWORKS,     // glass bottle
  BuildingType.APOTHECARY,      // medicine
  BuildingType.SOAP_WORKS,      // soap
  BuildingType.PERFUMERY,       // perfume
  BuildingType.PAINTER_STUDIO,  // paintings
  BuildingType.MACHINE_SHOP,    // machine parts
  BuildingType.ICE_CREAMERY,    // ice cream
  BuildingType.WATCHMAKER,      // watch
]
function paletteOrder(t: BuildingType): number {
  let i = PALETTE_ORDER.indexOf(t)
  return i === -1 ? Number.POSITIVE_INFINITY : i
}

interface PaletteGroup {
  name: string;
  items: PaletteItem[];
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
  get MoveTool(): typeof MOVE_TOOL { return MOVE_TOOL }
  get UpgradeTool(): typeof UPGRADE_TOOL { return UPGRADE_TOOL }
  get DowngradeTool(): typeof DOWNGRADE_TOOL { return DOWNGRADE_TOOL }

  // "Basics" is pinned open. All other groups behave like an accordion: one
  // group is open at a time so the bottom dock stays compact.
  private openGroup = Resident.FARMER as string
  public isCollapsed(name: string): boolean {
    return name !== 'Basics' && this.openGroup !== name
  }
  public toggleGroup(name: string) {
    if (name === 'Basics') return
    this.openGroup = name
  }

  public tierGroups(): PaletteGroup[] {
    return this.groups.filter(g => g.name !== 'Basics')
  }

  public basicsGroup(): PaletteGroup | undefined {
    return this.groups.find(g => g.name === 'Basics')
  }

  public activeGroup(): PaletteGroup | undefined {
    return this.groups.find(g => g.name === this.openGroup && g.name !== 'Basics')
  }

  // Building groups re-computed on every render so city switches take effect.
  get groups(): PaletteGroup[] {
    const dev = this.state.dev_mode
    const cityName = this.state.state.current_city?.name as CityName | undefined
    // Dev mode offers every city's exclusive buildings, not just the current city's.
    const cityBuildings = dev
      ? [...ALL_CITY_EXCLUSIVE_BUILDINGS]
      : cityName ? (CITY_EXCLUSIVE_BUILDINGS[cityName] ?? []) : []

    let groups: PaletteGroup[] = [
      { name: 'Basics', items: [...BASIC_BUILDINGS] },
    ]
    // Exclude basics and ALL city-exclusive buildings from the shared tier
    // buckets. Dev mode also surfaces the normally hidden buildings.
    let all = (Object.values(BuildingType) as BuildingType[])
      .filter(t => !BASIC_BUILDINGS.includes(t) && !ALL_CITY_EXCLUSIVE_BUILDINGS.has(t) && (dev || !HIDDEN_BUILDINGS.has(t)))
    let tierNames = [Resident.FARMER, Resident.WORKER, Resident.ARTISAN, Resident.SCHOLAR, Resident.ENTREPRENEUR, Resident.MAGNATE]
    for (let i = 0; i < tierNames.length; i++) {
      let items = all.filter(t => GetBuildingTier(t) === i + 1)
      items.sort((a, b) => paletteOrder(a) - paletteOrder(b))
      if (items.length) groups.push({ name: tierNames[i], items })
    }
    let other = all.filter(t => GetBuildingTier(t) === undefined)
    if (other.length) groups.push({ name: 'Other', items: other })
    // Show the current city's exclusive buildings only if it has any (all
    // cities' exclusives under one group in dev mode).
    if (cityBuildings.length > 0) {
      groups.push({ name: dev ? 'Exclusive' : cityName!, items: cityBuildings })
    }
    if (!groups.some(g => g.name === this.openGroup && g.name !== 'Basics')) {
      this.openGroup = groups.find(g => g.name !== 'Basics')?.name ?? ''
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
    this.tipX = Math.min(r.left, window.innerWidth - 248)
    this.tipY = Math.max(8, r.top - 132)
  }
  public showItem(type: PaletteItem, ev: MouseEvent) {
    if (this.isPaletteTool(type)) return
    this.show(type, ev)
  }
  public hide() { this.hovered = undefined }

  // Gold/currency, shown alongside material in the cost row.
  public goldType = Resource.GOLD

  // Resource icon (PNG src + emoji fallback) for tooltip item chips.
  public resSrc(type: Resource): string | undefined { return GetResourceIconSrc(type) }
  public resEmoji(type: Resource): string { return GetResourceEmoji(type) }
  public workerIcon(type: Resident): string { return GetResidentIconAsset(type) }

  public iconSrc(type: PaletteItem): string | undefined {
    if (type === MOVE_TOOL) return 'assets/used/cursors/move-arrows.png'
    if (type === UPGRADE_TOOL) return 'assets/used/cursors/upgrade-arrow.png'
    if (type === DOWNGRADE_TOOL) return 'assets/used/cursors/downgrade-arrow.png'
    return GetBuildingIconSrc(type)
  }

  public iconFallback(type: PaletteItem): string {
    if (type === MOVE_TOOL) return '↔'
    if (type === UPGRADE_TOOL) return '↑'
    if (type === DOWNGRADE_TOOL) return '↓'
    return this.iconName(type)
  }

  public isSelected(type: PaletteItem): boolean {
    if (type === MOVE_TOOL) return this.state.move_mode
    if (type === UPGRADE_TOOL) return this.state.upgrade_mode === 'upgrade'
    if (type === DOWNGRADE_TOOL) return this.state.upgrade_mode === 'downgrade'
    return this.state.state.build_type == type
  }

  public select(type: PaletteItem) {
    if (type === MOVE_TOOL) {
      this.state.SetMoveMode()
      return
    }
    if (type === UPGRADE_TOOL) {
      this.state.SetUpgradeMode('upgrade')
      return
    }
    if (type === DOWNGRADE_TOOL) {
      this.state.SetUpgradeMode('downgrade')
      return
    }
    this.state.SetBuildType(type)
  }

  public onDragStart(type: PaletteItem, ev: DragEvent) {
    if (this.isPaletteTool(type)) {
      ev.preventDefault()
      return
    }
    this.state.dragging = true
    this.state.SetBuildType(type)
  }

  public onDragEnd() {
    this.state.dragging = false
  }

  public isDraggable(type: PaletteItem): boolean {
    return !this.isPaletteTool(type)
  }

  private isPaletteTool(type: PaletteItem): type is PaletteTool {
    return type === MOVE_TOOL || type === UPGRADE_TOOL || type === DOWNGRADE_TOOL
  }
}
