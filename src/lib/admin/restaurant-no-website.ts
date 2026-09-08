import type { RestaurantLead, RestaurantWebsiteStatus } from "@prisma/client";
import { blankToNull, instagramHref, mapsHref, whatsappHref } from "@/lib/admin/restaurant-leads";

export const NO_WEBSITE_SALES_TYPE = "NO_WEBSITE_EMAIL" as const;
export const WEBSITE_PROBLEM_SALES_TYPE = "WEBSITE_PROBLEM_EMAIL" as const;

export type RestaurantSalesType = typeof NO_WEBSITE_SALES_TYPE | typeof WEBSITE_PROBLEM_SALES_TYPE;

export type RecommendedContactChannel = "EMAIL" | "INSTAGRAM" | "WHATSAPP" | "PHONE" | "NONE";

export const recommendedContactChannelLabels: Record<RecommendedContactChannel, string> = {
  EMAIL: "E-posta",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  PHONE: "Telefon",
  NONE: "Doğrulanmış kanal yok",
};

export const restaurantSalesTypeLabels: Record<RestaurantSalesType, string> = {
  NO_WEBSITE_EMAIL: "NO_WEBSITE_EMAIL",
  WEBSITE_PROBLEM_EMAIL: "WEBSITE_PROBLEM_EMAIL",
};

const WEBSITE_PROBLEM_STATUSES: RestaurantWebsiteStatus[] = ["VERY_WEAK", "WEAK", "IMPROVABLE"];
const NO_SALES_EMAIL_STATUSES: RestaurantWebsiteStatus[] = ["NOT_VERIFIED", "GOOD", "VERY_GOOD"];

const FORBIDDEN_SITE_COPY = [
  "siteniz kötü",
  "siteniz eski",
  "siteniz zayıf",
  "siteniz bozuk",
  "sorunlu site",
  "web siteniz zayıf",
  "mevcut sitenizde görülen",
];

const FORBIDDEN_NO_WEBSITE_COPY = [
  "bağımsız bir web sitesi öne çıkmadı",
  "bağımsız resmi site yok",
  "size ait bir web sitesi",
  "kendi web siteniz bu görünürlüğü tamamlar",
];

export type RestaurantLeadContactSlice = Pick<
  RestaurantLead,
  | "restaurantName"
  | "district"
  | "neighborhood"
  | "category"
  | "website"
  | "websiteStatus"
  | "publicEmail"
  | "phone"
  | "whatsapp"
  | "instagram"
  | "googleMapsUrl"
  | "googleRating"
  | "googleReviewCount"
  | "salkayPitch"
  | "websiteAnalysis"
  | "problem1"
  | "problem2"
  | "problem3"
>;

export type RecommendedChannel = {
  channel: RecommendedContactChannel;
  label: string;
  value: string | null;
  href: string | null;
};

export type RestaurantSalesDraft = {
  restaurantName: string;
  district: string;
  neighborhood: string | null;
  phone: string | null;
  publicEmail: string | null;
  instagram: string | null;
  instagramHref: string | null;
  whatsapp: string | null;
  whatsappHref: string | null;
  googleMapsUrl: string | null;
  googleMapsHref: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleProof: string | null;
  salkayPitch: string | null;
  recommendedChannel: RecommendedChannel;
  salesType: RestaurantSalesType;
  emailApproach: string;
  emailSubject: string;
  emailBody: string;
  copyText: string;
  hasPublicEmail: boolean;
};

export type NoWebsiteOpportunity = RestaurantSalesDraft & {
  salesType: typeof NO_WEBSITE_SALES_TYPE;
};

export type WebsiteProblemOpportunity = RestaurantSalesDraft & {
  salesType: typeof WEBSITE_PROBLEM_SALES_TYPE;
  website: string | null;
  problems: string[];
};

export function restaurantSalesType(status: RestaurantWebsiteStatus): RestaurantSalesType | null {
  if (status === "NO_WEBSITE") return NO_WEBSITE_SALES_TYPE;
  if (WEBSITE_PROBLEM_STATUSES.includes(status)) return WEBSITE_PROBLEM_SALES_TYPE;
  return null;
}

export function usesWebsiteProblemCopy(status: RestaurantWebsiteStatus) {
  return restaurantSalesType(status) === WEBSITE_PROBLEM_SALES_TYPE;
}

export function usesNoWebsiteCopy(status: RestaurantWebsiteStatus) {
  return status === "NO_WEBSITE";
}

export function blocksRestaurantSalesEmail(status: RestaurantWebsiteStatus) {
  return NO_SALES_EMAIL_STATUSES.includes(status);
}

