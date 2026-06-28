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

- Saved candidate: `public/assets/reserve/buildings/crop-farm/v5.png`
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

## 2026-06-27 - Crop Farm Grid Alignment

- User feedback: current crop farm isometric view does not align with the map grid; use the animal farm angle and `public/assets/lib/iso-tile-reference.png` as references.
- Promoted runtime asset: `public/assets/used/buildings/crop-farm.png`
- Source library asset: `public/assets/lib/buildings/crop-farm/v5.png`
- Result note: selected the existing red-diamond crop farm candidate because its lower, wider field footprint better matches the 2:1 isometric grid and the animal farm's runtime angle.

## 2026-06-27 - Fishermen Wharf, Grove Farm, Food Workshop, University

- Saved candidate: `public/assets/lib/buildings/fishermen-wharf/v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0cd56e6f93b409f1016a3f421cf570819093126f2ecd1325e2.png`
- Result note: medium 2x2 wharf with a shack over water at the top/back corner, walkways around the top and side edges, and a mostly clear lower deck area for future produce/resource icons.

- Saved candidate: `public/assets/lib/buildings/grove-farm/v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0cd56e6f93b409f1016a3f4262fbe881908027ac51cf871c03.png`
- Result note: orchard/grove farm variant in the animal-farm/crop-farm family, with a rustic barn at the top/back corner, fenced plot, side gate, and readable fruit trees across the main field.

- Saved candidate: `public/assets/lib/buildings/food-processing-workshop/v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0cd56e6f93b409f1016a3f429c1b788190b5cbbcd5084a423b.png`
- Result note: workshop variant for prepared-food production, with oven, press, barrels, sacks, bread, oil, jam, grapes, and olives replacing blacksmith/anvil cues.

- Saved candidate: `public/assets/lib/buildings/university-map/v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0cd56e6f93b409f1016a3f42df4504819094756dae63ae0cf2.png`
- Result note: fancy large 4x4 civic university with symmetrical academic hall, towers, ornate stonework, courtyard, globe/fountain ornament, and no readable text.

## 2026-06-27 - Service Building Isometric Set

- User feedback: redo the four service buildings as a coherent set, preserving the existing cute service-building look while making the view more isometric. Use the same basic building design, vary roof color, add a role symbol on the facade, and add a special tool on the side wall.
- Family direction: compact old-time timber-and-stone service hall, cream plaster panels, chunky stone foundation, arched double doors, upper cupola, tiled roof, warm wood trim, dark brown/olive pixel outline, and clear 45 degree / 30 degree isometric front-plus-right-side view.

- Saved candidate: `public/assets/lib/buildings/fire-station/v2.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_072fc6bae23e8a39016a3f48306d748191bb57d2a76786d96a.png`
- Result note: red-roof fire station with flame facade badge, bell cupola, and side-wall hose reel, bucket, axe, and nozzle props.

- Saved candidate: `public/assets/lib/buildings/police-station/v3.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_072fc6bae23e8a39016a3f488251d881919f475f53bbe2039a.png`
- Result note: blue-roof police/policy office with shield-and-batons facade badge plus side-wall notice board, seals, baton rack, and lantern.

- Saved candidate: `public/assets/lib/buildings/clinic/v7.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_072fc6bae23e8a39016a3f48d031ac819191ad8e5d8860b427.png`
- Result note: green-roof clinic with red-cross facade badge plus side-wall herbs, mortar and pestle, and small healer shelf.

- Saved candidate: `public/assets/lib/buildings/engineer-station/v4.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_072fc6bae23e8a39016a3f49254dc481918958a2673c7623ad.png`
- Result note: gold-roof engineer station with compass/gear facade badge plus side-wall drafting board and measuring tools.

## 2026-06-27 - Service Building Proportion Revisions

- User feedback: clinic is the best reference. Fire is fatter than the others and should lose the chimney. Engineer is slightly fatter. Police/policy roof structure is smaller than the others.
- Revision direction: keep `v7.png` as the family anchor for width, roof mass, cupola scale, and isometric angle.

