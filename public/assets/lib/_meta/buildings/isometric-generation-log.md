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
