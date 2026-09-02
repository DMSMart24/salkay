export type PremiumEmailKind =
  | "bar"
  | "restaurant"
  | "construction"
  | "architecture"
  | "realEstate"
  | "hotel"
  | "automotive"
  | "custom";

export const PREMIUM_INDUSTRY_KINDS = [
  "construction",
  "architecture",
  "realEstate",
  "hotel",
  "automotive",
] as const;

export type PremiumIndustryKind = (typeof PREMIUM_INDUSTRY_KINDS)[number];

function normalizeName(name: string) {
  return name.replace(/[—–−-]/g, "-").toLocaleLowerCase("tr");
}

function categoryOf(input: { category?: string | null }) {
  return (input.category ?? "").toLocaleUpperCase("tr");
}

function isBarIdentity(input: { name?: string | null; category?: string | null }) {
  const category = categoryOf(input);
  if (category === "BAR" || category === "BARLAR") return true;
  const name = (input.name ?? "").trim();
  if (name === "BAR — Premium Web Sitesi Analizi") return true;
  const normalized = normalizeName(name);
  if (normalized.includes("restoran") || normalized.includes("restaurant")) return false;
  return /\bbar\b/.test(normalized) && normalized.includes("premium") && normalized.includes("analiz");
}

function isRestaurantIdentity(input: { name?: string | null; category?: string | null }) {
  if (isBarIdentity(input)) return false;
  const category = categoryOf(input);
  if (category === "RESTORAN" || category === "RESTAURANT") return true;
  const name = (input.name ?? "").trim();
  if (name === "RESTORAN — Premium Web Sitesi Analizi") return true;
  const normalized = normalizeName(name);
  return normalized.includes("restoran") && normalized.includes("premium") && normalized.includes("analiz");
}

function isReservedIdentity(normalized: string) {
  return (
    normalized.includes("restoran") ||
    normalized.includes("restaurant") ||
    /\bbar\b/.test(normalized) ||
    normalized.includes("genel") ||
    normalized.includes("follow_up") ||
    normalized.includes("follow-up") ||
    normalized.includes("follow up")
  );
}

function isNamedIndustryIdentity(
  input: { name?: string | null; category?: string | null },
  exactName: string,
  categories: readonly string[],
  needles: readonly string[],
) {
  if (isBarIdentity(input) || isRestaurantIdentity(input)) return false;
  const category = categoryOf(input);
  if (categories.includes(category)) return true;
  const name = (input.name ?? "").trim();
  if (name === exactName) return true;
  const normalized = normalizeName(name);
  if (isReservedIdentity(normalized)) return false;
  return (
    needles.some((needle) => normalized.includes(needle)) &&
    normalized.includes("premium") &&
    normalized.includes("analiz")
  );
}

function isConstructionIdentity(input: { name?: string | null; category?: string | null }) {
  return isNamedIndustryIdentity(
    input,
    "İNŞAAT — Premium Web Sitesi Analizi",
    ["İNŞAAT", "INSAAT"],
    ["inşaat", "insaat", "construction"],
  );
}

function isArchitectureIdentity(input: { name?: string | null; category?: string | null }) {
  return isNamedIndustryIdentity(
    input,
    "MİMARLIK — Premium Web Sitesi Analizi",
    ["MİMARLIK", "MIMARLIK"],
    ["mimarlık", "mimarlik", "architecture"],
  );
}

function isRealEstateIdentity(input: { name?: string | null; category?: string | null }) {
  return isNamedIndustryIdentity(
    input,
    "GAYRİMENKUL — Premium Web Sitesi Analizi",
    ["GAYRİMENKUL", "GAYRIMENKUL"],
    ["gayrimenkul", "real estate", "emlak"],
  );
}

function isHotelIdentity(input: { name?: string | null; category?: string | null }) {
  return isNamedIndustryIdentity(
    input,
    "OTEL — Premium Web Sitesi Analizi",
    ["OTEL", "HOTEL"],
    ["otel", "hotel"],
  );
}

function isAutomotiveIdentity(input: { name?: string | null; category?: string | null }) {
  return isNamedIndustryIdentity(
    input,
    "OTOMOTİV — Premium Web Sitesi Analizi",
    ["OTOMOTİV", "OTOMOTIV"],
    ["otomotiv", "automotive"],
  );
}

export function resolvePremiumEmailKind(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}): PremiumEmailKind {
  if (isBarIdentity(input)) return "bar";
  if (isRestaurantIdentity(input)) return "restaurant";
  if (isConstructionIdentity(input)) return "construction";
  if (isArchitectureIdentity(input)) return "architecture";
  if (isRealEstateIdentity(input)) return "realEstate";
  if (isHotelIdentity(input)) return "hotel";
  if (isAutomotiveIdentity(input)) return "automotive";
  if (/<!--\s*salkay-email:bar/i.test(input.body ?? "")) return "bar";
  if (/<!--\s*salkay-email:restaurant/i.test(input.body ?? "")) return "restaurant";
  if (/<!--\s*salkay-email:construction/i.test(input.body ?? "")) return "construction";
  if (/<!--\s*salkay-email:architecture/i.test(input.body ?? "")) return "architecture";
  if (/<!--\s*salkay-email:real-estate/i.test(input.body ?? "")) return "realEstate";
  if (/<!--\s*salkay-email:hotel/i.test(input.body ?? "")) return "hotel";
  if (/<!--\s*salkay-email:automotive/i.test(input.body ?? "")) return "automotive";
  return "custom";
}

export function isCodeBackedPremiumKind(kind: PremiumEmailKind): kind is Exclude<PremiumEmailKind, "custom"> {
  return kind !== "custom";
}

export function isPremiumIndustryKind(kind: PremiumEmailKind): kind is PremiumIndustryKind {
  return (PREMIUM_INDUSTRY_KINDS as readonly string[]).includes(kind);
}
