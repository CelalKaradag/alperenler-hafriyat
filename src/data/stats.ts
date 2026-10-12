/**
 * Rakam şeridi (ana sayfa). Yalnızca firma tarafından doğrulanmış rakamlar eklenir.
 * Liste boşken ana sayfada şerit görünmez.
 *
 * Firma onayı (kesin): 5 paletli ekskavatör, 2 JCB, 7 kamyon, 2 tır. Tırların lowbed olup olmadığı
 * bilinmiyor: etiket yalnızca "Tır". Marka/model/yıl yazılmaz.
 */

import type { IconName } from '../utils/icons';

export type StatIcon = Extract<IconName, 'calendar' | 'truck' | 'pin' | 'users' | 'check' | 'machine'>;

export interface Stat {
  /** Olduğu gibi gösterilir, örn. "25+" */
  value: string;
  label: string;
  icon?: StatIcon;
}

export const stats: Stat[] = [
  { value: '5', label: 'Paletli ekskavatör', icon: 'machine' },
  { value: '2', label: 'JCB', icon: 'machine' },
  { value: '7', label: 'Kamyon', icon: 'truck' },
  { value: '2', label: 'Tır', icon: 'truck' },
];
