import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tile } from '../sim/tile';
import { repaintOn } from '../live';
import { ServiceType } from '../sim/types';
import { GetServiceIconSrc, GetServiceEmoji } from '../building-icons';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-service',
  imports: [IconComponent],
  templateUrl: './service.component.html',
  styleUrl: './service.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceComponent {
  @Input() tile!: Tile
  constructor() { repaintOn(s => [s.frame]) }

  serviceSrc(type: ServiceType): string | undefined { return GetServiceIconSrc(type) }
  serviceEmoji(type: ServiceType): string { return GetServiceEmoji(type) }
}
