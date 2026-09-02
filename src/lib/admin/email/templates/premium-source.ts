import { architecturePremiumSource } from "@/lib/admin/email/templates/architecture";
import { automotivePremiumSource } from "@/lib/admin/email/templates/automotive";
import { barPremiumSource } from "@/lib/admin/email/templates/bar";
import { constructionPremiumSource } from "@/lib/admin/email/templates/construction";
import { hotelPremiumSource } from "@/lib/admin/email/templates/hotel";
import {
  industrySpec,
  type IndustryPremiumSpec,
} from "@/lib/admin/email/templates/premium-industry";
import {
  isPremiumIndustryKind,
  type PremiumEmailKind,
  type PremiumIndustryKind,
} from "@/lib/admin/email/templates/premium-kind";
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
  switch (kind) {
    case "bar":
      return "{{companyName}} web sitesi hakkında kısa bir fikir";
    case "restaurant":
      return "{{companyName}} için kısa bir web analizi";
    case "construction":
    case "architecture":
    case "realEstate":
    case "hotel":
    case "automotive":
      return industrySpec(kind).subject;
    default: {
      const _never: never = kind;
      throw new Error(`Unhandled premium email kind: ${_never}`);
    }
  }
}

export function industrySpecForKind(kind: PremiumIndustryKind): IndustryPremiumSpec {
  return industrySpec(kind);
}

export function composePlaceholderForKind(kind: Exclude<PremiumEmailKind, "custom">) {
  if (kind === "bar") return "Bar premium HTML şablonu gönderimde otomatik kullanılır.";
  if (kind === "restaurant") return "Restoran premium HTML şablonu gönderimde otomatik kullanılır.";
  if (isPremiumIndustryKind(kind)) return industrySpec(kind).composePlaceholder;
  const _never: never = kind;
  throw new Error(`Unhandled premium email kind: ${_never}`);
}
