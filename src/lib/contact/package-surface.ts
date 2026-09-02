import { webDesignContent as copy } from "@/components/web-design/content";
import {
  resolveContactPackage,
  type ContactPackageSlug,
  type ResolvedContactPackage,
} from "@/lib/contact/packages";

const SHARED_LEAD =
  "Projenizi kısaca anlatın, size uygun kapsamı birlikte netleştirelim.";

export type ContactPackageSurface = ResolvedContactPackage & {
  priceLabel: string;
  lead: string;
  messagePrefill: string;
};

function priceLabelFor(slug: ContactPackageSlug): string {
  switch (slug) {
    case "start":
    case "business":
    case "professional": {
      const level = copy.levels.find((item) => item.id === slug);
      return level
        ? `${level.priceAmount} ${level.priceUnit} ${level.priceCaption}`
        : "";
    }
    case "signature":
      return copy.signature.price;
    case "custom":
      return copy.custom.price;
    case "care":
    case "care-pro": {
      const plan = copy.care.plans.find((item) => item.id === slug);
      return plan ? `${plan.priceAmount} ${plan.priceUnit}` : "";
    }
    default: {
      const _never: never = slug;
      return _never;
    }
  }
}

export function resolveContactPackageSurface(
  value: string | undefined,
): ContactPackageSurface | null {
  const pkg = resolveContactPackage(value);
  if (!pkg) {
    return null;
  }

  return {
    ...pkg,
    priceLabel: priceLabelFor(pkg.slug),
    lead: SHARED_LEAD,
    messagePrefill: `İlgilendiğim paket: ${pkg.displayName}\n\n`,
  };
}
