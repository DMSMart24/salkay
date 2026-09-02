import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import {
  CONSTRUCTION_SPEC,
  industryPremiumSource,
  isIndustryCompany,
  renderIndustryEmail,
} from "@/lib/admin/email/templates/premium-industry";

export const CONSTRUCTION_TEMPLATE_NAME = CONSTRUCTION_SPEC.templateName;
export const CONSTRUCTION_TEMPLATE_SUBJECT = CONSTRUCTION_SPEC.subject;
export const CONSTRUCTION_TEMPLATE_CATEGORY = CONSTRUCTION_SPEC.category;

export function isConstructionCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return isIndustryCompany(CONSTRUCTION_SPEC, input);
}

export function isConstructionPremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "construction";
}

export function constructionPremiumSource() {
  return industryPremiumSource(CONSTRUCTION_SPEC);
}

export function renderConstructionEmail(_source: string, context: CompanyEmailContext) {
  return renderIndustryEmail(CONSTRUCTION_SPEC, context);
}
