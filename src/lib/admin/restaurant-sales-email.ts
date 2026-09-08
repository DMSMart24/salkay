import type { RestaurantLead, RestaurantLeadPriority, RestaurantWebsiteStatus } from "@prisma/client";
import { renderRestaurantSalesEmailHtml } from "@/lib/admin/email/templates/restaurant-sales";
import { blankToNull } from "@/lib/admin/restaurant-leads";
import {
  blocksRestaurantSalesEmail,
  formatGoogleProof,
  recommendedContactChannel,
  restaurantSalesType,
  type RecommendedChannel,
  type RestaurantSalesType,
} from "@/lib/admin/restaurant-no-website";
import { site } from "@/lib/site";

export const RESTAURANT_SALES_EMAIL_VARIANT_COUNT = 3;

export const NO_WEBSITE_CTA =
  "İsterseniz işletmeniz için ücretsiz, küçük bir ana sayfa konsepti hazırlayıp paylaşabiliriz.";

export const WEBSITE_PROBLEM_CTA =
  "İsterseniz mevcut siteniz için ücretsiz küçük bir yenileme konsepti hazırlayıp paylaşabiliriz.";

const FORBIDDEN_A = [
  "siteniz eski",
  "siteniz kötü",
  "mevcut sitenizi yenileyelim",
  "siteniz zayıf",
  "siteniz bozuk",
];

const FORBIDDEN_B = [
  "sitenizi geliştirebiliriz",
  "bağımsız bir web sitesi öne çıkmadı",
  "bağımsız resmi site yok",
  "size ait bir web sitesi",
];

const LEAK_PATTERNS = [
  /leadscore/i,
  /lead score/i,
  /\bHIGH\b/,
  /QUALIFIED_OUT/,
  /websiteScore/i,
  /website score/i,
  /DNS NXDOMAIN/i,
  /user-scalable/i,
  /i\.pravatar/i,
  /html lang\s*=\s*en/i,
  /Create React App/i,
  /Hello Elementor/i,
  /GTranslate/i,
  /WordPress \d+\.\d+/i,
  /jQuery [\d.]+/i,
];

export type RestaurantSalesEmailLead = Pick<
  RestaurantLead,
  | "restaurantName"
  | "district"
  | "neighborhood"
  | "category"
  | "website"
  | "websiteDomain"
  | "websiteStatus"
  | "websiteScore"
  | "leadScore"
  | "priority"
  | "publicEmail"
  | "phone"
  | "whatsapp"
  | "instagram"
  | "googleMapsUrl"
  | "googleRating"
  | "googleReviewCount"
  | "problem1"
  | "problem2"
  | "problem3"
  | "websiteAnalysis"
  | "opportunities"
  | "salkayPitch"
>;

export type RestaurantSalesPersonalization = {
  restaurantName: string;
  district: string;
  neighborhood: string | null;
  category: string | null;
  venueKind: string;
  googleProof: string | null;
  instagram: boolean;
  website: string | null;
  problemsUsed: string[];
  reservationNeed: boolean;
  digitalMenuNeed: boolean;
};

export type RestaurantSalesEmail = {
  emailType: RestaurantSalesType;
  subject: string;
  greeting: string;
  paragraphs: string[];
  listItems: string[];
  cta: string;
  ctaHref: string;
  plainText: string;
  html: string;
  recipient: string | null;
  recommendedChannel: RecommendedChannel;
  personalization: RestaurantSalesPersonalization;
  variant: number;
};

