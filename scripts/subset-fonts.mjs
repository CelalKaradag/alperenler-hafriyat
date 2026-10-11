#!/usr/bin/env node
/**
 * Font kırpma (build/dev öncesi: package.json "prebuild" ve "predev").
 *
 * @fontsource-variable/archivo ve /inter paketlerindeki latin + latin-ext dosyalarını
 * yalnızca sitede gereken karakterlere (Türkçe dahil temel Latin seti) kırpıp
 * public/fonts/ altına woff2 olarak yazar. DEĞİŞKEN EKSENLER KIRPILMAZ: wght (ve Archivo'da wdth)
 * orijinal aralıklarıyla korunur (eksen daraltma font genişliğini bozdu, bkz. README). Saf JS (subset-font, Python gerekmez).
 *
 * Güvenlik ağı: herhangi bir adım başarısız olursa build DURMAZ; ilgili çıktı yerine
 * fontsource dosyasının kopyası konur (daha büyük ama eksiksiz). Çıkış kodu her zaman 0'dır.
 *
 * Not: fontsource latin ve latin-ext dosyalarını ayrı sunar ve JS ile birleştirmek mümkün değildir;
 * bu yüzden aile başına iki küçük dosya üretilir (ana: ASCII + temel, ek: Ğ ğ İ Ş ş ₺ gibi
 * latin-ext karakterleri). Tarayıcı `unicode-range` ile gerekeni indirir.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'fonts');
const cacheFile = path.join(outDir, '.cache.json');

// Sitede kullanılan karakterler. Yeni bir karakter gerekirse buraya ekleyin (README: Performans).
const TEXT = [
  // ASCII (A-Z a-z 0-9 ve noktalama)
  Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCodePoint(0x20 + i)).join(''),
  // Latin-1 simgeleri ve noktalama (©, ®, °, ±, ½, «, » …)
  Array.from({ length: 0xbf - 0xa0 + 1 }, (_, i) => String.fromCodePoint(0xa0 + i)).join(''),
  // Türkçe harfler ve şapkalılar
  'ÇĞİÖŞÜçğıöşüÂÎÛâîû',
  // Tırnaklar, tire/uzun tire, üç nokta, madde işareti
  '‘’‚“”„‹›«»–—…•·‐−′″',
  // Oklar, para birimi ve işaretler
  '→←↑↓₺€™©®°±×÷½¼¾',
].join('');

// İmza sürümü: kırpma davranışı değişince artırılır, eski çıktılar yeniden üretilir.
// 2: eksen daraltma KALDIRILDI (yalnızca karakter kırpma).
const SCRIPT_VERSION = 2;

const FONTS = [
  { name: 'archivo-latin', pkg: 'archivo', file: 'archivo-latin-wdth-normal.woff2' },
  { name: 'archivo-latin-ext', pkg: 'archivo', file: 'archivo-latin-ext-wdth-normal.woff2' },
  { name: 'inter-latin', pkg: 'inter', file: 'inter-latin-wght-normal.woff2' },
  { name: 'inter-latin-ext', pkg: 'inter', file: 'inter-latin-ext-wght-normal.woff2' },
];
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const sourcePath = (font) =>
  path.join(root, 'node_modules', '@fontsource-variable', font.pkg, 'files', font.file);
const destPath = (font) => path.join(outDir, `${font.name}.woff2`);

async function readCache() {
  try {
    return JSON.parse(await readFile(cacheFile, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Kaynak boyutları da imzaya girer: paket güncellenirse yeniden üretilir.
  const sizes = {};
  for (const font of FONTS) {
    sizes[font.name] = existsSync(sourcePath(font)) ? (await stat(sourcePath(font))).size : 0;
  }
  const signature = createHash('sha1')
    .update(JSON.stringify({ SCRIPT_VERSION, FONTS, TEXT, sizes }))
    .digest('hex');

  const cache = await readCache();
  if (cache && cache.signature === signature && FONTS.every((font) => existsSync(destPath(font)))) {
    console.log('[fonts] Kırpılmış fontlar güncel, atlandı.');
    return;
  }

  let subsetFont = null;
  try {
    subsetFont = (await import('subset-font')).default;
  } catch (error) {
    console.warn(`[fonts] subset-font yüklenemedi (${error.message}); fontsource dosyaları kopyalanacak.`);
  }

  let allSubset = true;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const font of FONTS) {
    const src = sourcePath(font);
    const dest = destPath(font);

    if (!existsSync(src)) {
      console.warn(`[fonts] Kaynak yok: ${font.pkg}/${font.file} (npm install çalıştırıldı mı?)`);
      allSubset = false;
      continue;
    }

    const before = sizes[font.name];
    totalBefore += before;
    try {
      if (!subsetFont) throw new Error('subset-font yok');
      // variationAxes VERİLMEZ: değişken eksenler orijinal aralıklarıyla korunur.
      const output = await subsetFont(await readFile(src), TEXT, { targetFormat: 'woff2' });
      if (!output || output.length < 1024) throw new Error('çıktı beklenenden küçük');
      await writeFile(dest, output);
      totalAfter += output.length;
      console.log(`[fonts] ${font.name}: ${kb(before)} → ${kb(output.length)}`);
    } catch (error) {
      allSubset = false;
      console.warn(`[fonts] ${font.name} kırpılamadı (${error.message}); fontsource dosyası kopyalanıyor.`);
      try {
        await copyFile(src, dest);
        totalAfter += before;
      } catch (copyError) {
        console.warn(`[fonts] ${font.name} kopyalanamadı: ${copyError.message}`);
      }
    }
  }

  if (totalBefore > 0) {
    console.log(`[fonts] Toplam: ${kb(totalBefore)} → ${kb(totalAfter)}`);
  }
  if (allSubset) {
    await writeFile(cacheFile, JSON.stringify({ signature }), 'utf8');
  }
}

// Hata olsa bile build durmasın (çıkış kodu 0).
main().catch((error) => {
  console.warn(`[fonts] Beklenmeyen hata, atlandı: ${error.message}`);
});
