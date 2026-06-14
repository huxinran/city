import { ChangeDetectorRef, effect, inject } from '@angular/core'
import { StateService } from './state.service'

// Marks the calling OnPush component dirty whenever one of the selected
// StateService signals changes. Call once from a component's constructor
// (an injection context). Declare exactly the signals the view depends on:
//
//   repaintOn(s => [s.frame])                 // live per-tick data (carts, production…)
//   repaintOn(s => [s.mapVersion])            // map / selection / tool edits
//   repaintOn(s => [s.frame, s.mapVersion])   // both
//
// This is the single place that wires the simulation's render heartbeat into
// the change-detection of OnPush components, so adding a new live component is
// a one-liner and never silently goes stale.
export function repaintOn(select: (s: StateService) => Array<() => unknown>): void {
  const state = inject(StateService)
  const cdr = inject(ChangeDetectorRef)
  const sources = select(state)
  effect(() => {
    for (const s of sources) s()
    cdr.markForCheck()
  })
}
