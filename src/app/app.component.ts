import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CityComponent } from './city/city.component';
import { BuildingMenuComponent } from './building-menu/building-menu.component';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { StatusSummaryComponent } from './status-summary/status-summary.component';
import { TerrainMenuComponent } from './terrain-menu/terrain-menu.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TileDetailComponent } from './tile-detail/tile-detail.component';
import { State } from './state'
import { StateService } from './state.service';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CityComponent, TileDetailComponent, BuildingMenuComponent, MatTabsModule, MatGridList, MatGridTile, MatButtonModule, MatTableModule, ResourceSummaryComponent, StatusSummaryComponent, TerrainMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  title = 'city';
  state  = new StateService();

  constructor() {
    this.Load()
  }

  public Save() {
    localStorage.setItem("state", JSON.stringify(this.state.state))
  }

  public Load() {
    let saved_state = localStorage.getItem("state")
    if (saved_state) {
      this.state.state = JSON.parse(saved_state)
    }
  }

  public Reset() {
    this.state = new StateService()
    console.log(this.state.state)
    this.Save()
  }
}
