import type { WebsiteStatus } from "@prisma/client";
import { site } from "@/lib/site";
import {
  canShowCustomerWebsiteScore,
  formatScore,
  websiteScoreBand,
  websiteScoreBandLabels,
} from "@/lib/admin/qualification";
import {
  architectureCtaUrl,
  automotiveCtaUrl,
  barCtaUrl,
  constructionCtaUrl,
  emailAssetUrl,
  emailAssets,
  emailCtaUrl,
  hotelCtaUrl,
  isEmailCtaConfigured,
  realEstateCtaUrl,
  restaurantCtaUrl,
  salkayPhone,
  salkayWhatsAppNumber,
} from "@/lib/admin/email/assets";
import type { PremiumIndustryKind } from "@/lib/admin/email/templates/premium-kind";
import { escapeHtml } from "@/lib/admin/email/html";
import {
  localizeOutreachIssues,
  localizeRecommendedServices,
  type LocalizedText,
} from "@/lib/admin/email/localize";
import { fullName } from "@/lib/admin/normalize";

export type CompanyEmailInput = {
  companyName: string;
  website?: string | null;
  generalEmail?: string | null;
  phone?: string | null;
  industry?: string | null;
  city?: string | null;
  district?: string | null;
  websiteScore?: number | null;
  websiteStatus?: WebsiteStatus | null;
  websiteIssues?: string[] | null;
  recommendedServices?: string[] | null;
  contacts?: Array<{
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    isPrimary?: boolean;
  }>;
};

export type CompanyEmailContext = {
  vars: Record<string, string>;
  issues: string[];
  internalIssues: string[];
  customerIssues: string[];
  localizedIssues: LocalizedText[];
  issueReviewNeeded: string[];
  recommendedServices: string[];
  hasScore: boolean;
  noWebsite: boolean;
  scoreLabel: string;
  scoreBandLabel: string;
  analysisIntro: string;
  ctaConfigured: boolean;
  ctaUrl: string;
  phoneVisible: boolean;
  logoUrl: string;
  kayUrl: string;
};

function cleanList(values?: string[] | null) {
  if (!Array.isArray(values)) return [];
  return values.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
}

function withWhatsAppCta(company: CompanyEmailInput, ctaUrl: string): CompanyEmailContext {
  const context = buildCompanyEmailContext(company);
  return {
    ...context,
    ctaUrl,
    ctaConfigured: Boolean(salkayWhatsAppNumber()) || context.ctaConfigured,
    vars: {
      ...context.vars,
      ctaUrl,
    },
  };
}

export function buildRestaurantEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return withWhatsAppCta(company, restaurantCtaUrl(company.companyName));
}

export function buildBarEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  const context = withWhatsAppCta(company, barCtaUrl(company.companyName));
  const recommendedServices = mapBarRecommendedServices(context.recommendedServices);
  const heroUrl = emailAssetUrl(emailAssets.barHero);
  const heroMobileUrl = emailAssetUrl(emailAssets.barHeroMobile);
  return {
    ...context,
    recommendedServices,
    vars: {
      ...context.vars,
      recommendedServices: recommendedServices.join(" · "),
      heroUrl,
      heroMobileUrl,
    },
  };
}

export function buildConstructionEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return withIndustryWhatsApp(company, constructionCtaUrl(company.companyName), INDUSTRY_SERVICE_CHIPS.construction);
}

export function buildArchitectureEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return withIndustryWhatsApp(company, architectureCtaUrl(company.companyName), INDUSTRY_SERVICE_CHIPS.architecture);
}

export function buildRealEstateEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return withIndustryWhatsApp(company, realEstateCtaUrl(company.companyName), INDUSTRY_SERVICE_CHIPS.realEstate);
}

export function buildHotelEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return withIndustryWhatsApp(company, hotelCtaUrl(company.companyName), INDUSTRY_SERVICE_CHIPS.hotel);
}

export function buildAutomotiveEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return withIndustryWhatsApp(company, automotiveCtaUrl(company.companyName), INDUSTRY_SERVICE_CHIPS.automotive);
}

