import {
  localizeOutreachIssues,
  localizeRecommendedServices,
  type LocalizedText,
} from "@/lib/admin/email/localize";

const BLOCKED_CLAIM_PATTERNS: readonly RegExp[] = [
  /\bnot[_\s-]?verified\b/i,
  /live\s*fetch\s*failed/i,
  /\bssl\b/i,
  /certificate/i,
  /sertifika/i,
  /password|passwort|şifre|\bsifre\b/i,
  /\b(p1001|p1002|p2022)\b/i,
  /\berr_[a-z0-9_]+\b/i,
  /\b(404|500|502|503|521)\b/,
  /\b(playwright|puppeteer|crawler|crawl|debug)\b/i,
  /sales\s*pitch/i,
  /lead\s*score/i,
  /do[_\s-]?not[_\s-]?contact/i,
  /internal\s+note/i,
  /stack\s*trace/i,
  /database_url/i,
  /resend[_\s-]?api/i,
  /wi-?fi\s*(password|şifre|pass)/i,
];

const INTERNAL_NOTE_PATTERNS: readonly RegExp[] = [
  /fetch failed/i,
  /live fetch/i,
  /official domain .* confirmed/i,
  /email not taken/i,
  /third-party pages/i,
  /research source/i,
  /wave\s*\d/i,
  /outreach-(first|second|low)/i,
  /skor verilmedi/i,
  /skor yok/i,
  /inceleme anında site/i,
];

export function containsBlockedClaim(value: string) {
  const text = value.trim();
  if (!text) return false;
  return BLOCKED_CLAIM_PATTERNS.some((pattern) => pattern.test(text));
}

export function looksLikeInternalResearchNote(value: string) {
  const text = value.trim();
  if (!text) return false;
  if (containsBlockedClaim(text)) return true;
  return INTERNAL_NOTE_PATTERNS.some((pattern) => pattern.test(text));
}

export function assertNoInternalLeak(text: string) {
  const hay = text.replace(/\s+/g, " ");
  const leaks = [
    "NOT_VERIFIED",
    "live fetch failed",
    "LIVE FETCH FAILED",
    "salesPitch",
    "leadScore",
  ].filter((needle) => hay.includes(needle));
  if (/ssl adı|certificate error|ERR_/i.test(hay)) {
    leaks.push("ssl-or-certificate");
  }
  return leaks;
}

export function sanitizeCustomerIssue(row: LocalizedText): string | null {
  if (!row.customer.trim()) return null;
  if (looksLikeInternalResearchNote(row.original) || containsBlockedClaim(row.customer)) {
    return null;
  }
  if (row.matched) return row.customer.trim();
  if (row.sourceLanguage === "tr" && !looksLikeInternalResearchNote(row.customer)) {
    return row.customer.trim();
  }
  if (row.customer === "Bu alanda dijital deneyimin geliştirilmesi önerilir.") {
    return row.customer;
  }
  return null;
}

export function sanitizeCustomerIssues(issues: string[], language: "tr" | "de" | "en" = "tr") {
  const localized = localizeOutreachIssues(issues, language);
  const customer: string[] = [];
  const dropped: string[] = [];
  for (const row of localized) {
    const safe = sanitizeCustomerIssue(row);
    if (safe) {
      customer.push(safe);
    } else if (row.original.trim()) {
      dropped.push(row.original.trim());
    }
  }
  return { customer: customer.slice(0, 4), dropped };
}

export function sanitizeRecommendedServices(items: string[], language: "tr" | "de" | "en" = "tr") {
  return localizeRecommendedServices(items, language)
    .filter((row) => !containsBlockedClaim(row.original) && !containsBlockedClaim(row.customer))
    .map((row) => row.customer);
}
