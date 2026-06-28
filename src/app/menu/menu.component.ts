import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

import { StateService } from '../state.service';
import { repaintOn } from '../live';

@Component({
  selector: 'app-menu',
  imports: [NgIconComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  state = inject(StateService)
  constructor() { repaintOn(s => [s.mapVersion]) }

  // Custom dropdown state (replaces Angular Material's mat-menu).
  open = signal(false)
  submenu = signal<string | null>(null)
  message = signal<string | null>(null)
  private messageTimer?: ReturnType<typeof setTimeout>

  toggle() {
    this.open.update(o => !o)
    this.submenu.set(null)
  }

  close() {
    this.open.set(false)
    this.submenu.set(null)
  }

  showSub(name: string) {
    this.submenu.update(s => s === name ? null : name)
  }

  // Open the generated image gallery (public/assets/gallery.html) in a new tab.
  // Regenerate it with: node tools/gen-gallery.mjs public/assets
  imageDirectory() { window.open('assets/gallery.html', '_blank'); this.close() }

  save() { this.state.Save(); this.flash('Saved'); this.close() }
  load() {
    if (!this.state.HasSave()) { this.flash('No save yet'); this.close(); return }
    this.state.Load()
    this.flash('Loaded')
    this.close()
  }
  restart() { this.state.Restart(); this.flash('Restarted'); this.close() }
  actorWalking() { this.state.TogglePoodleMode(); this.close() }
  reset() { this.state.Reset(); this.close() }

  private flash(text: string) {
    this.message.set(text)
    clearTimeout(this.messageTimer)
    this.messageTimer = setTimeout(() => this.message.set(null), 1400)
  }
}