export function websiteProblemPoints(
  lead: Pick<RestaurantLead, "problem1" | "problem2" | "problem3">,
) {
  return [lead.problem1, lead.problem2, lead.problem3].map((item) => blankToNull(item)).filter((item): item is string => Boolean(item));
}

export function recommendedContactChannel(lead: RestaurantLeadContactSlice): RecommendedChannel {
  const email = blankToNull(lead.publicEmail);
  if (email) {
    return { channel: "EMAIL", label: recommendedContactChannelLabels.EMAIL, value: email, href: `mailto:${email}` };
  }

  const instagram = blankToNull(lead.instagram);
  const instagramLink = instagramHref(instagram);
  if (instagram && instagramLink) {
    return {
      channel: "INSTAGRAM",
      label: recommendedContactChannelLabels.INSTAGRAM,
      value: instagram,
      href: instagramLink,
    };
  }

  const whatsapp = blankToNull(lead.whatsapp);
  const whatsappLink = whatsappHref(whatsapp);
  if (whatsapp && whatsappLink) {
    return {
      channel: "WHATSAPP",
      label: recommendedContactChannelLabels.WHATSAPP,
      value: whatsapp,
      href: whatsappLink,
    };
  }

  const phone = blankToNull(lead.phone);
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    return {
      channel: "PHONE",
      label: recommendedContactChannelLabels.PHONE,
      value: phone,
      href: digits ? `tel:${phone}` : null,
    };
  }

  return { channel: "NONE", label: recommendedContactChannelLabels.NONE, value: null, href: null };
}

export function formatGoogleProof(lead: Pick<RestaurantLead, "googleRating" | "googleReviewCount">) {
  const rating =
    typeof lead.googleRating === "number" && Number.isFinite(lead.googleRating)
      ? lead.googleRating.toFixed(1).replace(".", ",")
      : null;
  const reviews =
    typeof lead.googleReviewCount === "number" && Number.isFinite(lead.googleReviewCount)
      ? lead.googleReviewCount
      : null;
  if (rating && reviews != null) return `${rating} · ${reviews} yorum`;
  if (rating) return `${rating} puan`;
  if (reviews != null) return `${reviews} yorum`;
  return null;
}

function venueKind(lead: Pick<RestaurantLead, "restaurantName" | "category">) {
  const hay = [lead.category, lead.restaurantName].filter(Boolean).join(" ").toLocaleLowerCase("tr");
  if (/meyhane/.test(hay)) return { label: "meyhane", demo: "meyhane vitrini" };
  if (/ocakbaşı|ocakbasi|kebap|dürüm|durum/.test(hay)) return { label: "ocakbaşı / kebap", demo: "kebap ve ocakbaşı vitrini" };
  if (/balık|balik|meze/.test(hay)) return { label: "balık restoranı", demo: "balık restoranı vitrini" };
  if (/kahvaltı|kahvalti|brunch|breakfast/.test(hay)) return { label: "kahvaltı / cafe", demo: "kahvaltı ve cafe vitrini" };
  if (/cafe|kahve|coffee/.test(hay)) return { label: "cafe", demo: "cafe vitrini" };
  if (/bosna/.test(hay)) return { label: "restoran", demo: "marka vitrini" };
  return { label: "restoran", demo: "restoran vitrini" };
}

function presenceClauses(lead: RestaurantLeadContactSlice) {
  const parts: string[] = [];
  const proof = formatGoogleProof(lead);
  if (proof) {
    parts.push(`Google’da ${proof} ile görünürsünüz`);
  } else if (blankToNull(lead.googleMapsUrl)) {
    parts.push("Google Haritalar’da görünür bir işletmesiniz");
  }
  if (blankToNull(lead.instagram)) {
    parts.push("Instagram’da da aktif bir hesabınız var");
  }
  return parts;
}

function noWebsiteEmailSubject(lead: RestaurantLeadContactSlice) {
  return `${lead.restaurantName} için size ait bir web sitesi`;
}

