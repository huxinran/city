const fs = require("fs");
const path = require("path");
const sharp = require("C:/Users/Xinran/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp");

const OUT_DIR = path.join(__dirname, "..", "public", "assets", "resource-icons-cute-64");
const SOURCE = path.join(OUT_DIR, "source-sheet-transparent.png");
const SIZE = 64;

const icons = [
  { name: "apple", col: 0, row: 0 },
  { name: "lettuce", col: 1, row: 0 },
  { name: "grape", col: 2, row: 0 },
  { name: "olive", col: 3, row: 0 },
  { name: "pig", col: 0, row: 1 },
  { name: "cow", col: 1, row: 1 },
  { name: "sheep", col: 2, row: 1 },
  { name: "chicken", col: 3, row: 1 },
];

function keyMagenta(raw, width, height) {
  const out = Buffer.from(raw);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const magentaDistance = Math.abs(r - 255) + Math.abs(g - 0) + Math.abs(b - 255);
    if (magentaDistance < 230 || (r > 170 && b > 170 && g < 125)) {
      out[i + 3] = 0;
    } else if (r > 150 && b > 150 && g < 120) {
      out[i] = Math.min(r, g + 70);
      out[i + 2] = Math.min(b, g + 70);
    }
  }
  return sharp(out, { raw: { width, height, channels: 4 } });
}

async function makeIcon(sourceMeta, icon) {
  const cellWidth = Math.floor(sourceMeta.width / 4);
  const cellHeight = Math.floor(sourceMeta.height / 2);
  const left = icon.col * cellWidth;
  const top = icon.row * cellHeight;

  const cellBuffer = await sharp(SOURCE)
    .extract({ left, top, width: cellWidth, height: cellHeight })
    .ensureAlpha()
    .png()
    .toBuffer();

  const trimmedBuffer = await sharp(cellBuffer)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .png()
    .toBuffer();

  const trimMeta = await sharp(trimmedBuffer).metadata();
  const scale = Math.min((SIZE - 4) / trimMeta.width, (SIZE - 4) / trimMeta.height, 1);
  const width = Math.max(1, Math.round(trimMeta.width * scale));
  const height = Math.max(1, Math.round(trimMeta.height * scale));

  await sharp(trimmedBuffer)
    .resize({
      width,
      height,
      kernel: "nearest",
      fit: "inside",
      withoutEnlargement: true,
    })
    .extend({
      top: Math.floor((SIZE - height) / 2),
      bottom: Math.ceil((SIZE - height) / 2),
      left: Math.floor((SIZE - width) / 2),
      right: Math.ceil((SIZE - width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT_DIR, `${icon.name}.png`));
}

async function makePreview() {
  const width = SIZE * 4;
  const height = SIZE * 2;
  const base = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
  const composites = icons.map((icon) => ({
    input: path.join(OUT_DIR, `${icon.name}.png`),
    left: icon.col * SIZE,
    top: icon.row * SIZE,
  }));
  await base.composite(composites).png().toFile(path.join(OUT_DIR, "cute-resources-sheet.png"));
  await sharp(path.join(OUT_DIR, "cute-resources-sheet.png"))
    .resize(width * 3, height * 3, { kernel: "nearest" })
    .png()
    .toFile(path.join(OUT_DIR, "cute-resources-preview.png"));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sourceMeta = await sharp(SOURCE).metadata();
  for (const icon of icons) {
    await makeIcon(sourceMeta, icon);
  }
  await makePreview();
  const manifest = {
    tileSize: SIZE,
    style: "cute cartoon-ish detailed 64x64 pixel art, transparent background",
    icons: icons.map((icon) => ({
      name: icon.name,
      file: `assets/resource-icons-cute-64/${icon.name}.png`,
    })),
    sheet: "assets/resource-icons-cute-64/cute-resources-sheet.png",
  };
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${icons.length} cute resource icons to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
