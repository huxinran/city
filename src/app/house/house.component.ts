import { Component, Input } from '@angular/core';
import { House, Need } from '../building';
import { NgFor, NgStyle } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { Tile } from '../tile';
@Component({
  selector: 'app-house',
  imports: [NgFor, MatChip, MatButtonModule, NgStyle],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() tile!: Tile

  public GetStyle(need: Need) {
    let color = undefined;
    if (need.satisfied) {
      color = "lightgreen"
    }
    return {
      "background-color" : color
    }
  }
}
