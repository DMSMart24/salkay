import { architecturePremiumSource } from "@/lib/admin/email/templates/architecture";
import { automotivePremiumSource } from "@/lib/admin/email/templates/automotive";
import { barPremiumSource } from "@/lib/admin/email/templates/bar";
import { constructionPremiumSource } from "@/lib/admin/email/templates/construction";
import { hotelPremiumSource } from "@/lib/admin/email/templates/hotel";
import { outreachCopy } from "@/lib/admin/email/templates/outreach-copy";
import {
  industrySpec,
  type IndustryPremiumSpec,
} from "@/lib/admin/email/templates/premium-industry";
import type { PremiumEmailKind, PremiumIndustryKind } from "@/lib/admin/email/templates/premium-kind";
import { realEstatePremiumSource } from "@/lib/admin/email/templates/real-estate";
import { restaurantPremiumSource } from "@/lib/admin/email/templates/restaurant";

export function premiumHtmlSource(kind: Exclude<PremiumEmailKind, "custom">) {
  switch (kind) {
    case "bar":
      return barPremiumSource();
    case "restaurant":
      return restaurantPremiumSource();
    case "construction":
      return constructionPremiumSource();
    case "architecture":
      return architecturePremiumSource();
    case "realEstate":
      return realEstatePremiumSource();
    case "hotel":
      return hotelPremiumSource();
    case "automotive":
      return automotivePremiumSource();
    default: {
      const _never: never = kind;
      throw new Error(`Unhandled premium email kind: ${_never}`);
    }
  }
}

export function premiumSubject(kind: Exclude<PremiumEmailKind, "custom">) {
  return outreachCopy(kind).subject;
}

export function industrySpecForKind(kind: PremiumIndustryKind): IndustryPremiumSpec {
  return industrySpec(kind);
}

export function composePlaceholderForKind(kind: Exclude<PremiumEmailKind, "custom">) {
  return outreachCopy(kind).composePlaceholder;
}
