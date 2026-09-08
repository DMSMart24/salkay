import type {
  Prisma,
  RestaurantContactStatus,
  RestaurantLead,
  RestaurantLeadPriority,
  RestaurantRegion,
  RestaurantWebsiteStatus,
} from "@prisma/client";
import { isValidEmail, normalizeEmail } from "@/lib/admin/normalize";
import {
  matchRestaurantLeadAgainstPool,
  toMatchCandidate,
  type RestaurantLeadMatchReason,
} from "@/lib/admin/restaurant-lead-duplicates";
import {
  allowsWebsiteScore,
  normalizeLeadKey,
  parseLeadDate,
  sanitizeRestaurantLeadWrite,
  type RestaurantLeadWriteInput,
} from "@/lib/admin/restaurant-leads";
import { getPrisma } from "@/lib/admin/prisma";

export type RestaurantLeadImportMode = "create" | "update";
export type RestaurantLeadImportAction =
  | "new"
  | "update"
  | "unchanged"
  | "invalid"
  | "review_required"
  | "skip";
export type RestaurantLeadProvidedField = Exclude<
  keyof RestaurantLeadWriteInput,
  "restaurantName" | "district"
>;

export type RestaurantLeadParsedRow = RestaurantLeadWriteInput & {
  index: number;
  nameNorm: string;
  districtNorm: string;
  errors: string[];
  providedFields: RestaurantLeadProvidedField[];
};

export type RestaurantLeadDuplicate = {
  id: string;
  restaurantName: string;
  district: string;
  reason: RestaurantLeadMatchReason;
};

export type RestaurantLeadPreviewRow = RestaurantLeadParsedRow & {
  duplicate: RestaurantLeadDuplicate | null;
  existing?: RestaurantLead | null;
  importAction?: RestaurantLeadImportAction;
};

export type RestaurantLeadImportStats = {
  total: number;
  valid: number;
  newLeads: number;
  updates: number;
  unchanged: number;
  duplicates: number;
  invalid: number;
  reviewRequired: number;
  notVerified: number;
  missingLeadScore: number;
};

const CANONICAL_HEADERS = [
  "restaurantName",
  "district",
  "region",
  "neighborhood",
  "address",
  "website",
  "websiteDomain",
  "websiteStatus",
  "websiteScore",
  "leadScore",
  "priority",
  "publicEmail",
  "phone",
  "whatsapp",
  "instagram",
  "googleMapsUrl",
  "googleRating",
  "googleReviewCount",
  "category",
  "problem1",
  "problem2",
  "problem3",
  "websiteAnalysis",
  "opportunities",
  "salkayPitch",
  "source",
  "dateChecked",
  "contactStatus",
  "outreachNotes",
] as const;

export const RESTAURANT_LEAD_CSV_COLUMNS = CANONICAL_HEADERS;

const HEADER_ALIASES: Record<string, (typeof CANONICAL_HEADERS)[number]> = {
  restaurantname: "restaurantName",
  restaurant: "restaurantName",
  name: "restaurantName",
  restoran: "restaurantName",
  restorantadi: "restaurantName",
  restoranadi: "restaurantName",
  district: "district",
  ilce: "district",
  region: "region",
  bolge: "region",
  yakasi: "region",
  neighborhood: "neighborhood",
  mahalle: "neighborhood",
  address: "address",
  adres: "address",
  website: "website",
  url: "website",
  site: "website",
  websitedomain: "websiteDomain",
  domain: "websiteDomain",
  websitestatus: "websiteStatus",
  websitescore: "websiteScore",
  leadscore: "leadScore",
  priority: "priority",
  oncelik: "priority",
  publicemail: "publicEmail",
  email: "publicEmail",
  eposta: "publicEmail",
  mail: "publicEmail",
  phone: "phone",
  telefon: "phone",
  whatsapp: "whatsapp",
  wa: "whatsapp",
  instagram: "instagram",
  ig: "instagram",
  googlemapsurl: "googleMapsUrl",
  googlemaps: "googleMapsUrl",
  maps: "googleMapsUrl",
  mapsurl: "googleMapsUrl",
  googlemapskaynakurl: "googleMapsUrl",
  kaynakurl: "googleMapsUrl",
  googlerating: "googleRating",
  rating: "googleRating",
  googlereviewcount: "googleReviewCount",
  reviewcount: "googleReviewCount",
  reviews: "googleReviewCount",
  category: "category",
  kategori: "category",
  problem1: "problem1",
  problem2: "problem2",
  problem3: "problem3",
  websiteanalysis: "websiteAnalysis",
  analysis: "websiteAnalysis",
  opportunities: "opportunities",
  salkayopportunity: "opportunities",
  firsatlar: "opportunities",
  salkaypitch: "salkayPitch",
  pitch: "salkayPitch",
  source: "source",
  kaynak: "source",
  datechecked: "dateChecked",
  contactstatus: "contactStatus",
  outreachnotes: "outreachNotes",
  notes: "outreachNotes",
};

