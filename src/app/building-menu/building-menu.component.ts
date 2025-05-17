import { Component, Input } from '@angular/core';
import { StateService } from '../state.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-building-menu',
  imports: [MatButtonModule, MatMenuModule, MatCardModule],
  templateUrl: './building-menu.component.html',
  styleUrl: './building-menu.component.css'
})
export class BuildingMenuComponent {
  @Input() state!: StateService;
}
