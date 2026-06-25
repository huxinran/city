import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';

import { Tile } from '../sim/tile';
import { StateService } from '../state.service';
import { Resource } from '../sim/types'
import { Route, Ship } from '../sim/building';
import { City } from '../sim/city';
import { repaintOn } from '../live';
import { GetCityCrestSrc } from '../city-icons';
import { GetResourceIconSrc, GetResourceEmoji } from '../resource-icons';
import { IconComponent } from '../icon/icon.component';

import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dock',
  imports: [FormsModule, IconComponent],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockComponent {
  @Input() tile!: Tile
  from?: City
  to?: City
  selectedResource?: Resource
  amount: number = 10
  ship?: Ship
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  get cities(): City[] { return this.state.state.cities }

  // Full resource list for the create-route dropdown.
  get allResources(): Resource[] { return Object.values(Resource) }

  get currentCity(): City { return this.state.state.current_city! }

  // All routes across every city — outgoing shown in full, incoming labeled.
  get allRoutes(): { route: Route; city: City }[] {
    const result: { route: Route; city: City }[] = []
    for (const city of this.state.state.cities) {
      for (const route of city.routes) {
        result.push({ route, city })
      }
    }
    return result
  }

  CreateRoute() {
    if (!this.from || !this.to || !this.selectedResource) return
    const ship = this.ship
    const route = new Route(this.from.name, this.to.name, this.selectedResource, this.amount, ship)
    this.from.routes.push(route)
    // Reset form
    this.from = undefined
    this.to = undefined
    this.selectedResource = undefined
    this.ship = undefined
    this.amount = 10
  }

  DeleteRoute(city: City, route: Route) {
    const idx = city.routes.indexOf(route)
    if (idx >= 0) city.routes.splice(idx, 1)
  }

  progressPct(route: Route): number {
    return Math.round(route.progress * 100)
  }

  crest(name: string): string | undefined { return GetCityCrestSrc(name) }
  resSrc(type: Resource): string | undefined { return GetResourceIconSrc(type) }
  resEmoji(type: Resource): string { return GetResourceEmoji(type) }
}
