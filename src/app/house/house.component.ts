import { Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Need } from '../building';
import { NgFor, NgStyle } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Tile } from '../tile';
@Component({
  selector: 'app-house',
  imports: [NgFor, MatChip, MatButtonModule, NgStyle, PercentPipe, MatIconModule],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() tile!: Tile

  public GetStyle(need: Need) {
    let color = undefined;
    if (need.satisfied) {
      color = "lightgreen"
    } else {
      color = "lightgrey"
    }
    return {
      "background-color" : color
    }
  }
}
