/**
 * Rakam şeridi (ana sayfa; sarı tam genişlik bant). Yalnızca firma tarafından doğrulanmış rakamlar eklenir.
 * Liste boşken şerit görünmez. Yeni öğe eklemek için aşağıya bir satır yazmak yeterlidir; ızgara masaüstünde
 * öğe sayısına göre sütun açar, tablet/mobilde 2 sütundur (tek kalan son öğe ortalanır).
 *
 * Firma onayı (kesin): 7 paletli ekskavatör, 2 JCB, 7 kamyon, 2 lowbed tır; Malatya'nın tüm ilçelerine hizmet
 * (ilçe sayısı regions.ts'teki ONAYLI ilçelerden hesaplanır, elle yazılmaz). Başka rakam/etiket UYDURULMAZ.
 *
 * İLERİDE (müşteri sayı verince) eklenebilir. Sayıya "+" gibi bir son ek `suffix` ile eklenir; sayaç animasyonu
 * "0'dan 500'e" sayar ve sonda "+" gösterir. ÖRNEK (şimdi EKLEME; sayılar yer tutucudur, müşteri verecek):
 *
 *   { value: '500', suffix: '+', label: 'Tamamlanan iş', icon: 'check' },
 *   { value: '300', suffix: '+', label: 'Mutlu müşteri', icon: 'users' },
 *
 * Marka/model/yıl yazılmaz.
 */

import type { IconName } from '../utils/icons';
import { regions } from './regions';

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
  /** Gösterilen sayı (HTML'de gerçek sayı yazılıdır; yalnızca tam sayılar sayarak artar), örn. "500" */
  value: string;
  /** İsteğe bağlı son ek, örn. "+" (sayıyla birlikte gösterilir ve sayılırken korunur) */
  suffix?: string;
  label: string;
  icon?: StatIcon;
}

/** Hizmet verilen (onaylı) ilçe sayısı: regions.ts'ten hesaplanır */
const approvedRegionCount = regions.filter((region) => region.onaylandi).length;

export const stats: Stat[] = [
  { value: '7', label: 'Paletli ekskavatör', icon: 'fleetExcavator' },
  { value: '2', label: 'JCB', icon: 'fleetBackhoe' },
  { value: '7', label: 'Kamyon', icon: 'fleetDumpTruck' },
  { value: '2', label: 'Lowbed tır', icon: 'fleetLowbed' },
  ...(approvedRegionCount > 0
    ? [{ value: String(approvedRegionCount), label: 'İlçede hizmet', icon: 'pin' as const }]
    : []),
];
