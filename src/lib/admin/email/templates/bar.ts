import type { CompanyEmailContext } from "@/lib/admin/email/context";
import {
  compactOutreachSource,
  renderCompactOutreach,
} from "@/lib/admin/email/templates/compact-outreach";
import { BAR_OUTREACH } from "@/lib/admin/email/templates/outreach-copy";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";

export const BAR_TEMPLATE_NAME = BAR_OUTREACH.templateName;
export const BAR_TEMPLATE_SUBJECT = BAR_OUTREACH.subject;
export const BAR_GROUP_NAME = "Barlar";
export const BAR_GROUP_INDUSTRY = "Bar";
export const BAR_TEMPLATE_CATEGORY = BAR_OUTREACH.category;

const BAR_PHRASES = [
  "barlar",
  "cocktail bar",
  "cocktailbar",
  "lounge bar",
  "loungebar",
  "pub",
] as const;

function classifyHay(input: {
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

function hasRestaurantSignal(hay: string) {
  return hay.includes("restoran") || hay.includes("restaurant");
}

function hasStrongBarSignal(hay: string) {
  return BAR_PHRASES.some((phrase) => hay.includes(phrase));
}

function hasBarWord(hay: string) {
  return /(^|[\s/&|,_-])bar($|[\s/&|,_-])/.test(` ${hay} `);
}

export function isBarCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  const hay = classifyHay(input);
  if (!hay) return false;
  if (hasStrongBarSignal(hay)) return true;
  return hasBarWord(hay) && !hasRestaurantSignal(hay);
}

export function isBarPremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "bar";
}

export function barPremiumSource() {
  return compactOutreachSource(BAR_OUTREACH);
}

export function renderBarEmail(_source: string, context: CompanyEmailContext) {
  return renderCompactOutreach(BAR_OUTREACH, context);
}
