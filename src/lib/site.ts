export const site = {
  name: "SALKAY",
  legalName: "SALKAY",
  domain: "salkay.com",
  domainTr: "salkay.com.tr",
  url: "https://salkay.com",
  email: "merhaba@salkay.com",
  location: "İstanbul, Türkiye",
  locale: "tr_TR",
  locales: ["tr", "de", "en"] as const,
  defaultLocale: "tr" as const,
} as const;

export type SiteLocale = (typeof site.locales)[number];
