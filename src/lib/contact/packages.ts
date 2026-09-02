import { routes } from "@/lib/routes";
import type { ContactProjectType } from "@/lib/contact/types";

export const CONTACT_PACKAGE_SLUGS = [
  "start",
  "business",
  "professional",
  "signature",
  "custom",
  "care",
  "care-pro",
] as const;

export type ContactPackageSlug = (typeof CONTACT_PACKAGE_SLUGS)[number];

export type ResolvedContactPackage = {
  slug: ContactPackageSlug;
  label: string;
  displayName: string;
  service: ContactProjectType;
};

export function isContactPackageSlug(
  value: string | undefined,
): value is ContactPackageSlug {
  return Boolean(
    value && CONTACT_PACKAGE_SLUGS.includes(value as ContactPackageSlug),
  );
}

export function resolveContactPackage(
  value: string | undefined,
): ResolvedContactPackage | null {
  if (!isContactPackageSlug(value)) {
    return null;
  }

  switch (value) {
    case "start":
      return {
        slug: value,
        label: "START",
        displayName: "START",
        service: "Web Tasarım",
      };
    case "business":
      return {
        slug: value,
        label: "BUSINESS",
        displayName: "BUSINESS",
        service: "Web Tasarım",
      };
    case "professional":
      return {
        slug: value,
        label: "PROFESSIONAL",
        displayName: "PROFESSIONAL",
        service: "Web Tasarım",
      };
    case "signature":
      return {
        slug: value,
        label: "SALKAY SIGNATURE",
        displayName: "SALKAY SIGNATURE",
        service: "Web Tasarım",
      };
    case "custom":
      return {
        slug: value,
        label: "ÖZEL YAZILIM",
        displayName: "ÖZEL YAZILIM",
        service: "Özel Yazılım",
      };
    case "care":
      return {
        slug: value,
        label: "CARE",
        displayName: "CARE",
        service: "Diğer",
      };
    case "care-pro":
      return {
        slug: value,
        label: "CARE PRO",
        displayName: "CARE PRO",
        service: "Diğer",
      };
    default: {
      const _never: never = value;
      return _never;
    }
  }
}

export function contactPackageHref(slug: ContactPackageSlug) {
  return `${routes.contact}?package=${slug}`;
}