export function buildIndustryEmailContext(
  kind: PremiumIndustryKind,
  company: CompanyEmailInput,
): CompanyEmailContext {
  switch (kind) {
    case "construction":
      return buildConstructionEmailContext(company);
    case "architecture":
      return buildArchitectureEmailContext(company);
    case "realEstate":
      return buildRealEstateEmailContext(company);
    case "hotel":
      return buildHotelEmailContext(company);
    case "automotive":
      return buildAutomotiveEmailContext(company);
    default: {
      const _never: never = kind;
      throw new Error(`Unhandled premium industry kind: ${_never}`);
    }
  }
}

function withIndustryWhatsApp(
  company: CompanyEmailInput,
  ctaUrl: string,
  chips: readonly string[],
): CompanyEmailContext {
  const context = withWhatsAppCta(company, ctaUrl);
  const recommendedServices = mapIndustryRecommendedServices(context.recommendedServices, chips);
  return {
    ...context,
    recommendedServices,
    vars: {
      ...context.vars,
      recommendedServices: recommendedServices.join(" · "),
    },
  };
}

export function buildCompanyEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  const contact = company.contacts?.find((row) => row.isPrimary) ?? company.contacts?.[0];
  const contactName = contact
    ? fullName(contact.firstName ?? "", contact.lastName ?? "")
    : "";
  const companyEmail = company.generalEmail || contact?.email || "";
  const internalIssues = cleanList(company.websiteIssues);
  const localizedIssues = localizeOutreachIssues(internalIssues, "tr");
  const customerIssues = localizedIssues.map((row) => row.customer).slice(0, 4);
  const issueReviewNeeded = localizedIssues.filter((row) => !row.matched).map((row) => row.original);
  const recommendedInternal = cleanList(company.recommendedServices);
  const recommendedServices = localizeRecommendedServices(recommendedInternal, "tr").map((row) => row.customer);
  const noWebsite = company.websiteStatus === "NO_WEBSITE";
  const hasScore = canShowCustomerWebsiteScore(company);
  const formattedScore = hasScore ? formatScore(company.websiteScore) : null;
  const scoreBandLabel =
    hasScore && typeof company.websiteScore === "number"
      ? websiteScoreBandLabels[websiteScoreBand(company.websiteScore)]
      : "";
  const analysisIntro = noWebsite
    ? "Markanızın Google ve sosyal medya dışındaki bağımsız dijital varlığını güçlendirecek modern bir web deneyimi için önemli bir fırsat görüyoruz."
    : "Web sitenizi sizin için kısaca inceledik.";
  const scoreLabel = formattedScore ?? (noWebsite ? "Web sitesi bulunamadı" : "Analiz devam ediyor");
  const phone = salkayPhone();
  const ctaUrl = emailCtaUrl();
  const district = company.district?.trim() || "";
  const city = company.city?.trim() || "";
  const location = [district, city].filter(Boolean).join(", ");
  const unsubscribeUrl = companyEmail
    ? `${site.url}/unsubscribe?email=${encodeURIComponent(companyEmail)}`
    : `${site.url}/unsubscribe`;

  const vars: Record<string, string> = {
    companyName: company.companyName.trim(),
    contactName,
    firstName: contact?.firstName?.trim() || "",
    companyEmail,
    website: company.website?.trim() || "",
    district,
    city,
    location,
    industry: company.industry?.trim() || "",
    score: formattedScore ?? "",
    scoreBand: scoreBandLabel,
    analysisIntro,
    issue_1: customerIssues[0] ?? "",
    issue_2: customerIssues[1] ?? "",
    issue_3: customerIssues[2] ?? "",
    issue_4: customerIssues[3] ?? "",
    recommendedServices: recommendedServices.join(" · "),
    companyPhone: company.phone?.trim() || "",
    unsubscribeUrl,
    salkayPhone: phone,
    salkayEmail: "info@salkay.com",
    salkayWebsite: site.url,
    ctaUrl,
    logoUrl: emailAssetUrl(emailAssets.logo),
    logoHeaderUrl: emailAssetUrl(emailAssets.logoHeader),
    kayUrl: emailAssetUrl(emailAssets.kay),
    heroUrl: emailAssetUrl(emailAssets.hero),
    heroMobileUrl: emailAssetUrl(emailAssets.heroMobile),
  };

  return {
    vars,
    issues: customerIssues,
    internalIssues,
    customerIssues,
    localizedIssues,
    issueReviewNeeded,
    recommendedServices,
    hasScore,
    noWebsite,
    scoreLabel,
    scoreBandLabel,
    analysisIntro,
    ctaConfigured: isEmailCtaConfigured(),
    ctaUrl,
    phoneVisible: Boolean(phone),
    logoUrl: vars.logoUrl,
    kayUrl: vars.kayUrl,
  };
}

