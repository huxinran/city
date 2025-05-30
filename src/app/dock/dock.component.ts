import { Component, inject, Input } from '@angular/core';
import { Tile } from '../tile';
import { StateService } from '../state.service';

@Component({
  selector: 'app-dock',
  imports: [],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css'
})
export class DockComponent {
  @Input() tile!: Tile
  state  =  inject(StateService)
}
