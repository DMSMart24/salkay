import assert from "node:assert/strict";
import { test } from "node:test";
import { assertNoInternalLeak, containsBlockedClaim, sanitizeCustomerIssues } from "@/lib/admin/email/claim-safety";
import { renderFromTemplate } from "@/lib/admin/email/render";
import { resolveSendableTemplate } from "@/lib/admin/email/sendable";
import { CUSTOMER_ANALYSIS_INTRO, customerWebsiteCopyKind } from "@/lib/admin/email/website-copy";
import { BAR_TEMPLATE_NAME, BAR_TEMPLATE_SUBJECT } from "@/lib/admin/email/templates/bar";
import { CONSTRUCTION_TEMPLATE_NAME } from "@/lib/admin/email/templates/construction";
import { ARCHITECTURE_TEMPLATE_NAME } from "@/lib/admin/email/templates/architecture";
import { REAL_ESTATE_TEMPLATE_NAME } from "@/lib/admin/email/templates/real-estate";
import { HOTEL_TEMPLATE_NAME } from "@/lib/admin/email/templates/hotel";
import { AUTOMOTIVE_TEMPLATE_NAME } from "@/lib/admin/email/templates/automotive";
import {
  RESTAURANT_TEMPLATE_NAME,
  RESTAURANT_TEMPLATE_SUBJECT,
} from "@/lib/admin/email/templates/restaurant";
import { evaluateAddressSend } from "@/lib/admin/outreach";
import type { CompanyEmailInput } from "@/lib/admin/email/context";

const staleRestaurant = {
  name: RESTAURANT_TEMPLATE_NAME,
  category: "RESTORAN",
  subject: "{{companyName}} web sitesi hakkında kısa bir fikir",
  body: "STALE ADMIN HTML live fetch failed NOT_VERIFIED",
};

function restaurantCompany(
  status: CompanyEmailInput["websiteStatus"],
  extras: Partial<CompanyEmailInput> = {},
): CompanyEmailInput {
  return {
    companyName: extras.companyName ?? "Mojo Ataşehir",
    website: extras.website ?? "https://www.mojolounge.com.tr/",
    district: extras.district ?? "Ataşehir",
    city: extras.city ?? "İstanbul",
    websiteStatus: status,
    websiteScore: extras.websiteScore ?? null,
    websiteIssues: extras.websiteIssues ?? [],
    recommendedServices: extras.recommendedServices ?? ["Web yeniden tasarım"],
    generalEmail: extras.generalEmail ?? "info@example.com",
    ...extras,
  };
}

function leakScan(html: string, text: string) {
  const hay = `${html}\n${text}`;
  return assertNoInternalLeak(hay);
}

test("claim safety blocks internal SSL and fetch notes", () => {
  assert.equal(containsBlockedClaim("SSL adı uyuşmuyor. NOT_VERIFIED bırakılamaz"), true);
  const sanitized = sanitizeCustomerIssues([
    "SSL adı uyuşmuyor. NOT_VERIFIED bırakılamaz; site güvenli açılmıyor.",
    "Official domain mojolounge.com.tr confirmed; live fetch failed.",
    "Veralteter visueller Gesamteindruck",
  ]);
  assert.equal(sanitized.customer.includes("Görsel tasarımın modernleştirilmesi"), true);
  assert.equal(
    sanitized.customer.some((item) => /ssl|NOT_VERIFIED|live fetch/i.test(item)),
    false,
  );
});

test("website copy kinds", () => {
  assert.equal(customerWebsiteCopyKind({ websiteStatus: "WEAK" }), "verified");
  assert.equal(customerWebsiteCopyKind({ websiteStatus: "NOT_VERIFIED" }), "not_verified");
  assert.equal(customerWebsiteCopyKind({ websiteStatus: "NO_WEBSITE" }), "no_website");
  assert.equal(customerWebsiteCopyKind({ websiteStatus: "UNKNOWN" }), "not_verified");
});

test("restaurant verified uses review copy, score, and code subject", () => {
  const company = restaurantCompany("WEAK", {
    companyName: "Salve Cafe",
    websiteScore: 2.5,
    websiteIssues: ["Veralteter visueller Gesamteindruck"],
  });
  const rendered = renderFromTemplate(staleRestaurant, company);
  assert.equal(rendered.subject, "Salve Cafe için kısa bir web analizi");
  assert.equal(rendered.sendable.subject, RESTAURANT_TEMPLATE_SUBJECT);
  assert.equal(rendered.context.copyKind, "verified");
  assert.equal(rendered.context.analysisIntro, CUSTOMER_ANALYSIS_INTRO.verified);
  assert.match(rendered.bodyHtml, /Web sitenizi sizin için kısaca inceledik/);
  assert.match(rendered.bodyHtml, /2,5/);
  assert.match(rendered.bodyHtml, /Ücretsiz örneği görmek istiyorum/);
  assert.match(rendered.bodyHtml, /Abonelikten çık/);
  assert.match(rendered.bodyHtml, /Salve Cafe için kısa bir dijital değerlendirme/);
  assert.equal(leakScan(rendered.bodyHtml, rendered.bodyText).length, 0);
});

