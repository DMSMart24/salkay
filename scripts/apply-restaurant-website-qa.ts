import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Prisma, RestaurantLead, RestaurantLeadPriority, RestaurantWebsiteStatus } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import { applyRestaurantLeadStatusRules, blankToNull, normalizeLeadKey } from "../src/lib/admin/restaurant-leads";
import { EXTRA_OVERRIDES } from "./data/restaurant-website-qa-overrides";

type Probe = {
  id: string;
  restaurantName: string;
  district: string;
  region: "ANADOLU" | "AVRUPA";
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  googleMapsUrl: string | null;
  outreachNotes: string | null;
  current: {
    website: string | null;
    websiteDomain: string | null;
    websiteStatus: RestaurantWebsiteStatus;
    websiteScore: number | null;
    leadScore: number | null;
    priority: RestaurantLeadPriority;
    problem1: string | null;
    problem2: string | null;
    problem3: string | null;
    websiteAnalysis: string | null;
    opportunities: string | null;
    salkayPitch: string | null;
  };
  probe: {
    kind: string;
    status: number | null;
    finalUrl: string | null;
    host: string | null;
    title: string | null;
    error: string | null;
    signals: string[];
    excerpt: string;
  };
};

type Override = {
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

function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), name);
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index < 1) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function keyOf(name: string, district: string) {
  return `${normalizeLeadKey(name)}|${normalizeLeadKey(district)}`;
}

function hasPhone(row: Probe) {
  return Boolean(blankToNull(row.phone) || blankToNull(row.whatsapp));
}

function socialLine(row: Probe) {
  const bits = [row.instagram ? "Instagram" : null, row.googleMapsUrl ? "Google işletme profili" : null].filter(Boolean);
  return bits.length ? `Müşteri ${bits.join(" ve ")} üzerinden görünüyor.` : "Kayıtta bağımsız site URL’si yok.";
}

function noWebsitePitch(name: string) {
  return `${name} için modern restoran sitesi + dijital menü + WhatsApp + rezervasyon.`;
}

function salesPriority(status: RestaurantWebsiteStatus, phone: boolean): RestaurantLeadPriority {
  if (status === "GOOD" || status === "VERY_GOOD") return "QUALIFIED_OUT";
  if (status === "IMPROVABLE") return "MEDIUM";
  if (status === "NOT_VERIFIED") return "PENDING";
  return phone ? "HIGH" : "MEDIUM";
}

function leadScoreFor(status: RestaurantWebsiteStatus, phone: boolean) {
  switch (status) {
    case "NO_WEBSITE":
      return phone ? 8.8 : 7.3;
    case "VERY_WEAK":
      return phone ? 9.1 : 7.6;
    case "WEAK":
      return phone ? 8.4 : 7.0;
    case "IMPROVABLE":
      return phone ? 7.2 : 6.3;
    case "GOOD":
      return 5.2;
    case "VERY_GOOD":
      return 4.6;
    case "NOT_VERIFIED":
      return null;
    default: {
      const _never: never = status;
      throw new Error(`Unhandled status ${_never}`);
    }
  }
}

function websiteScoreFor(status: RestaurantWebsiteStatus, explicit?: number | null) {
  if (explicit !== undefined) return explicit;
  switch (status) {
    case "NO_WEBSITE":
    case "NOT_VERIFIED":
      return null;
    case "VERY_WEAK":
      return 2.2;
    case "WEAK":
      return 4.0;
    case "IMPROVABLE":
      return 5.8;
    case "GOOD":
      return 7.4;
    case "VERY_GOOD":
      return 8.7;
    default: {
      const _never: never = status;
      throw new Error(`Unhandled status ${_never}`);
    }
  }
}

