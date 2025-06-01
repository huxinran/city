import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileComponent } from '../tile/tile.component';
import { City } from '../city';
import { StateService } from '../state.service';

@Component({
  selector: 'app-city',
  imports: [TileComponent, CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent {
  @Input() city!: City;

  state = inject(StateService)
  
  public getStyle() {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.city.w}, 0.01fr)`,
      'justify-items': 'center',
    };
  }
}
