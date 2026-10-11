/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** "true" ise onaylanmamış (taslak) hizmetler ve SSS build çıktısına girer (önizleme). */
  readonly PUBLIC_SHOW_DRAFTS?: string;
}
