import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import {
  AUTOMOTIVE_SPEC,
  industryPremiumSource,
  isIndustryCompany,
  renderIndustryEmail,
} from "@/lib/admin/email/templates/premium-industry";

export const AUTOMOTIVE_TEMPLATE_NAME = AUTOMOTIVE_SPEC.templateName;
export const AUTOMOTIVE_TEMPLATE_SUBJECT = AUTOMOTIVE_SPEC.subject;
export const AUTOMOTIVE_TEMPLATE_CATEGORY = AUTOMOTIVE_SPEC.category;

export function isAutomotiveCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return isIndustryCompany(AUTOMOTIVE_SPEC, input);
}

export function isAutomotivePremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "automotive";
}

export function automotivePremiumSource() {
  return industryPremiumSource(AUTOMOTIVE_SPEC);
}

export function renderAutomotiveEmail(_source: string, context: CompanyEmailContext) {
  return renderIndustryEmail(AUTOMOTIVE_SPEC, context);
}
