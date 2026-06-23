# Building icons (32×32)

Drop a building's icon here as `<slug>.png` (32×32 recommended), then list its
slug in `AVAILABLE_BUILDING_ICONS` in `src/app/building-icons.ts`. The image then
replaces the emoji everywhere (map + palette); anything not listed keeps its
emoji fallback and makes no network request.

Slugs are defined in `BUILDING_IMAGE_SLUGS` in `src/app/building-icons.ts`, e.g.:

- wheat-farm.png
- bakery.png
- house.png
- lumber-hut.png

Served at runtime from `assets/icons/buildings/<slug>.png` (the `public/` folder
is copied to the web root by the Angular build).