const OVERRIDES = new Map<string, Override>([
  [
    keyOf("Valuna", "Istanbul"),
    {
      status: "NO_WEBSITE",
      clearWebsite: true,
      problem1: "Kayıtlı URL (valunapergola.ch) İsviçre pergola/cam sistem firması; restoran sitesi değil.",
      problem2: "Bağımsız restoran websitesi yok.",
      analysis:
        "valunapergola.ch canlı kontrolde bioklimatik pergola ve cam sistem satışı. Valuna restoran kaydıyla ilgisi yok; bağımsız restoran vitrini bulunamadı.",
      pitch: noWebsitePitch("Valuna"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Hayri Usta Ocakbaşı Beyoğlu", "Beyoğlu"),
    {
      status: "NO_WEBSITE",
      problem1: "hayriusta.com yalnızca “Hayri Usta Ocakbaşı is coming soon” gösteriyor.",
      problem2: "Menü, rezervasyon ve işletme vitrini yok.",
      analysis:
        "hayriusta.com 2026-09-04 kontrolünde WordPress coming soon sayfası. Kullanılabilir restoran sitesi yok.",
      pitch: noWebsitePitch("Hayri Usta Ocakbaşı Beyoğlu"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Morn Kadıköy", "Kadıköy"),
    {
      status: "NO_WEBSITE",
      problem1: "mornkadikoy.com Plesk “Web Server's Default Page” gösteriyor.",
      problem2: "Restoran içeriği yok.",
      analysis:
        "mornkadikoy.com hosting varsayılan sayfası; bağımsız restoran vitrini kurulmamış.",
      pitch: noWebsitePitch("Morn Kadıköy"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Urfam Sur Ocakbaşı", "Şişli"),
    {
      status: "NO_WEBSITE",
      problem1: "urfamsur.com.tr “YENİLENİYORUZ / çok yakında” bakım sayfası.",
      problem2: "Kullanılabilir menü ve rezervasyon akışı yok.",
      analysis:
        "urfamsur.com.tr canlı kontrolde yenileniyoruz mesajı; çalışan restoran sitesi yok.",
      pitch: noWebsitePitch("Urfam Sur Ocakbaşı"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Feride Meyhanesi", "Ataşehir"),
    {
      status: "NO_WEBSITE",
      problem1: "feridemeyhanesi.com DNS çözülmüyor.",
      problem2: "Çalışan bağımsız website yok.",
      analysis: "feridemeyhanesi.com host çözülemedi; bağımsız restoran sitesi yok.",
      pitch: noWebsitePitch("Feride Meyhanesi"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Meyhane Istanbul", "Beyoğlu"),
    {
      status: "NO_WEBSITE",
      problem1: "meyhaneistanbul.com DNS çözülmüyor.",
      problem2: "Çalışan bağımsız website yok.",
      analysis: "meyhaneistanbul.com host çözülemedi; bağımsız restoran sitesi yok.",
      pitch: noWebsitePitch("Meyhane Istanbul"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Ocakbaşı Zervan Restaurant", "Şişli"),
    {
      status: "NO_WEBSITE",
      problem1: "zervanocakbasi.com DNS çözülmüyor.",
      problem2: "Çalışan bağımsız website yok.",
      analysis: "zervanocakbasi.com host çözülemedi; bağımsız restoran sitesi yok.",
      pitch: noWebsitePitch("Ocakbaşı Zervan Restaurant"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Fülane Restaurant", "Fatih"),
    {
      status: "NO_WEBSITE",
      problem1: "fulanerestaurant.com / www 404 döndürüyor.",
      problem2: "Yayında restoran sayfası yok.",
      analysis: "fulanerestaurant.com 2026-09-04 kontrolünde 404; kullanılabilir site yok.",
      pitch: noWebsitePitch("Fülane Restaurant"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("ASTEK Restaurant & Meyhane", "Şişli"),
    {
      status: "NO_WEBSITE",
      problem1: "astekmeyhane.com bağlantı zaman aşımına uğruyor.",
      problem2: "Kullanılabilir restoran sitesi yok.",
      analysis: "astekmeyhane.com 12sn+ yanıt vermedi; çalışan vitrin yok.",
      pitch: noWebsitePitch("ASTEK Restaurant & Meyhane"),
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Güler Ocakbaşı Restaurant", "Şişli"),
    {
      status: "VERY_WEAK",
      websiteScore: 1.8,
      problem1: "gulerocakbasi.com HTTP 500 ile açılıyor.",
      problem2: "Ana sayfa kullanılamıyor; menü/rezervasyon yok.",
      analysis: "gulerocakbasi.com 2026-09-04’te 500 Internal Server Error. Site var ama kırık.",
      pitch: "Güler Ocakbaşı: tam redesign + stabil hosting + mobil menü/WhatsApp/rezervasyon.",
      opportunities: "WEBSITE_REDESIGN, HOSTING_FIX, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Cremia Cafe & Rest", "Üsküdar"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.0,
      problem1: "cremiacafe.com SSL sertifikasının süresi dolmuş; tarayıcı uyarıyor.",
      problem2: "Güvenli bağlantı kurulamıyor.",
      analysis: "cremiacafe.com sertifika süresi dolmuş (SEC_E_CERT_EXPIRED). Site fiilen kullanılamaz.",
      pitch: "Cremia: SSL/host düzeltmesi yetmez; mobil restoran vitrini + menü + WhatsApp gerekir.",
      opportunities: "WEBSITE_REDESIGN, SSL_FIX, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Albatros Restaurant", "Büyükçekmece"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.1,
      problem1: "albatrosrestaurant.net SSL adı uyuşmuyor; güvenli bağlantı kurulamıyor.",
      problem2: "Müşteri tarayıcıda sertifika uyarısı görür.",
      analysis: "albatrosrestaurant.net sertifika/SNI hatası. Restoran sitesi güvenilir açılmıyor.",
      pitch: "Albatros: SSL düzeltmesi + tam restoran redesign (menü, rezervasyon, WhatsApp).",
      opportunities: "WEBSITE_REDESIGN, SSL_FIX, DIGITAL_MENU, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Sur Ocakbaşı", "Fatih"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.1,
      problem1: "surocakbasi.com SSL adı uyuşmuyor.",
      problem2: "Güvenli site açılamıyor.",
      analysis: "surocakbasi.com sertifika/SNI hatası; mevcut IMPROVABLE notu gerçeği yansıtmıyor.",
      pitch: "Sur Ocakbaşı: çalışan, mobil restoran sitesi + menü + WhatsApp.",
      opportunities: "WEBSITE_REDESIGN, SSL_FIX, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Mojo Ataşehir", "Ataşehir"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.0,
      problem1: "mojolounge.com.tr SSL adı uyuşmuyor.",
      problem2: "NOT_VERIFIED bırakılamaz; site güvenli açılmıyor.",
      analysis: "mojolounge.com.tr sertifika/SNI hatası. Lounge/restoran vitrini doğrulanamadı.",
      pitch: "Mojo Ataşehir: SSL + mobil vitrin + rezervasyon/WhatsApp.",
      opportunities: "WEBSITE_REDESIGN, SSL_FIX, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("UMUS İstanbul", "Maltepe"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.3,
      problem1: "umusistanbul.com bağlantısı resetleniyor.",
      problem2: "Stabil restoran sitesi yok.",
      analysis: "umusistanbul.com 2026-09-04’te bağlantı reset; IMPROVABLE notu abartılı.",
      pitch: "UMUS: ayakta duran restoran sitesi + menü + rezervasyon.",
      opportunities: "WEBSITE_REDESIGN, HOSTING_FIX, DIGITAL_MENU, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Palukçu", "Fatih"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.4,
      problem1: "palukcubalik.com neredeyse yalnızca SEO anahtar kelime başlığı; restoran vitrini yok.",
      problem2: "Menü, iletişim CTA ve marka sayfası oluşmamış.",
      analysis:
        "palukcubalik.com başlıkta onlarca ilçe anahtar kelimesi var, gövde içerik yok. Salaş balıkçı için bile kullanılabilir site değil.",
      pitch: "Palukçu: tam restoran sitesi (menü, paket, WhatsApp, konum).",
      opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, WHATSAPP_CTA, LOCAL_SEO",
    },
  ],
  [
    keyOf("Köz Kanat Ataşehir", "Ataşehir"),
    {
      status: "WEAK",
      websiteScore: 3.6,
      problem1: "Menü kartlarında İngilizce şablon cümlesi duruyor: “Granny help you treat yourself…”.",
      problem2: "Haberler 2021–2022; yazım hataları (“eşilğinde”, “ağırlmaktan”).",
      problem3: "Rezervasyon/WhatsApp akışı zayıf; telefon listesi var.",
      analysis:
        "kozkanat.com Ataşehir şubesini listeliyor ama menü İngilizce demo metinle dolu, içerik eski. Çalışıyor fakat satış/dönüşüm için yetersiz.",
      pitch: "Köz Kanat: redesign veya conversion odaklı yenileme (Türkçe menü, CTA, mobil).",
      opportunities: "WEBSITE_REDESIGN, COPY_CLEANUP, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Beluga Fish Gourmet", "Ataşehir"),
    {
      status: "WEAK",
      websiteScore: 4.2,
      problem1: "Menü “tıklayınız” ile telefona bağlanıyor; sitede gerçek menü/rezervasyon yok.",
      problem2: "Metin genel (“yepyeni bir balık restoranı”); dönüşüm zayıf.",
      analysis:
        "belugabalik.com açılıyor, Ataşehir balık restoranı olduğu doğru. Menü sayfası yerine telefon numarası, rezervasyon formu yok. Zayıf satış sitesi.",
      pitch: "Beluga: menü + rezervasyon/WhatsApp + mobil vitrin.",
      opportunities: "CONVERSION_IMPROVE, DIGITAL_MENU, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Develi Ataşehir", "Ataşehir"),
    {
      status: "GOOD",
      websiteScore: 7.8,
      problem1: "Ataşehir şubesi zincir sitenin bir parçası; şubeye özel zayıf nokta yok.",
      analysis:
        "develi1912.com 109 yıllık marka sitesi: şubeler, online rezervasyon, saatler, telefon. Redesign satışı için uygun lead değil.",
      pitch: "Develi: düşük satış önceliği; mevcut zincir sitesi temel dönüşümü karşılıyor.",
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Fauna", "Ataşehir"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.9,
      problem1: "Rezervasyon Instagram linkine bağlı; sitede zayıf CTA.",
      problem2: "İçerik ince; 24 sandalyelik mahalle lokantası için yeterli ama dönüşüm sınırlı.",
      analysis:
        "fauna.com.tr markayı ve Ataşehir adresini doğru anlatıyor, saatler net. Wix/ince sayfa; temel ihtiyaç var, büyüme/dönüşüm zayıf.",
      pitch: "Fauna: yalnızca rezervasyon CTA ve menü netliği için küçük iyileştirme; agresif redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Ikaria Balık Restaurant", "Maltepe"),
    {
      status: "GOOD",
      websiteScore: 7.7,
      problem1: "Sitede güçlü vitrin var; redesign önceliği düşük.",
      analysis:
        "ikariabalik.com.tr Maltepe adresi, telefon, saat, meze/balık anlatımı ve rezervasyon çağrısı içeriyor. Modern, kullanılabilir restoran sitesi.",
      pitch: "İkaria: düşük satış önceliği; mevcut site temel dönüşümü karşılıyor.",
      opportunities: "LOW_PRIORITY_KEEP",
    },
  ],
  [
    keyOf("Nazenin Restaurant", "Ataşehir"),
    {
      status: "WEAK",
      websiteScore: 4.3,
      problem1: "Galeri butonu “Oluştur” olarak kalmış; şablon bitmemiş.",
      problem2: "Birkaç yemek kartı var, tam menü ve rezervasyon/WhatsApp yok.",
      analysis:
        "nazeninrestaurant.com Ataşehir adresi ve telefonu doğru. İnce WordPress vitrin, yarım galeri, dönüşüm zayıf.",
      pitch: "Nazenin: conversion odaklı yenileme (tam menü, WhatsApp, rezervasyon).",
      opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
  [
    keyOf("Sensus Wine & Food Ataşehir", "Ataşehir"),
    {
      status: "IMPROVABLE",
      websiteScore: 5.4,
      problem1: "Kurumsal şarap butiği sitesi; Ataşehir restoranı tek satır adres.",
      problem2: "Placeholder e-posta (info@website.com) duruyor.",
      analysis:
        "sensuswine.com zincir şarap/peynir sitesi. Ataşehir şubesi listeleniyor ama restoran menü/rezervasyon vitrini yok. Kullanılabilir, restoran satışı zayıf.",
      pitch: "Sensus Ataşehir: şubeye özel menü + rezervasyon sayfası; tam zincir redesign şart değil.",
      opportunities: "CONVERSION_IMPROVE, BRANCH_PAGE, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Grill Prime Palladium Tower", "Ataşehir"),
    {
      status: "WEAK",
      websiteScore: 3.9,
      problem1: "kasapprime.com.tr kasap/e-ticaret vitrini; Grill Prime restoran rezervasyonu yok.",
      problem2: "Restoran menü ve masa CTA’sı görünmüyor.",
      analysis:
        "Kayıtlı URL kasap e-ticaret sitesine gidiyor. Grill Prime Palladium için bağımsız restoran deneyimi yok.",
      pitch: "Grill Prime: restoran odaklı site (menü, rezervasyon, konum) veya net şube sayfası.",
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    },
  ],
  [
    keyOf("Restohan Kebap Bomonti", "Şişli"),
    {
      status: "VERY_WEAK",
      websiteScore: 2.6,
      problem1: "restohankebap.com açılınca “RESTO LORDOM RESTAURANT” Wix sayfası geliyor.",
      problem2: "Yanlış marka kimliği; Restohan vitrini yok.",
      analysis:
        "restohankebap.com 2026-09-04’te Resto Lordom Şişli Wix şablonuna çözülüyor. Domain Restohan’a ait değil gibi duruyor.",
      pitch: "Restohan: kendi domain’inde bağımsız kebap sitesi + menü + WhatsApp.",
      opportunities: "WEBSITE_NEW, BRAND_IDENTITY, DIGITAL_MENU, WHATSAPP_CTA",
    },
  ],
]);

for (const [key, value] of EXTRA_OVERRIDES) {
  OVERRIDES.set(key, value);
}

function fillEmptyAnalysis(row: Probe) {
  const s = new Set(row.probe.signals);
  if (row.probe.kind === "none" || !row.current.website) {
    return {
      analysis: `${row.restaurantName} kaydında bağımsız website URL’si yok. ${socialLine(row)}`,
      problem1: row.current.problem1 ?? "Bağımsız restoran websitesi yok.",
      problem2: row.current.problem2 ?? (row.instagram || row.googleMapsUrl ? "Müşteri Instagram/Google profiline yönleniyor." : null),
      pitch: row.current.salkayPitch ?? noWebsitePitch(row.restaurantName),
      opportunities: row.current.opportunities ?? "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    };
  }
  const missing: string[] = [];
  if (!s.has("menu")) missing.push("menü");
  if (!s.has("reservation")) missing.push("rezervasyon");
  if (!s.has("whatsapp") && !s.has("tel")) missing.push("telefon/WhatsApp CTA");
  const analysis = [
    `${row.probe.host || row.current.website} HTTP ${row.probe.status ?? "?"} ile açıldı.`,
    row.probe.title ? `Başlık: “${row.probe.title.slice(0, 80)}”.` : "Başlık okunamadı.",
    s.has("viewport") ? "Mobil viewport var." : "Mobil viewport yok.",
    missing.length ? `Eksik/zayıf: ${missing.join(", ")}.` : "Menü veya iletişim izi var.",
  ].join(" ");
  return {
    analysis,
    problem1: row.current.problem1 ?? missing[0] ?? "Dönüşüm akışı net değil.",
    problem2: row.current.problem2 ?? missing[1] ?? null,
    pitch:
      row.current.salkayPitch ??
      (row.current.websiteStatus === "NO_WEBSITE"
        ? noWebsitePitch(row.restaurantName)
        : row.current.websiteStatus === "VERY_WEAK"
          ? `${row.restaurantName}: tam redesign + mobil + menü/WhatsApp/rezervasyon.`
          : row.current.websiteStatus === "WEAK"
            ? `${row.restaurantName}: redesign veya conversion odaklı iyileştirme.`
            : row.current.websiteStatus === "IMPROVABLE"
              ? `${row.restaurantName}: mevcut sitede spesifik CTA/menü/mobil iyileştirme.`
              : `${row.restaurantName}: düşük satış önceliği.`),
    opportunities: row.current.opportunities ?? "CONVERSION_IMPROVE",
  };
}

function buildPatch(existing: RestaurantLead, row: Probe): Prisma.RestaurantLeadUpdateInput | null {
  const override = OVERRIDES.get(keyOf(row.restaurantName, row.district));
  const noUrlUnverified = existing.websiteStatus === "NOT_VERIFIED" && !blankToNull(existing.website);

  let status = existing.websiteStatus;
  let analysis = existing.websiteAnalysis;
  let problem1 = existing.problem1;
  let problem2 = existing.problem2;
  let problem3 = existing.problem3;
  let pitch = existing.salkayPitch;
  let opportunities = existing.opportunities;
  let website = existing.website;
  let websiteDomain = existing.websiteDomain;
  let websiteScore = existing.websiteScore;
  let forced = false;

  if (override) {
    status = override.status;
    analysis = override.analysis;
    problem1 = override.problem1;
    problem2 = override.problem2 ?? null;
    problem3 = override.problem3 ?? null;
    pitch = override.pitch;
    opportunities = override.opportunities;
    websiteScore = websiteScoreFor(status, override.websiteScore);
    if (override.clearWebsite) {
      website = null;
      websiteDomain = null;
    }
    forced = true;
  } else if (noUrlUnverified) {
    status = "NO_WEBSITE";
    websiteScore = null;
    problem1 = "Bağımsız restoran websitesi yok; kayıtta URL yok.";
    problem2 = row.instagram || row.googleMapsUrl ? "Müşteri Instagram veya Google profiline yönleniyor." : "Dijital vitrin yok.";
    problem3 = hasPhone(row) ? null : "Doğrulanmış telefon da yok.";
    analysis = `${row.restaurantName} (${row.district}) NOT_VERIFIED bırakılmıştı ancak website URL’si yok. ${socialLine(row)}`;
    pitch = noWebsitePitch(row.restaurantName);
    opportunities = "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW";
    forced = true;
  } else if (!existing.websiteAnalysis) {
    const filled = fillEmptyAnalysis(row);
    analysis = filled.analysis;
    problem1 = filled.problem1;
    problem2 = filled.problem2;
    pitch = filled.pitch;
    opportunities = filled.opportunities;
  }

  const phone = hasPhone(row);
  let priority = existing.priority;
  let leadScore = existing.leadScore;
  if (forced) {
    const rules = applyRestaurantLeadStatusRules({
      websiteStatus: status,
      websiteScore,
      leadScore: leadScoreFor(status, phone),
      priority: salesPriority(status, phone),
    });
    websiteScore = rules.websiteScore;
    leadScore = rules.leadScore;
    priority = rules.priority;
  } else {
    const rules = applyRestaurantLeadStatusRules({
      websiteStatus: status,
      websiteScore,
      leadScore,
      priority: salesPriority(status, phone),
    });
    websiteScore = rules.websiteScore;
    priority = rules.priority;
    if (status === "NOT_VERIFIED") leadScore = null;
  }

  const next: Prisma.RestaurantLeadUpdateInput = {};
  const assign = (field: keyof Prisma.RestaurantLeadUpdateInput, value: unknown, current: unknown) => {
    if (value === current) return;
    (next as Record<string, unknown>)[field] = value;
  };
  assign("websiteStatus", status, existing.websiteStatus);
  assign("websiteScore", websiteScore, existing.websiteScore);
  assign("leadScore", leadScore, existing.leadScore);
  assign("priority", priority, existing.priority);
  assign("problem1", problem1, existing.problem1);
  assign("problem2", problem2, existing.problem2);
  assign("problem3", problem3, existing.problem3);
  assign("websiteAnalysis", analysis, existing.websiteAnalysis);
  assign("opportunities", opportunities, existing.opportunities);
  assign("salkayPitch", pitch, existing.salkayPitch);
  assign("website", website, existing.website);
  assign("websiteDomain", websiteDomain, existing.websiteDomain);

  if (Object.keys(next).length === 0) return null;
  next.dateChecked = new Date("2026-09-04T00:00:00.000Z");
  return next;
}

async function main() {
  loadDotEnv();
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL missing");
  const prisma = getPrisma();
  const apply = process.argv.includes("--apply");
  const probes = JSON.parse(readFileSync(path.join(process.cwd(), "tmp/restaurant-website-probe.json"), "utf8")) as Probe[];
  const leads = await prisma.restaurantLead.findMany();
  if (leads.length !== 239) throw new Error(`Expected 239, got ${leads.length}`);
  const byId = new Map(leads.map((lead) => [lead.id, lead]));

  const planned = probes.map((row) => {
    const existing = byId.get(row.id);
    if (!existing) throw new Error(`Missing ${row.id}`);
    if (
      existing.restaurantName !== row.restaurantName ||
      existing.district !== row.district ||
      existing.region !== row.region ||
      existing.phone !== row.phone
    ) {
      throw new Error(`Identity drift ${row.id}`);
    }
    return { row, existing, patch: buildPatch(existing, row) };
  });

  const changing = planned.filter((item) => item.patch);
  const statusChanged = changing.filter((item) => item.patch?.websiteStatus != null);
  const scoreChanged = changing.filter((item) => Object.prototype.hasOwnProperty.call(item.patch, "websiteScore"));
  const analysisChanged = changing.filter((item) => item.patch?.websiteAnalysis != null);
  console.log({
    plannedUpdates: changing.length,
    statusChanged: statusChanged.length,
    scoreChanged: scoreChanged.length,
    analysisChanged: analysisChanged.length,
    priorityChanged: changing.filter((item) => item.patch?.priority != null).length,
  });
  for (const item of statusChanged) {
    console.log(
      `STATUS ${item.existing.websiteStatus} -> ${item.patch?.websiteStatus} | ${item.row.restaurantName} | ${item.row.district}`,
    );
  }

  const nextStatus: Record<string, number> = {};
  const nextPrio: Record<string, number> = {};
  const nextHighRegion: Record<string, number> = { ANADOLU: 0, AVRUPA: 0 };
  for (const item of planned) {
    const status = (item.patch?.websiteStatus as string | undefined) ?? item.existing.websiteStatus;
    const prio = (item.patch?.priority as string | undefined) ?? item.existing.priority;
    nextStatus[status] = (nextStatus[status] ?? 0) + 1;
    nextPrio[prio] = (nextPrio[prio] ?? 0) + 1;
    if (prio === "HIGH") nextHighRegion[item.row.region] += 1;
  }
  console.log("projected status", nextStatus);
  console.log("projected priority", nextPrio);
  console.log("projected HIGH by region", nextHighRegion);

  if (!apply) {
    console.log("Dry-run. Pass --apply to write.");
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      if ((await tx.restaurantLead.count()) !== 239) throw new Error("count changed");
      for (const item of changing) {
        if (!item.patch) continue;
        await tx.restaurantLead.update({ where: { id: item.existing.id }, data: item.patch });
      }
      if ((await tx.restaurantLead.count()) !== 239) throw new Error("count after write");
    },
    { timeout: 180000, maxWait: 20000 },
  );
  console.log(`Applied ${changing.length} analysis patches. Count still 239.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