- Saved revision: `public/assets/lib/buildings/fire-station/v3.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_051ea81ab6835aef016a3f505770a88190b03b62c1e70b256d.png`
- Result note: slimmer fire station matching the clinic proportions more closely. Chimney removed; flame badge, bell cupola, and side-wall fire tools preserved.

- Saved revision: `public/assets/lib/buildings/engineer-station/v5.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_051ea81ab6835aef016a3f50a6fd088190a6b545d555555307.png`
- Result note: slightly slimmer engineer station with reduced side-wall bulk, while preserving the compass/gear facade mark and drafting/tool props.

- Saved revision: `public/assets/lib/buildings/police-station/v4.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_051ea81ab6835aef016a3f50f787e88190bc0179900d6ac702.png`
- Result note: police/policy office with a larger roof cupola closer to the clinic's cupola scale, preserving the blue roof, shield facade mark, and side notice-board tools.

- Saved revision: `public/assets/lib/buildings/police-station/v5.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f072e-9b34-7fd0-8cdf-2a4106c43062/ig_0d136d728a5efa0d016a3f540a90dc819e902d7cd3eb458598.png`
- Result note: correction after v4 overdid the roof structure scale. Keeps a readable medium cupola, smaller than v4 but larger than the original tiny police cupola, and reduces the overall apparent presence toward the clinic anchor.

## 2026-06-27 - Wharf, Grove, Food Workshop Revisions

- User feedback: isometric view and footprint shape are the top rule for building assets. The wharf was close, but the lower/front platform should be removed and left as water. Grove should read as a tree-family building without being a dense orchard. Food workshop should keep an empty yard so project art/icons can be drawn later. University v1 accepted.

- Saved revision: `public/assets/lib/buildings/fishermen-wharf/v2.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0e892ce83ddea653016a3f4705b584819091f0fcbe65ac97e1.png`
- Result note: keeps the fisher shack and top/back walkways, but removes the large lower deck. The lower/front footprint is open water with pilings, giving a cleaner 2x2 water-base read.

- Saved revision: `public/assets/lib/buildings/grove-farm/v2.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0e892ce83ddea653016a3f475d20fc8190b624325a85b15b27.png`
- Result note: replaces the dense fruit orchard with a tree nursery/tree-farm yard. The center stays open, while saplings, seedling beds, logs, stump rings, and nursery props show the tree-family role around the edges.

- Saved revision: `public/assets/lib/buildings/food-processing-workshop/v2.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0e892ce83ddea653016a3f47b9c3fc819087f5c803f08b3790.png`
- Result note: keeps food-processing identity with a small oven, press, sacks, barrels, and herbs near the building/edges, but leaves the central stone courtyard empty for future project art.

## 2026-06-27 - Wharf Pole, Grove Crop, Bakery Shape Revisions

- User feedback: remove the poles from the wharf water; bakery/workshop isometric shape still feels off; grove image is cut off. Reaffirmed that fitting the isometric footprint is the highest priority for farm/grove and workshop assets.

- Saved revision: `public/assets/lib/buildings/fishermen-wharf/v3.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_02ab2c8cc17f4f62016a3fccb93aec81a09a02763372b66bc9.png`
- Result note: removes the isolated posts from the open lower/front water area while keeping structural supports under the dock and shack.

- Saved revision: `public/assets/lib/buildings/grove-farm/v3.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_02ab2c8cc17f4f62016a3fcd20053481a09c5bd5b65ab27845.png`
- Result note: scales and recenters the tree nursery so the full asset fits with white padding, keeps an open central yard, and preserves tree-family cues around the edges.

- Saved revision: `public/assets/lib/buildings/food-processing-workshop/v3.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_02ab2c8cc17f4f62016a3fcd92cbf881a096f70ec2d734a198.png`
- Result note: improves the bakery/workshop footprint toward a flatter 2:1 isometric courtyard, with the building and oven anchored at the back and the center/front left empty.

## 2026-06-27 - Wharf Fuzzy Water Edge

- User feedback: save grove and bakery v3; revise wharf so the water is fuzzy and merges with the map, using the dock water edge as reference.
- Accepted assets: `public/assets/lib/buildings/grove-farm/v3.png` and `public/assets/lib/buildings/food-processing-workshop/v3.png`.

