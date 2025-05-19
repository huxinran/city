import { Component, Input } from '@angular/core';
import { House } from '../building';
import { NgFor } from '@angular/common';
import { MatChip } from '@angular/material/chips';
@Component({
  selector: 'app-house',
  imports: [NgFor, MatChip],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() house!: House
}
