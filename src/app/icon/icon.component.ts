import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Renders an icon as a <size>x<size> image when `src` is given (and loads),
// otherwise falls back to the `fallback` emoji/text. Keeping the fallback means
// the UI works before any art exists, and never shows a broken image.
@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  template: `
    @if (src && !failed) {
      <img [src]="src" [alt]="alt" [width]="size" [height]="size"
           (error)="failed = true" class="icon-img">
    } @else {
      <span class="icon-emoji" [style.font-size.px]="size">{{ fallback }}</span>
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
    .icon-img { object-fit: contain; display: block; }
    .icon-emoji { line-height: 1; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnChanges {
  @Input() src?: string
  @Input() fallback = ''
  @Input() alt = ''
  @Input() size = 32

  failed = false

  ngOnChanges(changes: SimpleChanges) {
    // A different source may exist; clear a previous load failure so we retry.
    if (changes['src']) {
      this.failed = false
    }
  }
}
