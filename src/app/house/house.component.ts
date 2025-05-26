import { Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Tile } from '../tile';
@Component({
  selector: 'app-house',
  imports: [MatChip, MatButtonModule, PercentPipe, MatIconModule],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() tile!: Tile

  public Upgrade() {
    this.tile.building!.house!.tier += 1
    this.tile.building!.house!.max_occupant = this.tile.building!.house!.tier * 10
  }
  public Downgrade() {
    this.tile.building!.house!.tier -= 1
    this.tile.building!.house!.max_occupant = this.tile.building!.house!.tier * 10
  }
}