export function parseSalesEmailVariant(raw?: string | number | null) {
  const parsed = typeof raw === "number" ? raw : Number(raw ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  const index = Math.trunc(parsed);
  return ((index % RESTAURANT_SALES_EMAIL_VARIANT_COUNT) + RESTAURANT_SALES_EMAIL_VARIANT_COUNT) %
    RESTAURANT_SALES_EMAIL_VARIANT_COUNT;
}

export function nextSalesEmailVariant(variant: number) {
  return (parseSalesEmailVariant(variant) + 1) % RESTAURANT_SALES_EMAIL_VARIANT_COUNT;
}

export function restaurantVenueKind(lead: Pick<RestaurantLead, "restaurantName" | "category">) {
  const hay = [lead.category, lead.restaurantName].filter(Boolean).join(" ").toLocaleLowerCase("tr");
  if (/bosna|balkan/.test(hay)) return "Bosna mutfağı restoranı";
  if (/meyhane/.test(hay)) return "meyhane";
  if (/ocakbaşı|ocakbasi|kebap|dürüm|durum/.test(hay)) return "kebap restoranı";
  if (/balık|balik|meze/.test(hay)) return "meze ve balık restoranı";
  if (/kahvaltı|kahvalti|brunch/.test(hay)) return "kahvaltı / cafe";
  if (/cafe|kahve|coffee/.test(hay)) return "cafe-restoran";
  return "restoran";
}

function turkishLocative(place: string) {
  const folded = place.trim();
  const vowels = folded.match(/[aeıioöuüAEIİOÖUÜaeıioöuü]/g);
  const lastVowel = (vowels?.[vowels.length - 1] ?? "e").toLocaleLowerCase("tr");
  const lastChar = folded.slice(-1).toLocaleLowerCase("tr");
  const back = /[aıou]/.test(lastVowel);
  const voiceless = /[fstkçşhp]/.test(lastChar);
  const suffix = back ? (voiceless ? "ta" : "da") : voiceless ? "te" : "de";
  return `${folded}’${suffix}`;
}

function hostFromWebsite(lead: RestaurantSalesEmailLead) {
  const raw = blankToNull(lead.websiteDomain) || blankToNull(lead.website);
  if (!raw) return null;
  return raw.replace(/^https?:\/\//i, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

function hasOpportunity(lead: RestaurantSalesEmailLead, needle: string) {
  return (lead.opportunities || "").toUpperCase().includes(needle);
}

function formatReviewCount(value: number) {
  return Math.round(value).toLocaleString("tr-TR");
}

function googleClause(lead: RestaurantSalesEmailLead) {
  const rating =
    typeof lead.googleRating === "number" && Number.isFinite(lead.googleRating)
      ? lead.googleRating.toFixed(1).replace(".", ",")
      : null;
  const reviews =
    typeof lead.googleReviewCount === "number" && Number.isFinite(lead.googleReviewCount)
      ? formatReviewCount(lead.googleReviewCount)
      : null;
  if (rating && reviews) return `Google’da ${rating} puan ve ${reviews} yorum`;
  if (rating) return `Google’da ${rating} puan`;
  if (reviews) return `Google’da ${reviews} yorum`;
  if (blankToNull(lead.googleMapsUrl)) return "Google Haritalar’da görünür bir işletme";
  return null;
}

const PROBLEM_REWRITERS: Array<{
  test: (text: string) => boolean;
  write: (lead: RestaurantSalesEmailLead) => string;
}> = [
  {
    test: (text) => /ultimate blogging|hello world|twenty twenty/i.test(text),
    write: (lead) => {
      const host = hostFromWebsite(lead) ?? "web siteniz";
      return `${host} açıldığında restoran içeriği yerine WordPress’in varsayılan blog şablonu görünüyor; ana başlık “Ultimate Blogging Championship”, yayındaki yazı da “Hello world!”.`;
    },
  },
  {
    test: (text) => /lorem ipsum|king prawns|carbonara|fajitas|demo menü|demo menu/i.test(text),
    write: (lead) => {
      const host = hostFromWebsite(lead) ?? "sitenizin ana sayfası";
      return `${host} ana sayfasında Lorem ipsum ve kebap menüsü olmayan İngilizce örnek yemekler (King Prawns, Carbonara, Fajitas) duruyor.`;
    },
  },
  {
    test: (text) => /plesk|no web site at this address/i.test(text),
    write: (lead) => {
      const host = hostFromWebsite(lead) ?? "domain";
      return `${host} açıldığında hosting varsayılan sayfası çıkıyor; restoran içeriği yok.`;
    },
  },
  {
    test: (text) => /otelimiz|oda servisi|uzun konaklama/.test(text.toLocaleLowerCase("tr")),
    write: () => "Yayındaki metin restoran yerine otel şablonuna ait görünüyor.",
  },
  {
    test: (text) => {
      const folded = text.toLocaleLowerCase("tr");
      return /iletişim\/contact/.test(folded) || (/php hatası/.test(folded) && /iletişim|contact/.test(folded));
    },
    write: () => "İletişim sayfası şu anda açılmıyor.",
  },
  {
    test: (text) => /php hatası/.test(text.toLocaleLowerCase("tr")) && /qr/i.test(text),
    write: () => "QR menü şu anda açılmıyor.",
  },
  {
    test: (text) => /php hatası/.test(text.toLocaleLowerCase("tr")),
    write: () => "Sitede bir sayfa hata veriyor; içerik açılmıyor.",
  },
  {
    test: (text) => /yapım aşamasında|under construction|coming soon/i.test(text),
    write: () => "Site hâlâ yapım aşamasında; menü ve sipariş akışı görünmüyor.",
  },
  {
    test: (text) => /web tasarım|paragon tasarım|verabilisim|godaddy website builder/i.test(text),
    write: () => "Footer’da restoran yerine ajans veya şablon imzası duruyor.",
  },
  {
    test: (text) => /wordpress \d|yıllardır güncellenmemiş|jquery \d|copyright 2015/i.test(text),
    write: () => "Site eski bir altyapı üzerinde; yıllardır güncellenmemiş görünüyor.",
  },
  {
    test: (text) => /user-scalable|mobil yakınlaştırma/i.test(text),
    write: () => "Mobilde sayfa yakınlaştırması kapalı; kullanım zorlaşıyor.",
  },
  {
    test: (text) => /wix|bridge nakka 2/i.test(text),
    write: () => "Sayfa başlığı hazır şablon izi taşıyor; restoran menüsü ve yemek rezervasyonu öne çıkmıyor.",
  },
  {
    test: (text) =>
      /flavors|qr-menu|menu-online\.co|#sec3|yemek listesi değil|yemek kalemi yok|ayrı menü sayfası yok|nav’da menü yok/i.test(
        text,
      ),
    write: () => "Sitede tarayıcıda okunabilir bir yemek menüsü yok; menü ya boş ya da dış bir bağlantıya kaçıyor.",
  },
  {
    test: (text) => /sosyal mesafe|covid|maske\/mesafe|\bmaske\b/i.test(text),
    write: () => "Sitede pandemi döneminden kalan eski metinler duruyor.",
  },
  {
    test: (text) => /üç kez tekrar|beş kez tekrar|birleşik tekrar|h1 bloğu/i.test(text),
    write: () => "Ana sayfada aynı başlık bloğu tekrar ediyor.",
  },
  {
    test: (text) => /pravatar|stok görseller/i.test(text),
    write: () => "Yorum görselleri stok avatar; gerçek müşteri fotoğrafı değil.",
  },
  {
    test: (text) => /video splash|tam ekran video/i.test(text),
    write: () => "Ana sayfa tam ekran video; menü ve rezervasyon içeriği hemen görünmüyor.",
  },
  {
    test: (text) => /tek kartlık|iletişim landing/i.test(text),
    write: () => "Site yalnızca kısa bir iletişim kartı; menü ve rezervasyon sayfası yok.",
  },
  {
    test: (text) => /hll gurme|ürünler ve bayilik/i.test(text),
    write: () => "Site restoran menüsü değil; ürün ve bayilik vitrini gibi duruyor.",
  },
  {
    test: (text) =>
      /hosgeldiniz|üskükar|güzleryüzlü|aferatif|reservasyon için konu|ö zelliklerini|franchıse/i.test(text),
    write: () => "Sitede yayında duran yazım hataları var.",
  },
  {
    test: (text) => /add content here/i.test(text),
    write: () => "Ana sayfada “Add Content Here” yer tutucu metin duruyor.",
  },
  {
    test: (text) => /giyim kuralı|program, giyim/i.test(text),
    write: () => "Menü sayfası yemek listesi değil; program ve rezervasyon şartları duruyor.",
  },
  {
    test: (text) => /html lang|create react app|meta description boş/i.test(text),
    write: () => "Yayındaki sayfa henüz restoran içeriği taşımıyor; iskelet duruyor.",
  },
  {
    test: (text) => /arih ve kültürü|kesik başlıyor/i.test(text),
    write: () => "Ana sayfa metni kesik başlıyor.",
  },
  {
    test: (text) => /izmir geçiyor/i.test(text),
    write: (lead) => `Site başlığında başka bir şehir geçiyor; işletme ${turkishLocative(lead.district.trim())}.`,
  },
  {
    test: (text) => /placeholder içeriği|ürün açıklaması burada yer alacak|placeholder\.png/i.test(text),
    write: () => "Sitede yer tutucu metin veya kırık görseller yayında.",
  },
  {
    test: (text) => /12:00 -2359|19:30 am|yazımı hatalı|yazım hatası/i.test(text),
    write: () => "İletişim sayfasında saat veya metin hatalı yazılmış.",
  },
  {
    test: (text) => /#reservation|#contact hash|hero overlay/i.test(text),
    write: () => "Rezervasyon bağlantısı sayfada çalışmıyor.",
  },
  {
    test: (text) => /href=“#”|href="#"|çalışmayan boş/i.test(text),
    write: () => "Sitede çalışmayan boş bağlantılar duruyor.",
  },
];

function isInternalOnlyProblem(text: string) {
  const folded = text.toLocaleLowerCase("tr");
  if (/dns nxdomain/.test(folded)) return true;
  if (/public e-posta yok/.test(folded)) return true;
  if (/public business e-posta/.test(folded)) return true;
  return false;
}

function softenCrmNote(text: string) {
  const cleaned = text
    .replace(/\(\s*\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4}\s*\)/g, "")
    .replace(/DNS NXDOMAIN[^.]*\.?/gi, "")
    .replace(/WordPress\s+\d+(?:\.\d+)+/gi, "eski WordPress")
    .replace(/jQuery\s+[\d.]+/gi, "eski altyapı")
    .replace(/user-scalable\s*=\s*no/gi, "mobil yakınlaştırma kapalı")
    .replace(/html\s+lang\s*=\s*en;?/gi, "")
    .replace(/i\.pravatar\.cc/gi, "stok görsel")
    .replace(/href\s*=\s*[“"'']?#["”'']?/gi, "çalışmayan bağlantı")
    .replace(/Hello Elementor/gi, "hazır şablon")
    .replace(/Create React App[^.]*\.?/gi, "iskelet sayfa.")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([;.,])/g, "$1")
    .replace(/^[;.\s]+/, "")
    .trim();
  return cleaned.length >= 12 ? cleaned : null;
}

