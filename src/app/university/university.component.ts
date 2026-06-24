import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';

import { Tile } from '../sim/tile';
import { StateService } from '../state.service';
import { Technology, ALL_RESEARCH, ResearchProject } from '../sim/building';
import { repaintOn } from '../live';

@Component({
  selector: 'app-university',
  imports: [PercentPipe],
  templateUrl: './university.component.html',
  styleUrl: './university.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniversityComponent {
  @Input() tile!: Tile
  state = inject(StateService)
  constructor() { repaintOn(s => [s.frame]) }

  get univ() { return this.tile.building!.university! }
  get city() { return this.state.state.current_city! }

  get unlocked(): Technology[] { return this.city.unlocked_techs ?? [] }

  get currentProject(): ResearchProject | undefined {
    if (!this.univ.selected_tech) return undefined
    return ALL_RESEARCH.find(p => p.tech === this.univ.selected_tech)
  }

  get available(): ResearchProject[] {
    return ALL_RESEARCH.filter(p =>
      !this.unlocked.includes(p.tech) && p.tech !== this.univ.selected_tech
    )
  }

  canAfford(p: ResearchProject): boolean {
    return this.state.state.gold >= p.gold_cost
  }

  start(tech: Technology) {
    this.state.StartResearch(this.city, this.tile, tech)
  }

  cancel() {
    let univ = this.univ
    // Refund half the gold cost if research is in progress
    if (univ.selected_tech) {
      let project = ALL_RESEARCH.find(p => p.tech === univ.selected_tech)
      if (project && univ.progress > 0) {
        this.state.state.gold += Math.floor(project.gold_cost * 0.5)
      }
      univ.selected_tech = undefined
      univ.progress = 0
    }
  }
}
