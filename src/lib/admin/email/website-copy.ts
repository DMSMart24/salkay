import type { WebsiteStatus } from "@prisma/client";

export type CustomerWebsiteCopyKind = "verified" | "not_verified" | "no_website";

export const CUSTOMER_ANALYSIS_INTRO = {
  verified: "Web sitenizi sizin için kısaca inceledik.",
  not_verified: "Dijital görünürlüğünüz için bazı geliştirme fırsatları belirledik.",
  no_website:
    "Markanızın Google ve sosyal medya dışındaki bağımsız dijital varlığını güçlendirecek modern bir web deneyimi için önemli bir fırsat görüyoruz.",
} as const;

const ANALYSABLE_STATUSES: readonly WebsiteStatus[] = [
  "GOOD",
  "AVERAGE",
  "NEEDS_UPGRADE",
  "VERY_WEAK",
  "WEAK",
  "IMPROVABLE",
  "VERY_GOOD",
];

export function isAnalysableWebsiteStatus(status?: WebsiteStatus | null): boolean {
  return Boolean(status && ANALYSABLE_STATUSES.includes(status));
}

export function customerWebsiteCopyKind(input: {
  websiteStatus?: WebsiteStatus | null;
  website?: string | null;
}): CustomerWebsiteCopyKind {
  if (input.websiteStatus === "NO_WEBSITE") return "no_website";
  if (input.websiteStatus === "NOT_VERIFIED") return "not_verified";
  if (input.websiteStatus === "UNKNOWN") return "not_verified";
  if (!input.websiteStatus) return "not_verified";
  if (!isAnalysableWebsiteStatus(input.websiteStatus)) return "not_verified";
  return "verified";
}

export function customerAnalysisIntro(input: {
  websiteStatus?: WebsiteStatus | null;
  website?: string | null;
}) {
  return CUSTOMER_ANALYSIS_INTRO[customerWebsiteCopyKind(input)];
}

export type PreviewWebsiteMode = "actual" | "verified" | "not_verified" | "no_website";

export function parsePreviewWebsiteMode(raw: string): PreviewWebsiteMode {
  switch (raw) {
    case "verified":
    case "not_verified":
    case "no_website":
    case "actual":
      return raw;
    default:
      return "actual";
  }
}

export function applyPreviewWebsiteMode<
  T extends { websiteStatus?: WebsiteStatus | null; websiteScore?: number | null },
>(company: T, mode: PreviewWebsiteMode): T {
  switch (mode) {
    case "actual":
      return company;
    case "not_verified":
      return { ...company, websiteStatus: "NOT_VERIFIED", websiteScore: null };
    case "no_website":
      return { ...company, websiteStatus: "NO_WEBSITE", websiteScore: null };
    case "verified":
      return {
        ...company,
        websiteStatus: isAnalysableWebsiteStatus(company.websiteStatus) ? company.websiteStatus : "WEAK",
        websiteScore: typeof company.websiteScore === "number" ? company.websiteScore : 4.2,
      };
    default: {
      const _never: never = mode;
      return _never;
    }
  }
}
