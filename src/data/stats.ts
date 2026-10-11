/**
 * Rakam şeridi. Yalnızca firma tarafından doğrulanmış rakamlar eklenir.
 * Liste boşken ana sayfada şerit görünmez.
 */

import type { IconName } from '../utils/icons';

export type StatIcon = Extract<IconName, 'calendar' | 'truck' | 'pin' | 'users' | 'check'>;

export interface Stat {
  /** Olduğu gibi gösterilir, örn. "25+" */
  value: string;
  label: string;
  icon?: StatIcon;
}

export const stats: Stat[] = [];
