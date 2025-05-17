import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StateService } from '../state.service';

import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-resource-summary',
  imports: [NgFor],
  templateUrl: './resource-summary.component.html',
  styleUrl: './resource-summary.component.css'
})
export class ResourceSummaryComponent {
  @Input() state!: StateService;
  
  constructor() {
  }

}
