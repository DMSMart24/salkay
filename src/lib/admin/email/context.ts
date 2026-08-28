import { site } from "@/lib/site";
import {
  emailAssetUrl,
  emailAssets,
  emailCtaUrl,
  isEmailCtaConfigured,
  salkayPhone,
} from "@/lib/admin/email/assets";
import { escapeHtml } from "@/lib/admin/email/html";
import {
  localizeOutreachIssues,
  localizeRecommendedServices,
  type LocalizedText,
} from "@/lib/admin/email/localize";
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
  internalIssues: string[];
  customerIssues: string[];
  localizedIssues: LocalizedText[];
  issueReviewNeeded: string[];
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
  const internalIssues = cleanList(company.websiteIssues);
  const localizedIssues = localizeOutreachIssues(internalIssues, "tr");
  const customerIssues = localizedIssues.map((row) => row.customer).slice(0, 4);
  const issueReviewNeeded = localizedIssues.filter((row) => !row.matched).map((row) => row.original);
  const recommendedInternal = cleanList(company.recommendedServices);
  const recommendedServices = localizeRecommendedServices(recommendedInternal, "tr").map((row) => row.customer);
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
    issue_1: customerIssues[0] ?? "",
    issue_2: customerIssues[1] ?? "",
    issue_3: customerIssues[2] ?? "",
    issue_4: customerIssues[3] ?? "",
    recommendedServices: recommendedServices.join(" · "),
    companyPhone: company.phone?.trim() || "",
    unsubscribeUrl,
    salkayPhone: phone,
    salkayEmail: "info@salkay.com",
    salkayWebsite: site.url,
    ctaUrl,
    logoUrl: emailAssetUrl(emailAssets.logo),
    logoHeaderUrl: emailAssetUrl(emailAssets.logoHeader),
    kayUrl: emailAssetUrl(emailAssets.kay),
    heroUrl: emailAssetUrl(emailAssets.hero),
  };

  return {
    vars,
    issues: customerIssues,
    internalIssues,
    customerIssues,
    localizedIssues,
    issueReviewNeeded,
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
    return `<tr><td style="padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#d7dde8;">Gelişim alanı henüz eklenmedi.</td></tr>`;
  }

  return issues
    .slice(0, 4)
    .map(
      (issue) =>
        `<tr>
          <td valign="top" width="22" style="padding:0 8px 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td width="18" height="18" bgcolor="#16c7ff" align="center" style="background:#16c7ff;border-radius:9px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#07111f;font-weight:700;">✓</td>
              </tr>
            </table>
          </td>
          <td valign="top" style="padding:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#f4f7fb;">${escapeHtml(issue)}</td>
        </tr>`,
    )
    .join("");
}

function scoreBarHtml(score: number) {
  const cells = Array.from({ length: 10 }, (_, index) => {
    const on = index < score;
    return `<td width="20" height="7" bgcolor="${on ? "#16c7ff" : "#1a2b42"}" style="background:${on ? "#16c7ff" : "#1a2b42"};font-size:0;line-height:0;">&nbsp;</td>`;
  }).join(`<td width="5" style="font-size:0;line-height:0;">&nbsp;</td>`);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;"><tr>${cells}</tr></table>`;
}

export function scoreBlockHtml(context: CompanyEmailContext) {
  if (!context.hasScore) {
    return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:#d5aa62;">Genel Skor</p>
      <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:#d5aa62;font-weight:700;">Analiz devam ediyor</p>`;
  }

  const score = Number(context.scoreLabel);
  return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:#8ea0b8;">Genel Skor</p>
    <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:42px;line-height:44px;color:#16c7ff;font-weight:700;">${escapeHtml(context.scoreLabel)}<span style="font-size:16px;color:#8ea0b8;font-weight:400;"> /10</span></p>
    ${Number.isFinite(score) ? scoreBarHtml(score) : ""}`;
}

export function phoneBlockHtml(context: CompanyEmailContext) {
  if (!context.phoneVisible) {
    return "";
  }
  return `<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;">${escapeHtml(context.vars.salkayPhone)}</p>`;
}
