import { normalizeDomain } from "@/lib/admin/normalize";
import {
  blankToNull,
  normalizeLeadKey,
  normalizePhoneDigits,
} from "@/lib/admin/restaurant-leads";

export type RestaurantLeadMatchReason =
  | "name_district"
  | "name_primary_district"
  | "unique_name"
  | "phone"
  | "website_domain"
  | "district_address"
  | "in_file";

export type RestaurantLeadMatchConfidence = "exact" | "strong" | "ambiguous";

export type RestaurantLeadMatchCandidate = {
  id: string;
  restaurantName: string;
  district: string;
  nameNorm: string;
  districtNorm: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  websiteDomain?: string | null;
};

export type RestaurantLeadMatchProbe = {
  restaurantName: string;
  nameNorm?: string;
  district: string;
  districtNorm?: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  websiteDomain?: string | null;
  excludeId?: string;
};

export type RestaurantLeadMatchDecision =
  | { status: "none" }
  | {
      status: "match";
      reason: RestaurantLeadMatchReason;
      confidence: "exact" | "strong";
      existing: RestaurantLeadMatchCandidate;
    }
  | {
      status: "review_required";
      reason: RestaurantLeadMatchReason;
      confidence: "ambiguous";
      candidates: RestaurantLeadMatchCandidate[];
      detail: string;
    };

export type RestaurantLeadDuplicatePairKind =
  | "exact"
  | "phone"
  | "domain"
  | "name_only"
  | "name_primary_district"
  | "address";

export type RestaurantLeadDuplicatePair = {
  kind: RestaurantLeadDuplicatePairKind;
  autoMatch: boolean;
  reason: RestaurantLeadMatchReason;
  a: RestaurantLeadMatchCandidate;
  b: RestaurantLeadMatchCandidate;
  detail: string;
  falsePositiveRisk: "low" | "medium" | "high";
};

const SOCIAL_OR_DIRECTORY_HOSTS = new Set([
  "instagram.com",
  "facebook.com",
  "fb.com",
  "linktr.ee",
  "linktree.com",
  "canva.com",
  "yemeksepeti.com",
  "getir.com",
  "trendyol.com",
  "migros.com.tr",
  "restaurantguru.com",
  "tripadvisor.com",
  "foursquare.com",
  "maps.google.com",
  "goo.gl",
  "bit.ly",
]);

export function primaryDistrictNorm(district?: string | null) {
  const norm = normalizeLeadKey(district);
  if (!norm) return "";
  return norm.split(/[/,|–—-]/)[0]?.trim() ?? norm;
}