function noWebsiteEmailBody(lead: RestaurantLeadContactSlice) {
  const name = lead.restaurantName.trim();
  const district = lead.district.trim();
  const kind = venueKind(lead);
  const presence = presenceClauses(lead);
  const presenceSentence =
    presence.length > 0
      ? `${name} (${district}) olarak ${presence.join("; ")}.`
      : `${name} (${district}) olarak işletmenizi inceledik.`;

  const complement =
    blankToNull(lead.instagram) || blankToNull(lead.googleMapsUrl) || formatGoogleProof(lead)
      ? "Google veya Instagram varlığınızı küçümsemiyoruz. Kendi web siteniz bu görünürlüğü tamamlar: menü, rezervasyon, WhatsApp ve yol tarifi tek yerde, sizin kontrolünüzde olur."
      : "Kendi web siteniz Google görünürlüğü, menü, rezervasyon, WhatsApp, yol tarifi ve marka güveni için size ait bir dijital vitrin olur.";

  return [
    `Merhaba ${name} ekibi,`,
    "",
    presenceSentence,
    "",
    "Araştırmamızda size ait, bağımsız bir web sitesi öne çıkmadı.",
    "",
    complement,
    "",
    "Kendi siteniz şunları sağlar:",
    "• Google’da markanız arandığında açılan resmi sayfa",
    "• Güncel menü",
    "• Rezervasyon",
    "• WhatsApp iletişimi",
    "• Yol tarifi",
    "• Marka güveni ve doğrudan müşteri kazanımı",
    "",
    `İsterseniz ${name} için kısa, restorana özel bir ana sayfa konsepti (${kind.demo}) hazırlayabiliriz. Bu bir toplu satış maili değil; ${name} için bir taslak.`,
    "",
    "Saygılarımızla,",
    "SALKAY",
  ].join("\n");
}

function noWebsiteEmailApproach(lead: RestaurantLeadContactSlice, channel: RecommendedChannel) {
  const presence: string[] = [];
  if (formatGoogleProof(lead) || blankToNull(lead.googleMapsUrl)) presence.push("Google");
  if (blankToNull(lead.instagram)) presence.push("Instagram");
  const presenceText = presence.length > 0 ? `${presence.join(" / ")} varlığını tamamlayan ` : "";
  const pitch = blankToNull(lead.salkayPitch);
  const lines = [
    "NO_WEBSITE_EMAIL. “Siteniz kötü/eski” deme; WEAK/VERY_WEAK site-sorunu metnini kullanma.",
    `${presenceText}bağımsız site: menü + rezervasyon + WhatsApp + Maps + SEO.`,
    `${lead.restaurantName} için küçük demo/anasayfa konsepti teklif et.`,
    `Önerilen kanal: ${channel.label}${channel.value ? ` (${channel.value})` : ""}.`,
  ];
  if (pitch) lines.push(`Dahili pitch: ${pitch}`);
  return lines.join(" ");
}

export function assertNoWebsiteCopySafe(text: string) {
  const folded = text.toLocaleLowerCase("tr");
  return FORBIDDEN_SITE_COPY.filter((phrase) => folded.includes(phrase));
}

export function buildNoWebsiteOpportunity(lead: RestaurantLeadContactSlice): NoWebsiteOpportunity {
  const channel = recommendedContactChannel(lead);
  const emailSubject = noWebsiteEmailSubject(lead);
  const emailBody = noWebsiteEmailBody(lead);
  const publicEmail = blankToNull(lead.publicEmail);
  const instagram = blankToNull(lead.instagram);
  const whatsapp = blankToNull(lead.whatsapp);

  return {
    restaurantName: lead.restaurantName,
    district: lead.district,
    neighborhood: blankToNull(lead.neighborhood),
    phone: blankToNull(lead.phone),
    publicEmail: publicEmail,
    instagram: instagram,
    instagramHref: instagramHref(instagram),
    whatsapp: whatsapp,
    whatsappHref: whatsappHref(whatsapp),
    googleMapsUrl: blankToNull(lead.googleMapsUrl),
    googleMapsHref: mapsHref(lead.googleMapsUrl),
    googleRating: typeof lead.googleRating === "number" ? lead.googleRating : null,
    googleReviewCount: typeof lead.googleReviewCount === "number" ? lead.googleReviewCount : null,
    googleProof: formatGoogleProof(lead),
    salkayPitch: blankToNull(lead.salkayPitch),
    recommendedChannel: channel,
    salesType: NO_WEBSITE_SALES_TYPE,
    emailApproach: noWebsiteEmailApproach(lead, channel),
    emailSubject,
    emailBody,
    copyText: `Konu: ${emailSubject}\n\n${emailBody}`,
    hasPublicEmail: Boolean(publicEmail),
  };
}

export function websiteProblemSalesApproach(lead: Pick<RestaurantLead, "restaurantName" | "problem1" | "problem2" | "problem3">) {
  const problems = websiteProblemPoints(lead);
  return [
    "WEBSITE_PROBLEM_EMAIL. Mevcut sitede görülen somut sorunlar → yeniden tasarım.",
    "NO_WEBSITE “bağımsız site yok” metnini kullanma.",
    problems[0] ? `Somut: ${problems[0]}` : "Somut problem alanı boşsa e-posta yazma.",
  ].join(" ");
}

