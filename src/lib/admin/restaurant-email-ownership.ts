import { normalizeDomain, normalizeEmail } from "@/lib/admin/normalize";

export type RestaurantEmailOwnerClass =
  | "BUSINESS_DOMAIN"
  | "PERSONAL_EMAIL"
  | "AGENCY_OR_VENDOR"
  | "UNKNOWN";

export type RestaurantEmailOwnership = {
  classification: RestaurantEmailOwnerClass;
  readyEligible: boolean;
  reason: string;
  emailDomain: string | null;
  siteDomain: string | null;
};

const PERSONAL_HOSTS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.com.tr",
  "outlook.com",
  "outlook.com.tr",
  "live.com",
  "msn.com",
  "windowslive.com",
  "yahoo.com",
  "yahoo.com.tr",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "yandex.com",
  "yandex.ru",
  "yandex.com.tr",
  "mail.com",
  "gmx.com",
  "gmx.de",
]);

const AGENCY_HOSTS = [
  "goodpeople.digital",
  "qodeinteractive.com",
  "themeforest.net",
  "envato.com",
  "wixpress.com",
  "wix.com",
  "squarespace.com",
  "webflow.io",
  "shopify.com",
  "godaddy.com",
  "hostinger.com",
  "elementor.com",
  "wordpress.com",
];

const PLACEHOLDER_HOSTS = new Set([
  "website.com",
  "example.com",
  "sitem.com",
  "email.com",
  "test.com",
  "domain.com",
]);

const PLACEHOLDER_LOCAL = /^(eposta|ornek|example|test|asdf+|qwer+|aasssddff|dummy|placeholder|ornekmail)$/i;

function registrableName(domain: string | null) {
  if (!domain) return null;
  return domain
    .replace(/^www\./, "")
    .replace(/\.com\.tr$/i, "")
    .replace(/\.(com|net|org|pro|rest|digital|io|co|biz)$/i, "");
}

function isPersonalHost(domain: string) {
  return PERSONAL_HOSTS.has(domain) || [...PERSONAL_HOSTS].some((host) => domain.endsWith(`.${host}`));
}

function isAgencyHost(domain: string) {
  return AGENCY_HOSTS.some((host) => domain === host || domain.endsWith(`.${host}`));
}

function isPlaceholderEmail(email: string, domain: string) {
  const local = email.split("@")[0] ?? "";
  return PLACEHOLDER_HOSTS.has(domain) || PLACEHOLDER_LOCAL.test(local);
}

function domainsAligned(emailDomain: string, siteDomain: string | null) {
  if (!siteDomain) return false;
  if (emailDomain === siteDomain) return true;
  if (emailDomain.endsWith(`.${siteDomain}`) || siteDomain.endsWith(`.${emailDomain}`)) return true;
  const emailName = registrableName(emailDomain);
  const siteName = registrableName(siteDomain);
  return Boolean(emailName && siteName && emailName === siteName);
}

function foundOnOfficialSite(source: string | null | undefined, siteDomain: string | null) {
  if (!source || !siteDomain) return false;
  const normalized = source.toLowerCase();
  return (
    normalized === `website:${siteDomain}` ||
    normalized === `website-page:${siteDomain}` ||
    normalized.startsWith(`website:${siteDomain}`) ||
    normalized.startsWith(`website-page:${siteDomain}`)
  );
}

export function classifyRestaurantEmailOwnership(input: {
  email?: string | null;
  website?: string | null;
  websiteDomain?: string | null;
  emailSource?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const siteDomain = input.websiteDomain || normalizeDomain(input.website);
  const emailDomain = email?.split("@")[1] ?? null;

  if (!email || !emailDomain) {
    return {
      classification: "UNKNOWN" as const,
      readyEligible: false,
      reason: "No verified public email.",
      emailDomain,
      siteDomain,
    } satisfies RestaurantEmailOwnership;
  }

  if (isPlaceholderEmail(email, emailDomain)) {
    return {
      classification: "UNKNOWN" as const,
      readyEligible: false,
      reason: `Placeholder or fake mailbox kept on file: ${email}. Not a restaurant business inbox.`,
      emailDomain,
      siteDomain,
    } satisfies RestaurantEmailOwnership;
  }

  if (isPersonalHost(emailDomain)) {
    return {
      classification: "PERSONAL_EMAIL" as const,
      readyEligible: false,
      reason: `Personal mailbox (${emailDomain}). No explicit proof this is the restaurant official business contact.`,
      emailDomain,
      siteDomain,
    } satisfies RestaurantEmailOwnership;
  }

  if (isAgencyHost(emailDomain)) {
    return {
      classification: "AGENCY_OR_VENDOR" as const,
      readyEligible: false,
      reason: `Agency or vendor mailbox (${emailDomain}). Not the restaurant inbox.`,
      emailDomain,
      siteDomain,
    } satisfies RestaurantEmailOwnership;
  }

  if (domainsAligned(emailDomain, siteDomain)) {
    return {
      classification: "BUSINESS_DOMAIN" as const,
      readyEligible: true,
      reason: `Email domain matches official restaurant domain (${siteDomain}).`,
      emailDomain,
      siteDomain,
    } satisfies RestaurantEmailOwnership;
  }

  if (foundOnOfficialSite(input.emailSource, siteDomain)) {
    return {
      classification: "BUSINESS_DOMAIN" as const,
      readyEligible: true,
      reason: `Non-personal mailbox found on official website ${siteDomain}. Treated as restaurant business contact.`,
      emailDomain,
      siteDomain,
    } satisfies RestaurantEmailOwnership;
  }

  return {
    classification: "UNKNOWN" as const,
    readyEligible: false,
    reason: `Email domain ${emailDomain} does not match ${siteDomain ?? "no official site"} and was not proven as official restaurant contact.`,
    emailDomain,
    siteDomain,
  } satisfies RestaurantEmailOwnership;
}

export function restaurantLeadReadyGuard(input: {
  operatingStatus?: string | null;
  emailVerified?: boolean | null;
  pitchConfidence?: string | null;
  emailSubject?: string | null;
  emailBody?: string | null;
  fetchStatus?: string | null;
  possibleDuplicate?: boolean | null;
  primaryOpportunity?: string | null;
  email?: string | null;
  website?: string | null;
  websiteDomain?: string | null;
  emailSource?: string | null;
}) {
  const ownership = classifyRestaurantEmailOwnership(input);
  const reasons: string[] = [];
  if (input.operatingStatus !== "ACTIVE") reasons.push("operatingStatus is not ACTIVE");
  if (!input.emailVerified) reasons.push("emailVerified is not true");
  if (!ownership.readyEligible) reasons.push(ownership.reason);
  if (input.pitchConfidence !== "HIGH" && input.pitchConfidence !== "MEDIUM") {
    reasons.push("pitchConfidence is not HIGH or MEDIUM");
  }
  if (!input.primaryOpportunity) reasons.push("primaryOpportunity missing");
  if (!input.emailSubject || !input.emailBody) reasons.push("email draft missing");
  if (input.fetchStatus === "FAILED") reasons.push("fetch failed; pitch is ambiguous");
  if (input.possibleDuplicate) reasons.push("possible duplicate still unresolved");
  return {
    ownership,
    readyEligible: reasons.length === 0,
    reasons,
  };
}
