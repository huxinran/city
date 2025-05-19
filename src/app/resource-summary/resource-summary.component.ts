import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StateService } from '../state.service';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-resource-summary',
  imports: [NgFor, MatCardModule],
  templateUrl: './resource-summary.component.html',
  styleUrl: './resource-summary.component.css'
})
export class ResourceSummaryComponent {
  @Input() state!: StateService;
  
  constructor() {
  }

}
