// Génère les icônes PNG de la PWA sans dépendance externe (encodeur PNG maison).
// Reproductible : `node scripts/gen-icons.mjs`. Dessine un haltère sur fond sombre.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const BG = [21, 21, 21, 255]       // #151515 (thème Activitar)
const ACCENT = [228, 56, 28, 255]  // #e4381C (rouge-orange)
const GREEN = [255, 202, 4, 255]   // #ffca04 (or)

function draw(size) {
  const s = size / 512
  const buf = new Uint8Array(size * size * 4)
  const px = (x, y, c) => {
    x |= 0; y |= 0
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3]
  }
  const rect = (x, y, w, h, c) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) px(x + xx, y + yy, c)
  }
  const disc = (cx, cy, r, c) => {
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++)
      if (xx * xx + yy * yy <= r * r) px(cx + xx, cy + yy, c)
  }
  // fond plein (maskable-friendly)
  rect(0, 0, size, size, BG)
  const T = 34 * s // épaisseur barre/plaques
  // barre horizontale (176..336 @ y256)
  rect(176 * s, 256 * s - T / 2, 160 * s, T, ACCENT)
  // plaques internes (150 & 362, y206..306)
  rect(150 * s - T / 2, 206 * s, T, 100 * s, ACCENT)
  rect(362 * s - T / 2, 206 * s, T, 100 * s, ACCENT)
  // plaques externes (120 & 392, y226..286)
  rect(120 * s - T / 2, 226 * s, T, 60 * s, ACCENT)
  rect(392 * s - T / 2, 226 * s, T, 60 * s, ACCENT)
  // point vert
  disc(256 * s, 150 * s, 16 * s, GREEN)
  return buf
}

// --- Encodeur PNG (RGBA, filtre 0) ---
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(bytes) {
  let c = 0xffffffff
  for (const b of bytes) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function u32(n) { return Uint8Array.of((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255) }
function chunk(type, data) {
  const t = new TextEncoder().encode(type)
  const body = new Uint8Array(t.length + data.length)
  body.set(t); body.set(data, t.length)
  return new Uint8Array([...u32(data.length), ...body, ...u32(crc32(body))])
}
function encodePNG(size, rgba) {
  const sig = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10)
  const ihdr = new Uint8Array([...u32(size), ...u32(size), 8, 6, 0, 0, 0])
  const raw = new Uint8Array(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    raw.set(rgba.subarray(y * size * 4, (y + 1) * size * 4), y * (size * 4 + 1) + 1)
  }
  const idat = deflateSync(raw)
  return new Uint8Array([...sig, ...chunk('IHDR', ihdr), ...chunk('IDAT', idat), ...chunk('IEND', new Uint8Array())])
}

for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['icon-maskable-512', 512]]) {
  writeFileSync(new URL(`../icons/${name}.png`, import.meta.url), encodePNG(size, draw(size)))
  console.log(`✓ icons/${name}.png (${size}px)`)
}
