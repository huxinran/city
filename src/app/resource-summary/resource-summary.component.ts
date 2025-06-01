import { Component, inject } from '@angular/core';

import { StateService } from '../state.service';

@Component({
  selector: 'app-resource-summary',
  imports: [],
  templateUrl: './resource-summary.component.html',
  styleUrl: './resource-summary.component.css'
})
export class ResourceSummaryComponent {
  state  =  inject(StateService)
}
