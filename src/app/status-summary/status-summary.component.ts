import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StateService } from '../state.service';
import { DecimalPipe } from '@angular/common';
import { repaintOn } from '../live';
@Component({
  selector: 'app-status-summary',
  imports: [DecimalPipe],
  templateUrl: './status-summary.component.html',
  styleUrl: './status-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSummaryComponent {
  state  =  inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }
}
