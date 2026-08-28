import { site } from "@/lib/site";

export const EMAIL_MAX_WIDTH = 640;

export function emailAssetBaseUrl() {
  const configured = process.env.EMAIL_ASSET_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return site.url.replace(/\/$/, "");
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
  logo: "/email/salkay-logo.svg",
  kay: "/brand/kay/kay-hero-still.png",
  kayFallback: "/brand/kay/kay-hero-still.webp",
} as const;
