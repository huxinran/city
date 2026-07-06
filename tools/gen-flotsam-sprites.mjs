// Generate the ambient flotsam sprites drawn by the cart layer:
// small climate-themed objects that drift across water.
// Output: public/assets/used/actors/flotsam/*.png (transparent, 64px wide).
import fs from 'node:fs/promises';
import sharp from 'sharp';

const OUT = 'public/assets/used/actors/flotsam';

const SPRITES = {
  // Arctic ice floes: flat pale slabs seen at the iso angle.
  'ice-1': `<svg width="64" height="40" xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,18 26,8 56,14 50,26 20,30" fill="#eef7fd"/>
    <polygon points="8,18 20,30 20,36 8,24" fill="#b8d9ec"/>
    <polygon points="20,30 50,26 50,32 20,36" fill="#cbe4f2"/>
    <polygon points="50,26 56,14 56,20 50,32" fill="#a9cfe6"/>
    <polyline points="22,16 30,20 42,17" stroke="#cfe6f2" stroke-width="2" fill="none"/>
  </svg>`,
  'ice-2': `<svg width="64" height="36" xmlns="http://www.w3.org/2000/svg">
    <polygon points="6,16 30,6 58,12 44,24 14,26" fill="#f4fafe"/>
    <polygon points="6,16 14,26 14,32 6,22" fill="#b8d9ec"/>
    <polygon points="14,26 44,24 44,30 14,32" fill="#d5e9f4"/>
    <polygon points="44,24 58,12 58,18 44,30" fill="#a9cfe6"/>
  </svg>`,
  // Warm-water coconut, half-submerged look with a husk highlight.
  'coconut-1': `<svg width="40" height="36" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="18" rx="14" ry="13" fill="#7a5230"/>
    <ellipse cx="20" cy="18" rx="14" ry="13" fill="none" stroke="#5d3d22" stroke-width="2"/>
    <path d="M8 14 Q20 4 32 14" stroke="#93683f" stroke-width="3" fill="none"/>
    <circle cx="15" cy="20" r="2" fill="#4a2f1a"/>
    <circle cx="21" cy="23" r="2" fill="#4a2f1a"/>
    <circle cx="24" cy="18" r="2" fill="#4a2f1a"/>
    <ellipse cx="14" cy="11" rx="4" ry="2.5" fill="#a87c4f"/>
  </svg>`,
  'coconut-2': `<svg width="48" height="34" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="18" cy="20" rx="12" ry="11" fill="#6f4a2a"/>
    <ellipse cx="18" cy="20" rx="12" ry="11" fill="none" stroke="#54371e" stroke-width="2"/>
    <ellipse cx="13" cy="14" rx="3.5" ry="2" fill="#9a7147"/>
    <path d="M28 16 Q38 6 46 12 Q38 12 30 19 Z" fill="#4f8f4f"/>
    <path d="M28 16 Q36 10 44 11" stroke="#3d703d" stroke-width="1.5" fill="none"/>
  </svg>`,
  // Temperate driftwood log.
  'driftwood-1': `<svg width="64" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="52" height="12" rx="6" fill="#8a6a45"/>
    <rect x="6" y="8" width="52" height="12" rx="6" fill="none" stroke="#6d5236" stroke-width="2"/>
    <ellipse cx="58" cy="14" rx="4" ry="6" fill="#a5825a"/>
    <ellipse cx="58" cy="14" rx="2" ry="3" fill="#7c5f3e"/>
    <path d="M14 12 H34 M20 16 H44" stroke="#75593a" stroke-width="1.5"/>
    <path d="M10 6 Q14 2 18 6" stroke="#6d5236" stroke-width="2" fill="none"/>
  </svg>`,
  // Floating leaf for the temperate rivers.
  'leaf-1': `<svg width="40" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14 Q14 2 36 8 Q28 20 10 18 Z" fill="#6fae4e"/>
    <path d="M4 14 Q14 2 36 8" stroke="#588c3c" stroke-width="2" fill="none"/>
    <path d="M8 14 Q20 10 33 9" stroke="#588c3c" stroke-width="1.5" fill="none"/>
  </svg>`,
};

await fs.mkdir(OUT, { recursive: true });
for (const [name, svg] of Object.entries(SPRITES)) {
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}.png`);
  console.log(`wrote ${OUT}/${name}.png`);
}