const STALE_RESEARCH_STATUSES = new Set([
  "notanalyzed",
  "analysispending",
  "pending",
  "notresearched",
  "pendinganalysis",
]);

const WEBSITE_STATUS_ALIASES: Record<string, RestaurantWebsiteStatus> = {
  nowebsite: "NO_WEBSITE",
  websitesiyok: "NO_WEBSITE",
  websitesibulunamadi: "NO_WEBSITE",
  veryweak: "VERY_WEAK",
  cokzayif: "VERY_WEAK",
  weak: "WEAK",
  zayif: "WEAK",
  improvable: "IMPROVABLE",
  gelistirilebilir: "IMPROVABLE",
  good: "GOOD",
  iyi: "GOOD",
  verygood: "VERY_GOOD",
  cokiyi: "VERY_GOOD",
  notverified: "NOT_VERIFIED",
  henuzincelenmedi: "NOT_VERIFIED",
  dogrulanmadi: "NOT_VERIFIED",
};

const PRIORITY_ALIASES: Record<string, RestaurantLeadPriority> = {
  high: "HIGH",
  yuksek: "HIGH",
  medium: "MEDIUM",
  orta: "MEDIUM",
  low: "LOW",
  dusuk: "LOW",
  qualifiedout: "QUALIFIED_OUT",
  kapsamdisi: "QUALIFIED_OUT",
  pending: "PENDING",
  researchpending: "PENDING",
};

const CONTACT_STATUS_ALIASES: Record<string, RestaurantContactStatus> = {
  notcontacted: "NOT_CONTACTED",
  readytocontact: "READY_TO_CONTACT",
  contacted: "CONTACTED",
  replied: "REPLIED",
  followup: "FOLLOW_UP",
  interested: "INTERESTED",
  meeting: "MEETING",
  won: "WON",
  lost: "LOST",
};

const REGION_ALIASES: Record<string, RestaurantRegion> = {
  anadolu: "ANADOLU",
  anadoluyakasi: "ANADOLU",
  avrupa: "AVRUPA",
  avrupayakasi: "AVRUPA",
};

const CONTACT_STATUSES: RestaurantContactStatus[] = [
  "NOT_CONTACTED",
  "READY_TO_CONTACT",
  "CONTACTED",
  "REPLIED",
  "FOLLOW_UP",
  "INTERESTED",
  "MEETING",
  "WON",
  "LOST",
];

const UPDATEABLE_FIELDS: RestaurantLeadProvidedField[] = [
  "region",
  "neighborhood",
  "address",
  "website",
  "websiteDomain",
  "websiteStatus",
  "websiteScore",
  "leadScore",
  "priority",
  "publicEmail",
  "phone",
  "whatsapp",
  "instagram",
  "googleMapsUrl",
  "googleRating",
  "googleReviewCount",
  "category",
  "problem1",
  "problem2",
  "problem3",
  "websiteAnalysis",
  "opportunities",
  "salkayPitch",
  "source",
  "dateChecked",
  "contactStatus",
  "outreachNotes",
];

function fold(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "");
}

function text(value: unknown) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  const next = String(value).trim();
  return next ? next : null;
}

function isStaleSentinel(value: unknown) {
  const raw = text(value);
  if (!raw) return false;
  return STALE_RESEARCH_STATUSES.has(fold(raw));
}

