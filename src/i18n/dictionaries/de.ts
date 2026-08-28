import type { Dictionary } from "@/i18n/types";
import { tr } from "@/i18n/dictionaries/tr";

/**
 * German copy will be authored in a later phase.
 * The dictionary shape is locked so DE cannot drift from TR.
 */
export const de: Dictionary = {
  ...tr,
  locale: "de",
  ready: false,
};
