import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * public/ altındaki bir dosyanın var olup olmadığını (build/dev sırasında) kontrol eder.
 * Yol "/images/hero.jpg" gibi / ile başlamalıdır. Dosya yoksa görsel hiç render edilmez,
 * böylece kırık görsel ikonu oluşmaz.
 */
export function publicFileExists(src: string | undefined): src is string {
  if (!src || !src.startsWith('/') || src.includes('..')) return false;
  return existsSync(join(process.cwd(), 'public', src));
}

/** Aday yollardan public/ altında ilk var olanı döndürür (hiçbiri yoksa null). */
export function firstExisting(candidates: string | string[] | undefined): string | null {
  const list = Array.isArray(candidates) ? candidates : candidates ? [candidates] : [];
  return list.find((candidate) => publicFileExists(candidate)) ?? null;
}

/** "/images/x.jpg" → "/images/x.webp" (dosya varsa), yoksa null. <picture> için webp kaynağı. */
export function webpSibling(src: string): string | null {
  const webp = src.replace(/\.(jpe?g|png)$/i, '.webp');
  return webp !== src && publicFileExists(webp) ? webp : null;
}