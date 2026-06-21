const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.join(__dirname, "..", "public", "assets", "resources-64");
const SIZE = 64;
const SCALE = 2;

const C = {
  outline: [35, 27, 22, 255],
  amberDeep: [98, 53, 16, 255],
  amberDark: [145, 79, 22, 255],
  amber: [205, 126, 35, 255],
  amberLight: [245, 184, 64, 255],
  amberHi: [255, 231, 126, 255],
  riceGreenDeep: [49, 73, 24, 255],
  riceGreenDark: [78, 105, 28, 255],
  riceGreen: [121, 151, 45, 255],
  riceGreenLight: [176, 197, 66, 255],
  riceGrainDark: [147, 122, 55, 255],
  riceGrain: [223, 197, 111, 255],
  riceGrainLight: [255, 239, 167, 255],
  shadow: [0, 0, 0, 70],
};

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  t.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([t, data])), 8 + data.length);
  return out;
}

function png(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = row + 1 + x * 4;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function canvas(w = SIZE, h = SIZE) {
  const pixels = new Uint8Array(w * h * 4);
  const set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    pixels.set(color, (y * w + x) * 4);
  };
  const rect = (x, y, rw, rh, color) => {
    for (let yy = y; yy < y + rh; yy++) {
      for (let xx = x; xx < x + rw; xx++) set(xx, yy, color);
    }
  };
  const line = (x0, y0, x1, y1, color) => {
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      set(x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  return { pixels, set, rect, line };
}

function ellipse(c, cx, cy, rx, ry, fill, outline = C.outline) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (v <= 1.08) c.set(cx + x, cy + y, outline);
      if (v <= 0.74) c.set(cx + x, cy + y, fill);
    }
  }
}

function block(c, x, y, w, h, fill, shade, hi) {
  c.rect(x - 1, y - 1, w + 2, h + 2, C.outline);
  c.rect(x, y, w, h, fill);
  c.rect(x, y + h - 2, w, 2, shade);
  c.rect(x + 1, y + 1, Math.max(1, w - 4), 2, hi);
}

function wheatKernel(c, x, y, w = 7, h = 10) {
  block(c, x, y, w, h, C.amberLight, C.amberDark, C.amberHi);
  c.rect(x + w - 2, y + 2, 2, h - 3, C.amber);
  c.set(x + 2, y + h - 3, C.amberDeep);
}

function riceGrain(c, x, y, w = 7, h = 10) {
  block(c, x, y, w, h, C.riceGrainLight, C.riceGrainDark, [255, 250, 202, 255]);
  c.rect(x + w - 2, y + 2, 2, h - 3, C.riceGrain);
}

function thickLine(c, x0, y0, x1, y1, color, shade = C.outline) {
  c.line(x0 - 1, y0, x1 - 1, y1, shade);
  c.line(x0 + 1, y0, x1 + 1, y1, shade);
  c.line(x0, y0, x1, y1, color);
  c.line(x0 + 1, y0, x1 + 1, y1, color);
}

function drawWheat() {
  const c = canvas();
  c.rect(13, 57, 38, 3, C.shadow);

  thickLine(c, 26, 56, 21, 18, C.amberDark);
  thickLine(c, 33, 57, 32, 11, C.amberDark);
  thickLine(c, 41, 55, 45, 17, C.amberDark);

  const leftHead = [[14, 31], [17, 24], [20, 17], [21, 38], [24, 30], [27, 22]];
  const centerHead = [[27, 16], [30, 8], [33, 16], [28, 27], [33, 25], [35, 34], [30, 39]];
  const rightHead = [[39, 23], [43, 16], [45, 27], [41, 35], [47, 36], [38, 43]];
  for (const [x, y] of leftHead) wheatKernel(c, x, y);
  for (const [x, y] of centerHead) wheatKernel(c, x, y, 8, 11);
  for (const [x, y] of rightHead) wheatKernel(c, x, y);

  thickLine(c, 25, 50, 12, 43, C.amber);
  thickLine(c, 29, 48, 16, 39, C.amber);
  thickLine(c, 39, 49, 53, 39, C.amber);
  thickLine(c, 42, 52, 56, 47, C.amber);

  c.rect(25, 50, 15, 8, C.outline);
  c.rect(27, 51, 11, 6, C.amberDeep);
  c.rect(29, 51, 3, 6, C.amberLight);
  return c.pixels;
}

