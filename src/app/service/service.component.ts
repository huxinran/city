import { Component, Input } from '@angular/core';

import { Tile } from '../tile';

@Component({
  selector: 'app-service',
  imports: [],
  templateUrl: './service.component.html',
  styleUrl: './service.component.css'
})
export class ServiceComponent {
  @Input() tile!: Tile
}
