#!/usr/bin/env node
/**
 * Duyarlı görsel türevleri (build/dev öncesi: package.json "prepare:assets" içinden).
 *
 * public/images/ altındaki tüm .jpg kaynaklardan 480, 960 ve 1600 px genişlikte (kaynaktan büyük
 * olanı üretmez; kaynağın kendi genişliği de bir türev olarak eklenir) webp + jpg türevleri üretir:
 *   public/images/_r/<ad>-<genişlik>.(webp|jpg)
 * ve her görselin boyutunu + baskın rengini (sharp stats().dominant) src/data/image-meta.json'a yazar.
 * Picture.astro, galeri ve hero bu meta ile srcset/sizes ve yer tutucu zemin rengi üretir.
 *
 * - Kaynak değişmediyse atlanır (public/images/_r/.cache.json).
 * - Hata olursa build DURMAZ: sharp yoksa/çalışmazsa mevcut _r klasörü ve meta olduğu gibi kalır;
 *   site tek boy orijinal görsellere düşer. Çıkış kodu her zaman 0.
 * - public/images/_r/ Git'e girer (dağıtım ortamında sharp çalışmasa bile hazır olsun).
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(root, 'public', 'images');
const outDir = path.join(imagesDir, '_r');
const cacheFile = path.join(outDir, '.cache.json');
const metaFile = path.join(root, 'src', 'data', 'image-meta.json');

const WIDTHS = [480, 960, 1600];
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 80;
const VERSION = 1; // türev ayarları değişince artırılır

const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

async function walk(dir, found = []) {
  if (!existsSync(dir)) return found;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_r') await walk(full, found);
    } else if (/\.jpe?g$/i.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

/** Dosya adı çakışmasında üst klasör adı öne eklenir */
function buildKeys(files) {
  const counts = new Map();
  for (const file of files) {
    const base = path.basename(file).replace(/\.jpe?g$/i, '');
    counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  const keys = new Map();
  for (const file of files) {
    const base = path.basename(file).replace(/\.jpe?g$/i, '');
    const rel = path.relative(imagesDir, file).replace(/\\/g, '/').replace(/\.jpe?g$/i, '');
    keys.set(file, counts.get(base) > 1 ? rel.replace(/\//g, '__') : base);
  }
  return keys;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (error) {
    console.warn(`[images] sharp yüklenemedi (${error.message}); mevcut türevler/orijinaller kullanılacak.`);
    return;
  }

  const files = await walk(imagesDir);
  if (files.length === 0) {
    console.log('[images] public/images altında .jpg yok, atlandı.');
    return;
  }

  await mkdir(outDir, { recursive: true });
  const cache = await readJson(cacheFile, {});
  const keys = buildKeys(files);
  const nextCache = {};
  const meta = {};
  let made = 0;
  let skipped = 0;
  let bytes = 0;

  for (const file of files) {
    const publicPath = '/images/' + path.relative(imagesDir, file).replace(/\\/g, '/');
    const key = keys.get(file);
    try {
      const info = await stat(file);
      const signature = `${VERSION}:${info.size}:${Math.round(info.mtimeMs)}:${key}`;
      const cached = cache[publicPath];

      const outputsExist = (widths) =>
        widths.every(
          (w) => existsSync(path.join(outDir, `${key}-${w}.webp`)) && existsSync(path.join(outDir, `${key}-${w}.jpg`)),
        );

      if (cached && cached.signature === signature && outputsExist(cached.meta.widths)) {
        meta[publicPath] = cached.meta;
        nextCache[publicPath] = cached;
        skipped += 1;
        continue;
      }

      const input = sharp(file);
      const metadata = await input.metadata();
      const swap = metadata.orientation && metadata.orientation >= 5;
      const width = swap ? metadata.height : metadata.width;
      const height = swap ? metadata.width : metadata.height;
      if (!width || !height) throw new Error('boyut okunamadı');

      const { dominant } = await sharp(file).stats();
      const color = `#${toHex(dominant.r)}${toHex(dominant.g)}${toHex(dominant.b)}`;

      // Kaynaktan büyük türev üretilmez; kaynağın kendi genişliği de eklenir
      const widths = WIDTHS.filter((w) => w < width);
      widths.push(width);

      for (const w of widths) {
        const base = () => sharp(file).rotate().resize({ width: w, withoutEnlargement: true });
        const webp = await base().webp({ quality: WEBP_QUALITY }).toFile(path.join(outDir, `${key}-${w}.webp`));
        const jpg = await base()
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toFile(path.join(outDir, `${key}-${w}.jpg`));
        bytes += webp.size + jpg.size;
      }

      const entry = { key, width, height, color, widths };
      meta[publicPath] = entry;
      nextCache[publicPath] = { signature, meta: entry };
      made += 1;
    } catch (error) {
      console.warn(`[images] ${publicPath} işlenemedi (${error.message}); atlandı.`);
      if (cache[publicPath]) {
        // önceki başarılı sonuç varsa korunur
        meta[publicPath] = cache[publicPath].meta;
        nextCache[publicPath] = cache[publicPath];
      }
    }
  }

  const sorted = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => a.localeCompare(b)));
  const json = `${JSON.stringify(sorted, null, 2)}\n`;
  if ((await readJson(metaFile, null)) === null || (await readFile(metaFile, 'utf8')) !== json) {
    await writeFile(metaFile, json, 'utf8');
  }
  await writeFile(cacheFile, `${JSON.stringify(nextCache)}\n`, 'utf8');

  console.log(
    `[images] ${made} görsel üretildi (${(bytes / 1024).toFixed(0)} KB), ${skipped} güncel olduğu için atlandı.`,
  );
}

main().catch((error) => {
  console.warn(`[images] Beklenmeyen hata, atlandı: ${error.message}`);
});