function customerProblems(lead: RestaurantSalesEmailLead, variant: number) {
  const raw = [lead.problem1, lead.problem2, lead.problem3]
    .map((item) => blankToNull(item))
    .filter((item): item is string => Boolean(item));
  const rewritten: string[] = [];
  const used: string[] = [];
  for (const text of raw) {
    if (isInternalOnlyProblem(text)) continue;
    const matcher = PROBLEM_REWRITERS.find((item) => item.test(text));
    const sentence = matcher ? matcher.write(lead) : softenCrmNote(text);
    if (!sentence) continue;
    if (rewritten.includes(sentence)) continue;
    rewritten.push(sentence);
    used.push(text);
    if (rewritten.length === 2) break;
  }
  if (rewritten.length === 0 && raw[0]) {
    const fallback = softenCrmNote(raw[0]);
    if (fallback) {
      rewritten.push(fallback);
      used.push(raw[0]);
    }
  }
  if (variant === 2 && rewritten.length > 1) {
    return { sentences: rewritten.slice(0, 1), used: used.slice(0, 1) };
  }
  return { sentences: rewritten.slice(0, 2), used: used.slice(0, rewritten.length) };
}

function noWebsiteCopy(lead: RestaurantSalesEmailLead, variant: number) {
  const name = lead.restaurantName.trim();
  const district = lead.district.trim();
  const loc = turkishLocative(district);
  const kind = restaurantVenueKind(lead);
  const google = googleClause(lead);
  const instagram = Boolean(blankToNull(lead.instagram));
  const reservation = hasOpportunity(lead, "RESERVATION");
  const greeting = `Merhaba ${name} ekibi,`;
  const reviews =
    typeof lead.googleReviewCount === "number" && Number.isFinite(lead.googleReviewCount)
      ? lead.googleReviewCount
      : null;

  const highVolume = reviews != null && reviews >= 800;
  const bosna = kind.includes("Bosna");

  let opening: string;
  if (variant === 1 && google) {
    opening = instagram
      ? `${name}, ${loc} ${google} ile duran ve Instagram’da da görünen bir ${kind}.`
      : `${name}, ${loc} ${google} ile duran bir ${kind}.`;
  } else if (highVolume && google) {
    opening = `${loc} ${google} olan bir ${kind}. Misafirleriniz sizi Google’dan buluyor.`;
  } else if (bosna && google) {
    opening = `${loc} Bosna mutfağı sunan bir restoransınız. ${google} bu görünürlüğü doğruluyor.`;
  } else if (google) {
    opening = `${loc} bir ${kind} olarak ${google} ile görünüyorsunuz.`;
  } else {
    opening = `${loc} bir ${kind} olarak işletmenizi inceledik.`;
  }

  const systemCore = reservation
    ? "Kendi domaininizde mobil uyumlu bir restoran sitesi menüyü, rezervasyonu, WhatsApp’ı ve haritayı tek yerde tutar. Google aramalarında da sizi organik olarak öne çıkarır."
    : "Kendi domaininizde mobil uyumlu bir restoran sitesi menüyü, WhatsApp’ı ve haritayı tek yerde tutar. Google aramalarında da sizi organik olarak öne çıkarır.";

  const instagramOffer = "Instagram, Local SEO ve size ait bir domain bu yapının parçası olur.";

  if (variant === 0) {
    const second = highVolume
      ? "Bu görünürlüğün yanında size ait bir site; güncel menü, masa rezervasyonu ve WhatsApp’ı sizin kontrolünüze alır."
      : bosna
        ? "Kısa, mobil bir restoran sitesi bu mutfağı kendi domaininizde gösterir; menü, rezervasyon ve WhatsApp bir arada durur."
        : systemCore;
    return {
      greeting,
      paragraphs: [opening, second],
      listItems: [
        "Mobil uyumlu premium restoran sitesi",
        reservation ? "Dijital menü ve rezervasyon" : "Dijital menü",
        "WhatsApp ve Google Maps",
        "Instagram, Local SEO ve kendi domaininiz",
      ],
      problemsUsed: [] as string[],
    };
  }
  if (variant === 1) {
    return {
      greeting,
      paragraphs: [
        opening,
        instagram
          ? "Instagram’daki hesabınız duruyor. Menü, rezervasyon ve yol tarifi de sizin domaininizde olunca misafirin işi kolaylaşır."
          : systemCore,
      ],
      listItems: [
        "Dijital menü",
        reservation ? "Rezervasyon" : "WhatsApp iletişimi",
        "Google Maps",
        "Local SEO ile organik görünürlük",
      ],
      problemsUsed: [] as string[],
    };
  }

  return {
    greeting,
    paragraphs: [
      `Kısa bir not: ${name} için size ait, bağımsız bir restoran sitesi henüz yok.`,
      opening,
      `${systemCore} ${instagramOffer}`,
    ],
    listItems: [],
    problemsUsed: [] as string[],
  };
}

