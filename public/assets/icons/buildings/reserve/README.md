# Reserve icons

Alternate / unused art kept out of the way. The app does **not** load anything in this folder.

## How to swap a version

The app references **canonical filenames** in the parent folder (e.g. `clinic.png`). To switch to a reserve version, just replace the canonical file:

```
# from icons/buildings/
mv clinic.png reserve/clinic-old.png      # set the current one aside
mv reserve/<variant>.png clinic.png   # promote the reserve art
```

No code change needed — the filename stays the same, only the image swaps.
