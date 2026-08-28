import { site, type SiteLocale } from "@/lib/site";

export const locales = site.locales;
export type Locale = SiteLocale;

export const defaultLocale: Locale = site.defaultLocale;

/**
 * Launch serves Turkish at the URL root (no `/tr` prefix).
 * DE and EN will use prefix routing: `/de`, `/en`.
 */
export const localePathPrefix: Record<Locale, string> = {
  tr: "",
  de: "/de",
  en: "/en",
};

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  de: "Deutsch",
  en: "English",
};

export const localeOg: Record<Locale, string> = {
  tr: "tr_TR",
  de: "de_DE",
  en: "en_US",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
