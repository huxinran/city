import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Tile } from '../tile';
import { House, RefreshHouse, GetUpgradeCost, GetUpgradeItems, UpgradeBasket } from '../building';
import { StateService } from '../state.service';
import { TakeItems, CountItem } from '../utils';
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

  // The categorized basket needed to upgrade this house to the next tier.
  public get upgradeCost(): UpgradeBasket {
    return GetUpgradeCost(this.tile.building!.house!.tier + 1)
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

  public get hasUpgradeCost(): boolean {
    return GetUpgradeItems(this.tile.building!.house!.tier + 1).length > 0
  }

  // Whether the city has enough of a single required item on hand.
  public has(item: Item): boolean {
    return CountItem(this.state.state.current_city!.storage, item.type) >= item.num
  }

  // Whether the city can afford the whole upgrade basket.
  public get canAffordUpgrade(): boolean {
    let items = GetUpgradeItems(this.tile.building!.house!.tier + 1)
    if (items.length === 0) return false
    return items.every(it => this.has(it))
  }

  public Upgrade() {
    let house = this.tile.building!.house!
    let items = GetUpgradeItems(house.tier + 1)
    if (items.length === 0) return
    // Charge the whole basket atomically; bail if any item is short.
    if (!TakeItems(this.state.state.current_city!.storage, items)) return
    house.tier += 1
    RefreshHouse(house)
    this.state.bumpMap()  // a new tier may unlock buildings in the palette
  }

  public Downgrade() {
    let house: House = this.tile.building!.house!
    house.tier -= 1
    RefreshHouse(house)
    this.state.bumpMap()
  }

  public resSrc(type: Resource): string | undefined { return GetResourceIconSrc(type) }
  public resEmoji(type: Resource): string { return GetResourceEmoji(type) }
}
