/**
 * Rehber yazılar (/rehber/ ve /rehber/<slug>/).
 *
 * Hepsi `onaylandi: false`; yalnızca `showDrafts` (src/data/drafts.ts) true iken görünür ("TASLAK"
 * rozetiyle, noindex); sitemap’e ve Article JSON-LD’ye girmez. Firma her yazıyı okuyup onayladıktan
 * sonra yalnızca o yazının `onaylandi` değerini `true` yapmalıdır.
 *
 * Yazılar sade, genel bilgidir: firmaya özel iddia, rakam, fiyat veya süre YOKTUR. Hukuki konularda
 * (`legal: true`) sayfada "güncel kuralları belediyenizden teyit edin" notu otomatik gösterilir.
 * Yazar her yerde "Alperenler Hafriyat"tır (kişi adı yoktur). Kapak, galerideki uygun bir fotoğraftır.
 */
import { showDrafts } from './drafts';

export interface GuideSection {
  id: string;
  title: string;
  paragraphs: string[];
  /** İsteğe bağlı madde listesi (paragraflardan sonra) */
  items?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  /** <title> için; "… | Alperenler Hafriyat" eklenerek kullanılır */
  seoTitle: string;
  description: string;
  /** Galeriden kapak fotoğrafı ve alt metni */
  cover: string;
  coverAlt: string;
  /** İlgili hizmet slug’ları (services.ts) */
  relatedServices: string[];
  /** true: sayfada "belediyenizden teyit edin" notu gösterilir */
  legal: boolean;
  onaylandi: boolean;
  sections: GuideSection[];
}

export const guideLegalNote =
  'Bu yazı genel bilgi amaçlıdır, hukuki veya teknik tavsiye değildir. İzin, belge ve döküm alanı gibi konulardaki güncel kuralları belediyenizden teyit edin.';