function websiteProblemSolution(_lead: RestaurantSalesEmailLead, used: string[]) {
  const blob = used.join(" ").toLocaleLowerCase("tr");
  if (/ultimate blogging|hello world/.test(blob)) {
    return "Domain restoranınıza ait bir ana sayfaya dönüşebilir: gerçek menü, rezervasyon, WhatsApp, harita ve Local SEO.";
  }
  if (/lorem ipsum|king prawns|carbonara|fajitas/.test(blob)) {
    return "Şablon yemek listesinin yerine sizin kebap menünüz, çalışan bir iletişim ve rezervasyon durabilir. Mobil kullanım ve Local SEO de bu yenilemenin parçası.";
  }
  if (/plesk|no web site at this address/.test(blob)) {
    return "Aynı domainde gerçek bir restoran sitesi açılabilir: menü, rezervasyon, WhatsApp ve harita.";
  }
  if (/yapım aşamasında/.test(blob)) {
    return "Aynı adreste menü, rezervasyon ve WhatsApp’ı gösteren sade bir restoran ana sayfası açılabilir.";
  }
  if (/covid|sosyal mesafe|maske/.test(blob)) {
    return "Eski dönem metinleri kalkınca menü, rezervasyon ve güncel iletişim öne çıkar.";
  }
  if (/php hatası|iletişim\/contact/.test(blob)) {
    return "Açılmayan sayfalar düzeltilir; menü, rezervasyon ve iletişim net durur.";
  }
  if (/add content here|placeholder/.test(blob)) {
    return "Yer tutucu metinlerin yerine sizin menünüz ve iletişim bilgileriniz durabilir.";
  }
  if (/otelimiz|oda servisi|uzun konaklama/.test(blob)) {
    return "Şablon otel metinleri kalkınca restoran kimliği, menü ve rezervasyon durabilir.";
  }
  if (/menü|yemek listesi|qr/.test(blob)) {
    return "Tarayıcıda okunan bir menü, rezervasyon, WhatsApp ve harita aynı sitede durabilir.";
  }
  return "Bunu sade bir restoran sitesine çekebiliriz: mobil kullanım, gerçek menü, rezervasyon, WhatsApp, harita ve Local SEO.";
}