const SERVICE_CHIP_LABELS: Record<string, string> = {
  "premium web yeniden tasarım": "Web Tasarımı",
  "web yeniden tasarım": "Web Tasarımı",
  "mobil kullanıcı deneyimi": "Mobil UX",
  "mobil iyileştirme": "Mobil UX",
  "kullanıcı deneyimi yenileme": "Mobil UX",
  "kullanıcı deneyimi iyileştirme": "Mobil UX",
  "rezervasyon sürecinin iyileştirilmesi": "Rezervasyon",
  "rezervasyon entegrasyonu": "Rezervasyon",
  "yerel seo": "Local SEO",
  "seo denetimi": "Local SEO",
  "restoran hikâyesi ve içerik": "İçerik",
  "içerik sadeleştirme": "İçerik",
  "restoran açılış sayfası": "Web Tasarımı",
  "e-ticaret entegrasyonu": "E-ticaret",
  "performans denetimi": "Performans",
  "dönüşüm iyileştirme": "Dönüşüm",
  "bilgi mimarisi": "UX",
  "etkinlik modülü": "Etkinlik Modülü",
  "sosyal medya entegrasyonu": "Sosyal Medya Entegrasyonu",
  "sosyal medya": "Sosyal Medya Entegrasyonu",
};

const BAR_SERVICE_CHIPS = [
  "Web Tasarımı",
  "Mobil UX",
  "Rezervasyon",
  "Etkinlik Modülü",
  "Local SEO",
  "Sosyal Medya Entegrasyonu",
] as const;

const BAR_SERVICE_ALIASES: Record<string, (typeof BAR_SERVICE_CHIPS)[number]> = {
  "web tasarımı": "Web Tasarımı",
  "premium web yeniden tasarım": "Web Tasarımı",
  "web yeniden tasarım": "Web Tasarımı",
  "mobil ux": "Mobil UX",
  "mobil kullanıcı deneyimi": "Mobil UX",
  "mobil iyileştirme": "Mobil UX",
  "kullanıcı deneyimi yenileme": "Mobil UX",
  "kullanıcı deneyimi iyileştirme": "Mobil UX",
  rezervasyon: "Rezervasyon",
  "rezervasyon sürecinin iyileştirilmesi": "Rezervasyon",
  "rezervasyon entegrasyonu": "Rezervasyon",
  "etkinlik modülü": "Etkinlik Modülü",
  "local seo": "Local SEO",
  "yerel seo": "Local SEO",
  "seo denetimi": "Local SEO",
  "sosyal medya entegrasyonu": "Sosyal Medya Entegrasyonu",
  "sosyal medya": "Sosyal Medya Entegrasyonu",
};

function mapBarRecommendedServices(services: string[]) {
  const seen = new Set<string>();
  const chips: string[] = [];
  for (const service of services) {
    const key = service.trim().toLowerCase();
    const label = BAR_SERVICE_ALIASES[key] ?? (BAR_SERVICE_CHIPS as readonly string[]).find((chip) => chip.toLowerCase() === key);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    chips.push(label);
    if (chips.length === 4) break;
  }
  return chips;
}

