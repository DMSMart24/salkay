import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import {
  REAL_ESTATE_SPEC,
  industryPremiumSource,
  isIndustryCompany,
  renderIndustryEmail,
} from "@/lib/admin/email/templates/premium-industry";

export const REAL_ESTATE_TEMPLATE_NAME = REAL_ESTATE_SPEC.templateName;
export const REAL_ESTATE_TEMPLATE_SUBJECT = REAL_ESTATE_SPEC.subject;
export const REAL_ESTATE_TEMPLATE_CATEGORY = REAL_ESTATE_SPEC.category;

export function isRealEstateCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return isIndustryCompany(REAL_ESTATE_SPEC, input);
}

export function isRealEstatePremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "realEstate";
}

export function realEstatePremiumSource() {
  return industryPremiumSource(REAL_ESTATE_SPEC);
}

export function renderRealEstateEmail(_source: string, context: CompanyEmailContext) {
  return renderIndustryEmail(REAL_ESTATE_SPEC, context);
}