- Saved revision: `public/assets/lib/buildings/fishermen-wharf/v4.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0715-2bc4-7281-afe2-07c1704dd856/ig_0c1044883317b28b016a3fd82904e8819d8ffb54fd86ed51af.png`
- Result note: keeps the no-open-water-poles layout while changing the water perimeter from a hard geometric tile edge to an irregular fuzzy/wave-broken edge closer to the existing dock asset.

## 2026-06-28 - Grove Farm 3x3 Hut Regeneration

- User feedback: grove farm has the wrong isometric view angle. Regenerate it using animal farm as the base, make it a full 3x3 grove tile, include a hut structure, clear tree tools, and a level open room/yard area to place produce.
- Generation direction: animal-farm-style 3x3 fenced dirt-yard diamond footprint, true 2:1 isometric camera, rustic hut as the main structure, readable pruning/tree tools and orchard props around the edges, broad open center/front dirt area for future produce placement.

- Saved revision: `public/assets/lib/buildings/grove-farm/v4.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f1e-1e48-7771-98ec-1c75d91b5147/ig_0eeede356c4df1b2016a414fd440608193994a466f8f99643e.png`
- Result note: replaces the previous square/front-facing grove yard with a cleaner animal-farm-aligned 3x3 isometric fenced base, centered hut, visible tree tools, small fruit trees at the edges, and an open front-center dirt yard for produce placement.

- User feedback on v4/v5 direction: take animal farm as the base more directly, keep the yard clean, use only three branch trees, make the roof green, and make the structure not a house but more like a roof with shelves below.

- Saved revision: `public/assets/lib/buildings/grove-farm/v5.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f1e-1e48-7771-98ec-1c75d91b5147/ig_0f478be130f2fe19016a415180c04081938eb8d0ac30ace3f8.png`
- Result note: cleaner animal-farm-like 3x3 fenced dirt yard with a green-roof open work shelter, shelves and tree tools below the roof, exactly three bare branch trees around the yard edges, and a large open center/front dirt area.

- Saved processed revision: `public/assets/lib/buildings/grove-farm/v6-cutout-scaled.png`
- Source asset: `public/assets/lib/buildings/grove-farm/v5.png`
- Result note: keeps the accepted v5 composition, removes the plain white background to alpha, trims padding, and scales the render down from 1399x1124 RGB to 1094x812 RGBA so it is closer to the animal farm's active render width.

- User feedback on v6: current look is good, but the view angle is too high. Regenerate with image generation using the reference files and lower the camera elevation by 5-10 degrees.

- Saved revision: `public/assets/lib/buildings/grove-farm/v7-lower-angle.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f1e-1e48-7771-98ec-1c75d91b5147/ig_0b37c7df126f12b0016a415440b6a481948ce71f0476dfc20e.png`
- Result note: preserves the green-roof open shelter, clean animal-farm-like yard, three bare trees, and compact tool rack while lowering the isometric elevation slightly so the shelter and fence show more side.

- Saved processed revision: `public/assets/lib/buildings/grove-farm/v8-lower-angle-cutout-scaled.png`
- Source asset: `public/assets/lib/buildings/grove-farm/v7-lower-angle.png`
- Result note: removes the generated checkerboard/plain background to alpha, trims padding, and scales the lower-angle render to 1094x767 RGBA for the active runtime copy.

- Saved processed revision: `public/assets/lib/buildings/grove-farm/v9-lower-angle-95pct.png`
- Source asset: `public/assets/lib/buildings/grove-farm/v8-lower-angle-cutout-scaled.png`
- Result note: keeps the lower-angle transparent v8 artwork and scales the render to 95% of its previous dimensions, from 1094x767 to 1039x729 RGBA.

- User feedback on v9: still needs regeneration and needs to be flatter.

- Saved revision: `public/assets/lib/buildings/grove-farm/v10-flatter-angle.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f1e-1e48-7771-98ec-1c75d91b5147/ig_071ae56f19c637c5016a41582ed040819781e65079e525c43d.png`
- Result note: regenerates the same clean grove concept with a visibly flatter/lower isometric elevation, shallower green roof, lower shelter silhouette, and broad clean yard.

