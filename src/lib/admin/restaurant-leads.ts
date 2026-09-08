import type {
  Prisma,
  RestaurantContactStatus,
  RestaurantLead,
  RestaurantLeadPriority,
  RestaurantRegion,
  RestaurantSalesStatus,
  RestaurantWebsiteStatus,
} from "@prisma/client";
import { normalizeDomain, normalizeEmail, normalizeWebsite } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";

export const RESTAURANT_LEAD_PAGE_SIZE = 25;

export const RESTAURANT_WEBSITE_STATUSES: RestaurantWebsiteStatus[] = [
  "NO_WEBSITE",
  "VERY_WEAK",
  "WEAK",
  "IMPROVABLE",
  "GOOD",
  "VERY_GOOD",
  "NOT_VERIFIED",
];

export const RESTAURANT_LEAD_PRIORITIES: RestaurantLeadPriority[] = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "QUALIFIED_OUT",
  "PENDING",
];

export const RESTAURANT_SALES_PRIORITIES: RestaurantLeadPriority[] = [
  "HIGH",
  "MEDIUM",
  "PENDING",
  "QUALIFIED_OUT",
];

export const RESTAURANT_REGIONS: RestaurantRegion[] = ["ANADOLU", "AVRUPA"];

export const WEAK_WEBSITE_STATUSES: RestaurantWebsiteStatus[] = ["VERY_WEAK", "WEAK"];

export const STRONG_LEAD_WEBSITE_STATUSES: RestaurantWebsiteStatus[] = [
  "NO_WEBSITE",
  "VERY_WEAK",
  "WEAK",
];

export const FIRST_CONTACT_SALES_STATUSES: RestaurantSalesStatus[] = ["NEW", "READY_TO_CONTACT"];

export type RestaurantEmailSegment = "NO_WEBSITE_EMAIL" | "WEBSITE_PROBLEM_EMAIL";

export type RestaurantLeadView =
  | "top"
  | "high"
  | "no-website"
  | "website-problems"
  | "needs-verification"
  | "has-email"
  | "not-contacted"
  | "qualified-out"
  | "top-20"
  | "no-website-opportunities"
  | "website-problem-opportunities"
  | "strongest"
  | "no-website-sales"
  | "weak-site"
  | "has-phone"
  | "has-whatsapp"
  | "pending-research"
  | "final-top-20"
  | "ready-for-outreach"
  | "";

export type RestaurantLeadFilters = {
  q?: string;
  district?: string;
  region?: RestaurantRegion | "";
  priority?: RestaurantLeadPriority | "";
  websiteStatus?: RestaurantWebsiteStatus | "";
  contactStatus?: RestaurantContactStatus | "";
  salesStatus?: RestaurantSalesStatus | "";
  emailSegment?: RestaurantEmailSegment | "";
  hasEmail?: "yes" | "no" | "";
  hasWebsite?: "yes" | "no" | "";
  hasPhone?: "yes" | "no" | "";
  hasWhatsapp?: "yes" | "no" | "";
  view?: RestaurantLeadView;
  page?: number;
  pageSize?: number;
};

export type LeadScoreBand = "elite" | "strong" | "mid" | "low";

export type RestaurantLeadWriteInput = {
  restaurantName: string;
  district: string;
  region?: RestaurantRegion;
  neighborhood?: string | null;
  address?: string | null;
  website?: string | null;
  websiteDomain?: string | null;
  websiteStatus: RestaurantWebsiteStatus;
  websiteScore?: number | null;
  leadScore?: number | null;
  priority: RestaurantLeadPriority;
  publicEmail?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  googleMapsUrl?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  category?: string | null;
  problem1?: string | null;
  problem2?: string | null;
  problem3?: string | null;
  websiteAnalysis?: string | null;
  opportunities?: string | null;
  salkayPitch?: string | null;
  source?: string | null;
  dateChecked?: Date | string | null;
  contactStatus: RestaurantContactStatus;
  outreachNotes?: string | null;
};

export function normalizeLeadKey(value?: string | null) {
  return value?.trim().toLocaleLowerCase("tr").replace(/\s+/g, " ") ?? "";
}

