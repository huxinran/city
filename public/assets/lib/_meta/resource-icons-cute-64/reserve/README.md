# Reserve icons

Alternate / unused art kept out of the way. The app does **not** load anything in this folder.

## How to swap a version

The app references **canonical filenames** in the parent folder (e.g. `wine.png`). To switch to a reserve version, just replace the canonical file:

```
# from resource-icons-cute-64/
mv wine.png reserve/wine-old.png      # set the current one aside
mv reserve/<variant>.png wine.png   # promote the reserve art
```

No code change needed — the filename stays the same, only the image swaps.
