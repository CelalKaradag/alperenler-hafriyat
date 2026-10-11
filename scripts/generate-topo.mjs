#!/usr/bin/env node
/**
 * Topoğrafik eş yükselti desenlerini build öncesi public/topo/ altına sabit SVG dosyaları olarak
 * üretir (package.json "prebuild" ve "predev"). Sayfalara inline basılmaz; CSS background-image
 * ile kullanılır ve tarayıcı önbelleğe alır.
 *
 *  hero.svg → hero ve 404 (normal yoğunluk)
 *  soft.svg → sayfa başlıkları ve iletişim kartı (normal yoğunluk, farklı desen)
 *  low.svg  → harita bekleme ekranı (düşük yoğunluk, hafif)
 *
 * Normal çizgiler kırık beyaz, iki çizgi ince sarı (#f5b400) — sarı çizgiler SVG dosyasının
 * içindedir, bu yüzden ayrıca inline gerekmez. Başarısız olursa build durmaz (çıkış kodu 0).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topoSvg } from './topo-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'topo');

const FILES = [
  { name: 'hero.svg', seed: 0, density: 'normal' },
  { name: 'soft.svg', seed: 2, density: 'normal' },
  { name: 'low.svg', seed: 5, density: 'low' },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const file of FILES) {
    const svg = topoSvg({ seed: file.seed, density: file.density });
    await writeFile(path.join(outDir, file.name), svg, 'utf8');
    console.log(`[topo] ${file.name}: ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
}

main().catch((error) => {
  console.warn(`[topo] Üretilemedi, atlandı: ${error.message}`);
});
