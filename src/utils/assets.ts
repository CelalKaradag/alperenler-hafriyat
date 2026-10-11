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
