import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Tile } from '../sim/tile';
import { House, RefreshHouse, GetUpgradeCost, UpgradeBasket, CanUpgradeHouse } from '../sim/building';
import { StateService } from '../state.service';
import { CountItem } from '../sim/utils';
import { Item } from '../sim/storage';
import { Resource, Resident, ServiceType } from '../sim/types';
import { GetResidentIcon, GetResidentIconAsset } from '../sim/building';
import { GetServiceIconSrc, GetServiceEmoji } from '../building-icons';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';
import { IconComponent } from '../icon/icon.component';
import { repaintOn } from '../live';

// One category section of the upgrade basket, for the template.
interface CostGroup { label: string; items: Item[] }

@Component({
  selector: 'app-house',
  imports: [PercentPipe, IconComponent],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseComponent {
  @Input() tile!: Tile
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  private get house(): House { return this.tile.building!.house! }

  // The categorized basket needed to upgrade this house to the next tier.
  public get upgradeCost(): UpgradeBasket {
    return GetUpgradeCost(this.house.tier + 1, this.house.city_type)
  }

  // Non-empty category sections for display (Food / Daily / Luxury).
  public get costGroups(): CostGroup[] {
    let b = this.upgradeCost
    return [
      { label: 'Food', items: b.food },
      { label: 'Daily', items: b.daily },
      { label: 'Luxury', items: b.luxury },
      { label: 'Build', items: b.build },
    ].filter(g => g.items.length > 0)
  }

  // No goods-basket cost is consumed on upgrade; the "Upgrade needs" UI stays
  // hidden. Upgrades are gated on the house's ongoing service + goods needs.
  public get hasUpgradeCost(): boolean {
    return false
  }

  // Whether the city has enough of a single required item on hand.
  public has(item: Item): boolean {
    return CountItem(this.state.state.current_city!.storage, item.type) >= item.num
  }

  // Upgrade gating is config-driven in the sim layer (HOUSE_UPGRADE_RULE in
  // building.ts) — this just delegates so the rule lives in one place.
  public get canUpgrade(): boolean {
    return CanUpgradeHouse(this.house)
  }

  public Upgrade() {
    if (!this.canUpgrade) return
    let house = this.house
    house.tier += 1
    RefreshHouse(house)
    this.state.bumpMap()
  }

  public Downgrade() {
    let house = this.house
    house.tier -= 1
    RefreshHouse(house)
    this.state.bumpMap()
  }

  public resSrc(type: Resource): string | undefined { return GetResourceIconSrc(type) }
  public resEmoji(type: Resource): string { return GetResourceEmoji(type) }
  public residentSrc(type: Resident): string { return GetResidentIconAsset(type) }
  public residentEmoji(type: Resident): string { return GetResidentIcon(type) }
  public serviceSrc(type: ServiceType): string | undefined { return GetServiceIconSrc(type) }
  public serviceEmoji(type: ServiceType): string { return GetServiceEmoji(type) }
}
