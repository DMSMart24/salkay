import { site } from "@/lib/site";
import {
  emailAssetUrl,
  emailAssets,
  emailCtaUrl,
  isEmailCtaConfigured,
  salkayPhone,
} from "@/lib/admin/email/assets";
import { escapeHtml } from "@/lib/admin/email/html";
import { fullName } from "@/lib/admin/normalize";

export type CompanyEmailInput = {
  companyName: string;
  website?: string | null;
  generalEmail?: string | null;
  phone?: string | null;
  industry?: string | null;
  city?: string | null;
  district?: string | null;
  websiteScore?: number | null;
  websiteIssues?: string[] | null;
  recommendedServices?: string[] | null;
  contacts?: Array<{
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    isPrimary?: boolean;
  }>;
};

export type CompanyEmailContext = {
  vars: Record<string, string>;
  issues: string[];
  recommendedServices: string[];
  hasScore: boolean;
  scoreLabel: string;
  ctaConfigured: boolean;
  ctaUrl: string;
  phoneVisible: boolean;
  logoUrl: string;
  kayUrl: string;
};

function cleanList(values?: string[] | null) {
  if (!Array.isArray(values)) return [];
  return values.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
}

export function buildRestaurantEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  return buildCompanyEmailContext(company);
}

export function buildCompanyEmailContext(company: CompanyEmailInput): CompanyEmailContext {
  const contact = company.contacts?.find((row) => row.isPrimary) ?? company.contacts?.[0];
  const contactName = contact
    ? fullName(contact.firstName ?? "", contact.lastName ?? "")
    : "";
  const companyEmail = company.generalEmail || contact?.email || "";
  const issues = cleanList(company.websiteIssues);
  const recommendedServices = cleanList(company.recommendedServices);
  const hasScore = typeof company.websiteScore === "number" && company.websiteScore >= 1 && company.websiteScore <= 10;
  const scoreLabel = hasScore ? String(company.websiteScore) : "Analiz devam ediyor";
  const phone = salkayPhone();
  const ctaUrl = emailCtaUrl();
  const unsubscribeUrl = companyEmail
    ? `${site.url}/unsubscribe?email=${encodeURIComponent(companyEmail)}`
    : `${site.url}/unsubscribe`;

  const vars: Record<string, string> = {
    companyName: company.companyName.trim(),
    contactName,
    firstName: contact?.firstName?.trim() || "",
    companyEmail,
    website: company.website?.trim() || "",
    district: company.district?.trim() || "",
    city: company.city?.trim() || "",
    industry: company.industry?.trim() || "",
    score: hasScore ? String(company.websiteScore) : "",
    issue_1: issues[0] ?? "",
    issue_2: issues[1] ?? "",
    issue_3: issues[2] ?? "",
    issue_4: issues[3] ?? "",
    recommendedServices: recommendedServices.join(" · "),
    companyPhone: company.phone?.trim() || "",
    unsubscribeUrl,
    salkayPhone: phone,
    salkayEmail: "info@salkay.com",
    salkayWebsite: site.url,
    ctaUrl,
    logoUrl: emailAssetUrl(emailAssets.logo),
    kayUrl: emailAssetUrl(emailAssets.kay),
  };

  return {
    vars,
    issues,
    recommendedServices,
    hasScore,
    scoreLabel,
    ctaConfigured: isEmailCtaConfigured(),
    ctaUrl,
    phoneVisible: Boolean(phone),
    logoUrl: vars.logoUrl,
    kayUrl: vars.kayUrl,
  };
}

export function issueRowsHtml(issues: string[]) {
  if (issues.length === 0) {
    return `<tr><td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#d7dde8;">Mevcut araştırma notu henüz eklenmedi.</td></tr>`;
  }

  return issues
    .slice(0, 4)
    .map(
      (issue) =>
        `<tr><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#f4f7fb;"><span style="color:#c9a46c;">▸</span> ${escapeHtml(issue)}</td></tr>`,
    )
    .join("");
}

export function scoreBlockHtml(context: CompanyEmailContext) {
  if (!context.hasScore) {
    return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#c9a46c;">Analiz devam ediyor</p>`;
  }

  return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:34px;color:#49e8ff;font-weight:700;">${escapeHtml(context.scoreLabel)} <span style="font-size:14px;color:#9aa6b8;font-weight:400;">/ 10</span></p>`;
}

export function phoneBlockHtml(context: CompanyEmailContext) {
  if (!context.phoneVisible) {
    return "";
  }
  return `<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;">${escapeHtml(context.vars.salkayPhone)}</p>`;
}