const INDUSTRY_SERVICE_CHIPS: Record<PremiumIndustryKind, readonly string[]> = {
  construction: ["Web Tasarımı", "Mobil UX", "Portföy", "Local SEO"],
  architecture: ["Web Tasarımı", "Mobil UX", "Portföy", "Local SEO"],
  realEstate: ["Web Tasarımı", "Mobil UX", "İlanlar", "Local SEO"],
  hotel: ["Web Tasarımı", "Mobil UX", "Rezervasyon", "Local SEO"],
  automotive: ["Web Tasarımı", "Mobil UX", "Stok", "Local SEO"],
};

const INDUSTRY_SERVICE_ALIASES: Record<string, string> = {
  "web tasarımı": "Web Tasarımı",
  "premium web yeniden tasarım": "Web Tasarımı",
  "web yeniden tasarım": "Web Tasarımı",
  "mobil ux": "Mobil UX",
  "mobil kullanıcı deneyimi": "Mobil UX",
  "mobil iyileştirme": "Mobil UX",
  "kullanıcı deneyimi yenileme": "Mobil UX",
  "kullanıcı deneyimi iyileştirme": "Mobil UX",
  rezervasyon: "Rezervasyon",
  "rezervasyon sürecinin iyileştirilmesi": "Rezervasyon",
  "rezervasyon entegrasyonu": "Rezervasyon",
  portföy: "Portföy",
  "proje portföyü": "Portföy",
  ilanlar: "İlanlar",
  "ilan portföyü": "İlanlar",
  stok: "Stok",
  "stok & model": "Stok",
  "local seo": "Local SEO",
  "yerel seo": "Local SEO",
  "seo denetimi": "Local SEO",
};

function mapIndustryRecommendedServices(services: string[], chips: readonly string[]) {
  const seen = new Set<string>();
  const mapped: string[] = [];
  for (const service of services) {
    const key = service.trim().toLowerCase();
    const label =
      INDUSTRY_SERVICE_ALIASES[key] ?? chips.find((chip) => chip.toLowerCase() === key);
    if (!label || !chips.includes(label) || seen.has(label)) continue;
    seen.add(label);
    mapped.push(label);
    if (mapped.length === 4) break;
  }
  return mapped;
}

function serviceChipLabel(service: string) {
  const mapped = SERVICE_CHIP_LABELS[service.trim().toLowerCase()];
  if (mapped) return mapped;
  const compact = service.trim().replace(/\s+/g, " ");
  return compact.length > 18 ? `${compact.slice(0, 16)}…` : compact;
}

export function issueRowsHtml(issues: string[]) {
  const rows = issues.map((item) => String(item).trim()).filter(Boolean).slice(0, 4);
  if (rows.length === 0) {
    return "";
  }

  return rows
    .map((issue, index) => {
      const last = index === rows.length - 1;
      const border = last ? "none" : "1px solid #203047";
      return `<tr>
          <td style="padding:12px 0;border-bottom:${border};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td valign="top" width="22" style="width:22px;padding:3px 10px 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      <td width="16" height="16" bgcolor="#16C7FF" align="center" style="background:#16C7FF;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:16px;color:#07111F;font-weight:700;">✓</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#FFFFFF;">${escapeHtml(issue)}</td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");
}

export function developmentAreasHtml(issues: string[]) {
  const rows = issueRowsHtml(issues);
  if (!rows) return "";
  return `<div style="margin-top:20px;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">ÖNE ÇIKAN GELİŞİM ALANLARI</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${rows}
      </table>
    </div>`;
}

function scoreBarHtml(score: number) {
  const filled = Math.max(0, Math.min(10, Math.round(score)));
  const cells = Array.from({ length: 10 }, (_, index) => {
    const on = index < filled;
    return `<td width="18" height="6" bgcolor="${on ? "#16C7FF" : "#1A2B42"}" style="width:18px;height:6px;background:${on ? "#16C7FF" : "#1A2B42"};border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>`;
  }).join(`<td width="5" style="width:5px;font-size:0;line-height:0;">&nbsp;</td>`);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;"><tr>${cells}</tr></table>`;
}

