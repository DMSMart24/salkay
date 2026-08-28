import type { Dictionary } from "@/i18n/types";
import { tr } from "@/i18n/dictionaries/tr";

/**
 * English copy will be authored in a later phase.
 * The dictionary shape is locked so EN cannot drift from TR.
 */
export const en: Dictionary = {
  ...tr,
  locale: "en",
  ready: false,
};
