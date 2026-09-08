import type { RestaurantWebsiteStatus } from "@prisma/client";
import { normalizeLeadKey } from "../../src/lib/admin/restaurant-leads";

export type QaOverride = {
  status: RestaurantWebsiteStatus;
  websiteScore?: number | null;
  clearWebsite?: boolean;
  problem1: string;
  problem2?: string;
  problem3?: string;
  analysis: string;
  pitch: string;
  opportunities: string;
};

function keyOf(name: string, district: string) {
  return `${normalizeLeadKey(name)}|${normalizeLeadKey(district)}`;
}

function site(name: string) {
  return `${name} için modern restoran sitesi + dijital menü + WhatsApp + rezervasyon.`;
}

function redesign(name: string) {
  return `${name}: tam redesign + mobil optimizasyon + menü/WhatsApp/rezervasyon akışı.`;
}

function conversion(name: string) {
  return `${name}: redesign veya conversion odaklı iyileştirme (menü, CTA, WhatsApp, rezervasyon).`;
}

function low(name: string) {
  return `${name}: düşük satış önceliği; mevcut site temel dönüşümü karşılıyor.`;
}

export const EXTRA_OVERRIDES = new Map<string, QaOverride>([
  [
    keyOf("Pendik Sahil Kebap", "Pendik"),
    {
      status: "NO_WEBSITE",
      problem1: "pendiksahilkebap.com Plesk “Web Server's Default Page” gösteriyor.",
      problem2: "Restoran içeriği yok; domain boş hosting.",
      analysis:
        "pendiksahilkebap.com 2026-09-04’te hâlâ Plesk varsayılan sayfası. Bağımsız restoran vitrini kurulmamış.",
      pitch: site("Pendik Sahil Kebap"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Loss Garden Cafe & Restaurant", "Maltepe"),
    {
      status: "NO_WEBSITE",
      problem1: "lossgarden.com WordPress “Hello world / Ultimate Blogging Championship” örneği.",
      problem2: "Restoran adı, menü ve iletişim vitrini yok.",
      analysis:
        "lossgarden.com canlıda örnek blog teması; Maltepe Loss Garden için kullanılabilir restoran sitesi yok.",
      pitch: site("Loss Garden Cafe & Restaurant"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Kebapçı Bedri Usta", "Beyoğlu"),
    {
      status: "NO_WEBSITE",
      problem1: "kebapcibedriusta.com yalnızca “Site is undergoing maintenance”.",
      problem2: "Menü, rezervasyon ve işletme vitrini yok.",
      analysis:
        "kebapcibedriusta.com 2026-09-04’te WordPress bakım modu. Kullanılabilir restoran sitesi yok.",
      pitch: site("Kebapçı Bedri Usta"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Meygüsar Ocakbaşı", "Bakırköy"),
    {
      status: "NO_WEBSITE",
      problem1: "meygusar.com WordPress.com “Bu site şu anda özeldir” sayfasına yönleniyor.",
      problem2: "Herkese açık restoran vitrini yok.",
      analysis:
        "meygusar.com 2026-09-04’te meygusar.wordpress.com özel site duvarına düşüyor. Bağımsız restoran sitesi yok.",
      pitch: site("Meygüsar Ocakbaşı"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("ASF Gurme", "Kartal"),
    {
      status: "NO_WEBSITE",
      problem1: "asfgurme.com yapım aşaması landing; menü ve sipariş yok.",
      problem2: "Kullanılabilir restoran vitrini yok.",
      analysis:
        "asfgurme.com 2026-09-04’te hâlâ yapım aşaması sayfası. Kartal adresi görünüyor ama bağımsız restoran sitesi yok.",
      pitch: site("ASF Gurme"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Nazar Profiterol", "Maltepe"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.0,
      problem1: "nazarprofiterol.com Cloudflare 520 ile açılmıyor.",
      problem2: "GOOD notu gerçeği yansıtmıyor; müşteri siteye giremiyor.",
      analysis:
        "nazarprofiterol.com 2026-09-04’te 520 Web server is returning an unknown error. Origin düşmüş; mevcut GOOD/LOW kayıt hatalı.",
      pitch: redesign("Nazar Profiterol"),
      opportunities: "WEBSITE_REDESIGN, HOSTING_FIX, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Tarihi Meşhur Eyüp Sultan Güveççisi", "Eyüpsultan"),
    {
      status: "VERY_WEAK",
      websiteScore: 1.6,
      problem1: "tarihiguvecci.com tarayıcıda bozuk/binary çıktı; Türkçe metin okunmuyor.",
      problem2: "Encoding kırık, menü ve iletişim yok.",
      analysis:
        "tarihiguvecci.com 2026-09-04’te ~20 karakter bozuk bayt döndürüyor. Restoran sitesi kullanılamaz.",
      pitch: redesign("Tarihi Meşhur Eyüp Sultan Güveççisi"),
      opportunities: "WEBSITE_REDESIGN, ENCODING_FIX, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("The Muhtar", "Ataşehir"),
    {
      status: "IMPROVABLE",
      websiteScore: 4.4,
      problem1: "Menü sayfası yemek listesi değil; program, giyim kuralı ve rezervasyon şartları.",
      problem2: "İnce ana sayfa; gece kulübü/eğlence vitrini restoran dönüşümünden zayıf.",
      analysis:
        "themuhtar.com.tr açılıyor, Ataşehir adresi ve rezervasyon e-postası var. Ana sayfa ince; yemek menüsü değil etkinlik kuralları önde. Kullanılabilir, agresif redesign şart değil.",
      pitch: "The Muhtar: menü ve rezervasyon CTA netliği; tam restoran redesign ikinci planda.",
      opportunities: "CONVERSION_IMPROVE, DIGITAL_MENU, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("HATAY GURME", "Ataşehir"),
    {
      status: "GOOD",
      websiteScore: 8.0,
      problem1: "Çalışma saatleri ana sayfada zayıf; şube deneyimi ikinci planda kalabiliyor.",
      analysis:
        "hataygurme.com.tr menü, galeri, rezervasyon telefonu (0216 572 00 31) ve online alışveriş içeriyor. 1985 marka anlatımı duruyor. Redesign satışı için uygun lead değil.",
      pitch: low("Hatay Gurme"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Sapa İstanbul", "Ataşehir"),
    {
      status: "GOOD",
      websiteScore: 8.0,
      problem1: "Kurumsal etkinlik vitrini güçlü; mahalle restoran CTA’sı ikincil.",
      analysis:
        "sapaistanbul.com menü, rezervasyon, ekip, kurumsal etkinlik ve TR/EN dil seçimi var. Modern restoran sitesi; satış önceliği düşük.",
      pitch: low("Sapa İstanbul"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("THE HUNGER", "Ataşehir"),
    {
      status: "GOOD",
      websiteScore: 7.0,
      problem1: "Zincir/franchise vitrini; Ataşehir şubesine özel zayıf nokta yok.",
      analysis:
        "thehunger.com.tr menü, şubeler, franchise ve iletişim sayfaları olan zincir sitesi. Redesign satışı için uygun lead değil.",
      pitch: low("The Hunger"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Bist Bahçe", "Maltepe"),
    {
      status: "GOOD",
      websiteScore: 6.5,
      problem1: "WhatsApp rezervasyon ana akışta zayıf; Getir menü öne çıkıyor.",
      analysis:
        "bistbahce.com galeri, etkinlik, hakkımızda, çalışma bilgisi ve Getir menü linki olan Maltepe cafe sitesi. Kullanılabilir, modern; satış önceliği düşük.",
      pitch: low("Bist Bahçe"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Karacabey", "Maltepe"),
    {
      status: "GOOD",
      websiteScore: 6.3,
      problem1: "Rezervasyon formu yerine etkinlik/grup yemeği vurgusu var.",
      analysis:
        "karacabey.com.tr közde kanat, künefe, galeri, online sipariş ve iletişim içeren marka sitesi. Temel dönüşüm var; redesign lead’i değil.",
      pitch: low("Karacabey"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Sudi Restoran", "Ataşehir"),
    {
      status: "GOOD",
      websiteScore: 7.4,
      problem1: "Wix/JS ağırlıklı; ham HTML’de başlık boş, tarayıcıda içerik geliyor.",
      analysis:
        "sudirestoran.com Wix tabanlı, rezervasyon ve menü izi var. Önceki saha notuyla uyumlu kullanılabilir restoran vitrini; satış önceliği düşük.",
      pitch: low("Sudi Restoran"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Adana Ocakbaşı Nişantaşı", "Şişli"),
    {
      status: "GOOD",
      websiteScore: 7.0,
      problem1: "Harita ve çalışma saati ana sayfada zayıf.",
      analysis:
        "adanaocakbasi.com.tr 1978 marka sitesi: WhatsApp, menü ve rezervasyon çağrısı var. Nişantaşı için redesign satışı uygun değil.",
      pitch: low("Adana Ocakbaşı Nişantaşı"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Alaçatı Et & Balık", "Büyükçekmece"),
    {
      status: "GOOD",
      websiteScore: 7.2,
      problem1: "Çalışma saatleri ana sayfada geri planda.",
      analysis:
        "alacatietbalik.com göl manzarası, menü, rezervasyon, WhatsApp ve Instagram içeren modern restoran sitesi. Satış önceliği düşük.",
      pitch: low("Alaçatı Et & Balık"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Balık Osman", "Büyükçekmece"),
    {
      status: "GOOD",
      websiteScore: 7.0,
      problem1: "WhatsApp butonu zayıf; rezervasyon var.",
      analysis:
        "balikosman.com.tr Büyükçekmece balık restoranı sitesi, menü ve rezervasyon akışı çalışıyor. Redesign lead’i değil.",
      pitch: low("Balık Osman"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Mayna Balık Restoran", "Sarıyer"),
    {
      status: "GOOD",
      websiteScore: 7.5,
      problem1: "Harita ana sayfada zayıf.",
      analysis:
        "maynabalik.com menü, rezervasyon, WhatsApp, saatler ve marka anlatımı olan Sarıyer balık/meyhane sitesi. Satış önceliği düşük.",
      pitch: low("Mayna Balık Restoran"),
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Adile Sultan Ev Yemekleri", "Ümraniye"),
    {
      status: "IMPROVABLE",
      websiteScore: 4.7,
      problem1: "Ana sayfa hikâye/blog/franchise ile açılıyor; şube ve sipariş geri planda.",
      problem2: "Telefon ve WhatsApp CTA ana sayfada zayıf.",
      analysis:
        "adilesultanevyemekleri.com içerik olarak dolu WordPress site. Menü ve rezervasyon izi var ama ilk ekran hikâye/franchising; restoran dönüşümü ortalama.",
      pitch: "Adile Sultan: şube/sipariş CTA ve WhatsApp netliği; tam redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, WHATSAPP_CTA, BRANCH_FINDER",
    },
  ],
  [
    keyOf("Barbun Balık Restaurant", "Maltepe"),
    {
      status: "WEAK",
      websiteScore: 3.2,
      problem1: "Telefon/WhatsApp ve harita ana sayfada yok.",
      problem2: "Rakı-balık metni var ama dönüşüm butonları zayıf.",
      analysis:
        "barbunrestaurant.net açılıyor, menü/rezervasyon kelimeleri var. Maltepe balıkçı için iletişim CTA ve mobil akış yetersiz.",
      pitch: conversion("Barbun Balık Restaurant"),
      opportunities: "WEBSITE_REDESIGN, WHATSAPP_CTA, MAPS_CTA",
    },
  ],
  [
    keyOf("Bayındır Et & Kebap", "Pendik"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.0,
      problem1: "Sayfada Lorem ipsum şablon metni duruyor.",
      problem2: "Güven vermeyen yarım WordPress vitrin.",
      analysis:
        "bayindirrestoran.com 2026-09-04’te lorem ipsum içeriyor. Pendik et/kebap için kullanılabilir restoran sitesi değil.",
      pitch: redesign("Bayındır Et & Kebap"),
      opportunities: "WEBSITE_REDESIGN, COPY_CLEANUP, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Döner Ustası Çetin Yalçın", "Kartal"),
    {
      status: "IMPROVABLE",
      websiteScore: 4.8,
      problem1: "Rezervasyon zayıf; döner/kahvaltı vitrini daha çok katalog.",
      analysis:
        "ducy.com.tr menü, saat, harita ve telefon içeren Kartal sitesi. Kullanılabilir ama dönüşüm/rezervasyon ortalama.",
      pitch: "Döner Ustası Çetin Yalçın: rezervasyon ve WhatsApp CTA sadeleştirme.",
      opportunities: "CONVERSION_IMPROVE, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Ekol Künefe", "Kadıköy"),
    {
      status: "WEAK",
      websiteScore: 2.9,
      problem1: "Eski jQuery 1.x şablon; rezervasyon yok.",
      problem2: "Telefon/WhatsApp CTA ana sayfada yok.",
      analysis:
        "ekolkunefe.com eski PHP/jQuery vitrin. Saat ve Instagram var, rezervasyon ve tıklanır telefon yok. Kadıköy künefe için zayıf satış sitesi.",
      pitch: conversion("Ekol Künefe"),
      opportunities: "WEBSITE_REDESIGN, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Madalyalı Restoran", "Ataşehir"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.8,
      problem1: "Çalışma saatleri ana sayfada zayıf.",
      analysis:
        "madalyali.com.tr Ataşehir adresi, telefon, WhatsApp, menü ve rezervasyon içeren WordPress site. Temel ihtiyaç var, saat/CTA netleştirilebilir.",
      pitch: "Madalyalı: saat ve rezervasyon CTA netliği; agresif redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK",
    },
  ],
  [
    keyOf("Nayman Restoran", "Kadıköy"),
    {
      status: "WEAK",
      websiteScore: 2.4,
      problem1: "Rezervasyon, harita ve Instagram yok.",
      problem2: "İnce vitrin; yalnızca WhatsApp/menü izi.",
      analysis:
        "naymanrestoran.com açılıyor ama iletişim/harita/rezervasyon zayıf. Kadıköy restoranı için dönüşüm yetersiz.",
      pitch: conversion("Nayman Restoran"),
      opportunities: "WEBSITE_REDESIGN, RESERVATION_FLOW, MAPS_CTA",
    },
  ],
  [
    keyOf("Sembol Künefe", "Ataşehir"),
    {
      status: "WEAK",
      websiteScore: 3.6,
      problem1: "Ana sayfa ürün katalog dili; mekân/rezervasyon deneyimi zayıf.",
      analysis:
        "sembolkunefe.com Ataşehir Dudullu Cd. ve 0850 hattı gösteriyor. Tatlı katalogu var, WhatsApp/rezervasyon ve marka vitrini zayıf.",
      pitch: conversion("Sembol Künefe"),
      opportunities: "WEBSITE_REDESIGN, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Zekibey İskender", "Üsküdar"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.2,
      problem1: "Rezervasyon ve harita ana sayfada zayıf.",
      analysis:
        "zekibeyiskender.com menü, telefon ve Instagram içeren WordPress site. Kullanılabilir; rezervasyon/WhatsApp akışı ortalama.",
      pitch: "Zekibey İskender: rezervasyon CTA ve harita; tam redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, RESERVATION_FLOW, MAPS_CTA",
    },
  ],
  [
    keyOf("SOİ Cadde", "Kadıköy"),
    {
      status: "WEAK",
      websiteScore: 3.2,
      problem1: "İngilizce şablon copy (“gastronomic adventure”) Türkçe markayla uyumsuz.",
      problem2: "Saat/format tutarsız; dönüşüm güveni zayıf.",
      analysis:
        "soicadde.com menü/rezervasyon linki var ama ana metin jenerik İngilizce restoran şablonu. Kadıköy SOİ için zayıf, yeniden tasarım faydalı.",
      pitch: conversion("SOİ Cadde"),
      opportunities: "WEBSITE_REDESIGN, COPY_CLEANUP, CONVERSION_IMPROVE",
    },
  ],
  [
    keyOf("Orçul Restaurant", "Kartal"),
    {
      status: "WEAK",
      websiteScore: 3.0,
      problem1: "Site aralıklı zaman aşımına düşüyor; dışarıdan marka vitrini zayıf.",
      problem2: "Daha çok iç QR menü; yeni müşteri akışı yetersiz.",
      analysis:
        "orculrestaurant.com 2026-09-04’te bir istekte 200, diğerinde timeout. Mevcut not QR menü vitrini; Kartal restoranı için zayıf dış satış sitesi.",
      pitch: conversion("Orçul Restaurant"),
      opportunities: "WEBSITE_REDESIGN, HOSTING_FIX, BRAND_VITRINE",
    },
  ],
  [
    keyOf("01 Baran Ocakbaşı", "Bahçelievler"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.6,
      problem1: "Başlık “Turkish cuisine near me” SEO spam; telefon/WhatsApp yok.",
      problem2: "Güven vermeyen jenerik restoran şablonu.",
      analysis:
        "01baranocakbasi.pro İngilizce SEO başlıklı şablon. Bahçelievler ocakbaşı için menü kelimesi var, iletişim CTA yok. Çok zayıf.",
      pitch: redesign("01 Baran Ocakbaşı"),
      opportunities: "WEBSITE_REDESIGN, LOCAL_SEO, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Avni Baba Meyhanesi", "Avcılar"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.3,
      problem1: "Çalışma saatleri ana sayfada zayıf.",
      analysis:
        "avnibabaninyeri.com Avcılar meyhane sitesi: telefon, WhatsApp, menü, rezervasyon ve harita var. Kullanılabilir, saat/CTA netleştirilebilir.",
      pitch: "Avni Baba: saat bloğu ve rezervasyon CTA; agresif redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK",
    },
  ],
  [
    keyOf("Fıccın Restoran", "Beyoğlu"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.8,
      problem1: "Ana sayfa ince; telefon/WhatsApp ve harita ilk ekranda yok.",
      problem2: "Günlük menü vurgusu var, rezervasyon CTA zayıf.",
      analysis:
        "ficcin.com Çerkes mutfağı markası ve Cihangir telefonu (0212 245 1213) içeriyor. Site çalışıyor ama ince; dönüşüm ortalama.",
      pitch: "Fıccın: rezervasyon/WhatsApp ve harita netliği.",
      opportunities: "CONVERSION_IMPROVE, WHATSAPP_CTA, MAPS_CTA",
    },
  ],
  [
    keyOf("KEBBABİ KEBAP", "Zeytinburnu"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.3,
      problem1: "Rezervasyon ve harita yok; ince kebap vitrini.",
      analysis:
        "kebbabi.com.tr telefon, WhatsApp, menü ve Instagram var. Zeytinburnu kebapçı için temel site duruyor, rezervasyon/konum zayıf.",
      pitch: "Kebbabi: rezervasyon ve harita; tam zincir redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, RESERVATION_FLOW, MAPS_CTA",
    },
  ],
  [
    keyOf("Kenan Usta Ocakbaşı", "Beyoğlu"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.7,
      problem1: "WhatsApp ve harita ana sayfada yok.",
      analysis:
        "kenanusta.com.tr menü, rezervasyon, saat ve Instagram içeren ocakbaşı sitesi. Kullanılabilir; WhatsApp/konum eklenirse yeter, agresif satış ikinci planda.",
      pitch: "Kenan Usta: WhatsApp ve harita CTA.",
      opportunities: "CONVERSION_IMPROVE, WHATSAPP_CTA, MAPS_CTA",
    },
  ],
  [
    keyOf("Muhabbet Ocakbaşı", "Beylikdüzü"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.0,
      problem1: "Çalışma saatleri ana sayfada yok.",
      analysis:
        "muhabbetocakbasi.com.tr Beylikdüzü kebap/steak vitrini: telefon, WhatsApp, menü, rezervasyon ve harita var. Saat bloğu eksik; HIGH değil MEDIUM fırsat.",
      pitch: "Muhabbet: saat ve rezervasyon netliği; tam redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK",
    },
  ],
  [
    keyOf("PEPO Restaurant and Bar", "Beyoğlu"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.0,
      problem1: "peporestaurant.com neredeyse boş; yalnızca 2021 copyright.",
      problem2: "Menü, iletişim ve rezervasyon yok.",
      analysis:
        "peporestaurant.com 2026-09-04’te “Ana Sayfa / PEPO RESTAURANT © 2021” dışında içerik yok. Kullanılamaz vitrin.",
      pitch: redesign("PEPO Restaurant and Bar"),
      opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Resto Lordom Bomonti", "Şişli"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.0,
      problem1: "Wix şablon; saat ve tıklanır telefon zayıf.",
      analysis:
        "restolordom.com Şişli Silahşör Cd. adresli Wix restoran sayfası. WhatsApp, menü, rezervasyon ve Instagram var. Kullanılabilir, dönüşüm ortalama.",
      pitch: "Resto Lordom: saat ve telefon CTA; agresif redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK",
    },
  ],
  [
    keyOf("Seher Restaurant", "Fatih"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.7,
      problem1: "Otomatik istek 403 Forbidden; bot koruması olabilir.",
      problem2: "İçerik bu turda tarayıcıdan doğrulanamadı; NO_WEBSITE denmedi.",
      analysis:
        "seherrestaurant.com SSL’li domain 2026-09-04’te 403 döndü. Kapalı site kanıtı yok; mevcut IMPROVABLE notu korundu, satış maili için yeniden tarayıcı kontrolü gerekir.",
      pitch: "Seher: tarayıcıda doğrulanırsa conversion iyileştirme; 403 yüzünden website yok deme.",
      opportunities: "CONVERSION_IMPROVE, RECHECK_BROWSER",
    },
  ],
  [
    keyOf("Sini Et Balık", "Küçükçekmece"),
    {
      status: "WEAK",
      websiteScore: 3.4,
      problem1: "Viewport yok; mobil uyum şüpheli.",
      problem2: "Telefon/WhatsApp/harita yok.",
      analysis:
        "sinietbalik.com kısa “kalite & lezzet” metni ve menü/galeri linki. Mobil viewport ve iletişim CTA yok. Küçükçekmece et-balık için zayıf.",
      pitch: conversion("Sini Et Balık"),
      opportunities: "WEBSITE_REDESIGN, MOBILE_FIX, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Tarihi Cumhuriyet Meyhanesi", "Beyoğlu"),
    {
      status: "WEAK",
      websiteScore: 3.7,
      problem1: "WhatsApp, saat ve harita ana sayfada yok.",
      analysis:
        "tarihicumhuriyetmeyhanesi.com.tr telefon, menü ve rezervasyon kelimesi var. Beyoğlu tarihi meyhane için mobil CTA ve konum zayıf.",
      pitch: conversion("Tarihi Cumhuriyet Meyhanesi"),
      opportunities: "WEBSITE_REDESIGN, WHATSAPP_CTA, MAPS_CTA",
    },
  ],
  [
    keyOf("Tarsus Ocakbaşı", "Şişli"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.2,
      problem1: "Saat ve harita ana sayfada zayıf.",
      analysis:
        "tarsusocakbasi.com Taksim ocakbaşı WordPress sitesi: telefon, WhatsApp, menü, rezervasyon ve Instagram var. Kullanılabilir, konum/saat netleştirilebilir.",
      pitch: "Tarsus Ocakbaşı: saat ve harita; tam redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK, MAPS_CTA",
    },
  ],
  [
    keyOf("Yeşilköy Balıkçısı", "Bakırköy"),
    {
      status: "WEAK",
      websiteScore: 3.7,
      problem1: "Rezervasyon, saat, harita ve tıklanır telefon yok.",
      analysis:
        "yesilkoybalikcisi.com.tr “Selim'in Yeri” başlıklı ince sayfa. WhatsApp/menü izi var, restoran dönüşüm akışı yok.",
      pitch: conversion("Yeşilköy Balıkçısı"),
      opportunities: "WEBSITE_REDESIGN, RESERVATION_FLOW, MAPS_CTA",
    },
  ],
  [
    keyOf("Öz Suruç Memoli Kebap", "Bahçelievler"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.4,
      problem1: "Dev Wix çıktısı; rezervasyon, telefon ve harita yok.",
      problem2: "Marka sayfası şişmiş, dönüşüm yok.",
      analysis:
        "ozsurucmemolikebap.com Wix’te yüz bin karakterlik dağınık sayfa. Menü kelimesi var, iletişim/rezervasyon yok. Bahçelievler kebapçı için çok zayıf.",
      pitch: redesign("Öz Suruç Memoli Kebap"),
      opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("İllaki Yeni Nesil Meyhane", "Beylikdüzü"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.2,
      problem1: "Saat ve harita ana sayfada zayıf.",
      analysis:
        "illakimeyhane.com Beylikdüzü yeni nesil meyhane: telefon, WhatsApp, menü, rezervasyon ve Instagram var. Kullanılabilir, konum/saat eksiği var.",
      pitch: "İllaki: saat ve harita CTA; agresif redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK, MAPS_CTA",
    },
  ],
  [
    keyOf("İskele Restaurant", "Büyükçekmece"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.2,
      problem1: "Çalışma saatleri ana sayfada yok.",
      analysis:
        "iskelerestaurant.com.tr Mimarsinan 1909 anlatımı, telefon, WhatsApp, menü, rezervasyon ve harita var. Kullanılabilir tarihi restoran sitesi; saat bloğu eksik.",
      pitch: "İskele Restaurant: saat ve rezervasyon netliği.",
      opportunities: "CONVERSION_IMPROVE, HOURS_BLOCK",
    },
  ],
]);

export { keyOf };
