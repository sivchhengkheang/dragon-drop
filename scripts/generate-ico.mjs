/**
 * generate-ico.mjs  –  100% pure Node.js built-ins, zero npm deps
 *
 * Parses public/dragon-logo.png, resizes it to all required Windows ICO
 * sizes using nearest-neighbour, then writes a valid ICO binary.
 *
 * Run:  node scripts/generate-ico.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { inflateSync } from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.resolve(__dirname, '..');
const SRC       = path.join(root, 'public', 'dragon-logo.png');
const DEST      = path.join(root, 'public', 'dragon-logo.ico');
const SIZES     = [16, 32, 48, 64, 128, 256];

// ─────────────────────────────────────────────────────────────
// 1. Minimal PNG decoder (RGBA output)
// ─────────────────────────────────────────────────────────────
function pngPaeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
}

function decodePng(buf) {
  // Validate signature
  const SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (buf[i] !== SIG[i]) throw new Error('Not a PNG');

  let width, height, bitDepth, colorType;
  const idatChunks = [];
  let pos = 8;

  while (pos < buf.length) {
    const len  = buf.readUInt32BE(pos);      pos += 4;
    const type = buf.slice(pos, pos + 4).toString('ascii'); pos += 4;
    const data = buf.slice(pos, pos + len);  pos += len + 4; // skip CRC

    if (type === 'IHDR') {
      width     = data.readUInt32BE(0);
      height    = data.readUInt32BE(4);
      bitDepth  = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
  }

  // Only handle 8-bit RGBA (6) or RGB (2) PNGs
  if (bitDepth !== 8) throw new Error(`Unsupported bit depth: ${bitDepth}`);
  if (colorType !== 2 && colorType !== 6) throw new Error(`Unsupported color type: ${colorType}`);
  const hasAlpha = colorType === 6;
  const channels = hasAlpha ? 4 : 3;

  const compressed = Buffer.concat(idatChunks);
  const raw        = inflateSync(compressed);

  // Un-filter scanlines
  const rgba = new Uint8Array(width * height * 4);
  const bpp  = channels;

  for (let y = 0; y < height; y++) {
    const rowBytes = width * bpp;
    const rowStart = y * (rowBytes + 1);
    const filter   = raw[rowStart];
    const src      = raw.slice(rowStart + 1, rowStart + 1 + rowBytes);
    const prev     = y === 0 ? new Uint8Array(rowBytes) : raw.slice((y - 1) * (rowBytes + 1) + 1, (y - 1) * (rowBytes + 1) + 1 + rowBytes);

    const row = new Uint8Array(rowBytes);
    for (let i = 0; i < rowBytes; i++) {
      const a = i >= bpp  ? row[i - bpp]  : 0;
      const b = prev[i];
      const c = i >= bpp  ? prev[i - bpp] : 0;
      switch (filter) {
        case 0: row[i] = src[i]; break;
        case 1: row[i] = (src[i] + a) & 0xff; break;
        case 2: row[i] = (src[i] + b) & 0xff; break;
        case 3: row[i] = (src[i] + Math.floor((a + b) / 2)) & 0xff; break;
        case 4: row[i] = (src[i] + pngPaeth(a, b, c)) & 0xff; break;
        default: throw new Error(`Unknown filter: ${filter}`);
      }
    }

    for (let x = 0; x < width; x++) {
      const si = x * bpp;
      const di = (y * width + x) * 4;
      rgba[di]     = row[si];
      rgba[di + 1] = row[si + 1];
      rgba[di + 2] = row[si + 2];
      rgba[di + 3] = hasAlpha ? row[si + 3] : 255;
    }
  }

  return { width, height, rgba };
}

// ─────────────────────────────────────────────────────────────
// 2. Nearest-neighbour resize
// ─────────────────────────────────────────────────────────────
function resizeNearestNeighbour(src, srcW, srcH, dstW, dstH) {
  const dst = new Uint8Array(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const sx = Math.floor(x * srcW / dstW);
      const sy = Math.floor(y * srcH / dstH);
      const si = (sy * srcW + sx) * 4;
      const di = (y  * dstW + x)  * 4;
      dst[di]     = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }
  return dst;
}

// ─────────────────────────────────────────────────────────────
// 3. Encode RGBA pixels as PNG  (simple, uncompressed store)
//    We write a minimal valid PNG: IHDR + IDAT (deflate level 0) + IEND
// ─────────────────────────────────────────────────────────────
import { deflateSync } from 'zlib';

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf  = Buffer.from(type, 'ascii');
  const lenBuf   = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf   = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(rgba, width, height) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // raw scanlines (filter byte 0 = None per row)
  const rowSize  = 1 + width * 4;
  const raw      = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * rowSize + 1 + x * 4;
      raw[di]     = rgba[si];
      raw[di + 1] = rgba[si + 1];
      raw[di + 2] = rgba[si + 2];
      raw[di + 3] = rgba[si + 3];
    }
  }

  const idat = deflateSync(raw, { level: 6 });

  const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    SIG,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─────────────────────────────────────────────────────────────
// 4. Build ICO  (PNG-in-ICO, the modern Windows format)
// ─────────────────────────────────────────────────────────────
function buildIco(pngBuffers, sizes) {
  const n       = sizes.length;
  const dirSize = 6 + n * 16;
  let   offset  = dirSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(n, 4);

  const dir = Buffer.alloc(n * 16);
  pngBuffers.forEach((buf, i) => {
    const sz  = sizes[i];
    const off = i * 16;
    dir.writeUInt8(sz >= 256 ? 0 : sz, off + 0);
    dir.writeUInt8(sz >= 256 ? 0 : sz, off + 1);
    dir.writeUInt8(0,  off + 2);
    dir.writeUInt8(0,  off + 3);
    dir.writeUInt16LE(1,  off + 4);
    dir.writeUInt16LE(32, off + 6);
    dir.writeUInt32LE(buf.length, off + 8);
    dir.writeUInt32LE(offset,     off + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, dir, ...pngBuffers]);
}

// ─────────────────────────────────────────────────────────────
// 5. Main
// ─────────────────────────────────────────────────────────────
console.log(`📖 Reading ${SRC}…`);
const srcBuf = readFileSync(SRC);
const { width, height, rgba } = decodePng(srcBuf);
console.log(`   Source: ${width}×${height} RGBA`);

const pngBuffers = SIZES.map(sz => {
  const pixels = resizeNearestNeighbour(rgba, width, height, sz, sz);
  const png    = encodePng(pixels, sz, sz);
  console.log(`   → ${sz}×${sz}  (${(png.length / 1024).toFixed(1)} KB)`);
  return png;
});

const ico = buildIco(pngBuffers, SIZES);
writeFileSync(DEST, ico);
console.log(`\n✅ Written: ${DEST}  (${(ico.length / 1024).toFixed(1)} KB total)`);
console.log('   Sizes:', SIZES.join(', '), 'px — PNG-in-ICO, valid Windows format');
