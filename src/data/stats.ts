/**
 * Rakam şeridi (ana sayfa; sarı tam genişlik bant). Yalnızca firma tarafından doğrulanmış rakamlar eklenir.
 * Liste boşken şerit görünmez. İleride "Tamamlanan iş", "Çalışan" gibi öğeler eklenebilir: yeni bir satır
 * eklemek yeterlidir (ızgara masaüstünde öğe sayısına göre otomatik sütun açar; mobil/tablet 2 sütundur).
 *
 * Firma onayı (kesin): 7 paletli ekskavatör, 2 JCB, 7 kamyon, 2 lowbed tır. Başka rakam/etiket UYDURULMAZ.
 * Marka/model/yıl yazılmaz.
 */

import type { IconName } from '../utils/icons';

export type StatIcon = Extract<
  IconName,
  | 'calendar'
  | 'truck'
  | 'pin'
  | 'users'
  | 'check'
  | 'machine'
  | 'fleetExcavator'
  | 'fleetBackhoe'
  | 'fleetDumpTruck'
  | 'fleetLowbed'
>;

export interface Stat {
  /** Olduğu gibi gösterilir (HTML'de gerçek sayı yazılıdır); yalnızca tam sayılar sayarak artar, örn. "7" */
  value: string;
  label: string;
  icon?: StatIcon;
}

export const stats: Stat[] = [
  { value: '7', label: 'Paletli ekskavatör', icon: 'fleetExcavator' },
  { value: '2', label: 'JCB', icon: 'fleetBackhoe' },
  { value: '7', label: 'Kamyon', icon: 'fleetDumpTruck' },
  { value: '2', label: 'Lowbed tır', icon: 'fleetLowbed' },
];
