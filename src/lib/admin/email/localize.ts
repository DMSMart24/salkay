export type OutreachLanguage = "tr" | "de" | "en";

export type LocalizedText = {
  original: string;
  customer: string;
  matched: boolean;
  sourceLanguage: OutreachLanguage | "unknown";
};

const ISSUE_TR: Record<string, string> = {
  "veralteter visueller gesamteindruck": "Görsel tasarımın modernleştirilmesi",
  "informationsarchitektur kann deutlich moderner werden":
    "İçerik yapısının ve kullanıcı deneyiminin geliştirilmesi",
  "reservierungsprozess kann stärker in die nutzerführung integriert werden":
    "Rezervasyon sürecinin daha kolay ve görünür hale getirilmesi",
  "premium-marke wird digital nicht optimal präsentiert":
    "Marka değerinin dijital ortamda daha güçlü yansıtılması",
  "sehr einfache visuelle präsentation": "Görsel sunumun daha güçlü ve modern hale getirilmesi",
  "sichtbare text- und spacingfehler": "Metin ve boşluk hatalarının giderilmesi",
  "schwache digitale markeninszenierung": "Dijital marka anlatımının güçlendirilmesi",
  "reservierung und inhalte könnten klarer geführt werden":
    "Rezervasyon ve içerik akışının daha net kurgulanması",
  "veralteter visueller auftritt": "Görsel kimliğin modernleştirilmesi",
  "alte event-inhalte aus 2021/2022 weiterhin sichtbar":
    "Güncel olmayan etkinlik içeriklerinin temizlenmesi",
  "content und typografie benötigen qualitätskontrolle":
    "İçerik ve tipografinin kalite kontrolünden geçirilmesi",
  "filialstruktur könnte moderner und conversion-orientierter aufgebaut werden":
    "Şube yapısının daha modern ve dönüşüm odaklı kurgulanması",
  "website konnte für eine belastbare bewertung noch nicht ausreichend geprüft werden":
    "Website henüz kapsamlı şekilde değerlendirilemedi",
  "moderner bestehender restaurantauftritt": "Mevcut restoran sitesi modern bir izlenim veriyor",
  "kein offensichtlicher bedarf für vollständiges redesign":
    "Kapsamlı bir yeniden tasarıma acil ihtiyaç görünmüyor",
  "website stark auf e-commerce ausgerichtet": "Sitenin restoran deneyimine daha fazla odaklanması",
  "restaurant-erlebnis steht digital zu wenig im mittelpunkt":
    "Restoran deneyiminin dijitalde daha güçlü öne çıkarılması",
  "restaurant und shop könnten klarer getrennt und verbunden werden":
    "Restoran ve mağaza alanlarının daha net ayrılması ve bağlanması",
  "bereits moderner markenauftritt": "Marka dijitalde modern bir izlenim bırakıyor",
  "solider bestehender auftritt": "Mevcut dijital duruş sağlam bir temel sunuyor",
  "visuelle hierarchie kann weiter verfeinert werden": "Görsel hiyerarşinin daha net hale getirilmesi",
  "conversion und mobile experience bieten noch optimierungspotenzial":
    "Dönüşüm ve mobil deneyimde iyileştirme alanı bulunuyor",
  "informationsarchitektur ausbaufähig": "İçerik yapısının daha anlaşılır hale getirilmesi",
  "restaurant-, standort- und shop-bereiche könnten besser verbunden werden":
    "Restoran, konum ve mağaza bölümlerinin daha iyi bağlanması",
  "conversion-pfade können klarer werden": "Dönüşüm adımlarının daha net hale getirilmesi",
  "bereits relativ starker digitaler markenauftritt": "Dijital marka duruşu halihazırda güçlü",
  "kein dringender vollständiger redesign-bedarf festgestellt":
    "Acil kapsamlı bir yeniden tasarım ihtiyacı görülmedi",
};

