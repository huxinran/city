import { Component, inject } from '@angular/core';
import { StateService } from '../state.service';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-status-summary',
  imports: [DecimalPipe],
  templateUrl: './status-summary.component.html',
  styleUrl: './status-summary.component.css'
})
export class StatusSummaryComponent {
  state  =  inject(StateService)
}
