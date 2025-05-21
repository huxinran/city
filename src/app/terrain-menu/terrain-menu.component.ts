import { Component, Input } from '@angular/core';
import { StateService } from '../state.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-terrain-menu',
  imports: [MatButtonModule, MatMenuModule, MatCardModule],
  templateUrl: './terrain-menu.component.html',
  styleUrl: './terrain-menu.component.css'
})
export class TerrainMenuComponent {
  @Input() state!: StateService;
}
