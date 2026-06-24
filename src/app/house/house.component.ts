import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Tile } from '../tile';
import { House, RefreshHouse, GetUpgradeCost, GetCityMaxTier, UpgradeBasket } from '../building';
import { StateService } from '../state.service';
import { CountItem } from '../utils';
import { Item } from '../storage';
import { Resource } from '../types';
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

  public get atMaxTier(): boolean {
    return this.house.tier >= GetCityMaxTier(this.house.city_type)
  }

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

  // Every service and goods (resource) need at the current tier is satisfied.
  public get needsMet(): boolean {
    return this.house.service_needs.every(n => n.satisfied)
        && this.house.resource_needs.every(n => n.satisfied)
  }

  // Upgrade is allowed once all current needs are met (and below max tier).
  public get canUpgrade(): boolean {
    return !this.atMaxTier && this.needsMet
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
}
