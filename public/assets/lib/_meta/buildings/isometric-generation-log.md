# Isometric Building Generation Log

## 2026-06-26 - Marketplace

- Saved candidate: `public/assets/reserve/buildings/marketplace/isometric-v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f054b-7771-7023-bc0d-6828ed7e99c7/ig_06d19c5cdb1962ff016a3ecc22be148196ac2bb78bdb46ed61.png`
- Result note: rejected for runtime use because the generator baked a checkerboard transparency pattern into an RGB PNG.

- Saved candidate: `public/assets/reserve/buildings/marketplace/isometric-v2.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f054b-7771-7023-bc0d-6828ed7e99c7/ig_01b48c0134715515016a3ecd2c66e081968149ebe6faf2ed78.png`
- Result note: clean plain-white source background, strong isometric top/side read, no magenta chroma-key background.
- Prompt summary: redraw the rustic marketplace stall as a cute high-detail pixel-art isometric building for a 64x32 isometric tile map, preserving the cream/red canopy, wooden frame, produce baskets, lantern, warm old-time market feel, with no text, people, watermark, modern materials, checkerboard, or magenta background.

## 2026-06-26 - Farms, Workshop, Warehouse

- Saved candidate: `public/assets/reserve/buildings/crop-farm/isometric-v1.png`
- Result note: first clean-white isometric crop farm pass; good 2x2 diamond yard but later superseded by stricter side-gate/alpha-edge feedback.

- Saved candidate: `public/assets/reserve/buildings/animal-farm/isometric-v1.png`
- Result note: first clean-white isometric animal farm pass; good 2x2 diamond yard but later superseded by stricter side-gate/alpha-edge feedback.

- Saved candidate: `public/assets/reserve/buildings/workshop/isometric-v1.png`
- Result note: first clean-white isometric workshop pass; good 2x2 stone courtyard but later superseded by stricter side-gate/alpha-edge feedback.

- Saved candidate: `public/assets/reserve/buildings/warehouse/isometric-v1.png`
- Result note: first clean-white compact warehouse pass; later superseded by a transparent 1x1 footprint candidate.

- Saved candidate: `public/assets/reserve/buildings/crop-farm/isometric-v4-alpha.png`
- Chroma-key source: `public/assets/reserve/buildings/crop-farm/isometric-v4-chromakey.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f054b-7771-7023-bc0d-6828ed7e99c7/ig_05406092ff90d370016a3ed39c5fb4819390192e30e51ae924.png`
- Result note: preferred crop farm alpha candidate. Building is anchored at the top corner, fence edges form a straight 2x2 isometric square, side gate/side door only, and the transparent ground edge fits the isometric grid.

- Saved candidate: `public/assets/reserve/buildings/animal-farm/isometric-v2-alpha.png`
- Chroma-key source: `public/assets/reserve/buildings/animal-farm/isometric-v2-chromakey.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f054b-7771-7023-bc0d-6828ed7e99c7/ig_08ae32d0c3b925d0016a3ed53885d48190a3cb8a212f570240.png`
- Result note: preferred animal farm alpha candidate. Barn is anchored at the top corner, fence edges form a straight 2x2 isometric square, side gate/side door only, and the transparent ground edge fits the isometric grid.

- Saved candidate: `public/assets/reserve/buildings/workshop/isometric-v2-alpha.png`
- Chroma-key source: `public/assets/reserve/buildings/workshop/isometric-v2-chromakey.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f054b-7771-7023-bc0d-6828ed7e99c7/ig_0b20442b55b7e5b6016a3ed608e3048196881232b22bdf40cb.png`
- Result note: preferred workshop alpha candidate. Workshop is anchored at the top corner, stone wall edges form a straight 2x2 isometric square, side gate/side door only, and the transparent courtyard edge fits the isometric grid.

- Saved candidate: `public/assets/reserve/buildings/warehouse/isometric-v2-alpha.png`
- Chroma-key source: `public/assets/reserve/buildings/warehouse/isometric-v2-chromakey.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f054b-7771-7023-bc0d-6828ed7e99c7/ig_0db4d2daa26538a8016a3ed6f46b388194b093c3c1295d1f6f.png`
- Result note: preferred warehouse alpha candidate. Compact warehouse sits on a crisp 1x1 isometric base pad with transparent edges, side door only, and props kept inside the footprint.

## 2026-06-26 - 3x3 Farm Red-Diamond Footprint Pass

