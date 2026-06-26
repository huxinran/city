# Population Bust Generation Log

## 2026-06-22

Reference set: top UI resident icons from `public/assets/population/*.png`.

- `farmer-bust.png`
  - Request: bust version of current farmer tier; adult, less childlike than the top UI full-body icon.
  - Saved path: `public/assets/population/busts/farmer-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_01e3a7a689a9f967016a395be463ec81959a2a1d0b15c110bd.png`

- `worker-bust.png`
  - Request: bust version of current worker tier; adult, less childlike than the top UI full-body icon.
  - Saved path: `public/assets/population/busts/worker-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_01e3a7a689a9f967016a395c5b44dc819582a5a224f4b0f317.png`

- `artisan-bust.png`
  - Request: bust version of current artisan tier with teal cap/headscarf, apron, brush, and craft cue.
  - Saved path: `public/assets/population/busts/artisan-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_01e3a7a689a9f967016a395cd1a17881959201c39f8e7da19f.png`

- `scholar-bust.png`
  - Request: bust version of current scholar tier with navy coat, spectacles, and book cue.
  - Saved path: `public/assets/population/busts/scholar-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_052ec3b526148d45016a395f8654b481939ecdbd3c2a8564d8.png`

- `entrepreneur-bust.png`
  - Request: bust version of current entrepreneur tier with burgundy waistcoat and coin pouch cue.
  - Saved path: `public/assets/population/busts/entrepreneur-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_01e3a7a689a9f967016a395e2672cc8195b5a2087c05fe5933.png`

- `magnate-bust.png`
  - Request: bust version of current magnate tier with top hat, formal coat, mustache, and cane/coin cue.
  - Saved path: `public/assets/population/busts/magnate-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_01e3a7a689a9f967016a395e9dfd088195ad535792e6e43c6c.png`

Notes: saved as generated; no background cleanup, app mapping, runtime manifest wiring, or code integration.

- `entrepreneur-bust-older.png`
  - Request: make the entrepreneur bust look a bit older, matching the updated full-body entrepreneur.
  - Saved path: `public/assets/population/busts/entrepreneur-bust-older.png`
  - Source file reference: `public/assets/population/busts/entrepreneur-bust.png`
  - Generated source cache: `C:/Users/Xinran/.codex/generated_images/019eed85-ad70-76f0-b90e-7f2011969d0c/ig_0d4172572433a7d2016a39629a0c38819394ad63fedcb0143c.png`
  - Notes: saved as generated; no background cleanup, app mapping, runtime manifest wiring, or code integration.

## 2026-06-26

Revision request: keep the population tier busts' successful cute pixel-art look, but remove the separate role objects, unify proportions across the set, and redo Artisan as a true bust without visible hands.

Shared v2 family rules:

- Head-and-shoulders bust only.
- No held or side props: no wheat, wrench, book, money bag, coins, cane, pottery, brush, tools, papers, scrolls, or other separate role objects.
- No visible hands or forearms.
- Similar three-quarter angle, warm painterly pixel highlights, dark brown/olive outlines, and comparable crop/proportion across all tiers.
- Generated source images returned with an RGB checkerboard-like background, so connected edge background was converted to alpha for the project-ready `*-v2-clean-alpha.png` files. The untouched RGB generated copies are also retained as `*-v2-clean.png`.
- No app mapping, runtime manifest wiring, or code integration.

- `farmer-bust-v2-clean-alpha.png`
  - Request: remove wheat and any side props; keep straw hat, green shirt, suspenders, adult friendly farmer identity.
  - Saved path: `public/assets/used/population/busts/farmer-bust-v2-clean-alpha.png`
  - Generated RGB copy: `public/assets/used/population/busts/farmer-bust-v2-clean.png`
  - Generated source cache: `/Users/xinranhu/.codex/generated_images/019f024d-a143-7702-b514-e8873eba99ee/ig_04e7073357238450016a3e090b6ee481959e4b0478ae449adf.png`

- `worker-bust-v2-clean-alpha.png`
  - Request: remove wrench/tools; keep blue cap, blue shirt, suspenders/apron straps, adult friendly worker identity.
  - Saved path: `public/assets/used/population/busts/worker-bust-v2-clean-alpha.png`
  - Generated RGB copy: `public/assets/used/population/busts/worker-bust-v2-clean.png`
  - Generated source cache: `/Users/xinranhu/.codex/generated_images/019f024d-a143-7702-b514-e8873eba99ee/ig_04e7073357238450016a3e0954b1248195bb7adea4a5f8b25b.png`

- `artisan-bust-v2-clean-alpha.png`
  - Request: redo as a true bust; remove hands, brush, pottery, and tools; keep teal headscarf, cream shirt, rust-red apron/vest cue.
  - Saved path: `public/assets/used/population/busts/artisan-bust-v2-clean-alpha.png`
  - Generated RGB copy: `public/assets/used/population/busts/artisan-bust-v2-clean.png`
  - Generated source cache: `/Users/xinranhu/.codex/generated_images/019f024d-a143-7702-b514-e8873eba99ee/ig_04e7073357238450016a3e09a623088195a31a321a26eb4a2f.png`

- `scholar-bust-v2-clean-alpha.png`
  - Request: remove book/papers; keep spectacles, navy coat, academic collar/cravat, friendly scholar identity.
  - Saved path: `public/assets/used/population/busts/scholar-bust-v2-clean-alpha.png`
  - Generated RGB copy: `public/assets/used/population/busts/scholar-bust-v2-clean.png`
  - Generated source cache: `/Users/xinranhu/.codex/generated_images/019f024d-a143-7702-b514-e8873eba99ee/ig_04e7073357238450016a3e09f4b360819589c07068d1cb0a8a.png`

- `entrepreneur-bust-v2-clean-alpha.png`
  - Request: remove money bag/coins; keep burgundy waistcoat and make the tier read older/adult merchant.
  - Saved path: `public/assets/used/population/busts/entrepreneur-bust-v2-clean-alpha.png`
  - Generated RGB copy: `public/assets/used/population/busts/entrepreneur-bust-v2-clean.png`
  - Generated source cache: `/Users/xinranhu/.codex/generated_images/019f024d-a143-7702-b514-e8873eba99ee/ig_04e7073357238450016a3e0a43c52c8195b72637849bca69e5.png`

- `magnate-bust-v2-clean-alpha.png`
  - Request: remove cane/coin cue; keep top hat, formal coat, gold trim, cravat, curled mustache.
  - Saved path: `public/assets/used/population/busts/magnate-bust-v2-clean-alpha.png`
  - Generated RGB copy: `public/assets/used/population/busts/magnate-bust-v2-clean.png`
  - Generated source cache: `/Users/xinranhu/.codex/generated_images/019f024d-a143-7702-b514-e8873eba99ee/ig_04e7073357238450016a3e0a99dcc08195b0c9924041418802.png`