function websiteProblemCopy(lead: RestaurantSalesEmailLead, variant: number) {
  const name = lead.restaurantName.trim();
  const loc = turkishLocative(lead.district.trim());
  const host = hostFromWebsite(lead);
  const google = googleClause(lead);
  const instagram = Boolean(blankToNull(lead.instagram));
  const problems = customerProblems(lead, variant);
  const greeting = `Merhaba ${name} ekibi,`;
  const seen = problems.sentences.join(" ");
  const proof =
    google && instagram
      ? `${loc} ${google} duruyor. Instagram hesabınız da açık.`
      : google
        ? `${loc} ${google} var.`
        : `${loc} işletmenizi inceledik.`;
  const solution = websiteProblemSolution(lead, problems.used);
  const inspect = host ? `${host} adresini inceledik.` : "Mevcut web sitenizi inceledik.";

  if (variant === 0) {
    return {
      greeting,
      paragraphs: [inspect, seen, proof, solution].filter(Boolean),
      listItems: [],
      problemsUsed: problems.used,
    };
  }
  if (variant === 1) {
    return {
      greeting,
      paragraphs: [proof, seen, solution],
      listItems: [],
      problemsUsed: problems.used,
    };
  }
  return {
    greeting,
    paragraphs: [
      inspect,
      seen,
      instagram ? "Instagram’daki yüzünüz ile sitenin verdiği ilk izlenim şu an örtüşmüyor." : solution,
      instagram ? solution : "",
    ].filter(Boolean),
    listItems: [],
    problemsUsed: problems.used,
  };
}