- Runtime comparison: selected 3x3 farms in the canvas renderer show a red 2:1 diamond footprint. Existing crop/animal farm art reads as a taller fenced square yard, so the ground plane does not align with the red truth outline.
- Corrected art direction: the field/pasture/fence footprint should align to the red 3x3 diamond; the farmhouse/barn is allowed to stick out upward/behind the field as vertical building art.
- Saved runtime comparison screenshots:
  - `public/assets/reserve/_meta/buildings/farm-red-diamond-20260626/crop-current-red-diamond.png`
  - `public/assets/reserve/_meta/buildings/farm-red-diamond-20260626/animal-current-red-diamond.png`
  - `public/assets/reserve/_meta/buildings/farm-red-diamond-20260626/crop-candidate-white-red-diamond.png`
  - `public/assets/reserve/_meta/buildings/farm-red-diamond-20260626/animal-candidate-white-red-diamond.png`

- Saved first attempt: `public/assets/reserve/buildings/crop-farm/isometric-v5-red-diamond-field-square-attempt.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0588-ac68-7692-93cb-25882aff1a47/ig_026766fc30b2bf1c016a3edd003e688196a4ee2f9ebde2bc63.png`
- Result note: strong style match but the yard still reads too square/tall relative to the runtime red diamond. RGB PNG with generated transparency presentation.

- Saved first attempt: `public/assets/reserve/buildings/animal-farm/isometric-v3-red-diamond-pasture-square-attempt.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0588-ac68-7692-93cb-25882aff1a47/ig_026766fc30b2bf1c016a3edd4264e08196a5cdae660bdf26f3.png`
- Result note: strong style match but the pasture still reads too square/tall relative to the runtime red diamond. RGB PNG with generated transparency presentation.

- Saved candidate: `public/assets/reserve/buildings/crop-farm/isometric-v5-red-diamond-field-white.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0588-ac68-7692-93cb-25882aff1a47/ig_004937120bc9990f016a3edeef3a188190a566ae3b94fba226.png`
- Result note: plain-white source version. Crop field/fence is lower and wider to better match the 3x3 red diamond; farmhouse protrudes upward from the back/top of the field. RGB PNG, no alpha.

- Saved alternate: `public/assets/reserve/buildings/crop-farm/isometric-v5-red-diamond-field-checker.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0588-ac68-7692-93cb-25882aff1a47/ig_0dc6ee028aafdb4e016a3ede0887b881978aa988dba5073f6c.png`
- Result note: flatter footprint alternate with baked checkerboard background. Useful for proportion review only; RGB PNG, no alpha.

- Saved candidate: `public/assets/reserve/buildings/animal-farm/isometric-v3-red-diamond-pasture-white.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0588-ac68-7692-93cb-25882aff1a47/ig_004937120bc9990f016a3edf2dc14c8190872833abbcbfb825.png`
- Result note: plain-white source version. Dirt pasture/fence is lower and wider to better match the 3x3 red diamond; barn protrudes upward from the back/top of the pasture. RGB PNG, no alpha.

- Saved alternate: `public/assets/reserve/buildings/animal-farm/isometric-v3-red-diamond-pasture-checker.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0588-ac68-7692-93cb-25882aff1a47/ig_0dc6ee028aafdb4e016a3ede445a7081979e7fce83002133d0.png`
- Result note: flatter footprint alternate with baked checkerboard background. Useful for proportion review only; RGB PNG, no alpha.

## 2026-06-26 - Animal Farm Flatter Pasture Revision

- User feedback: `public/assets/reserve/buildings/animal-farm/isometric-v3-red-diamond-pasture-white.png` has a view angle that is slightly too high and a thick dirt/ground layer that makes the farm feel fake.
- Geometry reference: `public/assets/reserve/iso-tile-reference.png`
- Saved candidate: `public/assets/reserve/buildings/animal-farm/isometric-v4-red-diamond-pasture-flatter-white.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f05bb-57bb-7703-ba5f-65d942cc1c59/ig_0681c3d4a18560d6016a3ef0f222788193bc1430c1b2e70d47.png`
- Result note: flatter/wider pasture and lower apparent view angle, with a reduced perimeter edge.

- Saved preferred candidate: `public/assets/reserve/buildings/animal-farm/isometric-v5-red-diamond-pasture-flush-white.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f05bb-57bb-7703-ba5f-65d942cc1c59/ig_0351933ec0bfc489016a3ef161478881909fd486cc5924f485.png`
- Result note: preferred revision. Keeps the red barn, fence, gate, hay props, and cozy pixel style while making the 3x3 pasture read flatter against the 2:1 isometric reference. The ground edge is treated as a thin outline rather than a raised dirt slab or thick green/brown base layer.

## 2026-06-26 - Animal Farm Side-Gate Revision

- User feedback: move the gate from the front-center fence to one of the fence edges.
- Saved candidate: `public/assets/reserve/buildings/animal-farm/isometric-v6-red-diamond-pasture-side-gate-white.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f05bb-57bb-7703-ba5f-65d942cc1c59/ig_0f5f6b30c211760e016a3ef9d7ad108193a594178c0c8fce3e.png`
- Result note: keeps the flatter flush-pasture animal farm direction from v5 while relocating the gate onto the right/front-right fence edge.
