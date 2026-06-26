# Farm Animal Generation Log - 2026-06-26

## Batch

- Project save folder: `public/assets/reserve/farm-animals-20260626/`
- Source cache folder: `C:\Users\Xinran\.codex\generated_images\019f01e0-3ec0-7b00-be98-bafaecbc9171\`
- Goal: new coherent farm animal resource set using the old cow, pig, sheep, chicken, and horse images as style examples, with minor consistency adjustments.
- Style rule: cute cartoon-ish high-detail pixel art, chunky visible pixels, rounded chibi proportions, friendly expressions, dark brown outline, warm highlights, soft shadows, clean single-subject framing.

## Assets

| Animal | Project path | Source cache file | Notes |
| --- | --- | --- | --- |
| cow | `public/assets/reserve/farm-animals-20260626/cow.png` | `ig_082f532894c3a84d016a3dee7173208196af6f89648cbe5785.png` | Kept old cow identity, softened into rounder family proportions. |
| pig | `public/assets/reserve/farm-animals-20260626/pig.png` | `ig_04e9e7742bdc6825016a3deeb4a1b08196bb2d8ae4300b10d7.png` | Close to old pig style; strong match for the set. |
| sheep | `public/assets/reserve/farm-animals-20260626/sheep.png` | `ig_0f8fff42c7484b41016a3def11b8ac8190af2e4b509d669aad.png` | Rounded wool body and friendly face match the old set well. |
| horse | `public/assets/reserve/farm-animals-20260626/horse.png` | `ig_09e989a08914556f016a3def686a84819488e15be9f8913962.png` | First pass improved old horse but still a little naturalistic. Kept as alternate. |
| horse v2 | `public/assets/reserve/farm-animals-20260626/horse-v2.png` | `ig_02490457c88395bf016a3df1793d7c8195812e717666adafe0.png` | Chosen horse: larger head, shorter legs, simpler mane, more compact pony-like silhouette. |
| llama | `public/assets/reserve/farm-animals-20260626/llama.png` | `ig_04011d301101645f016a3defa97c408197b9010ce983d85a64.png` | New animal; kept taller species silhouette but rounded and soft. |
| water buffalo | `public/assets/reserve/farm-animals-20260626/water-buffalo.png` | `ig_0df15cd865d6ccb6016a3df00bee2481968c70b439259e7f14.png` | New animal; broad body and horns read clearly, still friendly. |
| chicken | `public/assets/reserve/farm-animals-20260626/chicken.png` | `ig_04bd59fd1fd947df016a3df06706a88197b961173ebff222fa.png` | Close to old chicken, with chunkier readable feet. |
| duck | `public/assets/reserve/farm-animals-20260626/duck.png` | `ig_0f4554296f64dc2b016a3df0a8d7a48193a7d5b5e55fa3094a.png` | New bird sibling; plump body, flat bill, readable at small size. |
| goose | `public/assets/reserve/farm-animals-20260626/goose.png` | `ig_0128f650e3168aec016a3df105028c819090d1c2bcb4922941.png` | New bird sibling; taller than duck but still rounded and friendly. |

## Review

- Final review sheet: `public/assets/reserve/farm-animals-20260626/contact-sheet-v2.png`
- Best consistency anchors: pig, sheep, chicken, duck, goose.
- Main correction made: replaced the first horse pass with `horse-v2.png` because the original horse direction still leaned too realistic compared with the round cow, pig, sheep, and chicken style.
- Remaining watch item: water buffalo horns are naturally large and detailed. They still read friendly, but future versions should keep horn shapes rounded and avoid making them sharper or more realistic.

## Prompt Pattern

Each animal used the same core prompt structure:

```text
Use case: stylized-concept
Asset type: single game resource asset for a cozy farming/city-builder game
Primary request: create a cute cartoon-ish pixel art <animal> asset as part of a coherent farm animal set.
Reference style: follow the visible old cow, sheep, pig, chicken, and horse images as examples; match the rounded cow/sheep/pig/chicken family.
Subject: one full-body <animal>, side/front three-quarter view facing left, rounded chibi proportions, large friendly head, short sturdy legs where anatomically appropriate, gentle expression, readable species silhouette.
Style/medium: polished high-detail pixel art with chunky visible pixels, soft rounded forms, warm painterly pixel highlights, deeper soft shadows, dark brown pixel outline, old-time cozy farming game look.
Composition/framing: centered on a square canvas, subject fills most of the image area with generous padding, readable at small in-game resource size.
Scene/backdrop: clean plain white background.
Constraints: one animal only, no text, no watermark, no UI frame, no extra objects, no scenery.
Avoid: realistic anatomy, thin legs, harsh black outline, modern props, flat app-icon style.
```