function noWebsiteScoreBlockHtml() {
  const items = [
    "Marka odaklı web sitesi",
    "Mobil deneyim",
    "Menü",
    "Rezervasyon",
    "WhatsApp",
    "Google / Local SEO",
  ];
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#FFFFFF;">• ${escapeHtml(item)}</td></tr>`,
    )
    .join("");
  return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">DİJİTAL FIRSAT</p>
    <p style="margin:0 0 10px;font-family:Georgia,Times,serif;font-size:18px;line-height:24px;color:#FFFFFF;font-weight:700;">Bağımsız web sitesi bulunamadı</p>
    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#B8C3D1;">Markanızın Google ve sosyal medya dışındaki bağımsız dijital varlığını güçlendirecek modern bir web deneyimi için önemli bir fırsat görüyoruz.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>`;
}

export function scoreBlockHtml(context: CompanyEmailContext) {
  if (context.noWebsite) {
    return noWebsiteScoreBlockHtml();
  }

  if (!context.hasScore) {
    return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">DİJİTAL WEB SKORU</p>
      <p style="margin:10px 0 0;font-family:Georgia,Times,serif;font-size:18px;line-height:24px;color:#D5AA62;font-weight:700;">Analiz devam ediyor</p>`;
  }

  const numericScore = Number(context.scoreLabel.replace(",", "."));
  const scoreText = escapeHtml(context.scoreLabel);
  const band = escapeHtml(context.scoreBandLabel || "Geliştirme potansiyeli");
  return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">DİJİTAL WEB SKORU</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td valign="middle">
          <p style="margin:0;font-family:Georgia,Times,serif;line-height:40px;">
            <span style="font-size:40px;color:#16C7FF;font-weight:700;">${scoreText}</span>
            <span style="font-size:16px;color:#B8C3D1;font-weight:400;">&nbsp;/&nbsp;10</span>
          </p>
        </td>
        <td valign="middle" align="right" style="padding-left:10px;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="right" style="border-collapse:collapse;">
            <tr>
              <td bgcolor="#0B1729" style="background:#0B1729;border:1px solid #D5AA62;border-radius:4px;padding:5px 8px;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:12px;letter-spacing:0.08em;text-transform:uppercase;color:#D5AA62;white-space:nowrap;">${band}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${Number.isFinite(numericScore) ? scoreBarHtml(numericScore) : ""}
    <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#B8C3D1;">Tasarım, mobil kullanıcı deneyimi, navigasyon, dönüşüm yapısı ve dijital görünürlük açısından gerçekleştirdiğimiz incelemede geliştirme potansiyeli tespit ettik.</p>`;
}

export function recommendedServicesChipsHtml(services: string[]) {
  const chips = services.map((item) => String(item).trim()).filter(Boolean).slice(0, 4).map(serviceChipLabel);
  if (chips.length === 0) return "";

  const chipCell = (label: string) =>
    `<td width="50%" valign="top" style="width:50%;padding:0 6px 8px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td bgcolor="#0B1729" height="32" valign="middle" style="background:#0B1729;border:1px solid #D5AA62;border-radius:6px;padding:7px 10px;height:32px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#FFFFFF;white-space:nowrap;"><span style="color:#16C7FF;">●</span>&nbsp;${escapeHtml(label)}</p>
              </td>
            </tr>
          </table>
        </td>`;

  const rows: string[] = [];
  for (let index = 0; index < chips.length; index += 2) {
    const first = chips[index];
    const second = chips[index + 1];
    if (!first) continue;
    rows.push(`<tr>${chipCell(first)}${second ? chipCell(second) : "<td width=\"50%\" style=\"width:50%;padding:0;\"></td>"}</tr>`);
  }

  return `<div style="margin-top:20px;">
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">ÖNERİLEN SALKAY HİZMETLERİ</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${rows.join("")}
      </table>
    </div>`;
}

export function phoneBlockHtml(context: CompanyEmailContext) {
  if (!context.phoneVisible) {
    return "";
  }
  return `<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;">${escapeHtml(context.vars.salkayPhone)}</p>`;
}
