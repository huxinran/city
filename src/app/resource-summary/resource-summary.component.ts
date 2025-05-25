import { Component, Input } from '@angular/core';
import { StateService } from '../state.service';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-resource-summary',
  imports: [MatCardModule],
  templateUrl: './resource-summary.component.html',
  styleUrl: './resource-summary.component.css'
})
export class ResourceSummaryComponent {
  @Input() state!: StateService;
  
  constructor() {
  }

}
