# Terrain Render Experiment

Generated on 2026-06-26 from the experimental `terrain-render-experiment` branch.

- `terrain-surface-experiment-preview.png` is a Playwright screenshot of the live map canvas at `1280x900`.
- The renderer experiment keeps the gameplay grid unchanged, but draws terrain through cached whole-map splat layers, soft alpha masks, jittered boundary strokes, and sparse deterministic detail pixels.
- Safety checkpoint before the experiment: `ab7072f` (`checkpoint before terrain rendering experiment`).

To discard the experiment, switch back to `main` at the checkpoint or revert the experiment commit made after this note.
