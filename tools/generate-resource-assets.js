const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.join(__dirname, "..", "public", "assets", "resources");
const SIZE = 32;
const SCALE = 3;
const COLS = 10;

const C = {
  clear: [0, 0, 0, 0],
  outline: [38, 28, 24, 255],
  shadow: [59, 45, 38, 255],
  white: [238, 232, 205, 255],
  cream: [230, 202, 136, 255],
  tan: [190, 144, 78, 255],
  brown: [106, 70, 42, 255],
  darkBrown: [70, 45, 29, 255],
  red: [198, 58, 50, 255],
  redDark: [134, 38, 38, 255],
  orange: [224, 126, 42, 255],
  yellow: [237, 193, 66, 255],
  green: [73, 156, 76, 255],
  greenDark: [42, 99, 58, 255],
  blue: [70, 139, 190, 255],
  blueDark: [36, 75, 130, 255],
  purple: [118, 73, 156, 255],
  pink: [219, 116, 153, 255],
  gray: [130, 125, 118, 255],
  darkGray: [70, 71, 75, 255],
  lightGray: [184, 190, 188, 255],
  black: [20, 20, 24, 255],
  gold: [229, 177, 52, 255],
  sand: [216, 188, 116, 255],
};

const resources = [
  ["Apple", "apple"], ["Banana", "banana"], ["Berry", "berry"], ["Brandy", "brandy"],
  ["Bread", "bread"], ["Brick", "brick"], ["Cabbage", "cabbage"], ["Candle", "candle"],
  ["Cheese", "cheese"], ["Cider", "cider"], ["Cigar", "cigar"], ["Clay", "clay"],
  ["Coal", "coal"], ["Cocoa", "cocoa"], ["Corn", "corn"], ["Cotton", "cotton"],
  ["Egg", "egg"], ["Fish", "fish"], ["Flour", "flour"], ["Fur", "fur"],
  ["Gem", "gem"], ["Glass", "glass"], ["Gold", "gold"], ["Grape", "grape"],
  ["Iron", "iron"], ["Jam", "jam"], ["Melon", "melon"], ["Milk", "milk"],
  ["Oil", "oil"], ["Olive", "olive"], ["Orange", "orange"], ["Onion", "onion"],
  ["Furniture", "furniture"], ["Jewelry", "jewelry"], ["Iron Ore", "iron-ore"], ["Gold Ore", "gold-ore"],
  ["Pant", "pant"], ["Timber", "timber"], ["Tool", "tool"], ["Pork", "pork"],
  ["Potato", "potato"], ["Pottery", "pottery"], ["Pumpkin", "pumpkin"], ["Salt", "salt"],
  ["Sand", "sand"], ["Sausage", "sausage"], ["Slate", "slate"], ["Soybean", "soybean"],
  ["Steel", "steel"], ["Stone", "stone"], ["Sugar Cane", "sugar-cane"], ["Rice", "rice"],
  ["Rubber", "rubber"], ["Rum", "rum"], ["Tobacco", "tobacco"], ["Tomato", "tomato"],
  ["Wax", "wax"], ["Wheat", "wheat"], ["Wine", "wine"], ["Wood", "wood"], ["Wool", "wool"],
];

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
    for (let yy = y; yy < y + rh; yy++) for (let xx = x; xx < x + rw; xx++) set(xx, yy, color);
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
  return { w, h, pixels, set, rect, line };
}

function oval(c, cx, cy, rx, ry, fill, outline = C.outline) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (v <= 1.08) c.set(cx + x, cy + y, outline);
      if (v <= 0.76) c.set(cx + x, cy + y, fill);
    }
  }
}

function diamond(c, cx, cy, r, fill, outline = C.outline) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = Math.abs(x) + Math.abs(y);
      if (d <= r + 1) c.set(cx + x, cy + y, outline);
      if (d <= r - 1) c.set(cx + x, cy + y, fill);
    }
  }
}

function bottle(c, body, liquid, cork = C.brown) {
  c.rect(12, 6, 8, 3, C.outline); c.rect(14, 3, 4, 5, C.outline);
  c.rect(15, 2, 2, 3, cork); c.rect(13, 8, 6, 18, C.outline);
  c.rect(14, 9, 4, 16, body); c.rect(14, 18, 4, 7, liquid);
  c.rect(15, 10, 1, 4, C.white);
}

