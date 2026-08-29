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

export function salkayWhatsAppNumber() {
  let digits = salkayPhone().replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("+")) digits = digits.slice(1);
  digits = digits.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) digits = `90${digits}`;
  if (digits.length < 10 || digits.length > 15) return "";
  return digits;
}

export function whatsAppCtaUrl(message: string) {
  const number = salkayWhatsAppNumber();
  if (!number) return emailCtaUrl();
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function restaurantWhatsAppMessage(companyName: string) {
  return `Merhaba Salih Bey, ${companyName.trim()} için gönderdiğiniz web sitesi analizini inceledim. Detaylı bilgi almak istiyorum.`;
}

export function restaurantCtaUrl(companyName: string) {
  return whatsAppCtaUrl(restaurantWhatsAppMessage(companyName));
}

export function barWhatsAppMessage(companyName: string) {
  return `Merhaba Salih Bey, ${companyName.trim()} için gönderdiğiniz web sitesi analizini inceledim. Barımızın dijital görünümü ve rezervasyon süreci hakkında detaylı bilgi almak istiyorum.`;
}

export function barCtaUrl(companyName: string) {
  return whatsAppCtaUrl(barWhatsAppMessage(companyName));
}

export const emailAssets = {
  logo: "/email/salkay-logo-transparent.png",
  logoHeader: "/email/salkay-logo-transparent-2x.png",
  logoSource: "/email/salkay-logo-transparent-source.png",
  kay: "/email/kay-restaurant.png",
  kaySource: "/brand/kay/kay-hero-still.png",
  hero: "/email/restaurant-hero-scene.jpg",
  banner: "/email/restaurant-hero-banner.jpg",
  heroMobile: "/email/restaurant-hero-mobile-final.jpg",
} as const;
