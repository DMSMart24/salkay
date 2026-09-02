import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import {
  HOTEL_SPEC,
  industryPremiumSource,
  isIndustryCompany,
  renderIndustryEmail,
} from "@/lib/admin/email/templates/premium-industry";

export const HOTEL_TEMPLATE_NAME = HOTEL_SPEC.templateName;
export const HOTEL_TEMPLATE_SUBJECT = HOTEL_SPEC.subject;
export const HOTEL_TEMPLATE_CATEGORY = HOTEL_SPEC.category;

export function isHotelCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return isIndustryCompany(HOTEL_SPEC, input);
}

export function isHotelPremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "hotel";
}

export function hotelPremiumSource() {
  return industryPremiumSource(HOTEL_SPEC);
}

export function renderHotelEmail(_source: string, context: CompanyEmailContext) {
  return renderIndustryEmail(HOTEL_SPEC, context);
}
