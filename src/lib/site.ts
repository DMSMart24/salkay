export const site = {
  name: "SALKAY",
  legalName: "SALKAY",
  domain: "salkay.com",
  domainTr: "salkay.com.tr",
  url: "https://salkay.com",
  email: "info@salkay.com",
  whatsappDisplay: "+90 539 748 24 29",
  whatsappE164: "905397482429",
  location: "İstanbul, Türkiye",
  locale: "tr_TR",
  locales: ["tr", "de", "en"] as const,
  defaultLocale: "tr" as const,
} as const;

export type SiteLocale = (typeof site.locales)[number];

export function siteMailto() {
  return `mailto:${site.email}`;
}

export function siteWhatsAppUrl(message?: string) {
  const url = `https://wa.me/${site.whatsappE164}`;
  if (!message) {
    return url;
  }

  return `${url}?text=${encodeURIComponent(message)}`;
}
