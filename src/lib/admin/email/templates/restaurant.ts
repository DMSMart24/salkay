import type { CompanyEmailContext } from "@/lib/admin/email/context";
import {
  compactOutreachSource,
  renderCompactOutreach,
} from "@/lib/admin/email/templates/compact-outreach";
import { RESTAURANT_OUTREACH } from "@/lib/admin/email/templates/outreach-copy";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";

export const RESTAURANT_TEMPLATE_NAME = RESTAURANT_OUTREACH.templateName;
export const RESTAURANT_TEMPLATE_SUBJECT = RESTAURANT_OUTREACH.subject;
export const RESTAURANT_TEMPLATE_SUBJECT_ALT = "{{companyName}} web sitesi için 3 geliştirme fikri";

export function isRestaurantCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
}) {
  const hay = [input.industry, input.groupName, input.groupIndustry]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr");
  return hay.includes("restoran") || hay.includes("restaurant");
}

export function isRestaurantPremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "restaurant";
}

export function restaurantPremiumSource() {
  return compactOutreachSource(RESTAURANT_OUTREACH);
}

export function renderRestaurantEmail(_source: string, context: CompanyEmailContext) {
  return renderCompactOutreach(RESTAURANT_OUTREACH, context);
}
