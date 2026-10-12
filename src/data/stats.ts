/**
 * Rakam şeridi (ana sayfa; sarı tam genişlik bant). Yalnızca firma tarafından doğrulanmış rakamlar eklenir.
 * Liste boşken şerit görünmez. Yeni öğe eklemek için bir satır yazmak yeterlidir.
 *
 * İKİ GRUP: `group: 'is'` (üst grup, büyük sayılar) ve `group: 'filo'` (alt grup, "Filomuz"). Aynı gruptaki
 * öğeler listedeki sırayla gösterilir. Masaüstünde üst grup 3, alt grup öğe sayısı kadar sütun; tablet/mobilde
 * her grup 2 sütun (tek kalan son öğe ortalanır).
 *
 * Firma onayı (kesin): Tamamlanan iş 1653, Mutlu müşteri 1500, 7 paletli ekskavatör, 2 JCB, 7 kamyon,
 * 2 lowbed tır; Malatya'nın tüm ilçelerine hizmet (ilçe sayısı regions.ts'teki ONAYLI ilçelerden hesaplanır,
 * elle yazılmaz). Başka rakam/etiket UYDURULMAZ. Marka/model/yıl yazılmaz.
 *
 * Sayılar Türkçe biçimde gösterilir (1653 → "1.653"; HTML'de ve sayaç animasyonunda). `suffix` isteğe
 * bağlıdır (örn. "+"); şu an hiçbir öğede kullanılmaz: müşteri tam sayı verdi.
 */

import type { IconName } from '../utils/icons';
import { machines } from './machines';
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
  | 'statJobs'
  | 'statHandshake'
>;

export interface Stat {
  /** Ham tam sayı ("1653"); gösterim Türkçe biçimlendirilir ("1.653") */
  value: string;
  /** İsteğe bağlı son ek, örn. "+" (sayıyla birlikte gösterilir ve sayılırken korunur) */
  suffix?: string;
  label: string;
  /** Etiketin altında küçük ikinci satır (yalnızca bu öğede gösterilir), örn. "22–35 ton" */
  note?: string;
  icon?: StatIcon;
  /** 'is' = üst grup (büyük), 'filo' = alt grup ("Filomuz") */
  group: 'is' | 'filo';
}

/** Gösterilecek sayı metni: tam sayılar Türkçe biçimde (1.653), diğerleri olduğu gibi */
export const formatStatValue = (value: string): string =>
  /^\d+$/.test(value) ? new Intl.NumberFormat('tr-TR').format(Number(value)) : value;

/** Ekskavatör ton aralığı: machines.ts'teki filo verisinden (en küçük–en büyük ton) türetilir; elle yazılmaz */
const excavatorTons =
  machines
    .find((machine) => machine.slug === 'ekskavator-kiralama')
    ?.fleet?.rows.map((row) => row.tons)
    .filter((tons): tons is number => typeof tons === 'number') ?? [];
const excavatorTonRange =
  excavatorTons.length > 0
    ? `${Math.min(...excavatorTons)}–${Math.max(...excavatorTons)} ton`
    : undefined;

/** Hizmet verilen (onaylı) ilçe sayısı: regions.ts'ten hesaplanır */
const approvedRegionCount = regions.filter((region) => region.onaylandi).length;

export const stats: Stat[] = [
  // Üst grup
  { value: '1653', label: 'Tamamlanan iş', icon: 'statJobs', group: 'is' },
  { value: '1500', label: 'Mutlu müşteri', icon: 'statHandshake', group: 'is' },
  ...(approvedRegionCount > 0
    ? [{ value: String(approvedRegionCount), label: 'İlçede hizmet', icon: 'pin' as const, group: 'is' as const }]
    : []),
  // Alt grup (filo)
  { value: '7', label: 'Paletli ekskavatör', note: excavatorTonRange, icon: 'fleetExcavator', group: 'filo' },
  { value: '2', label: 'JCB', icon: 'fleetBackhoe', group: 'filo' },
  { value: '7', label: 'Kamyon', icon: 'fleetDumpTruck', group: 'filo' },
  { value: '2', label: 'Lowbed tır', icon: 'fleetLowbed', group: 'filo' },
];