export function blankToNull(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function hasFilledText(value?: string | null) {
  return Boolean(blankToNull(value));
}

export type RestaurantEmailTrustBadge = "VERIFIED" | "UNVERIFIED" | "MISSING" | "HISTORICAL";

/**
 * Notes-only email trust (no schema / migration).
 * Tags in outreachNotes: OFFICIAL_VERIFIED, THIRD_PARTY_VERIFIED, NOT_VERIFIED, NOT_FOUND, HISTORICAL.
 */
export function restaurantEmailTrustBadge(input: {
  publicEmail?: string | null;
  outreachNotes?: string | null;
}): RestaurantEmailTrustBadge {
  const notes = input.outreachNotes ?? "";
  const hasEmail = Boolean(blankToNull(input.publicEmail));

  if (/\bHISTORICAL\b/i.test(notes)) return "HISTORICAL";
  if (/\bNOT_FOUND\b/i.test(notes) && !hasEmail) return "MISSING";
  if (/\bNOT_VERIFIED\b/i.test(notes)) return "UNVERIFIED";
  if (/\b(OFFICIAL_VERIFIED|THIRD_PARTY_VERIFIED)\b/i.test(notes)) return "VERIFIED";
  if (hasEmail) return "UNVERIFIED";
  return "MISSING";
}

export function isClosedOrHoldRestaurant(input: {
  outreachNotes?: string | null;
  salesStatus?: string | null;
}) {
  if (input.salesStatus === "DO_NOT_CONTACT") return true;
  const notes = (input.outreachNotes ?? "").toLocaleLowerCase("tr");
  if (!notes) return false;
  return (
    /\b(kapal[iı]|kapanm[iı][sş]|permanently closed|closed permanently|işletme kapal[iı]|\bhold\b)\b/i.test(
      notes,
    ) || /\bCLOSED\b/.test(input.outreachNotes ?? "")
  );
}

function filledTextWhere(
  field: "phone" | "whatsapp" | "publicEmail" | "website",
): Prisma.RestaurantLeadWhereInput {
  switch (field) {
    case "phone":
      return { AND: [{ phone: { not: null } }, { phone: { not: "" } }] };
    case "whatsapp":
      return { AND: [{ whatsapp: { not: null } }, { whatsapp: { not: "" } }] };
    case "publicEmail":
      return { AND: [{ publicEmail: { not: null } }, { publicEmail: { not: "" } }] };
    case "website":
      return { AND: [{ website: { not: null } }, { website: { not: "" } }] };
    default: {
      const _never: never = field;
      throw new Error(`Unhandled filled-text field: ${_never}`);
    }
  }
}

function emptyTextWhere(
  field: "phone" | "whatsapp" | "publicEmail" | "website",
): Prisma.RestaurantLeadWhereInput {
  switch (field) {
    case "phone":
      return { OR: [{ phone: null }, { phone: "" }] };
    case "whatsapp":
      return { OR: [{ whatsapp: null }, { whatsapp: "" }] };
    case "publicEmail":
      return { OR: [{ publicEmail: null }, { publicEmail: "" }] };
    case "website":
      return { OR: [{ website: null }, { website: "" }] };
    default: {
      const _never: never = field;
      throw new Error(`Unhandled empty-text field: ${_never}`);
    }
  }
}

export function hasSalesContact(
  lead: Pick<RestaurantLead, "phone" | "whatsapp" | "publicEmail">,
) {
  return hasFilledText(lead.phone) || hasFilledText(lead.whatsapp) || hasFilledText(lead.publicEmail);
}

export function contactAvailabilityRank(
  lead: Pick<RestaurantLead, "phone" | "whatsapp" | "publicEmail">,
) {
  return (
    Number(hasFilledText(lead.publicEmail)) * 4 +
    Number(hasFilledText(lead.whatsapp)) * 2 +
    Number(hasFilledText(lead.phone))
  );
}

export function restaurantProblemList(
  lead: Pick<RestaurantLead, "problem1" | "problem2" | "problem3">,
) {
  return [lead.problem1, lead.problem2, lead.problem3]
    .map((item) => blankToNull(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 3);
}

export function salesContactWhere(): Prisma.RestaurantLeadWhereInput {
  return {
    OR: [filledTextWhere("phone"), filledTextWhere("whatsapp"), filledTextWhere("publicEmail")],
  };
}

export function strongestLeadWhere(): Prisma.RestaurantLeadWhereInput {
  return {
    AND: [
      { priority: "HIGH" },
      { websiteStatus: { in: [...STRONG_LEAD_WEBSITE_STATUSES] } },
      salesContactWhere(),
    ],
  };
}

export function firstContactWhere(region?: RestaurantRegion | ""): Prisma.RestaurantLeadWhereInput {
  return {
    AND: [
      strongestLeadWhere(),
      { salesStatus: { in: [...FIRST_CONTACT_SALES_STATUSES] } },
      ...(region ? [{ region }] : []),
    ],
  };
}

/** Structured READY FOR OUTREACH filter (closed notes filtered in list layer). */
export function readyForOutreachWhere(): Prisma.RestaurantLeadWhereInput {
  return {
    AND: [
      { priority: "HIGH" },
      { contactStatus: { in: ["NOT_CONTACTED", "READY_TO_CONTACT"] } },
      { websiteStatus: { in: [...STRONG_LEAD_WEBSITE_STATUSES] } },
      { salesStatus: { not: "DO_NOT_CONTACT" } },
    ],
  };
}

export function compareFirstContactLeads(
  a: Pick<RestaurantLead, "leadScore" | "websiteScore" | "phone" | "whatsapp" | "publicEmail">,
  b: Pick<RestaurantLead, "leadScore" | "websiteScore" | "phone" | "whatsapp" | "publicEmail">,
) {
  const scoreA = typeof a.leadScore === "number" ? a.leadScore : Number.NEGATIVE_INFINITY;
  const scoreB = typeof b.leadScore === "number" ? b.leadScore : Number.NEGATIVE_INFINITY;
  if (scoreA !== scoreB) return scoreB - scoreA;
  if (a.websiteScore == null && b.websiteScore != null) return -1;
  if (a.websiteScore != null && b.websiteScore == null) return 1;
  if (a.websiteScore != null && b.websiteScore != null && a.websiteScore !== b.websiteScore) {
    return a.websiteScore - b.websiteScore;
  }
  return contactAvailabilityRank(b) - contactAvailabilityRank(a);
}

export function allowsWebsiteScore(status: RestaurantWebsiteStatus) {
  return status !== "NO_WEBSITE" && status !== "NOT_VERIFIED";
}

export function restaurantEmailSegment(
  status: RestaurantWebsiteStatus,
): RestaurantEmailSegment | null {
  if (status === "NO_WEBSITE") return "NO_WEBSITE_EMAIL";
  if (status === "VERY_WEAK" || status === "WEAK" || status === "IMPROVABLE") {
    return "WEBSITE_PROBLEM_EMAIL";
  }
  return null;
}

export function applyRestaurantLeadStatusRules(input: {
  websiteStatus: RestaurantWebsiteStatus;
  websiteScore?: number | null;
  leadScore?: number | null;
  priority: RestaurantLeadPriority;
}) {
  const websiteStatus = input.websiteStatus;
  const finiteScore = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

  let websiteScore = allowsWebsiteScore(websiteStatus) ? finiteScore(input.websiteScore) : null;
  let leadScore = finiteScore(input.leadScore);
  let priority = input.priority;

  switch (websiteStatus) {
    case "NO_WEBSITE":
      websiteScore = null;
      break;
    case "NOT_VERIFIED":
      websiteScore = null;
      leadScore = null;
      priority = "PENDING";
      break;
    case "GOOD":
    case "VERY_GOOD":
      priority = "QUALIFIED_OUT";
      break;
    case "VERY_WEAK":
    case "WEAK":
    case "IMPROVABLE":
      break;
    default: {
      const _never: never = websiteStatus;
      throw new Error(`Unhandled restaurant website status: ${_never}`);
    }
  }

  return { websiteScore, leadScore, priority };
}

export function normalizePhoneDigits(value?: string | null) {
  const digits = blankToNull(value)?.replace(/\D/g, "") ?? "";
  if (!digits) return "";
  if (digits.startsWith("90") && digits.length >= 12) return digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 11) return digits.slice(1);
  return digits;
}

export function leadScoreBand(score: number | null | undefined): LeadScoreBand | null {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  if (score >= 9) return "elite";
  if (score >= 8) return "strong";
  if (score >= 7) return "mid";
  return "low";
}

export const leadScoreBandLabels: Record<LeadScoreBand, string> = {
  elite: "Çok güçlü",
  strong: "Güçlü",
  mid: "Orta",
  low: "Düşük",
};

export function parseLeadDate(value?: string | Date | null) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) return iso;
  const match = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (match) {
    const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function sanitizeRestaurantLeadWrite(input: RestaurantLeadWriteInput) {
  const websiteStatus = input.websiteStatus;
  const website = normalizeWebsite(blankToNull(input.website));
  const websiteDomain = normalizeDomain(blankToNull(input.websiteDomain) || website);
  const publicEmail = normalizeEmail(blankToNull(input.publicEmail));
  const rules = applyRestaurantLeadStatusRules({
    websiteStatus,
    websiteScore: input.websiteScore,
    leadScore: input.leadScore,
    priority: input.priority,
  });

  return {
    restaurantName: input.restaurantName.trim(),
    nameNorm: normalizeLeadKey(input.restaurantName),
    district: input.district.trim(),
    districtNorm: normalizeLeadKey(input.district),
    region: input.region ?? "ANADOLU",
    neighborhood: blankToNull(input.neighborhood),
    address: blankToNull(input.address),
    website,
    websiteDomain,
    websiteStatus,
    websiteScore: rules.websiteScore,
    leadScore: rules.leadScore,
    priority: rules.priority,
    publicEmail,
    phone: blankToNull(input.phone),
    whatsapp: blankToNull(input.whatsapp),
    instagram: blankToNull(input.instagram),
    googleMapsUrl: blankToNull(input.googleMapsUrl),
    googleRating:
      typeof input.googleRating === "number" && Number.isFinite(input.googleRating)
        ? input.googleRating
        : null,
    googleReviewCount:
      typeof input.googleReviewCount === "number" && Number.isFinite(input.googleReviewCount)
        ? input.googleReviewCount
        : null,
    category: blankToNull(input.category),
    problem1: blankToNull(input.problem1),
    problem2: blankToNull(input.problem2),
    problem3: blankToNull(input.problem3),
    websiteAnalysis: blankToNull(input.websiteAnalysis),
    opportunities: blankToNull(input.opportunities),
    salkayPitch: blankToNull(input.salkayPitch),
    source: blankToNull(input.source),
    dateChecked: parseLeadDate(input.dateChecked ?? null),
    contactStatus: input.contactStatus,
    outreachNotes: blankToNull(input.outreachNotes),
  };
}

export function hasPublicEmail(lead: Pick<RestaurantLead, "publicEmail">) {
  return Boolean(blankToNull(lead.publicEmail));
}

export function hasConcreteWebsiteProblem(lead: Pick<RestaurantLead, "problem1" | "problem2" | "problem3">) {
  return Boolean(blankToNull(lead.problem1) || blankToNull(lead.problem2) || blankToNull(lead.problem3));
}

export function compareTop20OutreachLeads(
  a: Pick<RestaurantLead, "leadScore" | "publicEmail" | "problem1" | "problem2" | "problem3">,
  b: Pick<RestaurantLead, "leadScore" | "publicEmail" | "problem1" | "problem2" | "problem3">,
) {
  const scoreA = typeof a.leadScore === "number" ? a.leadScore : Number.NEGATIVE_INFINITY;
  const scoreB = typeof b.leadScore === "number" ? b.leadScore : Number.NEGATIVE_INFINITY;
  if (scoreA !== scoreB) return scoreB - scoreA;
  const email = Number(hasPublicEmail(b)) - Number(hasPublicEmail(a));
  if (email) return email;
  return Number(hasConcreteWebsiteProblem(b)) - Number(hasConcreteWebsiteProblem(a));
}

export function websiteHref(value?: string | null) {
  return normalizeWebsite(value);
}

export function phoneHref(value?: string | null) {
  const digits = normalizePhoneDigits(value);
  return digits ? `tel:+90${digits}` : null;
}

export function instagramHref(value?: string | null) {
  const raw = blankToNull(value);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "").replace(/^instagram\.com\//i, "").replace(/^www\./i, "");
  return handle ? `https://instagram.com/${handle}` : null;
}

export function whatsappHref(value?: string | null) {
  const raw = blankToNull(value);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = normalizePhoneDigits(raw);
  return digits ? `https://wa.me/90${digits}` : null;
}

export function mapsHref(value?: string | null) {
  const raw = blankToNull(value);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
}

export function restaurantLeadWhere(filters: RestaurantLeadFilters): Prisma.RestaurantLeadWhereInput {
  const AND: Prisma.RestaurantLeadWhereInput[] = [];
  const view = filters.view ?? "";

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    const qNorm = normalizeLeadKey(q);
    const digits = q.replace(/\D/g, "");
    const search: Prisma.RestaurantLeadWhereInput[] = [
      { restaurantName: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { neighborhood: { contains: q, mode: "insensitive" } },
      { publicEmail: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { website: { contains: q, mode: "insensitive" } },
      { websiteDomain: { contains: q, mode: "insensitive" } },
    ];
    if (qNorm) {
      search.push({ nameNorm: { contains: qNorm } }, { districtNorm: { contains: qNorm } });
    }
    if (digits.length >= 4) {
      search.push({ phone: { contains: digits } }, { whatsapp: { contains: digits } });
    }
    AND.push({ OR: search });
  }

  if (filters.district) {
    AND.push({ district: { equals: filters.district, mode: "insensitive" } });
  }
  if (filters.region) {
    AND.push({ region: filters.region });
  }
  if (filters.priority) {
    AND.push({ priority: filters.priority });
  }
  if (filters.websiteStatus) {
    AND.push({ websiteStatus: filters.websiteStatus });
  }
  if (filters.contactStatus) {
    AND.push({ contactStatus: filters.contactStatus });
  }
  if (filters.salesStatus) {
    AND.push({ salesStatus: filters.salesStatus });
  }
  if (filters.emailSegment === "NO_WEBSITE_EMAIL") {
    AND.push({ websiteStatus: "NO_WEBSITE" });
  } else if (filters.emailSegment === "WEBSITE_PROBLEM_EMAIL") {
    AND.push({ websiteStatus: { in: ["VERY_WEAK", "WEAK", "IMPROVABLE"] } });
  }
  if (filters.hasEmail === "yes") {
    AND.push(filledTextWhere("publicEmail"));
  } else if (filters.hasEmail === "no") {
    AND.push(emptyTextWhere("publicEmail"));
  }
  if (filters.hasWebsite === "yes") {
    AND.push(filledTextWhere("website"));
  } else if (filters.hasWebsite === "no") {
    AND.push(emptyTextWhere("website"));
  }
  if (filters.hasPhone === "yes") {
    AND.push(filledTextWhere("phone"));
  } else if (filters.hasPhone === "no") {
    AND.push(emptyTextWhere("phone"));
  }
  if (filters.hasWhatsapp === "yes") {
    AND.push(filledTextWhere("whatsapp"));
  } else if (filters.hasWhatsapp === "no") {
    AND.push(emptyTextWhere("whatsapp"));
  }

  switch (view) {
    case "high":
      AND.push({ priority: "HIGH" });
      break;
    case "no-website":
    case "no-website-opportunities":
      AND.push({ websiteStatus: "NO_WEBSITE" });
      break;
    case "website-problems":
    case "website-problem-opportunities":
      AND.push({ websiteStatus: { in: ["VERY_WEAK", "WEAK", "IMPROVABLE"] } });
      break;
    case "needs-verification":
      AND.push({ websiteStatus: "NOT_VERIFIED" });
      break;
    case "has-email":
      AND.push(filledTextWhere("publicEmail"));
      break;
    case "not-contacted":
      AND.push({ contactStatus: "NOT_CONTACTED" });
      break;
    case "qualified-out":
      AND.push({ priority: "QUALIFIED_OUT" });
      break;
    case "top-20":
      AND.push({
        priority: "HIGH",
        websiteStatus: { in: ["NO_WEBSITE", "VERY_WEAK", "WEAK", "IMPROVABLE"] },
      });
      break;
    case "strongest":
      AND.push(strongestLeadWhere());
      break;
    case "no-website-sales":
      AND.push({ websiteStatus: "NO_WEBSITE", priority: { not: "QUALIFIED_OUT" } });
      break;
    case "weak-site":
      AND.push({
        websiteStatus: { in: [...WEAK_WEBSITE_STATUSES] },
        priority: { not: "QUALIFIED_OUT" },
      });
      break;
    case "has-phone":
      AND.push(filledTextWhere("phone"));
      break;
    case "has-whatsapp":
      AND.push(filledTextWhere("whatsapp"));
      break;
    case "pending-research":
      AND.push({
        OR: [{ websiteStatus: "NOT_VERIFIED" }, { priority: "PENDING" }],
      });
      break;
    case "final-top-20":
      AND.push({ isFinalTop20: true });
      break;
    case "ready-for-outreach":
      AND.push(readyForOutreachWhere());
      break;
    case "top":
    case "":
      break;
    default: {
      const _never: never = view;
      throw new Error(`Unhandled restaurant lead view: ${_never}`);
    }
  }

  return AND.length ? { AND } : {};
}

export async function findRestaurantLeadDuplicate(input: {
  restaurantName: string;
  district: string;
  excludeId?: string;
}) {
  const nameNorm = normalizeLeadKey(input.restaurantName);
  const districtNorm = normalizeLeadKey(input.district);
  if (!nameNorm || !districtNorm) return null;

  return getPrisma().restaurantLead.findFirst({
    where: {
      nameNorm,
      districtNorm,
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
    },
    select: { id: true, restaurantName: true, district: true },
  });
}

export async function listRestaurantLeads(filters: RestaurantLeadFilters) {
  const prisma = getPrisma();
  const where = restaurantLeadWhere(filters);
  const isTop20 = filters.view === "top-20";
  const isFinalTop20 = filters.view === "final-top-20";
  const isReadyForOutreach = filters.view === "ready-for-outreach";
  const isNoWebsiteOpportunities = filters.view === "no-website-opportunities";
  const isWebsiteProblemOpportunities = filters.view === "website-problem-opportunities";
  const unpaged =
    isTop20 ||
    isFinalTop20 ||
    isReadyForOutreach ||
    isNoWebsiteOpportunities ||
    isWebsiteProblemOpportunities;
  const pageSize = isTop20 || isFinalTop20
    ? 20
    : Math.max(1, filters.pageSize ?? RESTAURANT_LEAD_PAGE_SIZE);
  const page = Math.max(1, filters.page ?? 1);
  const leadScoreDesc: Prisma.RestaurantLeadOrderByWithRelationInput[] = [
    { leadScore: { sort: "desc", nulls: "last" } },
    { restaurantName: "asc" },
  ];
  const orderBy: Prisma.RestaurantLeadOrderByWithRelationInput[] = isFinalTop20
    ? [{ finalRank: "asc" }]
    : filters.view === "no-website" ||
        filters.view === "website-problems" ||
        isNoWebsiteOpportunities ||
        isWebsiteProblemOpportunities ||
        isReadyForOutreach
      ? leadScoreDesc
      : filters.view === "top" || !filters.view
        ? [{ leadScore: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }]
        : [{ updatedAt: "desc" }];

  const rowsQuery = unpaged
    ? prisma.restaurantLead.findMany({
        where,
        orderBy: isFinalTop20
          ? [{ finalRank: "asc" }]
          : isTop20
            ? [{ leadScore: { sort: "desc", nulls: "last" } }]
            : leadScoreDesc,
      })
    : prisma.restaurantLead.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

  const [total, fetched, districts] = await Promise.all([
    prisma.restaurantLead.count({ where }),
    rowsQuery,
    prisma.restaurantLead.findMany({
      where: filters.region ? { region: filters.region } : {},
      distinct: ["district"],
      select: { district: true },
      orderBy: { district: "asc" },
    }),
  ]);

  const withoutClosed = isReadyForOutreach
    ? fetched.filter((row) => !isClosedOrHoldRestaurant(row))
    : fetched;

  const rows = isTop20
    ? [...withoutClosed].sort(compareTop20OutreachLeads).slice(0, 20)
    : isFinalTop20
      ? [...withoutClosed]
          .sort((a, b) => (a.finalRank ?? 999) - (b.finalRank ?? 999))
          .slice(0, 20)
      : withoutClosed;

  return {
    rows,
    total: isTop20 || isFinalTop20 ? rows.length : isReadyForOutreach ? rows.length : total,
    page: unpaged ? 1 : page,
    pageCount: unpaged ? 1 : Math.max(1, Math.ceil(total / pageSize)),
    districts: districts.map((row) => row.district).filter(Boolean),
  };
}

export async function listFirstContactRecommendations(region?: RestaurantRegion | "") {
  const rows = await getPrisma().restaurantLead.findMany({
    where: firstContactWhere(region),
  });
  return [...rows].sort(compareFirstContactLeads).slice(0, 10);
}

export async function getRestaurantLeadStats(region?: RestaurantRegion | "") {
  const prisma = getPrisma();
  const scoped = region ? { region } : {};
  const [
    total,
    anadolu,
    avrupa,
    highPriority,
    medium,
    pending,
    qualifiedOut,
    noWebsite,
    weakWebsite,
    websiteProblem,
    needsVerification,
    strongest,
    noWebsiteSales,
    weakSiteSales,
    hasPhone,
    hasWhatsapp,
    hasEmail,
    pendingResearch,
    readyToContact,
    contacted,
    interested,
    notContacted,
    europePhone,
    europeWhatsapp,
    readyForOutreach,
  ] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { region: "ANADOLU" } }),
    prisma.restaurantLead.count({ where: { region: "AVRUPA" } }),
    prisma.restaurantLead.count({ where: { ...scoped, priority: "HIGH" } }),
    prisma.restaurantLead.count({ where: { ...scoped, priority: "MEDIUM" } }),
    prisma.restaurantLead.count({ where: { ...scoped, priority: "PENDING" } }),
    prisma.restaurantLead.count({ where: { ...scoped, priority: "QUALIFIED_OUT" } }),
    prisma.restaurantLead.count({ where: { ...scoped, websiteStatus: "NO_WEBSITE" } }),
    prisma.restaurantLead.count({
      where: { ...scoped, websiteStatus: { in: [...WEAK_WEBSITE_STATUSES] } },
    }),
    prisma.restaurantLead.count({
      where: { ...scoped, websiteStatus: { in: ["VERY_WEAK", "WEAK", "IMPROVABLE"] } },
    }),
    prisma.restaurantLead.count({ where: { ...scoped, websiteStatus: "NOT_VERIFIED" } }),
    prisma.restaurantLead.count({
      where: region ? { AND: [strongestLeadWhere(), { region }] } : strongestLeadWhere(),
    }),
    prisma.restaurantLead.count({
      where: { ...scoped, websiteStatus: "NO_WEBSITE", priority: { not: "QUALIFIED_OUT" } },
    }),
    prisma.restaurantLead.count({
      where: {
        ...scoped,
        websiteStatus: { in: [...WEAK_WEBSITE_STATUSES] },
        priority: { not: "QUALIFIED_OUT" },
      },
    }),
    prisma.restaurantLead.count({
      where: region ? { AND: [filledTextWhere("phone"), { region }] } : filledTextWhere("phone"),
    }),
    prisma.restaurantLead.count({
      where: region
        ? { AND: [filledTextWhere("whatsapp"), { region }] }
        : filledTextWhere("whatsapp"),
    }),
    prisma.restaurantLead.count({
      where: region
        ? { AND: [filledTextWhere("publicEmail"), { region }] }
        : filledTextWhere("publicEmail"),
    }),
    prisma.restaurantLead.count({
      where: {
        ...scoped,
        OR: [{ websiteStatus: "NOT_VERIFIED" }, { priority: "PENDING" }],
      },
    }),
    prisma.restaurantLead.count({ where: { ...scoped, contactStatus: "READY_TO_CONTACT" } }),
    prisma.restaurantLead.count({ where: { ...scoped, contactStatus: "CONTACTED" } }),
    prisma.restaurantLead.count({ where: { ...scoped, contactStatus: "INTERESTED" } }),
    prisma.restaurantLead.count({ where: { ...scoped, contactStatus: "NOT_CONTACTED" } }),
    prisma.restaurantLead.count({
      where: { AND: [{ region: "AVRUPA" }, filledTextWhere("phone")] },
    }),
    prisma.restaurantLead.count({
      where: { AND: [{ region: "AVRUPA" }, filledTextWhere("whatsapp")] },
    }),
    prisma.restaurantLead.findMany({
      where: region
        ? { AND: [readyForOutreachWhere(), { region }] }
        : readyForOutreachWhere(),
      select: { outreachNotes: true, salesStatus: true },
    }),
  ]);

  return {
    total,
    anadolu,
    avrupa,
    highPriority,
    medium,
    pending,
    qualifiedOut,
    noWebsite,
    weakWebsite,
    websiteProblem,
    needsVerification,
    strongest,
    noWebsiteSales,
    weakSiteSales,
    hasPhone,
    hasWhatsapp,
    hasEmail,
    pendingResearch,
    readyToContact,
    contacted,
    interested,
    notContacted,
    europePhone,
    europeWhatsapp,
    readyForOutreach: readyForOutreach.filter((row) => !isClosedOrHoldRestaurant(row)).length,
  };
}

export async function getRestaurantLead(id: string) {
  return getPrisma().restaurantLead.findUnique({ where: { id } });
}
