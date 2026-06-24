import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tile } from '../sim/tile';
import { repaintOn } from '../live';

@Component({
  selector: 'app-service',
  imports: [],
  templateUrl: './service.component.html',
  styleUrl: './service.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceComponent {
  @Input() tile!: Tile
  constructor() { repaintOn(s => [s.frame]) }
}
