# sim/ — the simulation core

Framework-agnostic game logic and domain model. **No Angular, no rendering, no
DOM** (one exception below). Everything here is plain TypeScript that could run
under a different UI framework, a different renderer (e.g. PixiJS), in a worker,
or in a headless test — unchanged.

## The boundary contract

- **sim/ may NOT import** from `@angular/*`, any component, `camera.ts`, the
  `*-icons.ts` view adapters, or anything outside `sim/`. It imports only other
  `sim/` modules and npm libraries.
- **Everyone else imports sim/, never the reverse.** The Angular layer
  (`state.service.ts`, components) is an *adapter* on top of this core:
  `StateService` wraps the tick loop and exposes signals; components render it.
- The set is **closed** — sim modules only import each other — so it can be
  lifted out wholesale.

### The one exception
`persistence.ts` uses `localStorage` (save/load). That's a browser API, not a
framework, so it doesn't break the "swap the UI framework" goal. If you ever need
sim to run truly headless (worker/server/tests without a DOM), inject the storage
instead of calling `localStorage` directly.

## Modules
`types` · `storage` · `tile` · `city` · `building` · `population` ·
`pathfinding` · `utils` · `state` · `persistence`

## Config (`sim/config/`)
Pure data tables, separated from logic so content/balance can be tuned without
touching simulation code:
- `buildings.config.ts` — `BUILDING_DEFS` (every placeable building) + `BOOTSTRAP_MATERIAL` (build-cost overrides)
- `cities.config.ts` — per-region needs, services and house-upgrade baskets (`CITY_PROFILES`)
- `research.config.ts` — university technologies (`ALL_RESEARCH`)

`balance.ts` holds the frequently-tuned global knobs (production speed, housing
occupancy, cart counts/speeds, happiness/upgrade gates). `building.ts` re-exports
the config symbols, so callers still import from `./sim/building`.

`ValidateConfig()` (in `building.ts`) runs at startup in dev and logs config drift
(ingredients/needs with no producer, buildings with no def or icon).

## Why this matters
The renderer has already gone from Angular DOM → canvas, and may go canvas →
PixiJS next. Each of those is a swap of the *adapter* layer. Keeping the sim core
clean is what makes those swaps cheap and the game logic testable in isolation.
