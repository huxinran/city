import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CityComponent } from './city/city.component';
import { MenuComponent } from './menu/menu.component';
import { PaletteComponent } from './palette/palette.component';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { StatusSummaryComponent } from './status-summary/status-summary.component';
import { TileDetailComponent } from './tile-detail/tile-detail.component';
import { StateService } from './state.service';
import { repaintOn } from './live';
@Component({
  selector: 'app-root',
  imports: [CityComponent, TileDetailComponent, MenuComponent, PaletteComponent, ResourceSummaryComponent, StatusSummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'city sim';
  public state  =  inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }
}
