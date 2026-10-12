/**
 * Güven şeridi (ana sayfa, Biz Kimiz ile Hizmetler arası): kısa, rakamsız, iddiasız maddeler.
 *
 * `onaylandi: false` → yalnızca `showDrafts` (src/data/drafts.ts) true iken görünür
 * (`npm run dev` veya `PUBLIC_SHOW_DRAFTS=true` önizleme build’i), "TASLAK" rozetiyle.
 * Firma onayladıktan sonra ilgili maddenin `onaylandi` değeri `true` yapılır.
 */
import type { IconName } from '../utils/icons';
import { showDrafts } from './drafts';

export interface Highlight {
  text: string;
  icon: IconName;
  onaylandi: boolean;
}

export const highlights: Highlight[] = [
  { text: 'Operatörlü makine', icon: 'machine', onaylandi: false },
  { text: 'Yerinde keşif ve teklif', icon: 'quote', onaylandi: false },
  { text: "Telefon ve WhatsApp’tan hızlı iletişim", icon: 'phone', onaylandi: false },
  { text: 'Yeşilyurt / Malatya merkezli', icon: 'pin', onaylandi: false },
];

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build’i) iken taslaklar da. */
export const visibleHighlights: Highlight[] = highlights.filter(
  (item) => item.onaylandi || showDrafts,
);
