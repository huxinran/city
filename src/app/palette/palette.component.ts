import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../state.service';
import { BuildingType } from '../types';
import { GetBuildingIcon } from '../building';
import { GetBuildingIconSrc } from '../building-icons';
import { IconComponent } from '../icon/icon.component';
import { repaintOn } from '../live';

interface PaletteGroup {
  name: string;
  items: BuildingType[];
}

@Component({
  selector: 'app-palette',
  imports: [CommonModule, IconComponent],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteComponent {
  state = inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }

  get Delete(): BuildingType { return BuildingType.DELETE }

  // Cached so the getter (called on every change-detection pass) only rebuilds
  // the group arrays when the current city actually changes.
  private _groupsCity?: object
  private _groups: PaletteGroup[] = []
  get groups(): PaletteGroup[] {
    let city = this.state.state.current_city!
    if (this._groupsCity !== city) {
      this._groupsCity = city
      this._groups = [
        { name: 'Basics', items: [BuildingType.ROAD, BuildingType.HOUSE, BuildingType.WAREHOUSE] },
        { name: 'Farms', items: city.farms },
        { name: 'Materials', items: city.materials },
        { name: 'Workshops', items: city.workshops },
        { name: 'Infrastructure', items: city.infrastructure },
      ]
    }
    return this._groups
  }

  public iconName(type: BuildingType): string {
    return GetBuildingIcon(type)
  }

  public iconSrc(type: BuildingType): string | undefined {
    return GetBuildingIconSrc(type)
  }

  public isSelected(type: BuildingType): boolean {
    return this.state.state.build_type == type
  }

  public select(type: BuildingType) {
    this.state.SetBuildType(type)
  }

  public onDragStart(type: BuildingType) {
    this.state.dragging = true
    this.state.SetBuildType(type)
  }

  public onDragEnd() {
    this.state.dragging = false
  }
}
