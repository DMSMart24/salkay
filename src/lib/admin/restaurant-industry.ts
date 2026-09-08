import type { Prisma } from "@prisma/client";

export const RESTAURANT_INDUSTRY = "Restaurant";
export const RESTAURANT_INDUSTRY_LABEL = "Restoranlar";
export const COMPANIES_RESTAURANT_PATH = "/admin/companies";
export const RESTAURANT_LEADS_PATH = "/admin/restaurant-leads";

const RESTAURANT_ALIASES = new Set([
  "restaurant",
  "restaurants",
  "restoran",
  "restoranlar",
  "reataurant",
]);

export function isRestaurantIndustry(value?: string | null) {
  const normalized = value?.trim().toLocaleLowerCase("tr");
  return Boolean(normalized && RESTAURANT_ALIASES.has(normalized));
}

export function isRestaurantGroup(group?: { name?: string | null; industry?: string | null } | null) {
  if (!group) return false;
  if (isRestaurantIndustry(group.industry) || isRestaurantIndustry(group.name)) return true;
  const name = group.name?.trim().toLocaleLowerCase("tr") ?? "";
  return name.includes("restoran") || name.includes("restaurant");
}

export function restaurantLeadsHref(params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (!value || key === "industry") return;
    search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `${RESTAURANT_LEADS_PATH}?${qs}` : RESTAURANT_LEADS_PATH;
}

export function companiesRestaurantHref(params?: Record<string, string | undefined>) {
  return restaurantLeadsHref(params);
}

export function industryLabel(industry: string) {
  return isRestaurantIndustry(industry) ? RESTAURANT_INDUSTRY_LABEL : industry;
}

export function canonicalIndustryOptions(industries: string[]) {
  const rest = industries.filter((item) => !isRestaurantIndustry(item));
  return [RESTAURANT_INDUSTRY, ...rest];
}

/** Legacy Company rows that used to live under Restoranlar. Keep in DB, hide from Firmen UI. */
export function legacyRestaurantCompanyWhere(): Prisma.CompanyWhereInput {
  return {
    OR: [
      { industry: { equals: "Restaurant", mode: "insensitive" } },
      { industry: { equals: "Restoran", mode: "insensitive" } },
      { industry: { equals: "Restoranlar", mode: "insensitive" } },
      { industry: { equals: "Restaurants", mode: "insensitive" } },
      {
        group: {
          is: {
            OR: [
              { industry: { equals: "Restaurant", mode: "insensitive" } },
              { name: { equals: "Restoranlar", mode: "insensitive" } },
            ],
          },
        },
      },
    ],
  };
}

export function excludeLegacyRestaurantCompanies(
  where: Prisma.CompanyWhereInput = {},
): Prisma.CompanyWhereInput {
  return {
    AND: [where, { NOT: legacyRestaurantCompanyWhere() }],
  };
}