- Saved processed revision: `public/assets/lib/buildings/grove-farm/v11-flatter-angle-cutout-scaled.png`
- Source asset: `public/assets/lib/buildings/grove-farm/v10-flatter-angle.png`
- Result note: removes the white background to alpha, trims padding, and scales the flatter regenerated asset to 1039x647 RGBA for the active runtime copy.

- User feedback on v11: too flat, take the middle point.

- Saved revision: `public/assets/lib/buildings/grove-farm/v12-mid-angle.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f1e-1e48-7771-98ec-1c75d91b5147/ig_00e9b42894386f77016a415a795f70819596811614aadd563f.png`
- Result note: regenerates the clean grove concept at a midpoint elevation between v9 and v11, keeping the open green-roof shelf shelter, three bare trees, compact tool rack, and broad clean yard.

- Saved processed revision: `public/assets/lib/buildings/grove-farm/v13-mid-angle-cutout-scaled.png`
- Source asset: `public/assets/lib/buildings/grove-farm/v12-mid-angle.png`
- Result note: removes the generated checkerboard/plain background to alpha, crops to alpha bounds, and scales the midpoint asset to 1039x707 RGBA for the active runtime copy.

- User feedback on v13: too square; field should be 30 degree angle, as well as the structure's roof line.

- Saved revision: `public/assets/lib/buildings/grove-farm/v14-30deg-field-roof.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f1e-1e48-7771-98ec-1c75d91b5147/ig_012960b92ecde06d016a415db872448190806f1cc226bb807b.png`
- Result note: regenerates the grove with a broader/flatter field footprint and aligns the green roof, shelf, fence, and yard lines to the same approximate 30 degree isometric diagonal family.

- Saved processed revision: `public/assets/lib/buildings/grove-farm/v15-30deg-field-roof-cutout-scaled.png`
- Source asset: `public/assets/lib/buildings/grove-farm/v14-30deg-field-roof.png`
- Result note: removes the generated checkerboard/plain background to alpha, crops to alpha bounds, and scales the corrected field/roof-angle asset to 1039x695 RGBA for the active runtime copy.

## 2026-06-27 - Service Building True Isometric Regeneration

- User feedback: regenerate the four service buildings with image generation, explicitly asking for isometric view rather than mechanically adjusting the original images.
- Generation direction: true classic 2:1 isometric camera, 45 degree rotation and about 30 degree elevation, front-plus-side faces, clear 2x2 isometric footprint, chunky cute pixel art, white source background, old-time timber-and-stone service buildings.

- Saved revision: `public/assets/lib/buildings/clinic/v9.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0e1e18bf68ea1a0c016a3fe0417a148193bc587fc464ac8cdf.png`
- Result note: green-roof clinic with red cross, cupola, herb and healer props, and a clear isometric grass footprint.

- Saved revision: `public/assets/lib/buildings/fire-station/v5.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0e1e18bf68ea1a0c016a3fe08ad29c8193943dd65e4a23ec8d.png`
- Result note: red-roof fire station with flame badge, cupola, hose, axe, barrel, and a clear isometric grass footprint.

- Saved revision: `public/assets/lib/buildings/police-station/v7.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0e1e18bf68ea1a0c016a3fe0d13a888193a784826f93d6a82a.png`
- Result note: blue-roof police station with shield/baton mark, notice board, lantern, cupola, and a clear isometric grass footprint.

- Saved revision: `public/assets/lib/buildings/engineer-station/v7.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0e1e18bf68ea1a0c016a3fe118e5a88193a72dec0dcd249c70.png`
- Result note: yellow-roof engineer station with gear/compass mark, blueprint/tools/gears, cupola, and a clear isometric grass footprint.

## 2026-06-27 - Service Building Grass-Line and Roof Alignment

- User feedback: keep the regenerated isometric direction, but make the building construction lines match the grass patch lines and make the roofs the same across the service set.
- Revision direction: explicit same-angle isometric grass patch, building footprint/walls/stairs/foundation/roof eaves/roof ridge parallel to the grass diamond edges, and a shared compact roof/cupola template with only color and service props varying.

