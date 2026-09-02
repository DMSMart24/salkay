import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import {
  ARCHITECTURE_SPEC,
  industryPremiumSource,
  isIndustryCompany,
  renderIndustryEmail,
} from "@/lib/admin/email/templates/premium-industry";

export const ARCHITECTURE_TEMPLATE_NAME = ARCHITECTURE_SPEC.templateName;
export const ARCHITECTURE_TEMPLATE_SUBJECT = ARCHITECTURE_SPEC.subject;
export const ARCHITECTURE_TEMPLATE_CATEGORY = ARCHITECTURE_SPEC.category;

export function isArchitectureCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return isIndustryCompany(ARCHITECTURE_SPEC, input);
}

export function isArchitecturePremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "architecture";
}

export function architecturePremiumSource() {
  return industryPremiumSource(ARCHITECTURE_SPEC);
}

export function renderArchitectureEmail(_source: string, context: CompanyEmailContext) {
  return renderIndustryEmail(ARCHITECTURE_SPEC, context);
}
