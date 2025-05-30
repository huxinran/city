import { Component, inject } from '@angular/core';
import { CityComponent } from './city/city.component';
import { MenuComponent } from './menu/menu.component';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { StatusSummaryComponent } from './status-summary/status-summary.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TileDetailComponent } from './tile-detail/tile-detail.component';
import { StateService } from './state.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-root',
  imports: [CityComponent, TileDetailComponent, MenuComponent, MatTabsModule, MatButtonModule, MatTableModule, ResourceSummaryComponent, StatusSummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'city sim';
  public state  =  inject(StateService)
}