- Saved revision: `public/assets/lib/buildings/clinic/v10.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_028dc971b34895b5016a3fe25e9b54819299a83af696c13337.png`
- Result note: green-roof clinic with building lines and grass patch edges aligned, using the shared service-building roof/cupola shape.

- Saved revision: `public/assets/lib/buildings/fire-station/v6.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_028dc971b34895b5016a3fe2b32b548192a0ec57e500ab1e2e.png`
- Result note: red-roof fire station with aligned grass/building edges and the shared roof/cupola mass.

- Saved revision: `public/assets/lib/buildings/police-station/v8.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_028dc971b34895b5016a3fe306146081929780fdbc27841caf.png`
- Result note: first blue-roof police alignment pass; roof was still slightly heavy compared with the rest of the service set.

- Saved revision: `public/assets/lib/buildings/police-station/v9.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_095d16147b46a376016a3fe41c878c819eb1d297014b4314e8.png`
- Result note: targeted police revision with compact roof/cupola mass closer to clinic, fire, and engineer. This is the active police version.

- Saved revision: `public/assets/lib/buildings/engineer-station/v8.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_028dc971b34895b5016a3fe351d5588192bf82df204ea8a2bb.png`
- Result note: yellow-roof engineer station with aligned grass/building edges and the shared roof/cupola mass.

## 2026-06-27 - Service Building Fuzzy Grass Edges

- User feedback: make the grass patch edges fuzzy so the buildings blend better on the map, but keep the full patch visible and avoid any cutoff.
- Revision direction: preserve the true-isometric service buildings, aligned construction lines, and shared roof family; change only the base treatment to a soft irregular grass perimeter with tiny broken edge pixels and tufts, with generous white padding around the entire asset.

- Saved revision: `public/assets/lib/buildings/clinic/v11.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0ae0ec634c28d006016a3fe5170d7081a28df2d3ba71ef366c.png`
- Result note: green-roof clinic with fuzzy natural grass perimeter and no clipped patch corners.

- Saved revision: `public/assets/lib/buildings/fire-station/v7.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0ae0ec634c28d006016a3fe56a11f481a29b20014b7529ad6e.png`
- Result note: red-roof fire station with fuzzy natural grass perimeter and no clipped patch corners.

- Saved revision: `public/assets/lib/buildings/police-station/v10.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0ae0ec634c28d006016a3fe5bbdd0081a28e6b38f570ce7f45.png`
- Result note: blue-roof police station with fuzzy natural grass perimeter and no clipped patch corners.

- Saved revision: `public/assets/lib/buildings/engineer-station/v9.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0976-b897-71e1-8064-9bb21b52d727/ig_0ae0ec634c28d006016a3fe617a4ec81a2afd5e37f5e5125c6.png`
- Result note: yellow-roof engineer station with fuzzy natural grass perimeter and no clipped patch corners.

## 2026-06-28 - Grove Farm Flat Parallel Field

- User feedback: redo grove farm because the field was too square; make it flatter, with square edges and parallel isometric lines.
- Revision direction: use the updated footprint-first farm rule. First create a wide, flat isometric diamond/parallelogram field, then place the shed, orchard rows, fences, tools, and bare branch-only trees on top. Do not use real vanishing-point perspective; keep parallel iso edges parallel.
- Saved revision: `public/assets/lib/buildings/grove-farm/v18-flat-parallel-field.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f66-482b-7ef1-b387-2a11936cdc91/ig_0ee78892b970b897016a41656418888190a5aed9b75687d97c.png`
- Runtime copy: `public/assets/used/buildings/grove-farm.png`
- Result note: flatter fenced grove footprint with straighter square/parallelogram edges, parallel fence rails and orchard rows, more branch-only trees, alpha cleanup, and crop to visible bounds.

- Follow-up feedback: still too square; needs to be flatter with square edges and parallel lines.
- Saved revision: `public/assets/lib/buildings/grove-farm/v19-extra-flat-parallel-field.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f66-482b-7ef1-b387-2a11936cdc91/ig_0385f0754464c780016a4167e5dc2881939f94d4b4ec69b07b.png`
- Runtime copy: `public/assets/used/buildings/grove-farm.png`
- Result note: pushes the grove footprint flatter and more tile-like, with a smaller back shed, long straight fence edges, sharp square/parallelogram corners, parallel orchard rows, and branch-only trees.

