export type PremiumEmailKind = "bar" | "restaurant" | "custom";

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

export function resolvePremiumEmailKind(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}): PremiumEmailKind {
  if (isBarIdentity(input)) return "bar";
  if (isRestaurantIdentity(input)) return "restaurant";
  if (/<!--\s*salkay-email:bar/i.test(input.body ?? "")) return "bar";
  if (/<!--\s*salkay-email:restaurant/i.test(input.body ?? "")) return "restaurant";
  return "custom";
}
