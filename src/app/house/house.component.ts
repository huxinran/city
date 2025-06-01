import { Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Tile } from '../tile';
import { House, RefreshHouse } from '../building';
@Component({
  selector: 'app-house',
  imports: [PercentPipe],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() tile!: Tile

  public Upgrade() {
    let house = this.tile.building!.house!
    house.tier += 1
    RefreshHouse(house)
  }

  public Downgrade() {
    let house: House = this.tile.building!.house!
    house.tier -= 1
    RefreshHouse(house)
  }
}