function researchedText(value: unknown) {
  if (isStaleSentinel(value)) return null;
  return text(value);
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined || value === "" || isStaleSentinel(value)) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseEnum<T extends string>(value: unknown, aliases: Record<string, T>, allowed: readonly T[]) {
  const raw = text(value);
  if (!raw) return undefined;
  const folded = fold(raw);
  if (aliases[folded]) return aliases[folded];
  const exact = allowed.find((item) => fold(item) === folded);
  return exact;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if ((char === "," || char === ";") && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

export function mapImportHeaders(headers: string[]) {
  return headers.map((header) => HEADER_ALIASES[fold(header)] ?? null);
}

function looksLikeMapsUrl(value?: string | null) {
  const raw = text(value);
  if (!raw) return false;
  return /google\.(com|com\.tr)\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(raw);
}

function cellHasValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim() !== "";
}

function isProvidedCell(field: RestaurantLeadProvidedField, value: unknown) {
  if (!cellHasValue(value)) return false;
  if (field === "websiteStatus" || field === "priority" || field === "contactStatus") return true;
  return !isStaleSentinel(value);
}

function toMillis(value: unknown) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === "string" && value.trim()) {
    const parsed = parseLeadDate(value);
    return parsed ? parsed.getTime() : null;
  }
  return null;
}

export function scalarEqual(left: unknown, right: unknown) {
  if (left == null && right == null) return true;
  if (left == null || right == null) return false;
  const leftTime = toMillis(left);
  const rightTime = toMillis(right);
  if (leftTime != null && rightTime != null) return leftTime === rightTime;
  if (typeof left === "number" && typeof right === "number") return left === right;
  return left === right;
}

function resolveWebsiteStatus(value: unknown): RestaurantWebsiteStatus {
  const raw = text(value);
  if (!raw) return "NOT_VERIFIED";
  const folded = fold(raw);
  if (STALE_RESEARCH_STATUSES.has(folded)) return "NOT_VERIFIED";
  return (
    parseEnum(raw, WEBSITE_STATUS_ALIASES, [
      "NO_WEBSITE",
      "VERY_WEAK",
      "WEAK",
      "IMPROVABLE",
      "GOOD",
      "VERY_GOOD",
      "NOT_VERIFIED",
    ]) ?? "NOT_VERIFIED"
  );
}

export function parseRestaurantLeadRow(raw: Record<string, unknown>, index: number): RestaurantLeadParsedRow {
  const restaurantName = text(raw.restaurantName) ?? "";
  const district = text(raw.district) ?? "";
  const websiteStatusProvided = isProvidedCell("websiteStatus", raw.websiteStatus);
  const websiteStatus = resolveWebsiteStatus(raw.websiteStatus);
  const parsedPriority = parseEnum(
    raw.priority,
    PRIORITY_ALIASES,
    ["HIGH", "MEDIUM", "LOW", "QUALIFIED_OUT", "PENDING"],
  );
  const priorityProvided = isProvidedCell("priority", raw.priority);
  const priority: RestaurantLeadPriority =
    parsedPriority ??
    (websiteStatus === "GOOD" || websiteStatus === "VERY_GOOD" ? "QUALIFIED_OUT" : "PENDING");
  const leadScore = parseNumber(raw.leadScore);
  const websiteScore = parseNumber(raw.websiteScore);
  const publicEmailRaw = researchedText(raw.publicEmail);
  const source = researchedText(raw.source);
  const mapsFromColumn = researchedText(raw.googleMapsUrl);
  const googleMapsUrl = mapsFromColumn || (looksLikeMapsUrl(source) ? source : null);
  const parsedContact = parseEnum(raw.contactStatus, CONTACT_STATUS_ALIASES, CONTACT_STATUSES);
  const parsedRegion = parseEnum(raw.region, REGION_ALIASES, ["ANADOLU", "AVRUPA"]);
  const regionProvided = isProvidedCell("region", raw.region);
  const errors: string[] = [];

  if (!restaurantName) errors.push("Restoran adı gerekli");
  if (!district) errors.push("İlçe gerekli");
  if (
    raw.leadScore !== undefined &&
    raw.leadScore !== null &&
    raw.leadScore !== "" &&
    !isStaleSentinel(raw.leadScore) &&
    leadScore === undefined
  ) {
    errors.push("leadScore sayı olmalı");
  }
  if (
    raw.websiteScore !== undefined &&
    raw.websiteScore !== null &&
    raw.websiteScore !== "" &&
    !isStaleSentinel(raw.websiteScore) &&
    websiteScore === undefined
  ) {
    errors.push("websiteScore sayı olmalı");
  }

  const sanitized = sanitizeRestaurantLeadWrite({
    restaurantName,
    district,
    region: parsedRegion,
    neighborhood: researchedText(raw.neighborhood),
    address: researchedText(raw.address),
    website: researchedText(raw.website),
    websiteDomain: researchedText(raw.websiteDomain),
    websiteStatus,
    websiteScore: allowsWebsiteScore(websiteStatus) ? websiteScore ?? null : null,
    leadScore: leadScore ?? null,
    priority,
    publicEmail: publicEmailRaw && isValidEmail(publicEmailRaw) ? publicEmailRaw : null,
    phone: researchedText(raw.phone),
    whatsapp: researchedText(raw.whatsapp),
    instagram: researchedText(raw.instagram),
    googleMapsUrl,
    googleRating: parseNumber(raw.googleRating) ?? null,
    googleReviewCount: parseNumber(raw.googleReviewCount) ?? null,
    category: researchedText(raw.category),
    problem1: researchedText(raw.problem1),
    problem2: researchedText(raw.problem2),
    problem3: researchedText(raw.problem3),
    websiteAnalysis: researchedText(raw.websiteAnalysis),
    opportunities: researchedText(raw.opportunities),
    salkayPitch: researchedText(raw.salkayPitch),
    source,
    dateChecked: parseLeadDate(
      researchedText(raw.dateChecked) ??
        text(raw.dateChecked) ??
        (raw.dateChecked instanceof Date ? raw.dateChecked : null),
    ),
    contactStatus: parsedContact ?? "NOT_CONTACTED",
    outreachNotes: researchedText(raw.outreachNotes),
  });

  const providedFields = UPDATEABLE_FIELDS.filter((field) => {
    if (field === "websiteStatus") return websiteStatusProvided;
    if (field === "region") return regionProvided;
    if (field === "priority") {
      return priorityProvided || (!priorityProvided && (websiteStatus === "GOOD" || websiteStatus === "VERY_GOOD"));
    }
    if (field === "googleMapsUrl") return isProvidedCell("googleMapsUrl", raw.googleMapsUrl);
    if (field === "websiteDomain" && isProvidedCell("website", raw.website) && !isProvidedCell("websiteDomain", raw.websiteDomain)) {
      return true;
    }
    if (field === "websiteScore" && websiteStatusProvided && !allowsWebsiteScore(websiteStatus)) {
      return true;
    }
    if (field === "publicEmail") {
      return Boolean(publicEmailRaw && isValidEmail(publicEmailRaw));
    }
    return isProvidedCell(field, raw[field]);
  });

  return {
    index,
    ...sanitized,
    publicEmail: publicEmailRaw && isValidEmail(publicEmailRaw) ? normalizeEmail(publicEmailRaw) : null,
    nameNorm: normalizeLeadKey(restaurantName),
    districtNorm: normalizeLeadKey(district),
    errors,
    providedFields,
  };
}

