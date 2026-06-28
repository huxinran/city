# Cart Sprite Generation Log - 2026-06-28

## Isometric cart sprite redo

Shared requirements:
- Cute cartoon-ish high-detail pixel art for the cozy old-time city-builder style.
- True isometric orthographic view aligned to the game's 2:1 isometric map angle.
- Honey-brown wooden hand cart with dark brown outline, warm highlights, chunky pixel detail.
- Generated on green chroma-key backgrounds, then converted to transparent PNGs.

Assets:
- Empty cart
  - Source cache: `/Users/xinranhu/.codex/generated_images/019f0f03-647f-7712-bf94-1c7ebd32c977/ig_086612672e889db5016a414924ab3481978c23291f307e4ca8.png`
  - Library source: `public/assets/lib/buildings/cart-empty/cart-empty-v2-isometric-source-green.png`
  - Library transparent: `public/assets/lib/buildings/cart-empty/cart-empty-v2-isometric.png`
  - Library cropped transparent: `public/assets/lib/buildings/cart-empty/cart-empty-v2-isometric-cropped.png`
  - Runtime copy: `public/assets/used/buildings/cart-empty.png`
- Fetching cart
  - Source cache: `/Users/xinranhu/.codex/generated_images/019f0f03-647f-7712-bf94-1c7ebd32c977/ig_086612672e889db5016a414962b5c88197925e2144557880cf.png`
  - Library source: `public/assets/lib/buildings/cart-fetching/cart-fetching-v2-isometric-source-green.png`
  - Library transparent: `public/assets/lib/buildings/cart-fetching/cart-fetching-v2-isometric.png`
  - Library cropped transparent: `public/assets/lib/buildings/cart-fetching/cart-fetching-v2-isometric-cropped.png`
  - Runtime copy: `public/assets/used/buildings/cart-fetching.png`
- Loaded cart
  - User feedback: include a visible crate and multiple sacks.
  - Source cache: `/Users/xinranhu/.codex/generated_images/019f0f03-647f-7712-bf94-1c7ebd32c977/ig_0eacd2a3e70afc04016a414a19088481948ab8be0c5217955b.png`
  - Library source: `public/assets/lib/buildings/cart-loaded/cart-loaded-v2-isometric-source-green.png`
  - Library transparent: `public/assets/lib/buildings/cart-loaded/cart-loaded-v2-isometric.png`
  - Library cropped transparent: `public/assets/lib/buildings/cart-loaded/cart-loaded-v2-isometric-cropped.png`
  - Runtime copy: `public/assets/used/buildings/cart-loaded.png`

Notes:
- Earlier loaded candidate without the clearer crate-plus-sacks cargo was discarded from runtime use.
- Active loaded cart contains one crate and three sacks so it reads clearly at small map size.
- Cropped transparent versions remove excess padding and are the current runtime copies.