function websiteProblemEmailSubject(lead: RestaurantLeadContactSlice) {
  return `${lead.restaurantName} web sitesi için kısa bir analiz`;
}

function websiteProblemEmailBody(lead: RestaurantLeadContactSlice) {
  const name = lead.restaurantName.trim();
  const district = lead.district.trim();
  const website = blankToNull(lead.website);
  const problems = websiteProblemPoints(lead);
  const problemLines =
    problems.length > 0
      ? problems.map((item) => `• ${item}`).join("\n")
      : "• Mevcut sitede doğrulanmış somut problem kaydı henüz yok; bu taslak gönderilmez.";

  return [
    `Merhaba ${name} ekibi,`,
    "",
    website
      ? `${name} (${district}) web sitenizi inceledik: ${website}`
      : `${name} (${district}) web sitenizi inceledik.`,
    "",
    "Mevcut sitede gördüğümüz somut noktalar:",
    problemLines,
    "",
    `Bu noktalar menü, rezervasyon ve marka deneyimini etkiliyor. ${name} için mevcut siteyi yeniden tasarlayabiliriz. Bu bir toplu satış maili değil; ${name} için bir taslak.`,
    "",
    "Saygılarımızla,",
    "SALKAY",
  ].join("\n");
}

function websiteProblemEmailApproach(lead: RestaurantLeadContactSlice, channel: RecommendedChannel) {
  const problems = websiteProblemPoints(lead);
  const lines = [
    "WEBSITE_PROBLEM_EMAIL. Mevcut sitede görülen somut sorunlar → yeniden tasarım.",
    "NO_WEBSITE “bağımsız site yok / size ait bir web sitesi” metnini kullanma.",
    `Önerilen kanal: ${channel.label}${channel.value ? ` (${channel.value})` : ""}.`,
  ];
  if (problems[0]) lines.push(`Somut: ${problems[0]}`);
  else lines.push("Somut problem alanı boşsa e-posta yazma.");
  const pitch = blankToNull(lead.salkayPitch);
  if (pitch) lines.push(`Dahili pitch: ${pitch}`);
  return lines.join(" ");
}

export function assertWebsiteProblemCopySafe(text: string) {
  const folded = text.toLocaleLowerCase("tr");
  return FORBIDDEN_NO_WEBSITE_COPY.filter((phrase) => folded.includes(phrase));
}

function salesDraftBase(
  lead: RestaurantLeadContactSlice,
  salesType: RestaurantSalesType,
  channel: RecommendedChannel,
  emailSubject: string,
  emailBody: string,
  emailApproach: string,
): RestaurantSalesDraft {
  const publicEmail = blankToNull(lead.publicEmail);
  const instagram = blankToNull(lead.instagram);
  const whatsapp = blankToNull(lead.whatsapp);
  return {
    restaurantName: lead.restaurantName,
    district: lead.district,
    neighborhood: blankToNull(lead.neighborhood),
    phone: blankToNull(lead.phone),
    publicEmail,
    instagram,
    instagramHref: instagramHref(instagram),
    whatsapp,
    whatsappHref: whatsappHref(whatsapp),
    googleMapsUrl: blankToNull(lead.googleMapsUrl),
    googleMapsHref: mapsHref(lead.googleMapsUrl),
    googleRating: typeof lead.googleRating === "number" ? lead.googleRating : null,
    googleReviewCount: typeof lead.googleReviewCount === "number" ? lead.googleReviewCount : null,
    googleProof: formatGoogleProof(lead),
    salkayPitch: blankToNull(lead.salkayPitch),
    recommendedChannel: channel,
    salesType,
    emailApproach,
    emailSubject,
    emailBody,
    copyText: `Konu: ${emailSubject}\n\n${emailBody}`,
    hasPublicEmail: Boolean(publicEmail),
  };
}

export function buildWebsiteProblemOpportunity(lead: RestaurantLeadContactSlice): WebsiteProblemOpportunity {
  const channel = recommendedContactChannel(lead);
  const emailSubject = websiteProblemEmailSubject(lead);
  const emailBody = websiteProblemEmailBody(lead);
  return {
    ...salesDraftBase(lead, WEBSITE_PROBLEM_SALES_TYPE, channel, emailSubject, emailBody, websiteProblemEmailApproach(lead, channel)),
    salesType: WEBSITE_PROBLEM_SALES_TYPE,
    website: blankToNull(lead.website),
    problems: websiteProblemPoints(lead),
  };
}