function sack(c, color, markColor) {
  c.rect(9, 10, 14, 15, C.outline);
  c.rect(10, 11, 12, 13, color);
  c.rect(12, 8, 8, 4, C.outline);
  c.rect(13, 9, 6, 2, color);
  c.rect(15, 16, 3, 3, markColor);
}

function ingot(c, color, hi) {
  c.rect(8, 18, 16, 7, C.outline);
  c.rect(10, 15, 12, 4, C.outline);
  c.rect(9, 19, 14, 5, color);
  c.rect(11, 16, 10, 2, hi);
}

function rock(c, color, hi = C.lightGray) {
  c.rect(8, 18, 16, 7, C.outline);
  c.rect(10, 14, 12, 7, C.outline);
  c.rect(9, 19, 14, 5, color);
  c.rect(11, 15, 10, 5, color);
  c.rect(12, 16, 4, 2, hi);
}

function planks(c, color) {
  for (let i = 0; i < 3; i++) {
    const y = 12 + i * 5;
    c.rect(7, y, 18, 4, C.outline);
    c.rect(8, y + 1, 16, 2, color);
    c.set(21, y + 2, C.darkBrown);
  }
}

function leaf(c, x, y, color = C.green) {
  diamond(c, x, y, 4, color, C.greenDark);
}

function bowl(c, fill) {
  c.rect(8, 19, 16, 5, C.outline);
  c.rect(10, 23, 12, 3, C.outline);
  c.rect(9, 20, 14, 3, C.white);
  c.rect(11, 17, 10, 3, fill);
}