export function normalizeAddressKey(value?: string | null) {
  const raw = normalizeLeadKey(value);
  if (!raw) return "";
  return raw
    .replace(/[.,;:#'"`]/g, " ")
    .replace(
      /\b(mah|mahallesi|mh|cad|caddesi|cd|sok|sokak|sk|bulvar|bulvarı|no|numara|kat|daire|apt|apartmanı|iş hanı)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveWebsiteDomain(input: {
  website?: string | null;
  websiteDomain?: string | null;
}) {
  return normalizeDomain(blankToNull(input.websiteDomain) || blankToNull(input.website));
}

export function isOfficialWebsiteDomain(domain?: string | null) {
  const host = blankToNull(domain)?.toLowerCase() ?? "";
  if (!host) return false;
  if (SOCIAL_OR_DIRECTORY_HOSTS.has(host)) return false;
  for (const blocked of SOCIAL_OR_DIRECTORY_HOSTS) {
    if (host === blocked || host.endsWith(`.${blocked}`)) return false;
  }
  return true;
}

export function toMatchCandidate(lead: {
  id: string;
  restaurantName: string;
  district: string;
  nameNorm?: string | null;
  districtNorm?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  websiteDomain?: string | null;
}): RestaurantLeadMatchCandidate {
  return {
    id: lead.id,
    restaurantName: lead.restaurantName,
    district: lead.district,
    nameNorm: lead.nameNorm || normalizeLeadKey(lead.restaurantName),
    districtNorm: lead.districtNorm || normalizeLeadKey(lead.district),
    address: lead.address ?? null,
    phone: lead.phone ?? null,
    website: lead.website ?? null,
    websiteDomain: resolveWebsiteDomain(lead),
  };
}

function uniqueById(candidates: RestaurantLeadMatchCandidate[]) {
  const map = new Map<string, RestaurantLeadMatchCandidate>();
  for (const item of candidates) map.set(item.id, item);
  return [...map.values()];
}

function phoneKey(value?: string | null) {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 10 ? digits : "";
}

type MatchSignal = {
  reason: RestaurantLeadMatchReason;
  candidates: RestaurantLeadMatchCandidate[];
  /** Only exact/strong + single candidate may auto-match. */
  autoEligible: boolean;
  detail: string;
};

/**
 * Match import/probe row against an existing lead pool.
 * Auto UPDATE only for exact/strong unique signals.
 * Ambiguous, name-only, or address-only → review_required (never auto merge).
 */
export function matchRestaurantLeadAgainstPool(
  probeInput: RestaurantLeadMatchProbe,
  pool: RestaurantLeadMatchCandidate[],
): RestaurantLeadMatchDecision {
  const probe = {
    restaurantName: probeInput.restaurantName,
    nameNorm: probeInput.nameNorm || normalizeLeadKey(probeInput.restaurantName),
    district: probeInput.district,
    districtNorm: probeInput.districtNorm || normalizeLeadKey(probeInput.district),
    address: probeInput.address ?? null,
    phone: probeInput.phone ?? null,
    website: probeInput.website ?? null,
    websiteDomain: resolveWebsiteDomain(probeInput),
    excludeId: probeInput.excludeId,
  };

  const others = pool.filter((lead) => (probe.excludeId ? lead.id !== probe.excludeId : true));
  if (!probe.nameNorm || !probe.districtNorm) return { status: "none" };

  const signals: MatchSignal[] = [];

  // 1) exact nameNorm + districtNorm
  const exact = others.filter(
    (lead) => lead.nameNorm === probe.nameNorm && lead.districtNorm === probe.districtNorm,
  );
  if (exact.length > 0) {
    signals.push({
      reason: "name_district",
      candidates: exact,
      autoEligible: exact.length === 1,
      detail:
        exact.length === 1
          ? "Exact nameNorm+districtNorm"
          : "Aynı nameNorm+districtNorm birden fazla kayıtta (unique ihlali).",
    });
  }

  // 2) name + primary district (formatting variants only; multi-branch → review)
  const probePrimary = primaryDistrictNorm(probe.district);
  if (probePrimary) {
    const byPrimary = others.filter(
      (lead) =>
        lead.nameNorm === probe.nameNorm && primaryDistrictNorm(lead.district) === probePrimary,
    );
    if (byPrimary.length > 0 && exact.length === 0) {
      const sameNameEverywhere = others.filter((lead) => lead.nameNorm === probe.nameNorm);
      signals.push({
        reason: "name_primary_district",
        candidates: byPrimary,
        autoEligible: byPrimary.length === 1 && sameNameEverywhere.length === 1,
        detail:
          byPrimary.length === 1 && sameNameEverywhere.length === 1
            ? "Tek kayıt: isim + primary district"
            : "Aynı isim + primary district; şube veya yazım belirsiz.",
      });
    }
  }

  // 3) unique / shared normalized name — never auto across different districts
  const sameName = others.filter((lead) => lead.nameNorm === probe.nameNorm);
  if (sameName.length > 0 && exact.length === 0) {
    const onlyFormatting =
      sameName.length === 1 &&
      primaryDistrictNorm(sameName[0].district) === probePrimary &&
      probePrimary.length > 0;
    if (!onlyFormatting) {
      signals.push({
        reason: "unique_name",
        candidates: sameName,
        autoEligible: false,
        detail:
          sameName.length === 1
            ? "İsim DB'de tek ama ilçe farklı — şube/taşınma belirsiz; REVIEW_REQUIRED."
            : "Aynı isim birden fazla ilçede — olası şubeler; otomatik merge yok.",
      });
    }
  }

  // 4) normalized primary phone digits
  const probePhone = phoneKey(probe.phone);
  if (probePhone) {
    const byPhone = others.filter((lead) => phoneKey(lead.phone) === probePhone);
    if (byPhone.length > 0) {
      const sameNamePhone = byPhone.filter((lead) => lead.nameNorm === probe.nameNorm);
      const autoOk = byPhone.length === 1 && sameNamePhone.length === 1;
      signals.push({
        reason: "phone",
        candidates: byPhone,
        autoEligible: autoOk,
        detail: autoOk
          ? "Tek kayıt: aynı telefon + aynı isim"
          : byPhone.length > 1
            ? "Aynı telefon birden fazla kayıtta — REVIEW_REQUIRED."
            : "Aynı telefon farklı isimde — false-positive riski; REVIEW_REQUIRED.",
      });
    }
  }

  // 5) normalized website domain (official only)
  const probeDomain = probe.websiteDomain;
  if (probeDomain && isOfficialWebsiteDomain(probeDomain)) {
    const byDomain = others.filter(
      (lead) =>
        lead.websiteDomain &&
        isOfficialWebsiteDomain(lead.websiteDomain) &&
        lead.websiteDomain === probeDomain,
    );
    if (byDomain.length > 0) {
      const sameNameDomain = byDomain.filter((lead) => lead.nameNorm === probe.nameNorm);
      const autoOk = byDomain.length === 1 && sameNameDomain.length === 1;
      signals.push({
        reason: "website_domain",
        candidates: byDomain,
        autoEligible: autoOk,
        detail: autoOk
          ? "Tek kayıt: aynı official domain + aynı isim"
          : byDomain.length > 1
            ? "Aynı domain birden fazla kayıtta — REVIEW_REQUIRED."
            : "Aynı domain farklı isimde — zincir/paylaşılan site riski; REVIEW_REQUIRED.",
      });
    }
  }

  // 6) district + address — yardımcı; asla tek başına auto UPDATE
  const probeAddress = normalizeAddressKey(probe.address);
  if (probeAddress.length >= 12) {
    const byAddress = others.filter(
      (lead) =>
        lead.districtNorm === probe.districtNorm &&
        normalizeAddressKey(lead.address) === probeAddress,
    );
    if (byAddress.length > 0) {
      signals.push({
        reason: "district_address",
        candidates: byAddress,
        autoEligible: false,
        detail: "İlçe + adres benzerliği yardımcı sinyal; fuzzy tek başına UPDATE yok.",
      });
    }
  }

  if (signals.length === 0) return { status: "none" };

  const autoSignals = signals.filter((signal) => signal.autoEligible && signal.candidates.length === 1);
  const autoIds = new Set(autoSignals.map((signal) => signal.candidates[0].id));

  if (autoSignals.length > 0 && autoIds.size === 1) {
    const best =
      autoSignals.find((signal) => signal.reason === "name_district") ??
      autoSignals.find((signal) => signal.reason === "phone") ??
      autoSignals.find((signal) => signal.reason === "website_domain") ??
      autoSignals.find((signal) => signal.reason === "name_primary_district") ??
      autoSignals[0];
    return {
      status: "match",
      reason: best.reason,
      confidence: best.reason === "name_district" ? "exact" : "strong",
      existing: best.candidates[0],
    };
  }

  if (autoIds.size > 1) {
    const candidates = uniqueById(autoSignals.flatMap((signal) => signal.candidates));
    return {
      status: "review_required",
      reason: autoSignals[0].reason,
      confidence: "ambiguous",
      candidates,
      detail: "Birden fazla güçlü sinyal farklı kayıtlara işaret ediyor — REVIEW_REQUIRED.",
    };
  }

  const reviewSignals = signals.filter((signal) => !signal.autoEligible || signal.candidates.length !== 1);
  const candidates = uniqueById(reviewSignals.flatMap((signal) => signal.candidates));
  const primary = reviewSignals[0] ?? signals[0];
  return {
    status: "review_required",
    reason: primary.reason,
    confidence: "ambiguous",
    candidates,
    detail: primary.detail,
  };
}

function pairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Read-only audit of an existing lead set. Does not write or merge.
 */
export function analyzeRestaurantLeadDuplicatePairs(
  leads: RestaurantLeadMatchCandidate[],
): {
  exact: RestaurantLeadDuplicatePair[];
  phone: RestaurantLeadDuplicatePair[];
  domain: RestaurantLeadDuplicatePair[];
  nameOnly: RestaurantLeadDuplicatePair[];
  namePrimaryDistrict: RestaurantLeadDuplicatePair[];
  address: RestaurantLeadDuplicatePair[];
  wouldAutoMatch: RestaurantLeadDuplicatePair[];
  reviewRequired: RestaurantLeadDuplicatePair[];
} {
  const exact: RestaurantLeadDuplicatePair[] = [];
  const phone: RestaurantLeadDuplicatePair[] = [];
  const domain: RestaurantLeadDuplicatePair[] = [];
  const nameOnly: RestaurantLeadDuplicatePair[] = [];
  const namePrimaryDistrict: RestaurantLeadDuplicatePair[] = [];
  const address: RestaurantLeadDuplicatePair[] = [];
  const wouldAutoMatch: RestaurantLeadDuplicatePair[] = [];
  const reviewRequired: RestaurantLeadDuplicatePair[] = [];
  const seenAuto = new Set<string>();
  const seenReview = new Set<string>();

  const byNameDistrict = new Map<string, RestaurantLeadMatchCandidate[]>();
  const byPhone = new Map<string, RestaurantLeadMatchCandidate[]>();
  const byDomain = new Map<string, RestaurantLeadMatchCandidate[]>();
  const byName = new Map<string, RestaurantLeadMatchCandidate[]>();
  const byNamePrimary = new Map<string, RestaurantLeadMatchCandidate[]>();
  const byDistrictAddress = new Map<string, RestaurantLeadMatchCandidate[]>();

  for (const lead of leads) {
    const nd = `${lead.nameNorm}|${lead.districtNorm}`;
    byNameDistrict.set(nd, [...(byNameDistrict.get(nd) ?? []), lead]);

    const phone = phoneKey(lead.phone);
    if (phone) byPhone.set(phone, [...(byPhone.get(phone) ?? []), lead]);

    if (lead.websiteDomain && isOfficialWebsiteDomain(lead.websiteDomain)) {
      byDomain.set(lead.websiteDomain, [...(byDomain.get(lead.websiteDomain) ?? []), lead]);
    }

    byName.set(lead.nameNorm, [...(byName.get(lead.nameNorm) ?? []), lead]);

    const np = `${lead.nameNorm}|${primaryDistrictNorm(lead.district)}`;
    byNamePrimary.set(np, [...(byNamePrimary.get(np) ?? []), lead]);

    const addr = normalizeAddressKey(lead.address);
    if (addr.length >= 12) {
      const key = `${lead.districtNorm}|${addr}`;
      byDistrictAddress.set(key, [...(byDistrictAddress.get(key) ?? []), lead]);
    }
  }

  const pushPairs = (
    group: RestaurantLeadMatchCandidate[],
    kind: RestaurantLeadDuplicatePairKind,
    reason: RestaurantLeadMatchReason,
    detail: string,
    falsePositiveRisk: RestaurantLeadDuplicatePair["falsePositiveRisk"],
    autoMatch: boolean,
    bucket: RestaurantLeadDuplicatePair[],
  ) => {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const pair: RestaurantLeadDuplicatePair = {
          kind,
          autoMatch,
          reason,
          a: group[i],
          b: group[j],
          detail,
          falsePositiveRisk,
        };
        bucket.push(pair);
        const key = pairKey(group[i].id, group[j].id);
        if (autoMatch) {
          if (!seenAuto.has(key)) {
            seenAuto.add(key);
            wouldAutoMatch.push(pair);
          }
        } else if (!seenReview.has(key)) {
          seenReview.add(key);
          reviewRequired.push(pair);
        }
      }
    }
  };

  for (const group of byNameDistrict.values()) {
    if (group.length > 1) {
      pushPairs(
        group,
        "exact",
        "name_district",
        "Aynı nameNorm+districtNorm",
        "low",
        true,
        exact,
      );
    }
  }

  for (const group of byPhone.values()) {
    if (group.length > 1) {
      // Shared phone across existing rows → never silent merge; flag for review.
      pushPairs(
        group,
        "phone",
        "phone",
        "Aynı normalize telefon",
        group.some((item, idx) =>
          group.some(
            (other, otherIdx) =>
              otherIdx !== idx && item.nameNorm !== other.nameNorm,
          ),
        )
          ? "high"
          : "medium",
        false,
        phone,
      );
    }
  }

  for (const group of byDomain.values()) {
    if (group.length > 1) {
      pushPairs(
        group,
        "domain",
        "website_domain",
        "Aynı official website domain",
        group.some((item, idx) =>
          group.some(
            (other, otherIdx) =>
              otherIdx !== idx && item.nameNorm !== other.nameNorm,
          ),
        )
          ? "high"
          : "medium",
        false,
        domain,
      );
    }
  }

  for (const group of byName.values()) {
    if (group.length > 1) {
      const districts = new Set(group.map((item) => item.districtNorm));
      if (districts.size > 1) {
        pushPairs(
          group,
          "name_only",
          "unique_name",
          "Aynı isim, farklı district — olası şube veya yazım farkı",
          "high",
          false,
          nameOnly,
        );
      }
    }
  }

  for (const group of byNamePrimary.values()) {
    if (group.length > 1) {
      const districts = new Set(group.map((item) => item.districtNorm));
      if (districts.size > 1) {
        pushPairs(
          group,
          "name_primary_district",
          "name_primary_district",
          "Aynı isim + aynı primary district, farklı districtNorm",
          "medium",
          false,
          namePrimaryDistrict,
        );
      }
    }
  }

  for (const group of byDistrictAddress.values()) {
    if (group.length > 1) {
      pushPairs(
        group,
        "address",
        "district_address",
        "Aynı ilçe + normalize adres",
        group.some((item, idx) =>
          group.some(
            (other, otherIdx) =>
              otherIdx !== idx && item.nameNorm !== other.nameNorm,
          ),
        )
          ? "high"
          : "low",
        false,
        address,
      );
    }
  }

  // Cross-check: for each lead, would matcher auto-match another existing lead?
  for (const lead of leads) {
    const decision = matchRestaurantLeadAgainstPool(
      {
        restaurantName: lead.restaurantName,
        nameNorm: lead.nameNorm,
        district: lead.district,
        districtNorm: lead.districtNorm,
        address: lead.address,
        phone: lead.phone,
        website: lead.website,
        websiteDomain: lead.websiteDomain,
        excludeId: lead.id,
      },
      leads,
    );
    if (decision.status === "match") {
      const key = pairKey(lead.id, decision.existing.id);
      if (!seenAuto.has(key)) {
        seenAuto.add(key);
        wouldAutoMatch.push({
          kind:
            decision.reason === "phone"
              ? "phone"
              : decision.reason === "website_domain"
                ? "domain"
                : decision.reason === "name_primary_district"
                  ? "name_primary_district"
                  : decision.reason === "unique_name"
                    ? "name_only"
                    : "exact",
          autoMatch: true,
          reason: decision.reason,
          a: lead,
          b: decision.existing,
          detail: `Matcher auto-match: ${decision.reason} (${decision.confidence})`,
          falsePositiveRisk: decision.reason === "unique_name" ? "medium" : "low",
        });
      }
    } else if (decision.status === "review_required") {
      for (const candidate of decision.candidates) {
        const key = pairKey(lead.id, candidate.id);
        if (!seenReview.has(key) && !seenAuto.has(key)) {
          seenReview.add(key);
          reviewRequired.push({
            kind:
              decision.reason === "phone"
                ? "phone"
                : decision.reason === "website_domain"
                  ? "domain"
                  : decision.reason === "district_address"
                    ? "address"
                    : decision.reason === "name_primary_district"
                      ? "name_primary_district"
                      : "name_only",
            autoMatch: false,
            reason: decision.reason,
            a: lead,
            b: candidate,
            detail: decision.detail,
            falsePositiveRisk: "medium",
          });
        }
      }
    }
  }

  return {
    exact,
    phone,
    domain,
    nameOnly,
    namePrimaryDistrict,
    address,
    wouldAutoMatch,
    reviewRequired,
  };
}