function drawRice() {
  const c = canvas();
  c.rect(13, 57, 38, 3, C.shadow);

  thickLine(c, 22, 57, 14, 24, C.riceGreenDark);
  thickLine(c, 29, 57, 27, 16, C.riceGreenDark);
  thickLine(c, 36, 57, 41, 16, C.riceGreenDark);
  thickLine(c, 43, 56, 54, 25, C.riceGreenDark);

  thickLine(c, 20, 46, 9, 36, C.riceGreen);
  thickLine(c, 27, 45, 16, 31, C.riceGreenLight, C.riceGreenDeep);
  thickLine(c, 39, 45, 54, 35, C.riceGreenLight, C.riceGreenDeep);
  thickLine(c, 43, 50, 58, 46, C.riceGreen);

  const grains = [
    [10, 21], [15, 24], [17, 29],
    [24, 13], [28, 17], [30, 23],
    [39, 14], [43, 19], [45, 25],
    [52, 23], [55, 29], [49, 32],
  ];
  for (const [x, y] of grains) riceGrain(c, x, y);

  c.rect(27, 51, 12, 8, C.outline);
  c.rect(29, 52, 8, 6, C.riceGreenDeep);
  c.rect(31, 52, 2, 6, C.riceGreenLight);
  return c.pixels;
}

function paste(dst, dstW, src, srcW, srcH, ox, oy) {
  for (let y = 0; y < srcH; y++) for (let x = 0; x < srcW; x++) {
    const si = (y * srcW + x) * 4;
    const di = ((oy + y) * dstW + ox + x) * 4;
    dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3];
  }
}

function upscale(src, w, h, scale) {
  const out = new Uint8Array(w * scale * h * scale * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const si = (y * w + x) * 4;
    for (let yy = 0; yy < scale; yy++) for (let xx = 0; xx < scale; xx++) {
      const di = ((y * scale + yy) * w * scale + x * scale + xx) * 4;
      out[di] = src[si]; out[di + 1] = src[si + 1]; out[di + 2] = src[si + 2]; out[di + 3] = src[si + 3];
    }
  }
  return out;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const assets = [
  { name: "Wheat", slug: "wheat", pixels: drawWheat() },
  { name: "Rice", slug: "rice", pixels: drawRice() },
];

for (const asset of assets) {
  fs.writeFileSync(path.join(OUT_DIR, `${asset.slug}.png`), png(SIZE, SIZE, asset.pixels));
}

const sheet = new Uint8Array(SIZE * assets.length * SIZE * 4);
assets.forEach((asset, i) => paste(sheet, SIZE * assets.length, asset.pixels, SIZE, SIZE, i * SIZE, 0));
fs.writeFileSync(path.join(OUT_DIR, "resources-64-sheet.png"), png(SIZE * assets.length, SIZE, sheet));
fs.writeFileSync(path.join(OUT_DIR, "resources-64-preview.png"), png(SIZE * assets.length * SCALE, SIZE * SCALE, upscale(sheet, SIZE * assets.length, SIZE, SCALE)));

const manifest = {
  tileSize: SIZE,
  style: "64x64 detailed pixel art, transparent background, crisp dark outline",
  resources: assets.map(({ name, slug }) => ({ name, file: `assets/resources-64/${slug}.png` })),
  sheet: "assets/resources-64/resources-64-sheet.png",
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${assets.length} 64x64 resource icons to ${OUT_DIR}`);