## 2026-06-28 - Workshop 2x2 Yard / 1x1 Building Revision

- User feedback: current workshop image was good, but the yard shape needed regeneration to an isometric square. Follow-up clarified that the structure can stick out of the footprint, and that the yard is 2x2 while the building itself is 1x1.
- Saved source: `public/assets/lib/buildings/workshop/iso-square-yard-2x2-building-1x1-source-v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f6c-764c-7fa3-bdfa-29ec3281997e/ig_022776e8417d9d25016a4165139fd88195b9a7a3ec3409efd0.png`
- Saved processed revision: `public/assets/lib/buildings/workshop/iso-square-yard-2x2-building-1x1-alpha-v1.png`
- Result note: preserves the blue-roof timber workshop identity while making the yard a 2x2 isometric footprint and keeping the workshop building mass to roughly 1x1, with open work yard space visible around it. The generated checkerboard background was removed to alpha and the active runtime copy was swapped to this revision.

- Follow-up feedback: yard still read too square, then an overcorrection made it rectangular. Correct target is a 2x2 isometric square footprint with height:width ratio 1:2, two pairs of parallel 30-degree edges, and a smaller 1x1 workshop occupying about 20-25% of the yard.
- Saved source: `public/assets/lib/buildings/workshop/true-iso-square-1to2-yard-smaller-building-source-v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f6c-764c-7fa3-bdfa-29ec3281997e/ig_03305970d9d920d6016a4168ce532c8195972b2810d55954cd.png`
- Saved processed revision: `public/assets/lib/buildings/workshop/true-iso-square-1to2-yard-smaller-building-alpha-v1.png`
- Result note: uses the updated prompt constraints, removes the generated checkerboard background to alpha, crops to visible bounds, and swaps the active runtime copy to this flatter 1:2 yard with reduced workshop scale.

- Follow-up feedback: make the yard flatter and move the building into a corner.
- Saved source: `public/assets/lib/buildings/workshop/flatter-yard-corner-building-source-v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f6c-764c-7fa3-bdfa-29ec3281997e/ig_009a9b20c96bbd75016a4169eefbd48197a04b9d2055c035bd.png`
- Saved processed revision: `public/assets/lib/buildings/workshop/flatter-yard-corner-building-alpha-v1.png`
- Result note: pushes the workshop into the back-left corner and keeps most of the yard open in front/right, with a flatter isometric yard silhouette. The generated checkerboard background was removed to alpha and this revision was swapped into the active runtime copy.

- Follow-up feedback: previous result still failed because the yard was not a true iso diamond. Revised direction: exactly four diamond points, no rectangular courtyard, no rear horizontal wall, and the workshop anchored to the top/back vertex with the fence tracing the diamond outline.
- Saved source: `public/assets/lib/buildings/workshop/true-diamond-yard-back-vertex-building-source-v1.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f6c-764c-7fa3-bdfa-29ec3281997e/ig_065e4c29db9d6de9016a416d14984c81908b0dd4d018af614c.png`
- Saved processed revision: `public/assets/lib/buildings/workshop/true-diamond-yard-back-vertex-building-alpha-v1.png`
- Result note: improves the yard read by restoring a pointed front vertex and diagonal fence runs, with the building sitting on the back/top end of the diamond. The generated checkerboard background was removed to alpha and this revision was swapped into the active runtime copy.

- Follow-up feedback: make v1 flatter.
- Saved source: `public/assets/lib/buildings/workshop/true-diamond-yard-back-vertex-building-flatter-source-v2.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f6c-764c-7fa3-bdfa-29ec3281997e/ig_08ebb9a58f350e4e016a416f8672cc8197937a9021aa3737fd.png`
- Saved processed revision: `public/assets/lib/buildings/workshop/true-diamond-yard-back-vertex-building-flatter-alpha-v2.png`
- Result note: keeps the v1 back-vertex building composition and pushes the yard silhouette flatter, with alpha cleanup and active runtime swap.

