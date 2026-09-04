import type { CompanyEmailContext } from "@/lib/admin/email/context";
import {
  compactOutreachSource,
  renderCompactOutreach,
} from "@/lib/admin/email/templates/compact-outreach";
import {
  ARCHITECTURE_OUTREACH,
  AUTOMOTIVE_OUTREACH,
  CONSTRUCTION_OUTREACH,
  HOTEL_OUTREACH,
  REAL_ESTATE_OUTREACH,
  type OutreachCopySpec,
} from "@/lib/admin/email/templates/outreach-copy";
import type { PremiumIndustryKind } from "@/lib/admin/email/templates/premium-kind";

export type IndustryPremiumSpec = OutreachCopySpec & {
  companyPhrases: readonly string[];
  cardPreview: string;
};

export const CONSTRUCTION_SPEC: IndustryPremiumSpec = {
  ...CONSTRUCTION_OUTREACH,
  cardPreview: "İnşaat firmaları için kısa dijital değerlendirme ve ücretsiz örnek.",
  companyPhrases: ["inşaat", "insaat", "construction", "müteahhit", "muteahhit"],
};

export const ARCHITECTURE_SPEC: IndustryPremiumSpec = {
  ...ARCHITECTURE_OUTREACH,
  cardPreview: "Mimarlık ofisleri için kısa portföy notu ve ücretsiz örnek.",
  companyPhrases: ["mimarlık", "mimarlik", "architecture"],
};

export const REAL_ESTATE_SPEC: IndustryPremiumSpec = {
  ...REAL_ESTATE_OUTREACH,
  cardPreview: "Gayrimenkul ofisleri için kısa dijital değerlendirme ve ücretsiz örnek.",
  companyPhrases: ["gayrimenkul", "real estate", "emlak"],
};

export const HOTEL_SPEC: IndustryPremiumSpec = {
  ...HOTEL_OUTREACH,
  cardPreview: "Oteller için kısa dijital not ve ücretsiz örnek.",
  companyPhrases: ["otel", "oteller", "hotel", "hotels"],
};

export const AUTOMOTIVE_SPEC: IndustryPremiumSpec = {
  ...AUTOMOTIVE_OUTREACH,
  cardPreview: "Otomotiv firmaları için kısa dijital fikir ve ücretsiz örnek.",
  companyPhrases: ["otomotiv", "automotive"],
};

export const INDUSTRY_SPECS: Record<PremiumIndustryKind, IndustryPremiumSpec> = {
  construction: CONSTRUCTION_SPEC,
  architecture: ARCHITECTURE_SPEC,
  realEstate: REAL_ESTATE_SPEC,
  hotel: HOTEL_SPEC,
  automotive: AUTOMOTIVE_SPEC,
};

export function industrySpec(kind: PremiumIndustryKind) {
  return INDUSTRY_SPECS[kind];
}

export function classifyIndustryHay(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return [input.industry, input.groupName, input.groupIndustry, input.category]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr")
    .replace(/\s+/g, " ")
    .trim();
}

export function isIndustryCompany(
  spec: IndustryPremiumSpec,
  input: {
    industry?: string | null;
    groupName?: string | null;
    groupIndustry?: string | null;
    category?: string | null;
  },
) {
  const hay = classifyIndustryHay(input);
  if (!hay) return false;
  return spec.companyPhrases.some((phrase) => hay.includes(phrase));
}

export function industryPremiumSource(spec: IndustryPremiumSpec) {
  return compactOutreachSource(spec);
}

export function renderIndustryEmail(spec: IndustryPremiumSpec, context: CompanyEmailContext) {
  return renderCompactOutreach(spec, context);
}