function recordsFromCsv(source: string) {
  const lines = source
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) {
    return { records: [] as Record<string, unknown>[], parseError: "CSV başlık ve en az bir satır içermeli." };
  }

  const headers = splitCsvLine(lines[0] ?? "");
  const mapped = mapImportHeaders(headers);
  if (!mapped.includes("restaurantName")) {
    return { records: [] as Record<string, unknown>[], parseError: "CSV başlığında restaurantName (veya eşdeğeri) gerekli." };
  }

  const records = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const record: Record<string, unknown> = {};
    mapped.forEach((field, cellIndex) => {
      if (!field) return;
      record[field] = cells[cellIndex] ?? "";
    });
    return record;
  });

  return { records };
}

export function parseRestaurantLeadCsv(source: string): {
  rows: RestaurantLeadParsedRow[];
  parseError?: string;
} {
  const parsed = recordsFromCsv(source);
  if (parsed.parseError) {
    return { rows: [], parseError: parsed.parseError };
  }
  return { rows: parsed.records.map((record, index) => parseRestaurantLeadRow(record, index + 2)) };
}

export async function parseRestaurantLeadXlsx(buffer: ArrayBuffer | Buffer): Promise<{
  rows: RestaurantLeadParsedRow[];
  parseError?: string;
}> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], parseError: "Excel dosyasında sayfa yok." };
  }
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
  if (rawRows.length === 0) {
    return { rows: [], parseError: "Excel sayfası boş." };
  }

  const first = rawRows[0] ?? {};
  const mappedHeaders = mapImportHeaders(Object.keys(first));
  if (!mappedHeaders.includes("restaurantName")) {
    return { rows: [], parseError: "Excel başlığında Restaurant / restaurantName (veya eşdeğeri) gerekli." };
  }

  const headerCells = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" })[0] ?? [];
  const fieldByCol = (headerCells as unknown[]).map((header) => HEADER_ALIASES[fold(String(header ?? ""))]);

  const rows = rawRows.map((raw, index) => {
    const record: Record<string, unknown> = {};
    Object.entries(raw).forEach(([header, value]) => {
      const field = HEADER_ALIASES[fold(header)];
      if (field) record[field] = value;
    });

    const excelRow = index + 2;
    fieldByCol.forEach((field, colIndex) => {
      if (!field) return;
      const cellAddress = XLSX.utils.encode_cell({ r: excelRow - 1, c: colIndex });
      const cell = sheet[cellAddress] as { l?: { Target?: string } } | undefined;
      const target = cell?.l?.Target?.trim();
      if (!target) return;
      if (field === "googleMapsUrl" || field === "website" || field === "instagram" || field === "source") {
        record[field] = target;
      }
    });

    return parseRestaurantLeadRow(record, excelRow);
  });

  return { rows };
}