function toPlainText(input: {
  greeting: string;
  paragraphs: string[];
  listItems: string[];
  cta: string;
}) {
  const lines = [input.greeting, "", ...input.paragraphs];
  if (input.listItems.length) {
    lines.push("");
    for (const item of input.listItems) lines.push(`• ${item}`);
  }
  lines.push("", input.cta, "", "İyi çalışmalar,", "Salih Kaya", "SALKAY");
  return lines.join("\n");
}

export function assertRestaurantSalesCopySafe(
  emailType: RestaurantSalesType,
  text: string,
  leadScore?: number | null,
) {
  const folded = text.toLocaleLowerCase("tr");
  const hits: string[] = [];
  const forbidden = emailType === "NO_WEBSITE_EMAIL" ? FORBIDDEN_A : FORBIDDEN_B;
  for (const phrase of forbidden) {
    if (folded.includes(phrase)) hits.push(phrase);
  }
  if (emailType === "NO_WEBSITE_EMAIL" && /mevcut sitenizi yenile/i.test(folded)) {
    hits.push("mevcut sitenizi yenile");
  }
  for (const pattern of LEAK_PATTERNS) {
    if (pattern.test(text)) hits.push(pattern.source);
  }
  if (typeof leadScore === "number") {
    const exact = leadScore.toFixed(1);
    const comma = exact.replace(".", ",");
    const leak = new RegExp(
      `(?:lead\\s*score|leadscore|skor)\\s*[:/]?\\s*${comma.replace(",", "[.,]")}|${comma.replace(",", "[.,]")}\\s*/\\s*10`,
      "i",
    );
    if (leak.test(text)) hits.push("leadScore");
  }
  return hits;
}