function draw(name, c) {
  c.rect(9, 27, 14, 2, [0, 0, 0, 70]);
  switch (name) {
    case "apple": oval(c, 16, 17, 7, 8, C.red); c.rect(16, 7, 2, 5, C.brown); leaf(c, 20, 10); break;
    case "banana": c.rect(9, 19, 3, 4, C.outline); c.rect(12, 20, 10, 3, C.outline); c.rect(21, 16, 3, 5, C.outline); c.rect(12, 19, 10, 3, C.yellow); c.rect(21, 17, 2, 3, C.yellow); break;
    case "berry": oval(c, 13, 18, 4, 4, C.red); oval(c, 18, 17, 4, 4, C.purple); oval(c, 17, 22, 4, 4, C.blue); leaf(c, 16, 12); break;
    case "brandy": bottle(c, C.orange, C.brown); break;
    case "bread": oval(c, 16, 18, 9, 6, C.tan); c.rect(10, 16, 12, 2, C.cream); break;
    case "brick": c.rect(7, 13, 18, 12, C.outline); c.rect(8, 14, 16, 10, C.redDark); c.rect(8, 18, 16, 1, C.outline); c.rect(15, 14, 1, 4, C.outline); c.rect(12, 19, 1, 5, C.outline); break;
    case "cabbage": oval(c, 16, 18, 9, 8, C.green); c.line(10, 18, 22, 18, C.greenDark); c.line(16, 11, 16, 25, C.greenDark); break;
    case "candle": c.rect(13, 10, 7, 16, C.outline); c.rect(14, 11, 5, 14, C.cream); c.rect(15, 7, 3, 4, C.outline); c.set(16, 6, C.yellow); c.set(16, 7, C.orange); break;
    case "cheese": c.rect(8, 14, 16, 11, C.outline); c.rect(9, 15, 14, 9, C.yellow); c.set(13, 18, C.orange); c.set(18, 21, C.orange); break;
    case "cider": bottle(c, C.green, C.orange); break;
    case "cigar": c.rect(8, 16, 17, 5, C.outline); c.rect(9, 17, 15, 3, C.brown); c.rect(16, 17, 2, 3, C.gold); break;
    case "clay": rock(c, [151, 83, 57, 255], C.tan); break;
    case "coal": rock(c, C.black, C.darkGray); break;
    case "cocoa": oval(c, 16, 18, 6, 9, C.brown); c.line(16, 11, 16, 24, C.darkBrown); break;
    case "corn": c.rect(14, 9, 5, 17, C.outline); c.rect(15, 10, 3, 15, C.yellow); c.line(11, 23, 15, 17, C.green); c.line(21, 23, 18, 17, C.green); break;
    case "cotton": oval(c, 12, 16, 4, 4, C.white); oval(c, 17, 14, 4, 4, C.white); oval(c, 20, 18, 4, 4, C.white); c.rect(15, 19, 2, 7, C.greenDark); break;
    case "egg": oval(c, 16, 18, 7, 9, C.white); break;
    case "fish": c.rect(10, 15, 13, 7, C.outline); c.rect(12, 16, 9, 5, C.blue); c.set(20, 17, C.black); c.line(9, 18, 5, 15, C.outline); c.line(9, 18, 5, 21, C.outline); break;
    case "flour": sack(c, C.cream, C.white); break;
    case "fur": c.rect(8, 11, 16, 14, C.outline); c.rect(10, 13, 12, 10, C.brown); c.set(12, 15, C.tan); c.set(19, 20, C.darkBrown); break;
    case "gem": diamond(c, 16, 17, 9, C.blue, C.outline); c.line(12, 15, 20, 15, C.white); break;
    case "glass": c.rect(9, 10, 14, 16, C.outline); c.rect(10, 11, 12, 14, [126, 201, 218, 190]); c.line(12, 23, 20, 13, C.white); break;
    case "gold": ingot(c, C.gold, C.yellow); break;
    case "grape": for (const [x,y] of [[14,13],[18,13],[12,17],[16,17],[20,17],[14,21],[18,21]]) oval(c,x,y,3,3,C.purple); leaf(c,17,9); break;
    case "iron": ingot(c, C.gray, C.lightGray); break;
    case "jam": c.rect(10, 9, 12, 17, C.outline); c.rect(11, 13, 10, 12, C.red); c.rect(11, 10, 10, 3, C.white); c.rect(13, 16, 6, 4, C.pink); break;
    case "melon": oval(c, 16, 18, 9, 7, C.green); c.line(9, 18, 23, 18, C.greenDark); c.line(16, 12, 16, 24, C.greenDark); break;
    case "milk": bottle(c, C.white, C.white); c.rect(14, 14, 4, 2, C.blue); break;
    case "oil": bottle(c, C.greenDark, C.gold); break;
    case "olive": oval(c, 16, 18, 7, 5, C.greenDark); c.set(18, 17, C.redDark); break;
    case "orange": oval(c, 16, 18, 8, 8, C.orange); leaf(c,20,10); break;
    case "onion": oval(c, 16, 18, 7, 8, C.purple); c.rect(15, 8, 2, 5, C.green); break;
    case "furniture": c.rect(9, 13, 14, 9, C.outline); c.rect(10, 14, 12, 7, C.brown); c.rect(11, 21, 2, 6, C.darkBrown); c.rect(20, 21, 2, 6, C.darkBrown); break;
    case "jewelry": diamond(c, 16, 17, 5, C.blue); c.rect(11, 18, 11, 6, C.outline); c.rect(12, 19, 9, 4, C.gold); break;
    case "iron-ore": rock(c, C.darkGray, C.gray); c.set(15, 17, C.lightGray); break;
    case "gold-ore": rock(c, C.darkGray, C.gold); c.set(18, 20, C.gold); break;
    case "pant": c.rect(10, 10, 12, 16, C.outline); c.rect(11, 11, 10, 5, C.blue); c.rect(11, 16, 4, 9, C.blueDark); c.rect(17, 16, 4, 9, C.blueDark); break;
    case "timber": planks(c, C.tan); break;
    case "tool": c.rect(10, 22, 12, 2, C.outline); c.line(12, 21, 22, 11, C.lightGray); c.line(22, 11, 25, 14, C.lightGray); c.line(22, 11, 19, 8, C.lightGray); break;
    case "pork": oval(c, 16, 18, 9, 6, C.pink); c.rect(18, 16, 4, 3, C.white); break;
    case "potato": oval(c, 16, 18, 8, 6, C.tan); c.set(13, 17, C.brown); c.set(18, 20, C.brown); break;
    case "pottery": c.rect(10, 12, 12, 14, C.outline); c.rect(12, 10, 8, 3, C.outline); c.rect(11, 13, 10, 12, [165, 91, 55, 255]); c.rect(13, 15, 6, 2, C.tan); break;
    case "pumpkin": oval(c, 16, 18, 10, 7, C.orange); c.rect(15, 9, 2, 5, C.greenDark); c.line(16, 12, 16, 24, C.redDark); break;
    case "salt": sack(c, C.white, C.blue); break;
    case "sand": rock(c, C.sand, C.cream); break;
    case "sausage": c.rect(8, 16, 17, 6, C.outline); c.rect(9, 17, 15, 4, C.redDark); c.set(7, 18, C.tan); c.set(25, 19, C.tan); break;
    case "slate": c.rect(8, 16, 17, 9, C.outline); c.rect(9, 17, 15, 7, C.blueDark); c.line(10, 22, 22, 18, C.gray); break;
    case "soybean": for (const [x,y] of [[13,16],[17,15],[19,19],[14,21]]) oval(c,x,y,3,3,C.green); leaf(c,16,12); break;
    case "steel": ingot(c, C.lightGray, C.white); break;
    case "stone": rock(c, C.gray, C.lightGray); break;
    case "sugar-cane": c.rect(11, 9, 3, 17, C.green); c.rect(18, 8, 3, 18, C.greenDark); c.line(14, 15, 20, 10, C.green); break;
    case "rice": bowl(c, C.white); break;
    case "rubber": c.rect(9, 13, 14, 11, C.outline); c.rect(10, 14, 12, 9, C.black); c.rect(12, 16, 8, 2, C.darkGray); break;
    case "rum": bottle(c, C.brown, C.orange); break;
    case "tobacco": leaf(c, 13, 16, C.greenDark); leaf(c, 19, 18, C.greenDark); c.rect(15, 13, 2, 12, C.brown); break;
    case "tomato": oval(c, 16, 18, 8, 7, C.red); leaf(c, 16, 11); break;
    case "wax": oval(c, 16, 18, 8, 6, C.yellow); c.rect(12, 13, 8, 4, C.gold); break;
    case "wheat": c.rect(15, 10, 2, 17, C.tan); for (let i=0;i<6;i++){ c.set(13,11+i*2,C.yellow); c.set(18,12+i*2,C.yellow); } break;
    case "wine": bottle(c, C.greenDark, C.redDark); break;
    case "wood": c.rect(8, 16, 17, 8, C.outline); c.rect(9, 17, 15, 6, C.brown); c.set(12, 20, C.tan); c.set(20, 19, C.tan); break;
    case "wool": oval(c, 12, 18, 5, 5, C.white); oval(c, 17, 16, 5, 5, C.white); oval(c, 20, 20, 5, 5, C.white); break;
  }
}

