import { Component, inject } from '@angular/core';
import { StateService } from '../state.service';
import { MatCardModule } from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-resource-summary',
  imports: [MatCardModule, MatExpansionModule],
  templateUrl: './resource-summary.component.html',
  styleUrl: './resource-summary.component.css'
})
export class ResourceSummaryComponent {
  state  =  inject(StateService)
}