const SERVICE_TR: Record<string, string> = {
  "premium web redesign": "Premium web yeniden tasarım",
  "mobile ux": "Mobil kullanıcı deneyimi",
  "reservierungsoptimierung": "Rezervasyon sürecinin iyileştirilmesi",
  "local seo": "Yerel SEO",
  "web redesign": "Web yeniden tasarım",
  "restaurant storytelling": "Restoran hikâyesi ve içerik",
  "reservierungsintegration": "Rezervasyon entegrasyonu",
  "restaurant landingpage": "Restoran açılış sayfası",
  "ux redesign": "Kullanıcı deneyimi yenileme",
  "e-commerce integration": "E-ticaret entegrasyonu",
  "seo audit": "SEO denetimi",
  "performance audit": "Performans denetimi",
  "content cleanup": "İçerik sadeleştirme",
  "ux optimierung": "Kullanıcı deneyimi iyileştirme",
  "mobile optimierung": "Mobil iyileştirme",
  "conversion optimierung": "Dönüşüm iyileştirme",
  "information architecture": "Bilgi mimarisi",
};

const GENERIC_ISSUE_TR = "Bu alanda dijital deneyimin geliştirilmesi önerilir.";

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function looksTurkish(value: string) {
  return /[ğüşıöçİĞÜŞÖÇ]/.test(value) || /\b(için|daha|web|mobil|rezervasyon|tasarım|marka)\b/i.test(value);
}

function looksGermanOrEnglish(value: string) {
  return /[äöüß]/.test(value) || /\b(und|der|die|das|für|mit|kann|werden|website|redesign|experience)\b/i.test(value);
}

function detectSourceLanguage(value: string): OutreachLanguage | "unknown" {
  if (looksTurkish(value) && !looksGermanOrEnglish(value)) return "tr";
  if (/[äöüß]/.test(value) || /\b(und|der|die|das|für|kann|werden)\b/i.test(value)) return "de";
  if (/\b(the|and|website|redesign|experience|mobile)\b/i.test(value)) return "en";
  return "unknown";
}

export function localizeOutreachIssue(issue: string, language: OutreachLanguage = "tr"): LocalizedText {
  const original = issue.trim();
  if (!original) {
    return { original: "", customer: "", matched: true, sourceLanguage: "unknown" };
  }

  const sourceLanguage = detectSourceLanguage(original);
  if (language !== "tr") {
    return { original, customer: original, matched: true, sourceLanguage };
  }

  const mapped = ISSUE_TR[normalizeKey(original)];
  if (mapped) {
    return { original, customer: mapped, matched: true, sourceLanguage };
  }

  if (sourceLanguage === "tr") {
    return { original, customer: original, matched: true, sourceLanguage };
  }

  return {
    original,
    customer: GENERIC_ISSUE_TR,
    matched: false,
    sourceLanguage,
  };
}

export function localizeOutreachIssues(issues: string[], language: OutreachLanguage = "tr") {
  return issues.map((issue) => localizeOutreachIssue(issue, language)).filter((row) => row.customer);
}

export function localizeRecommendedService(item: string, language: OutreachLanguage = "tr"): LocalizedText {
  const original = item.trim();
  if (!original) {
    return { original: "", customer: "", matched: true, sourceLanguage: "unknown" };
  }

  const sourceLanguage = detectSourceLanguage(original);
  if (language !== "tr") {
    return { original, customer: original, matched: true, sourceLanguage };
  }

  const mapped = SERVICE_TR[normalizeKey(original)];
  if (mapped) {
    return { original, customer: mapped, matched: true, sourceLanguage };
  }
  if (sourceLanguage === "tr") {
    return { original, customer: original, matched: true, sourceLanguage };
  }
  return { original, customer: "", matched: false, sourceLanguage };
}

export function localizeRecommendedServices(items: string[], language: OutreachLanguage = "tr") {
  return items
    .map((item) => localizeRecommendedService(item, language))
    .filter((row) => row.customer);
}
