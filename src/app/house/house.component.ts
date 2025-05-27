import { Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Tile } from '../tile';
import { GetResidentType, House } from '../building';
@Component({
  selector: 'app-house',
  imports: [MatChip, MatButtonModule, PercentPipe, MatIconModule],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() tile!: Tile

  public Upgrade() {
    let house: House = this.tile.building!.house!
    house.Upgrade()

  }
  public Downgrade() {
    let house: House = this.tile.building!.house!
    house.Downgrade()
  }
}