- Follow-up feedback: make v2 a little bit flatter and move the gate to the side.
- Saved source: `public/assets/lib/buildings/workshop/true-diamond-yard-flatter-side-gate-source-v3.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0f6c-764c-7fa3-bdfa-29ec3281997e/ig_060e05289daa8592016a41713fe0b081949671c1ef0a28d4e3.png`
- Saved processed revision: `public/assets/lib/buildings/workshop/true-diamond-yard-flatter-side-gate-alpha-v3.png`
- Result note: makes the diamond yard slightly flatter, keeps the front point clean, and moves the wooden gate onto the lower-right side edge. The generated checkerboard background was removed to alpha and this revision was swapped into the active runtime copy.

## 2026-06-28 - Food Processing Workshop / Bakery Flatter Isometric Yard

- User feedback: redo the bakery because the current one is too square; flatten its view to isometric.
- Saved processed revision: `public/assets/lib/buildings/food-processing-workshop/v3-flat-isometric.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0fc8-9a9c-7e83-a912-404cb6942456/ig_05564ccf3d780b2f016a417b4c30188194a842f0c98c2ab362.png`
- Runtime copy: `public/assets/used/buildings/food-processing-workshop.png`
- Result note: preserves the rustic bakery/workshop cues while making the yard much lower and wider, with a flatter 2:1 isometric footprint, back-edge bakery/oven placement, broad open center courtyard, alpha cleanup, and crop to visible bounds.

- Follow-up feedback: previous revision was too flat; yard should be a 1:2 diamond with roughly 30 degree edges.
- Saved processed revision: `public/assets/lib/buildings/food-processing-workshop/v4-1to2-diamond.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0fc8-9a9c-7e83-a912-404cb6942456/ig_02a03c9aea68cb1e016a417dc41e08819088c0144a9ba51e4f.png`
- Runtime copy: `public/assets/used/buildings/food-processing-workshop.png`
- Result note: pulls the yard back from the over-flattened panorama toward a normal isometric square footprint: a clearer 1:2 diamond/parallelogram with about 30 degree edge direction, while preserving the open bakery courtyard and back-edge bakery/oven props.

- Follow-up feedback: very close; make it just a bit more flat.
- Saved processed revision: `public/assets/lib/buildings/food-processing-workshop/v5-slightly-flatter-1to2-diamond.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0fc8-9a9c-7e83-a912-404cb6942456/ig_0f64d7c857be1ccc016a417ef7aae48193a03bbdc9d4751633.png`
- Runtime copy: `public/assets/used/buildings/food-processing-workshop.png`
- Result note: preserves the v4 composition and bakery/oven placement while nudging the yard slightly flatter, keeping the footprint close to the intended 1:2 isometric diamond rather than returning to the earlier over-flattened panorama.

- Follow-up feedback: v5 reads as a rectangle; make the yard a square.
- Saved processed revision: `public/assets/lib/buildings/food-processing-workshop/v6-square-diamond-yard.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0fc8-9a9c-7e83-a912-404cb6942456/ig_06c3bbb8421c33c9016a4188e0142c8190808c6212f2b7edde.png`
- Runtime copy: `public/assets/used/buildings/food-processing-workshop.png`
- Result note: corrects the stretched rectangular courtyard back to a compact isometric square diamond footprint with equal-feeling side lengths, while preserving the bakery, oven, press, shelf, and open courtyard identity.

## 2026-06-28 - Grove Farm Roomy Uncut Corners

- User feedback: redraw the current grove farm and make sure no corner is cut off.
- Saved processed revision: `public/assets/lib/buildings/grove-farm/v28-roomy-uncut-corners.png`
- Source cache: `/Users/xinranhu/.codex/generated_images/019f0fda-32e4-7572-82ed-a823dfda1f5c/ig_09db1c9af2fecdaa016a418062be048197b130ea1a6f8487ac.png`
- Runtime copy: `public/assets/used/buildings/grove-farm.png`
- Result note: preserves the v27 grove identity with the green-roof produce stand, three branch trees, front-right gate, and fenced dirt yard, but regenerates from a roomier white-background source. The background was removed to alpha, the visible asset was trimmed with a small transparent guard band, and all fence/footprint corners remain fully visible.