export function summarizeRestaurantLeadPreview(
  rows: RestaurantLeadPreviewRow[],
  mode: RestaurantLeadImportMode = "create",
): RestaurantLeadImportStats {
  const classified = rows.map((row) => ({
    ...row,
    importAction: row.importAction ?? classifyRestaurantLeadImportRow(row, mode),
  }));
  const invalid = classified.filter((row) => row.importAction === "invalid").length;
  const newLeads = classified.filter((row) => row.importAction === "new").length;
  const updates = classified.filter((row) => row.importAction === "update").length;
  const unchanged = classified.filter((row) => row.importAction === "unchanged").length;
  const reviewRequired = classified.filter((row) => row.importAction === "review_required").length;
  const validRows = rows.filter((row) => row.errors.length === 0);
  return {
    total: rows.length,
    valid: validRows.length,
    newLeads,
    updates,
    unchanged,
    duplicates: validRows.filter((row) => row.duplicate).length,
    invalid,
    reviewRequired,
    notVerified: rows.filter((row) => row.websiteStatus === "NOT_VERIFIED").length,
    missingLeadScore: rows.filter((row) => row.leadScore == null).length,
  };
}

export function buildRestaurantLeadUpdatePatch(
  existing: RestaurantLead,
  row: RestaurantLeadParsedRow,
): Prisma.RestaurantLeadUpdateInput {
  const provided = new Set(row.providedFields);
  const patch: Prisma.RestaurantLeadUpdateInput = {};

  const assign = (field: RestaurantLeadProvidedField, value: unknown) => {
    if (!provided.has(field)) return;
    if (scalarEqual(existing[field as keyof RestaurantLead], value)) return;
    (patch as Record<string, unknown>)[field] = value;
  };

  assign("neighborhood", row.neighborhood);
  assign("region", row.region);
  assign("address", row.address);
  assign("website", row.website);
  assign("websiteDomain", row.websiteDomain);
  assign("websiteStatus", row.websiteStatus);
  assign("leadScore", row.leadScore);
  assign("priority", row.priority);
  assign("publicEmail", row.publicEmail);
  assign("phone", row.phone);
  assign("whatsapp", row.whatsapp);
  assign("instagram", row.instagram);
  assign("googleMapsUrl", row.googleMapsUrl);
  assign("googleRating", row.googleRating);
  assign("googleReviewCount", row.googleReviewCount);
  assign("category", row.category);
  assign("problem1", row.problem1);
  assign("problem2", row.problem2);
  assign("problem3", row.problem3);
  assign("websiteAnalysis", row.websiteAnalysis);
  assign("opportunities", row.opportunities);
  assign("salkayPitch", row.salkayPitch);
  assign("source", row.source);
  assign("dateChecked", parseLeadDate(row.dateChecked ?? null));
  assign("contactStatus", row.contactStatus);
  assign("outreachNotes", row.outreachNotes);

  const nextStatus = provided.has("websiteStatus") ? row.websiteStatus : existing.websiteStatus;
  if (!allowsWebsiteScore(nextStatus)) {
    if (existing.websiteScore != null) {
      patch.websiteScore = null;
    }
  } else if (provided.has("websiteScore") && !scalarEqual(existing.websiteScore, row.websiteScore)) {
    patch.websiteScore = row.websiteScore;
  }

  if (
    (nextStatus === "GOOD" || nextStatus === "VERY_GOOD") &&
    !provided.has("priority") &&
    existing.priority !== "QUALIFIED_OUT"
  ) {
    patch.priority = "QUALIFIED_OUT";
  }

  if (provided.has("websiteStatus") && nextStatus === "NOT_VERIFIED") {
    if (existing.websiteScore != null) patch.websiteScore = null;
    if (existing.leadScore != null) patch.leadScore = null;
    if (existing.priority !== "PENDING") patch.priority = "PENDING";
  }

  if (
    provided.has("source") &&
    !provided.has("googleMapsUrl") &&
    !existing.googleMapsUrl &&
    looksLikeMapsUrl(row.source)
  ) {
    patch.googleMapsUrl = row.googleMapsUrl;
  }

  return patch;
}

