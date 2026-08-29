import { site } from "@/lib/site";

export const EMAIL_MAX_WIDTH = 700;

export function emailAssetBaseUrl() {
  const configured = process.env.EMAIL_ASSET_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  // salkay.com DNS is still on the registrar host, so email images 404 there.
  // Serve assets from the existing Vercel production hostname until that DNS is switched.
  return "https://salkay.vercel.app";
}

export function emailAssetUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${emailAssetBaseUrl()}${normalized}`;
}

export function emailCtaUrl() {
  const configured = process.env.EMAIL_CTA_URL?.trim();
  if (configured) {
    return configured;
  }
  return `${site.url}/iletisim`;
}

export function isEmailCtaConfigured() {
  return Boolean(process.env.EMAIL_CTA_URL?.trim());
}

export function salkayPhone() {
  return process.env.EMAIL_SALKAY_PHONE?.trim() || "";
}

export const emailAssets = {
  logo: "/email/salkay-logo-transparent.png",
  logoHeader: "/email/salkay-logo-transparent-2x.png",
  logoSource: "/email/salkay-logo-transparent-source.png",
  kay: "/email/kay-restaurant.png",
  kaySource: "/brand/kay/kay-hero-still.png",
  hero: "/email/restaurant-hero-scene.jpg",
  banner: "/email/restaurant-hero-banner.jpg",
} as const;