export const guides: Guide[] = [
  {
    slug: 'temel-kazisindan-once-bilinmesi-gerekenler',
    title: 'Temel kazısından önce bilinmesi gerekenler',
    seoTitle: 'Temel Kazısından Önce Bilinmesi Gerekenler',
    description:
      'Temel kazısına başlamadan önce zemin, proje, izinler, altyapı hatları ve saha erişimi hakkında bilinmesi gereken genel noktalar.',
    cover: '/images/galeri/santiye-temel-kazisi.jpg',
    coverAlt: 'Şehir içinde temel kazısı yapılan şantiye, ekskavatörler ve kamyonlar',
    relatedServices: ['hafriyat-ve-temel-kazisi', 'hafriyat-kamyonu-ve-moloz-tasima'],
    legal: true,
    onaylandi: false,
    sections: [
      {
        id: 'neden-hazirlik',
        title: 'Kazıdan önce hazırlık neden önemli?',
        paragraphs: [
          'Temel kazısı, bir yapının en erken ve geri dönüşü en zor aşamalarından biridir. Kazı başladıktan sonra fark edilen bir eksik; iş makinesinin ve kamyonların beklemesine, planın değişmesine ve masrafın artmasına yol açabilir. Bu yüzden iş makinesi sahaya gelmeden önce birkaç temel konuyu netleştirmek işi kolaylaştırır.',
          'Aşağıdaki başlıklar genel bir çerçevedir. Her arsanın zemini, her projenin ihtiyacı farklıdır; kesin kararları proje müellifleri ve ilgili kurumlar verir.',
        ],
      },
      {
        id: 'zemin-ve-proje',
        title: 'Zemin ve proje',
        paragraphs: [
          'Kazının nasıl yapılacağı büyük ölçüde zeminin yapısına ve projenin gerektirdiği ölçülere bağlıdır. Toprak, kil, çakıllı zemin ya da kaya aynı makineyle, aynı hızda ve aynı yöntemle kazılmaz. Zemin hakkında bilgi veren etüt raporu varsa kazıyı yapacak ekiple paylaşmak doğru yöntemi ve makineyi seçmeyi kolaylaştırır.',
          'Kazı derinliği, genişliği ve şev durumu projede belirtilir. Ölçüleri kazıyı yapan ekibin tahmin etmesi yerine projeden almak hem hata riskini azaltır hem de teklifin daha net hazırlanmasını sağlar.',
        ],
      },
      {
        id: 'izinler-ve-komsu-parseller',
        title: 'İzinler ve komşu parseller',
        paragraphs: [
          'Kazıya başlamak için gerekli ruhsat ve izinler yapılacağı yere göre değişebilir. Bu konuda hangi belgelerin gerektiğini ilgili belediyeden öğrenmek gerekir. Kuralların güncel hâli için kendi belediyenizle görüşmeniz en doğru yoldur.',
          'Komşu parsellere ve yola yakın kazılarda; komşu yapıların güvenliği, yol kenarı ve kaldırım gibi ortak alanların durumu da ayrıca düşünülmelidir. Bu tür sahalarda projeyi hazırlayan mühendislerin görüşü esastır.',
        ],
      },
      {
        id: 'altyapi-hatlari',
        title: 'Yer altı hatlarının yerini öğrenin',
        paragraphs: [
          'Arsada veya yol kenarında elektrik, su, kanalizasyon, doğal gaz ya da iletişim hatları bulunabilir. Bu hatların yerini kazıdan önce ilgili kurumlardan öğrenmek, makine kovasının bir hatta zarar vermesini önlemenin en güvenli yoludur.',
          'Yeri bilinmeyen bir hattın olabileceği düşünülüyorsa kazı bu bölgede dikkatle ve gerekirse elle yapılır. Böyle bir durumu işe başlamadan kazıyı yapan ekibe söylemek önemlidir.',
        ],
      },
      {
        id: 'saha-erisimi',
        title: 'Saha erişimi ve hafriyatın akışı',
        paragraphs: [
          'Kazıdan çıkan toprağın sahadan nasıl çıkarılacağı baştan planlanmalıdır. Paletli bir ekskavatörün ve hafriyat kamyonlarının sahaya girişi, dönüşü ve yükleme yeri için yeterli alan gerekir. Dar sokaklarda ya da eğimli arazilerde kullanılabilecek makine tipi değişebilir.',
          'Çıkan hafriyat toprağının nereye götürüleceği de önceden belirlenmelidir; bu konu için "Hafriyat toprağı ve moloz nereye götürülür?" yazımıza bakabilirsiniz.',
        ],
      },
      {
        id: 'mevsim-ve-hava',
        title: 'Mevsim ve hava koşulları',
        paragraphs: [
          'Yağmurlu ve karlı dönemlerde zemin yumuşar, kazı çukurunda su birikebilir ve sahaya giriş çıkış zorlaşabilir. Aynı zamanda donmuş zemin de kazıyı güçleştirebilir. Bu nedenle kazı tarihini seçerken mevsim koşullarını hesaba katmak ve işe başlamadan önce sahanın o günkü durumunu görmek faydalıdır.',
          'Su birikmesi ihtimali olan sahalarda suyun nereye akıtılacağı da baştan düşünülmelidir. Çukurda bekleyen su hem çalışmayı yavaşlatır hem de şevlerin dayanımını etkileyebilir.',
        ],
      },
      {
        id: 'olcu-ve-kot',
        title: 'Ölçü, kot ve kazı tabanı',
        paragraphs: [
          'Kazı tabanının hangi seviyede bırakılacağı projede belirtilir. Fazla kazılmış bir taban sonradan doldurmayı gerektirebilir; eksik kazılmış bir taban ise tekrar makine çağırmak anlamına gelir. Bu nedenle sahada kot noktalarının işaretlenmesi ve kazı sırasında kontrol edilmesi önemlidir.',
          'Ölçüleri kimin işaretleyeceği ve kazı sırasında kimin kontrol edeceği baştan netleşmelidir. Böylece iş makinesi operatörü doğru ölçüde çalışabilir.',
        ],
      },
      {
        id: 'kazi-sonrasi',
        title: 'Kazıdan sonra ne olur?',
        paragraphs: [
          'Kazı tamamlandığında temel zeminin proje ve ilgili mühendislerce kontrol edilmesi gerekir. Sonraki aşamalar, yani temel imalatı, ancak bu kontrolden sonra başlayabilir. Kazı tabanının temiz ve düzgün bırakılması bu aşamayı kolaylaştırır.',
          'Kazı çukurunun uzun süre açık kalması gerekiyorsa çukurun güvenliği ve yağmur suyunun durumu ayrıca düşünülmelidir.',
        ],
      },
      {
        id: 'guvenlik',
        title: 'İş güvenliği ve çevre',
        paragraphs: [
          'Kazı çukurlarının çevresi uygun biçimde işaretlenmeli ve korunmalıdır. Yağmur sonrası şev kaymaları ve çukurda biriken su gibi durumlar dikkat gerektirir. Çalışan makinelerin çevresinde iş dışı kişilerin bulunmaması gerekir.',
          'Toz, gürültü ve yola taşan toprak gibi konular çevreyi etkiler. Bu etkileri azaltmak için sahada alınacak önlemleri işe başlamadan konuşmak faydalıdır.',
        ],
      },
      {
        id: 'teklif-oncesi',
        title: 'Teklif istemeden önce hazır olsun',
        paragraphs: [
          'Kazıyı yapacak ekipten teklif isterken aşağıdaki bilgileri hazırlamak, teklifin işe uygun hazırlanmasını sağlar:',
        ],
        items: [
          'Arsanın bulunduğu ilçe ve mahalle',
          'Projedeki kazı ölçüleri ve varsa zemin bilgisi',
          'Sahaya makine ve kamyon girişinin durumu',
          'Çıkan toprağın nereye gideceği',
          'Kazının hangi tarihte başlamasını istediğiniz',
        ],
      },
    ],
  },
  {
    slug: 'hafriyat-topragi-ve-moloz-nereye-goturulur',
    title: 'Hafriyat toprağı ve moloz nereye götürülür?',
    seoTitle: 'Hafriyat Toprağı ve Moloz Nereye Götürülür?',
    description:
      'Hafriyat toprağı ve inşaat molozu için döküm alanı, taşıma ve yeniden kullanım hakkında genel bilgiler; güncel kurallar için belediyeye danışın.',
    cover: '/images/galeri/tas-ocagi-ekskavator-kamyon.jpg',
    coverAlt: 'Taş ocağında ekskavatör ve damperli kamyon',
    relatedServices: ['hafriyat-kamyonu-ve-moloz-tasima', 'hafriyat-ve-temel-kazisi', 'bina-yikim-ve-kirim'],
    legal: true,
    onaylandi: false,
    sections: [
      {
        id: 'genel-cerceve',
        title: 'Genel çerçeve',
        paragraphs: [
          'Kazı ya da yıkım sonrası ortaya çıkan malzemenin nereye götürüleceği, işin en çok sorulan konularından biridir. Bu malzemelerin gelişigüzel bir yere dökülmesi uygun değildir; ilgili belediyenin belirlediği alanlara, kurallara uygun biçimde götürülmesi gerekir.',
          'Hangi alanın kullanılacağı, işin yapıldığı yere ve belediyenin güncel düzenlemelerine göre değişir. Bu yüzden kesin bilgi için işin yapılacağı yerin belediyesine danışmak gerekir.',
        ],
      },
      {
        id: 'toprak-ve-moloz',
        title: 'Hafriyat toprağı ile moloz aynı şey değildir',
        paragraphs: [
          'Hafriyat toprağı, kazı sırasında çıkan toprak ve benzeri malzemedir. İnşaat molozu ise yıkım ve yapı işlerinden çıkan beton, tuğla, sıva gibi parçalardır. İkisi birbirine karışırsa ayrıştırma zorlaşır ve uygun alana götürmek güçleşebilir.',
          'Mümkünse sahada bu malzemeleri ayrı yığınlarda tutmak işi kolaylaştırır. Yıkım ve kazı birlikte yapılıyorsa bunu önceden konuşmak faydalıdır.',
        ],
      },
      {
        id: 'dokum-alani',
        title: 'Döküm alanı nasıl belirlenir?',
        paragraphs: [
          'Döküm alanlarını genellikle belediyeler belirler. Bazı yerlerde kullanılacak alan için başvuru ya da belge gerekebilir. Hangi belgelerin istendiğini ve alanın çalışma düzenini belediyeden öğrenmek gerekir.',
          'Kendi arsanızda ya da başka bir özel arazide dökmek istiyorsanız, bunun için de izin ve uygunluk koşulları olabilir. İzin almadan döküm yapmanın cezai sonuçları olabileceğinden, bu konuda önceden bilgi almak önemlidir.',
        ],
      },
      {
        id: 'tasima',
        title: 'Taşıma',
        paragraphs: [
          'Hafriyat ve molozun taşınması için uygun kamyon ve yükleme makinesi gerekir. Sahaya giriş çıkış yolunun uygunluğu, kamyonun dönüş alanı ve yükleme yeri taşıma planını etkiler.',
          'Kamyonların yüklerinin üstünün örtülmesi ve yola toprak taşınmaması gibi konular hem çevre hem trafik güvenliği için önemlidir. Bu tür kuralların güncel hâlini de belediyeden öğrenebilirsiniz.',
        ],
      },
      {
        id: 'cevre-ve-komsular',
        title: 'Çevre ve komşular',
        paragraphs: [
          'Kamyonların sık geçtiği sokaklarda toz, gürültü ve yola dökülen toprak komşuları rahatsız edebilir. Çıkış öncesi lastiklerin ve yolun temiz tutulması, yüklerin üstünün örtülmesi ve mümkünse yoğun saatlerde sokakta beklememek iyi komşuluk açısından önemlidir.',
          'Bu tür konularda yerel kurallar da olabilir; ayrıntıyı belediyeden öğrenebilirsiniz.',
        ],
      },
      {
        id: 'yeniden-kullanim',
        title: 'Yeniden kullanım olasılığı',
        paragraphs: [
          'Temiz hafriyat toprağı bazı durumlarda dolgu gibi işlerde yeniden kullanılabilir. Bunun mümkün olup olmadığı toprağın cinsine ve kullanılacağı işe bağlıdır. Moloz da kırılıp ayrıştırıldığında bazı işlerde değerlendirilebilir.',
          'Yeniden kullanım her iş için uygun değildir; bu konuda karar vermeden önce uygunluğunu öğrenmek gerekir.',
        ],
      },
      {
        id: 'sahada-ayristirma',
        title: 'Sahada ayrıştırma ve biriktirme',
        paragraphs: [
          'Malzemeyi sahada türüne göre ayrı yığınlarda biriktirmek, yükleme ve taşıma sırasında zaman kazandırır. Toprak, beton, tuğla ve benzeri parçalar birbirine karıştığında hem yükleme zorlaşır hem de uygun alana kabul edilme durumu değişebilir.',
          'Biriktirme alanı yola taşmamalı, komşu parsellere ve yağmur suyu akış yönüne zarar vermemelidir. Rüzgârlı havalarda tozun yayılmasını azaltmak için önlem almak çevre açısından iyi bir uygulamadır.',
        ],
      },
      {
        id: 'belge-ve-kayit',
        title: 'Belge ve kayıt',
        paragraphs: [
          'Bazı yerlerde hafriyatın döküm alanına teslim edildiğini gösteren belge veya kayıt istenebilir. Hangi belgelerin gerektiğini ve nasıl alınacağını belediyeden öğrenmek, işin sonradan sorun çıkarmamasını sağlar.',
          'Taşımayı yapan ekiple belge konusunu işe başlamadan konuşmak, kimin neyi hazırlayacağını netleştirir.',
        ],
      },
      {
        id: 'sik-yapilan-hatalar',
        title: 'Sık yapılan hatalar',
        paragraphs: ['Hafriyat ve moloz konusunda sıkça karşılaşılan hatalar şunlardır:'],
        items: [
          'Döküm yerini belediyeye sormadan malzemeyi sahadan çıkarmak',
          'Toprak ve molozu karıştırmak',
          'Kamyonun sahaya giriş çıkışını önceden düşünmemek',
          'Yüklerin üstünü örtmeyi ve yolu temiz tutmayı ihmal etmek',
          'Taşıma teklifi alırken malzemenin türünü doğru söylememek',
        ],
      },
      {
        id: 'hazirlik-listesi',
        title: 'Teklif istemeden önce',
        paragraphs: ['Taşıma için teklif isterken şu bilgileri hazırlamak işi hızlandırır:'],
        items: [
          'Malzemenin türü: toprak, moloz veya karışık',
          'Sahanın bulunduğu ilçe ve mahalle',
          'Kamyonun sahaya girişinin durumu',
          'Belediyeden öğrendiğiniz döküm alanı bilgisi varsa onu',
          'Taşımanın başlaması istenen tarih',
        ],
      },
    ],
  },
  {
    slug: 'ekskavator-mu-kepce-mi-dogru-makine-secimi',
    title: 'Ekskavatör mü kepçe mi? İşinize uygun makineyi seçmek',
    seoTitle: 'Ekskavatör mü Kepçe mi? Doğru Makine Seçimi',
    description:
      'Ekskavatör, kepçe (yükleyici-kazıcı) ve mini ekskavatör arasındaki farklar ve işinize uygun makineyi seçerken sorulacak sorular.',
    cover: '/images/galeri/derin-kazi-hitachi.jpg',
    coverAlt: 'Derin temel kazısında çalışan Hitachi ekskavatör',
    relatedServices: ['operatorlu-is-makinesi-kiralama', 'hafriyat-ve-temel-kazisi', 'kaya-kirma-ve-kirici-isleri'],
    legal: false,
    onaylandi: false,
    sections: [
      {
        id: 'terimler',
        title: 'Aynı makineyi mi kastediyoruz?',
        paragraphs: [
          'Günlük konuşmada "kepçe" kelimesi farklı makineler için kullanılabiliyor. Çoğu zaman önde yükleme kovası, arkada kazı kolu olan makine kastedilir; kimi zaman da ekskavatöre kepçe denir. Telefonda ya da teklif isterken yanlış anlaşılmamak için makineyi tarif etmek faydalıdır.',
          'Bu yazıda ekskavatör, önde yükleyici arkada kazıcı kolu olan makine ve mini ekskavatör arasındaki genel farkları anlatıyoruz. Gerçek ihtiyaç işin ve sahanın durumuna göre değişir.',
        ],
      },
      {
        id: 'ekskavator',
        title: 'Ekskavatör ne zaman uygun?',
        paragraphs: [
          'Ekskavatör, dönebilen bir üst gövde ve uzun bir kazı koluyla çalışan makinedir. Temel kazısı, derin kanal ve geniş alanda toprak kazısı gibi işlerde sık tercih edilir. Kolun uzanma kabiliyeti sayesinde makine yerinden fazla oynamadan çevresindeki alanda çalışabilir.',
          'Uç değiştirilerek farklı işler de yapılabilir; örneğin kırıcı uçla kaya ve beton kırma gibi.',
        ],
      },
      {
        id: 'yukleyici-kazici',
        title: 'Önde yükleyici, arkada kazıcı kollu makine',
        paragraphs: [
          'Bu makine hem malzeme yükleyebilir hem de kazı yapabilir. Küçük ve orta ölçekli işlerde, malzeme taşıma ve yükleme gerektiren sahalarda esnek bir çözüm sunabilir. Derin ve geniş kazılarda ise kazı kolunun erişimi ve makinenin duruşu sınırlayıcı olabilir.',
          'Aynı sahada hem yükleme hem küçük kazı gerekiyorsa tek makineyle çalışmak bazen pratiktir; ancak karar iş büyüklüğüne bağlıdır.',
        ],
      },
      {
        id: 'mini-ekskavator',
        title: 'Mini ekskavatör',
        paragraphs: [
          'Mini ekskavatör, dar ve sınırlı alanlarda çalışmak için daha küçük boyutlu bir makinedir. Bahçe, dar sokak, bina yanı gibi büyük makinenin giremediği yerlerde işe yarayabilir. Küçük boyutu nedeniyle kazı derinliği ve kapasitesi büyük makineye göre sınırlıdır.',
        ],
      },
      {
        id: 'paletli-lastikli',
        title: 'Paletli mi, lastikli mi?',
        paragraphs: [
          'Ekskavatörler paletli ya da lastikli olabilir. Paletli makineler çamurlu, engebeli ve yumuşak zeminde genellikle daha dengeli çalışır. Lastikli makineler ise yol üzerinde yer değiştirmeyi kolaylaştırır ve asfalt gibi yüzeylere daha az zarar verecek biçimde çalışabilir.',
          'Hangisinin uygun olduğu sahanın zeminine ve işin sürekliliğine bağlıdır. Zemin durumunu önceden anlatmak doğru makinenin seçilmesine yardımcı olur.',
        ],
      },
      {
        id: 'kirici-ve-uclar',
        title: 'Kırıcı ve diğer uçlar',
        paragraphs: [
          'Ekskavatörlerin ve bazı yükleyicilerin koluna farklı uçlar takılabilir. Kazı kovası toprak işleri içindir; kırıcı uç ise kaya, beton ve sert zeminlerde kullanılır. Kaya çıkması beklenen bir sahada baştan kırıcı uç ihtiyacını söylemek, ikinci kez makine çağırmayı önleyebilir.',
          'Bir uç için makinenin kol yapısının uygun olması gerekir. Bu yüzden uç ihtiyacını da makineyle birlikte konuşmak gerekir.',
        ],
      },
      {
        id: 'is-buyuklugu',
        title: 'İşin büyüklüğü',
        paragraphs: [
          'Küçük bir işe çok büyük bir makine göndermek, sahaya sığmama ve gereksiz maliyet gibi sorunlar çıkarabilir. Büyük bir işe küçük makineyle başlamak ise işi uzatabilir. İşin büyüklüğünü tahmini de olsa anlatmak doğru dengeyi bulmaya yardımcı olur.',
        ],
      },
      {
        id: 'sik-yapilan-hatalar',
        title: 'Sık yapılan hatalar',
        paragraphs: [
          'Makine seçiminde en sık karşılaşılan sorun, işin ayrıntısı anlatılmadan "kepçe lazım" demekle yetinilmesidir. Böyle bir durumda sahaya uygun olmayan bir makine gelebilir ve ikinci kez organizasyon gerekebilir.',
          'Bir diğer hata, kaya ya da beton çıkma ihtimalini söylememektir. Kırıcı uç gerekirse baştan bilinmesi hem planı hem de çalışma düzenini kolaylaştırır.',
        ],
      },
      {
        id: 'secim-sorulari',
        title: 'Seçerken kendinize sorun',
        paragraphs: ['Doğru makineyi seçmeden önce şu soruların cevabını bilmek işi kolaylaştırır:'],
        items: [
          'Ne kazılacak? Toprak mı, kaya mı, beton mu?',
          'Kazı ne kadar derin ve geniş olacak?',
          'Makinenin girişi için sahada yeterli alan var mı?',
          'Çıkan malzeme sahadan kamyonla mı taşınacak?',
          'Kırıcı gibi özel bir uç gerekecek mi?',
        ],
      },
      {
        id: 'operator-ve-kamyon',
        title: 'Operatör ve kamyon planı',
        paragraphs: [
          'Makine tek başına iş görmez. Operatörün deneyimi, kamyonların sahaya giriş çıkışı ve çıkan malzemenin gideceği yer birlikte düşünülmelidir. Operatörlü kiralamada makineyi kimin kullanacağı baştan netleştirilir.',
          'Emin olamıyorsanız işi ve sahayı kısaca anlatıp bizi arayın; hangi makinenin uygun olabileceğini birlikte değerlendirelim.',
        ],
      },
    ],
  },
  {
    slug: 'bina-yikimi-oncesi-hazirlik-kontrol-listesi',
    title: 'Bina yıkımı öncesi hazırlık kontrol listesi',
    seoTitle: 'Bina Yıkımı Öncesi Hazırlık Kontrol Listesi',
    description:
      'Bina yıkımına başlamadan önce izinler, abonelikler, çevre güvenliği ve atık yönetimi için genel bir kontrol listesi.',
    cover: '/images/galeri/kirici-ile-kaya-kirma.jpg',
    coverAlt: 'Kırıcı takılı ekskavatörlerle kırma çalışması',
    relatedServices: ['bina-yikim-ve-kirim', 'hafriyat-kamyonu-ve-moloz-tasima', 'kaya-kirma-ve-kirici-isleri'],
    legal: true,
    onaylandi: false,
    sections: [
      {
        id: 'baslarken',
        title: 'Yıkımdan önce neden liste?',
        paragraphs: [
          'Yıkım işi; izinler, abonelikler, komşu yapılar ve atık yönetimi gibi birden çok konuyu aynı anda içerir. Bunlardan biri eksik kalırsa iş durabilir ya da güvenlik riski doğabilir. Aşağıdaki liste genel bir başlangıçtır; sizin binanıza özel gereklilikleri ilgili kurumlar belirler.',
        ],
      },
      {
        id: 'izinler',
        title: 'İzinler ve mülkiyet',
        paragraphs: [
          'Yıkım için gerekli izin ve belgeler binanın bulunduğu yere ve türüne göre değişebilir. Yıkımın hangi koşullarda ve hangi belgelerle yapılacağını işe başlamadan önce ilgili belediyeden öğrenmek gerekir. Kat mülkiyetli veya ortak mülkiyetli yapılarda diğer maliklerin onayı da gündeme gelebilir.',
        ],
      },
      {
        id: 'abonelikler',
        title: 'Abonelikler ve hatlar',
        paragraphs: [
          'Elektrik, su, doğal gaz ve diğer abonelikler yıkımdan önce ilgili kurumlarla kapatılmalı ya da kesilmelidir. Bina bağlantılarının güvenli biçimde ayrılması hem çalışanların hem çevrenin güvenliği içindir.',
        ],
      },
      {
        id: 'tehlikeli-malzeme',
        title: 'Özel işlem gerektiren malzemeler',
        paragraphs: [
          'Eski yapılarda bazı malzemeler özel işlem gerektirebilir. Bu konuda şüpheniz varsa yıkıma başlamadan uzman bir kuruluştan görüş almanız güvenli olur. Bu yazı bu konuda teknik bir değerlendirme yerine geçmez.',
        ],
      },
      {
        id: 'yikim-yontemi',
        title: 'Yıkım yöntemi ve makine',
        paragraphs: [
          'Yıkımın nasıl yapılacağı binanın yapısına, yüksekliğine ve çevresine bağlıdır. Çoğu yıkım işinde ekskavatör ve kırıcı uç gibi makineler kullanılır. Yakın komşu yapı varsa yöntem daha dikkatli seçilmelidir.',
          'Yıkım yöntemini ve kullanılacak makineyi, sahayı gören ekiple birlikte konuşmak gerekir. Telefonla işi kısaca anlatmak ilk adım için yeterlidir.',
        ],
      },
      {
        id: 'saha-hazirligi',
        title: 'Sahanın hazırlanması',
        paragraphs: [
          'Yıkımdan önce bina içindeki eşyaların boşaltılması, yeniden kullanılacak kapı, pencere ve benzeri malzemelerin sökülmesi işi kolaylaştırır. Binanın çevresinde makinenin ve kamyonların hareket edebileceği alan bulunmalıdır.',
          'Sahaya kamyon girişinin uygun olmadığı durumlarda molozun nasıl çıkarılacağı ayrıca planlanır.',
        ],
      },
      {
        id: 'cevre-ve-guvenlik',
        title: 'Çevre ve komşu yapılar',
        paragraphs: [
          'Bitişik veya yakın yapılar, yol ve kaldırım yıkım sırasında etkilenebilir. Yıkımın yöntemi ve sahanın çevresinin korunması bu açıdan önemlidir. Toz ve gürültüyü azaltmak için alınacak önlemleri önceden konuşmak faydalıdır.',
          'Sahaya yetkisiz kişilerin girmemesi için çevrenin uygun biçimde işaretlenmesi gerekir.',
        ],
      },
      {
        id: 'atik',
        title: 'Moloz ve atık',
        paragraphs: [
          'Yıkımdan çok miktarda moloz çıkar. Molozun nereye götürüleceği, nasıl taşınacağı ve sahada nerede biriktirileceği baştan planlanmalıdır. Ayrıntı için "Hafriyat toprağı ve moloz nereye götürülür?" yazımıza bakabilirsiniz.',
        ],
      },
      {
        id: 'bilgi-verirken',
        title: 'Teklif için hangi bilgiler verilir?',
        paragraphs: [
          'Yıkım teklifi için binanın bulunduğu yer, kaç katlı olduğu, yapısının türü (betonarme, yığma ya da başka) ve çevredeki yapılarla ilişkisi yararlı bilgilerdir. Fotoğraf göstermek de ekibin işi anlamasını kolaylaştırır.',
          'Kesin yöntem ve teklif, sahanın görülmesinden sonra netleşir.',
        ],
      },
      {
        id: 'yikim-sonrasi',
        title: 'Yıkımdan sonra',
        paragraphs: [
          'Yıkım ve moloz taşıma bittikten sonra arsanın durumu kontrol edilmelidir. Bina temelinin ve bodrumun kaldırılıp kaldırılmayacağı, kalan çukurların doldurulup doldurulmayacağı ve arsanın düzeltilmesi sonraki işe göre belirlenir.',
          'Aynı arsada yeni bir yapı yapılacaksa yıkım ve kazı işini planlı biçimde birlikte düşünmek zaman ve emek kazandırabilir.',
        ],
      },
      {
        id: 'kontrol-listesi',
        title: 'Kontrol listesi',
        paragraphs: ['Yıkım teklifi istemeden önce şu maddeleri gözden geçirin:'],
        items: [
          'Yıkım izni ve gerekli belgeler için belediyeden bilgi aldım',
          'Elektrik, su ve doğal gaz abonelikleri kapatıldı veya kesilecek',
          'Mülkiyet durumu ve maliklerin onayı netleşti',
          'Özel işlem gerektirebilecek malzeme konusunda bilgi aldım',
          'Komşu yapılar ve çevre için önlemler konuşuldu',
          'Molozun gideceği yer ve taşıma planı belirlendi',
          'Sahaya makine ve kamyon girişi uygun',
        ],
      },
    ],
  },
];

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build’i) iken taslaklar da. */
export const visibleGuides: Guide[] = guides.filter((guide) => guide.onaylandi || showDrafts);

/** Bir yazının kelime sayısı (başlık, paragraf ve maddeler) */
export function guideWordCount(guide: Guide): number {
  const text = guide.sections
    .flatMap((section) => [section.title, ...section.paragraphs, ...(section.items ?? [])])
    .join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

/** Okuma süresi (dakika): dakikada ~200 kelime, en az 1 */
export function guideReadingMinutes(guide: Guide): number {
  return Math.max(1, Math.round(guideWordCount(guide) / 200));
}

/** Bir hizmetle ilişkili görünür rehberler (hizmet detay sayfasındaki bağlantı için) */
export function guidesForService(serviceSlug: string): Guide[] {
  return visibleGuides.filter((guide) => guide.relatedServices.includes(serviceSlug));
}
