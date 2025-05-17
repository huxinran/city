import { Component, Input } from '@angular/core';
import { House } from '../building';

@Component({
  selector: 'app-house',
  imports: [],
  templateUrl: './house.component.html',
  styleUrl: './house.component.css'
})
export class HouseComponent {
  @Input() house!: House
}