function paste(dst, dstW, src, srcW, srcH, ox, oy) {
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const si = (y * srcW + x) * 4;
      const di = ((oy + y) * dstW + ox + x) * 4;
      dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3];
    }
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

const sprites = resources.map(([label, slug]) => {
  const c = canvas();
  draw(slug, c);
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.png`), png(SIZE, SIZE, c.pixels));
  return { label, slug, pixels: c.pixels };
});

const rows = Math.ceil(sprites.length / COLS);
const sheetW = COLS * SIZE;
const sheetH = rows * SIZE;
const sheet = new Uint8Array(sheetW * sheetH * 4);
sprites.forEach((s, i) => paste(sheet, sheetW, s.pixels, SIZE, SIZE, (i % COLS) * SIZE, Math.floor(i / COLS) * SIZE));
fs.writeFileSync(path.join(OUT_DIR, "resources-sheet.png"), png(sheetW, sheetH, sheet));
fs.writeFileSync(path.join(OUT_DIR, "resources-preview.png"), png(sheetW * SCALE, sheetH * SCALE, upscale(sheet, sheetW, sheetH, SCALE)));

const manifest = {
  tileSize: SIZE,
  style: "32x32 pixel art, transparent background, crisp dark outline",
  resources: sprites.map(({ label, slug }) => ({ name: label, file: `assets/resources/${slug}.png` })),
  sheet: "assets/resources/resources-sheet.png",
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${sprites.length} resource icons to ${OUT_DIR}`);
