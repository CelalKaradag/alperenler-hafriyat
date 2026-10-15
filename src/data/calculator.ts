/**
 * Hafriyat hesaplayıcı (/hafriyat-hesaplama/): en × boy × derinlik → kazı hacmi (m³), kabarmış hacim
 * ve yaklaşık kamyon seferi. FİYAT YOKTUR; yalnızca hacim hesabı yapılır.
 *
 * Kabarma katsayıları genel mühendislik kabulleridir (kazılan malzeme gevşeyince hacmi artar):
 * toprak ≈ %25, killi / sert zemin ≈ %35, taşlık / kayalık ≈ %50. Kesin değer zemine göre değişir.
 *
 * `truckM3`: hesapta bir kamyon seferine yüklenen gevşek hacim (16 m³).
 * Firma onayladı (15.10.2026): sayfa, 16 m³ kamyon hacmi ve kabarma oranları onaylı; `onaylandi: true`.
 * Değer değişirse yalnızca bu dosya güncellenir (sayfa metinleri ve hesap buradan okur).
 */
import { showDrafts } from './drafts';

export interface SoilType {
  /** Kullanıcıya görünen ad (WhatsApp mesajına da girer) */
  label: string;
  /** Kabarma katsayısı (gevşek hacim / yerinde hacim) */
  swell: number;
}

export const calculator = {
  onaylandi: true,
  title: 'Hafriyat Hesaplama',
  seoTitle: 'Hafriyat Hesaplama: Kaç m³, Kaç Kamyon? | Alperenler Hafriyat',
  description:
    'Kazı alanının uzunluk, genişlik ve derinliğini girin; kazılacak hacmi (m³) ve yaklaşık kamyon seferini hemen görün. Ölçülerle WhatsApp’tan teklif isteyin.',
  lead: 'Kazı alanının ölçülerini girin; kaç metreküp toprak çıkacağını ve bunun yaklaşık kaç kamyon sefer tuttuğunu hemen görün.',
  truckM3: 16,
  soils: [
    { label: 'Toprak', swell: 1.25 },
    { label: 'Killi / sert zemin', swell: 1.35 },
    { label: 'Taşlık / kayalık', swell: 1.5 },
  ] satisfies SoilType[],
  /** Teklif sihirbazında ön-seçilecek iş türü (services.ts başlığıyla aynı olmalı) */
  serviceTitle: 'Hafriyat ve Temel Kazısı',
} as const;

/** Sayfa onaylıysa veya taslaklar görünürken (dev / önizleme) üretilir */
export const calculatorVisible: boolean = calculator.onaylandi || showDrafts;
