import type { CompanyPriority, WebsiteStatus } from "@prisma/client";

export const OPPORTUNITY_TYPES = [
  "WEBSITE_NEW",
  "WEBSITE_REDESIGN",
  "MOBILE_UX",
  "RESERVATION_FLOW",
  "LOCAL_SEO",
  "BRAND_REFRESH",
  "ECOMMERCE_ORDERING",
  "DIGITAL_MENU",
  "OTHER",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export type LeadPriorityBand = "A+" | "A" | "B" | "C" | "D";

export type WebsiteScoreBand = "VERY_WEAK" | "WEAK" | "IMPROVABLE" | "GOOD" | "VERY_GOOD";

export const opportunityLabels: Record<OpportunityType, string> = {
  WEBSITE_NEW: "Website Neubau",
  WEBSITE_REDESIGN: "Website Redesign",
  MOBILE_UX: "Mobil UX",
  RESERVATION_FLOW: "Rezervasyon akışı",
  LOCAL_SEO: "Local SEO",
  BRAND_REFRESH: "Marka yenileme",
  ECOMMERCE_ORDERING: "Sipariş / e-ticaret",
  DIGITAL_MENU: "Dijital menü",
  OTHER: "Diğer",
};

export function isOpportunityType(value: string): value is OpportunityType {
  return OPPORTUNITY_TYPES.includes(value as OpportunityType);
}

export function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value.toFixed(1).replace(".", ",");
}

export function clampScore(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value * 10) / 10));
}

export function websiteScoreBand(score: number): WebsiteScoreBand {
  if (score <= 2) return "VERY_WEAK";
  if (score <= 4) return "WEAK";
  if (score <= 6) return "IMPROVABLE";
  if (score <= 8) return "GOOD";
  return "VERY_GOOD";
}

export const websiteScoreBandLabels: Record<WebsiteScoreBand, string> = {
  VERY_WEAK: "Çok Zayıf",
  WEAK: "Zayıf",
  IMPROVABLE: "Geliştirilebilir",
  GOOD: "İyi",
  VERY_GOOD: "Çok İyi",
};

export function websiteStatusFromScore(score: number): WebsiteStatus {
  const band = websiteScoreBand(score);
  switch (band) {
    case "VERY_WEAK":
      return "VERY_WEAK";
    case "WEAK":
      return "WEAK";
    case "IMPROVABLE":
      return "IMPROVABLE";
    case "GOOD":
      return "GOOD";
    case "VERY_GOOD":
      return "VERY_GOOD";
    default: {
      const _never: never = band;
      return _never;
    }
  }
}

export function leadPriorityBand(score: number): LeadPriorityBand {
  if (score >= 9) return "A+";
  if (score >= 8) return "A";
  if (score >= 7) return "B";
  if (score >= 5) return "C";
  return "D";
}

export const leadPriorityLabels: Record<LeadPriorityBand, string> = {
  "A+": "A+ — hemen öncelik",
  A: "A — yüksek öncelik",
  B: "B — ilginç",
  C: "C — düşük öncelik",
  D: "D — şu an öncelik yok",
};

export function leadPriorityRange(band: LeadPriorityBand): { gte?: number; lt?: number } {
  switch (band) {
    case "A+":
      return { gte: 9 };
    case "A":
      return { gte: 8, lt: 9 };
    case "B":
      return { gte: 7, lt: 8 };
    case "C":
      return { gte: 5, lt: 7 };
    case "D":
      return { lt: 5 };
    default: {
      const _never: never = band;
      return _never;
    }
  }
}

export function companyPriorityFromLeadScore(score: number): CompanyPriority {
  const band = leadPriorityBand(score);
  switch (band) {
    case "A+":
    case "A":
      return "HIGH";
    case "B":
      return "MEDIUM";
    case "C":
    case "D":
      return "LOW";
    default: {
      const _never: never = band;
      return _never;
    }
  }
}

export function canShowCustomerWebsiteScore(input: {
  websiteStatus?: WebsiteStatus | null;
  websiteScore?: number | null;
  website?: string | null;
}) {
  if (input.websiteStatus === "NO_WEBSITE" || input.websiteStatus === "NOT_VERIFIED") {
    return false;
  }
  if (input.websiteStatus === "UNKNOWN" && !input.website) {
    return false;
  }
  return (
    typeof input.websiteScore === "number" &&
    input.websiteScore >= 1 &&
    input.websiteScore <= 10
  );
}

export function sanitizeQualificationWrite(input: {
  websiteStatus?: WebsiteStatus | null;
  websiteScore?: number | null;
  scoreDesign?: number | null;
  scoreMobile?: number | null;
  scoreUx?: number | null;
  scoreConversion?: number | null;
  scoreTechnical?: number | null;
  scoreSeo?: number | null;
  leadScore?: number | null;
  opportunities?: string[] | null;
}) {
  const websiteStatus = input.websiteStatus ?? "UNKNOWN";
  const blocked = websiteStatus === "NO_WEBSITE" || websiteStatus === "NOT_VERIFIED";
  const parts = {
    design: blocked ? null : input.scoreDesign ?? null,
    mobile: blocked ? null : input.scoreMobile ?? null,
    ux: blocked ? null : input.scoreUx ?? null,
    conversion: blocked ? null : input.scoreConversion ?? null,
    technical: blocked ? null : input.scoreTechnical ?? null,
    seo: blocked ? null : input.scoreSeo ?? null,
  };
  const hasParts = Object.values(parts).some((value) => typeof value === "number");
  const websiteScore = blocked
    ? null
    : input.websiteScore ?? (hasParts ? totalFromParts(parts) : null);

  return {
    websiteStatus,
    websiteScore,
    leadScore: input.leadScore ?? null,
    scoreDesign: parts.design,
    scoreMobile: parts.mobile,
    scoreUx: parts.ux,
    scoreConversion: parts.conversion,
    scoreTechnical: parts.technical,
    scoreSeo: parts.seo,
    opportunities: (input.opportunities ?? []).filter(isOpportunityType),
  };
}

export function totalFromParts(parts: {
  design?: number | null;
  mobile?: number | null;
  ux?: number | null;
  conversion?: number | null;
  technical?: number | null;
  seo?: number | null;
}) {
  const total =
    clampScore(parts.design ?? 0, 2) +
    clampScore(parts.mobile ?? 0, 2) +
    clampScore(parts.ux ?? 0, 2) +
    clampScore(parts.conversion ?? 0, 2) +
    clampScore(parts.technical ?? 0, 1) +
    clampScore(parts.seo ?? 0, 1);
  return clampScore(total, 10);
}
