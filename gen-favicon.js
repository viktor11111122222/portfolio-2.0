#!/usr/bin/env node
'use strict';
const zlib = require('zlib');
const fs   = require('fs');

// ── CRC32 ────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t   = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

// ── PNG encoder ──────────────────────────────────────────────
function makePNG(W, H, pixels) {
  // pixels: Uint8Array, RGBA, row-major
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0;          // filter: none
    for (let x = 0; x < W; x++) {
      const s = (y * W + x) * 4, d = y * (W * 4 + 1) + 1 + x * 4;
      raw[d]=pixels[s]; raw[d+1]=pixels[s+1]; raw[d+2]=pixels[s+2]; raw[d+3]=pixels[s+3];
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8]=8; ihdr[9]=6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing helpers ──────────────────────────────────────────
function setPixel(px, W, H, x, y, r, g, b, a=255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  // alpha blend over existing
  const srcA = a / 255, dstA = px[i+3] / 255;
  const outA  = srcA + dstA * (1 - srcA);
  if (outA === 0) return;
  px[i]   = (r * srcA + px[i]   * dstA * (1 - srcA)) / outA;
  px[i+1] = (g * srcA + px[i+1] * dstA * (1 - srcA)) / outA;
  px[i+2] = (b * srcA + px[i+2] * dstA * (1 - srcA)) / outA;
  px[i+3] = outA * 255;
}

function drawLine(px, W, H, x0, y0, x1, y1, r, g, b, thick, alpha=255) {
  const steps = Math.ceil(Math.hypot(x1-x0, y1-y0)) * 4;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px_ = x0 + (x1-x0)*t, py_ = y0 + (y1-y0)*t;
    for (let dy = -thick; dy <= thick; dy++)
      for (let dx = -thick; dx <= thick; dx++) {
        const dist = Math.hypot(dx, dy);
        if (dist > thick) continue;
        const a2 = alpha * (1 - dist / (thick+1));
        setPixel(px, W, H, px_+dx, py_+dy, r, g, b, a2);
      }
  }
}

function fillRect(px, W, H, x, y, w, h, r, g, b, a=255) {
  for (let j = y; j < y+h; j++)
    for (let i = x; i < x+w; i++)
      setPixel(px, W, H, i, j, r, g, b, a);
}

// ── Draw icon into a pixel buffer of size S×S ────────────────
function drawIcon(S) {
  const px = new Uint8Array(S * S * 4);
  const sc = S / 64; // scale factor (reference: 64px)

  // Background: #030308
  fillRect(px, S, S, 0, 0, S, S, 3, 3, 8);

  // Rounded corner accents (cyan top-left, pink top-right, etc.)
  const m = Math.round(2 * sc), len = Math.round(12 * sc), w2 = Math.round(1.5 * sc) || 1;
  // TL cyan
  drawLine(px,S,S, m,m, m+len,m,      0,229,255, w2);
  drawLine(px,S,S, m,m, m,    m+len,  0,229,255, w2);
  // TR pink
  drawLine(px,S,S, S-m,m, S-m-len,m,    255,0,100, w2);
  drawLine(px,S,S, S-m,m, S-m,    m+len, 255,0,100, w2);
  // BL cyan
  drawLine(px,S,S, m,S-m, m+len,S-m,    0,229,255, w2);
  drawLine(px,S,S, m,S-m, m,    S-m-len, 0,229,255, w2);
  // BR pink
  drawLine(px,S,S, S-m,S-m, S-m-len,S-m,    255,0,100, w2);
  drawLine(px,S,S, S-m,S-m, S-m,    S-m-len, 255,0,100, w2);

  // V shape — glow (purple, fat)
  const vL  = Math.round(9  * sc), vR = Math.round(55 * sc);
  const vT  = Math.round(10 * sc), vB = Math.round(52 * sc);
  const vMX = Math.round(32 * sc);
  const glow = Math.round(4 * sc) || 2;
  drawLine(px,S,S, vL,vT, vMX,vB, 191,0,255, glow, 100); // purple glow left
  drawLine(px,S,S, vR,vT, vMX,vB, 191,0,255, glow, 100); // purple glow right

  // V shape — cyan fill (thinner, on top)
  const core = Math.round(2 * sc) || 1;
  drawLine(px,S,S, vL,vT, vMX,vB, 0,229,255, core);
  drawLine(px,S,S, vR,vT, vMX,vB, 0,229,255, core);

  // Tip highlight (bright white/cyan)
  const tipR = Math.round(2.5 * sc) || 1;
  drawLine(px,S,S, vMX-tipR,vB-tipR, vMX+tipR,vB+tipR, 255,255,255, Math.max(1,tipR-1), 180);

  return px;
}

// ── Generate files ───────────────────────────────────────────
const sizes = [
  { name: 'favicon-16.png',        s: 16  },
  { name: 'favicon-32.png',        s: 32  },
  { name: 'favicon-48.png',        s: 48  },
  { name: 'apple-touch-icon.png',  s: 180 },
];

for (const { name, s } of sizes) {
  const px  = drawIcon(s);
  const buf = makePNG(s, s, px);
  fs.writeFileSync(name, buf);
  console.log(`✓ ${name}  (${s}×${s}, ${buf.length}B)`);
}

// ── ICO file (contains 16x16 + 32x32 PNG) ──────────────────
const img16 = fs.readFileSync('favicon-16.png');
const img32 = fs.readFileSync('favicon-32.png');
const imgs  = [img16, img32];
const szs   = [16, 32];

// ICO header: 6 bytes
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: ICO
icoHeader.writeUInt16LE(imgs.length, 4); // count

// Directory entries: 16 bytes each
const dirOffset = 6 + imgs.length * 16;
let dataOffset = dirOffset;
const dirs = [];
for (let i = 0; i < imgs.length; i++) {
  const dir = Buffer.alloc(16);
  dir[0] = szs[i] === 256 ? 0 : szs[i]; // width
  dir[1] = szs[i] === 256 ? 0 : szs[i]; // height
  dir[2] = 0;   // color count
  dir[3] = 0;   // reserved
  dir.writeUInt16LE(1, 4);  // planes
  dir.writeUInt16LE(32, 6); // bit count
  dir.writeUInt32LE(imgs[i].length, 8);  // size
  dir.writeUInt32LE(dataOffset, 12);     // offset
  dirs.push(dir);
  dataOffset += imgs[i].length;
}

const ico = Buffer.concat([icoHeader, ...dirs, ...imgs]);
fs.writeFileSync('favicon.ico', ico);
console.log(`✓ favicon.ico  (${ico.length}B)`);
