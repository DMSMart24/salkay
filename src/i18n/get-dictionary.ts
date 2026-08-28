import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { de } from "@/i18n/dictionaries/de";
import { en } from "@/i18n/dictionaries/en";
import { tr } from "@/i18n/dictionaries/tr";
import type { Dictionary } from "@/i18n/types";

const dictionaries: Record<Locale, Dictionary> = {
  tr,
  de,
  en,
};

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  const dictionary = dictionaries[locale];

  if (!dictionary.ready) {
    return dictionaries[defaultLocale];
  }

  return dictionary;
}

export function resolveLocale(value?: string): Locale {
  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}
