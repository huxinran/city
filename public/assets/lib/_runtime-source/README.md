# Runtime source migration

This folder preserves active images that did not already have an identical file in the curated library when `active-assets.json` was introduced.

It mirrors stable paths under `public/assets/used/`, but the files here are source files, not runtime copies. They can be moved into normal category/subject/version folders gradually; update `public/assets/active-assets.json` when doing so.

Do not add new art here during normal work. Save new versions in a curated `lib/<category>/<subject>/` folder and activate them with `tools/swap-asset.mjs`.
