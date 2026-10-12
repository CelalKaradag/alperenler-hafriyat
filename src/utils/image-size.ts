import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ImageSize {
  width: number;
  height: number;
}

/**
 * public/ altındaki bir JPEG’in gerçek piksel boyutunu (build/dev sırasında) dosyadan okur.
 * Paket gerekmez: JPEG başlıklarındaki SOF işaretçisi ve EXIF yönü (telefon fotoğrafları
 * 90° döndürülmüş saklanabilir) okunur. Okunamazsa null döner.
 */
export function imageSize(publicPath: string): ImageSize | null {
  try {
    const buffer = readFileSync(join(process.cwd(), 'public', publicPath));
    return jpegSize(buffer);
  } catch {
    return null;
  }
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  let orientation = 1;

  while (offset + 4 <= buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xff) {
      offset += 1; // dolgu baytı
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2; // uzunluk taşımayan işaretçiler
      continue;
    }

    const length = buf.readUInt16BE(offset + 2);
    if (marker === 0xe1 && buf.toString('latin1', offset + 4, offset + 8) === 'Exif') {
      orientation = exifOrientation(buf, offset + 10) ?? orientation;
    }

    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

function exifOrientation(buf: Buffer, tiffStart: number): number | null {
  if (tiffStart + 8 > buf.length) return null;
  const little = buf.toString('latin1', tiffStart, tiffStart + 2) === 'II';
  const u16 = (o: number) => (little ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o: number) => (little ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiffStart + u32(tiffStart + 4);
  if (ifd + 2 > buf.length) return null;
  const count = u16(ifd);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > buf.length) break;
    if (u16(entry) === 0x0112) return u16(entry + 8);
  }
  return null;
}