test("restaurant NOT_VERIFIED does not claim a site review or show score", () => {
  const company = restaurantCompany("NOT_VERIFIED", {
    websiteScore: 8.1,
    websiteIssues: [
      "SSL adı uyuşmuyor. NOT_VERIFIED bırakılamaz; site güvenli açılmıyor.",
      "live fetch failed",
    ],
    recommendedServices: ["Web yeniden tasarım", "Rezervasyon entegrasyonu"],
  });
  const rendered = renderFromTemplate(staleRestaurant, company);
  assert.equal(rendered.context.copyKind, "not_verified");
  assert.equal(rendered.context.hasScore, false);
  assert.doesNotMatch(rendered.bodyHtml, /Web sitenizi sizin için kısaca inceledik/);
  assert.match(rendered.bodyHtml, /Dijital görünürlüğünüz için bazı geliştirme fırsatları belirledik/);
  assert.doesNotMatch(rendered.bodyHtml, /DİJİTAL WEB SKORU/);
  assert.doesNotMatch(rendered.bodyHtml, /8,1/);
  assert.doesNotMatch(rendered.bodyHtml, /NOT_VERIFIED/);
  assert.doesNotMatch(rendered.bodyHtml, /live fetch failed/i);
  assert.doesNotMatch(rendered.bodyHtml, /SSL/);
  assert.doesNotMatch(rendered.bodyHtml, /STALE ADMIN HTML/);
  assert.equal(leakScan(rendered.bodyHtml, rendered.bodyText).length, 0);
});

test("restaurant NO_WEBSITE uses opportunity path without invented audit", () => {
  const company = restaurantCompany("NO_WEBSITE", {
    website: null,
    websiteScore: 3,
    websiteIssues: ["live fetch failed"],
  });
  const rendered = renderFromTemplate(staleRestaurant, company);
  assert.equal(rendered.context.copyKind, "no_website");
  assert.equal(rendered.context.hasScore, false);
  assert.match(rendered.bodyHtml, /Bağımsız web sitesi bulunamadı/);
  assert.doesNotMatch(rendered.bodyHtml, /Web sitenizi sizin için kısaca inceledik/);
  assert.doesNotMatch(rendered.bodyHtml, /live fetch failed/i);
  assert.equal(leakScan(rendered.bodyHtml, rendered.bodyText).length, 0);
});

test("preview renderer equals send renderer and compose subject equals bulk subject", () => {
  const company = restaurantCompany("IMPROVABLE", {
    companyName: "Bayındır Et & Kebap",
    websiteScore: 4.2,
    websiteIssues: ["Veralteter visueller Gesamteindruck"],
  });
  const preview = renderFromTemplate(staleRestaurant, company);
  const send = renderFromTemplate(
    { ...staleRestaurant, subject: "other subject", body: "other body" },
    company,
  );
  assert.equal(preview.subject, send.subject);
  assert.equal(preview.bodyHtml, send.bodyHtml);
  assert.equal(preview.sendable.subject, send.sendable.subject);
});

const industryCases = [
  { name: BAR_TEMPLATE_NAME, category: "BAR", company: "Galeron", kind: "bar" },
  { name: CONSTRUCTION_TEMPLATE_NAME, category: "İNŞAAT", company: "Atlas İnşaat", kind: "construction" },
  { name: ARCHITECTURE_TEMPLATE_NAME, category: "MİMARLIK", company: "Linea Mimarlık", kind: "architecture" },
  { name: REAL_ESTATE_TEMPLATE_NAME, category: "GAYRİMENKUL", company: "Ada Emlak", kind: "realEstate" },
  { name: HOTEL_TEMPLATE_NAME, category: "OTEL", company: "Sahil Otel", kind: "hotel" },
  { name: AUTOMOTIVE_TEMPLATE_NAME, category: "OTOMOTİV", company: "Mert Otomotiv", kind: "automotive" },
] as const;

for (const row of industryCases) {
  test(`${row.kind} premium template uses code source and safe copy`, () => {
    const template = {
      name: row.name,
      category: row.category,
      subject: "STALE SUBJECT",
      body: "STALE BODY NOT_VERIFIED live fetch failed",
    };
    const sendable = resolveSendableTemplate(template);
    assert.equal(sendable.sourceOfTruth, "code");
    assert.notEqual(sendable.subject, "STALE SUBJECT");
    const rendered = renderFromTemplate(
      template,
      restaurantCompany("WEAK", {
        companyName: row.company,
        websiteScore: 4.4,
        websiteIssues: ["Veralteter visueller Gesamteindruck"],
      }),
    );
    assert.equal(rendered.subject.startsWith(row.company), true);
    assert.doesNotMatch(rendered.bodyHtml, /STALE BODY/);
    assert.doesNotMatch(rendered.bodyHtml, /NOT_VERIFIED/);
    assert.doesNotMatch(rendered.bodyHtml, /live fetch failed/i);
    assert.equal(leakScan(rendered.bodyHtml, rendered.bodyText).length, 0);
  });
}

test("bar canonical subject stays the bar subject", () => {
  const sendable = resolveSendableTemplate({
    name: BAR_TEMPLATE_NAME,
    category: "BAR",
    subject: "wrong",
    body: "wrong",
  });
  assert.equal(sendable.subject, BAR_TEMPLATE_SUBJECT);
});

test("custom template keeps database subject and body", () => {
  const template = {
    name: "Website önerisi",
    category: "GENEL",
    subject: "Web siteniz hakkında kısa bir öneri",
    body: "Merhaba {{companyName}} ekibi",
  };
  const sendable = resolveSendableTemplate(template);
  assert.equal(sendable.sourceOfTruth, "database");
  assert.equal(sendable.editorAffectsSend, true);
  const rendered = renderFromTemplate(template, restaurantCompany("WEAK", { companyName: "Fauna" }));
  assert.equal(rendered.subject, "Web siteniz hakkında kısa bir öneri");
  assert.match(rendered.bodyText, /Merhaba Fauna ekibi/);
});

test("DNC blocks real send address check", async () => {
  const blocked = await evaluateAddressSend({
    outreachStatus: "DO_NOT_CONTACT",
    status: "NEW",
    to: "lead@example.com",
  });
  assert.equal(blocked.ok, false);
});