export function classifyRestaurantLeadImportRow(
  row: RestaurantLeadPreviewRow,
  mode: RestaurantLeadImportMode,
): RestaurantLeadImportAction {
  if (row.errors.length > 0) return "invalid";
  if (row.duplicate?.reason === "in_file") return "unchanged";
  if (row.importAction === "review_required") return "review_required";
  if (mode === "create") {
    return row.duplicate ? "unchanged" : "new";
  }
  if (!row.existing) return "new";
  const patch = buildRestaurantLeadUpdatePatch(row.existing, row);
  return Object.keys(patch).length > 0 ? "update" : "unchanged";
}

export async function attachRestaurantLeadDuplicates(
  rows: RestaurantLeadParsedRow[],
  mode: RestaurantLeadImportMode = "create",
): Promise<RestaurantLeadPreviewRow[]> {
  const seen = new Map<string, RestaurantLeadParsedRow>();
  // Full pool: phone/domain/name matching needs more than name+district keys.
  const existing = await getPrisma().restaurantLead.findMany();
  const pool = existing.map(toMatchCandidate);
  const byId = new Map(existing.map((lead) => [lead.id, lead]));

  return rows.map((row) => {
    const key = `${row.nameNorm}|${row.districtNorm}`;
    const inFile = seen.get(key);
    if (row.nameNorm && row.districtNorm) {
      seen.set(key, inFile ?? row);
    }

    if (inFile) {
      const preview: RestaurantLeadPreviewRow = {
        ...row,
        duplicate: {
          id: "",
          restaurantName: inFile.restaurantName,
          district: inFile.district,
          reason: "in_file",
        },
        existing: null,
        importAction: "unchanged",
      };
      preview.importAction = classifyRestaurantLeadImportRow(preview, mode);
      return preview;
    }

    const decision = matchRestaurantLeadAgainstPool(
      {
        restaurantName: row.restaurantName,
        nameNorm: row.nameNorm,
        district: row.district,
        districtNorm: row.districtNorm,
        address: row.address,
        phone: row.phone,
        website: row.website,
        websiteDomain: row.websiteDomain,
      },
      pool,
    );

    let preview: RestaurantLeadPreviewRow;
    if (decision.status === "match") {
      const match = byId.get(decision.existing.id) ?? null;
      preview = {
        ...row,
        duplicate: {
          id: decision.existing.id,
          restaurantName: decision.existing.restaurantName,
          district: decision.existing.district,
          reason: decision.reason,
        },
        existing: match,
        importAction: mode === "create" ? "unchanged" : "update",
      };
    } else if (decision.status === "review_required") {
      const first = decision.candidates[0];
      preview = {
        ...row,
        duplicate: first
          ? {
              id: first.id,
              restaurantName: first.restaurantName,
              district: first.district,
              reason: decision.reason,
            }
          : null,
        existing: first ? byId.get(first.id) ?? null : null,
        importAction: "review_required",
      };
    } else {
      preview = {
        ...row,
        duplicate: null,
        existing: null,
        importAction: "new",
      };
    }

    preview.importAction = classifyRestaurantLeadImportRow(preview, mode);
    return preview;
  });
}

export function restaurantLeadCsvTemplate() {
  return `${CANONICAL_HEADERS.join(",")}\n`;
}

export function isImportableLead(row: RestaurantLeadPreviewRow) {
  return row.importAction === "new" && row.errors.length === 0 && !row.duplicate;
}

export function isUpdatableLead(row: RestaurantLeadPreviewRow) {
  return row.importAction === "update" && Boolean(row.existing?.id);
}

export function parseRestaurantLeadImportMode(value: unknown): RestaurantLeadImportMode {
  return String(value ?? "").trim() === "update" ? "update" : "create";
}