export function restaurantSalesEmailCopyPack(
  draft: Pick<RestaurantSalesEmail, "subject" | "plainText">,
) {
  return `Konu: ${draft.subject}\n\n${draft.plainText}`;
}

export function canBuildRestaurantSalesEmail(
  lead: Pick<RestaurantLead, "websiteStatus" | "priority">,
) {
  if (lead.priority === "QUALIFIED_OUT") return false;
  if (blocksRestaurantSalesEmail(lead.websiteStatus)) return false;
  return restaurantSalesType(lead.websiteStatus) != null;
}

export function buildRestaurantSalesEmail(
  lead: RestaurantSalesEmailLead,
  variantRaw: string | number | null = 0,
): RestaurantSalesEmail | null {
  if (!canBuildRestaurantSalesEmail(lead)) return null;
  const emailType = restaurantSalesType(lead.websiteStatus);
  if (!emailType) return null;

  const variant = parseSalesEmailVariant(variantRaw);
  const name = lead.restaurantName.trim();
  const built =
    emailType === "NO_WEBSITE_EMAIL" ? noWebsiteCopy(lead, variant) : websiteProblemCopy(lead, variant);
  const problemsUsed = built.problemsUsed;
  const cta = emailType === "NO_WEBSITE_EMAIL" ? NO_WEBSITE_CTA : WEBSITE_PROBLEM_CTA;
  const subject =
    emailType === "NO_WEBSITE_EMAIL"
      ? `${name} için hazırladığımız dijital fikir`
      : `${name} sitesi için kısa bir not`;
  const recipient = blankToNull(lead.publicEmail);
  const ctaHref = `mailto:${site.email}?subject=${encodeURIComponent(`${name} — SALKAY`)}`;
  const plainText = toPlainText({
    greeting: built.greeting,
    paragraphs: built.paragraphs,
    listItems: built.listItems,
    cta,
  });
  const html = renderRestaurantSalesEmailHtml({
    restaurantName: name,
    emailType,
    greeting: built.greeting,
    paragraphs: built.paragraphs,
    listItems: built.listItems,
    cta,
    ctaHref,
  });

  return {
    emailType,
    subject,
    greeting: built.greeting,
    paragraphs: built.paragraphs,
    listItems: built.listItems,
    cta,
    ctaHref,
    plainText,
    html,
    recipient,
    recommendedChannel: recommendedContactChannel(lead),
    personalization: {
      restaurantName: name,
      district: lead.district,
      neighborhood: blankToNull(lead.neighborhood),
      category: blankToNull(lead.category),
      venueKind: restaurantVenueKind(lead),
      googleProof: formatGoogleProof(lead),
      instagram: Boolean(blankToNull(lead.instagram)),
      website: blankToNull(lead.website),
      problemsUsed,
      reservationNeed: hasOpportunity(lead, "RESERVATION"),
      digitalMenuNeed: hasOpportunity(lead, "DIGITAL_MENU"),
    },
    variant,
  };
}
