import assert from "node:assert/strict";
import { test } from "node:test";
import {
  architectureWhatsAppMessage,
  automotiveWhatsAppMessage,
  barWhatsAppMessage,
  constructionWhatsAppMessage,
  hotelWhatsAppMessage,
  realEstateWhatsAppMessage,
  restaurantCtaUrl,
  restaurantWhatsAppMessage,
} from "@/lib/admin/email/assets";
import { assertNoInternalLeak } from "@/lib/admin/email/claim-safety";
import { renderFromTemplate } from "@/lib/admin/email/render";
import { resolveSendableTemplate } from "@/lib/admin/email/sendable";
import { ARCHITECTURE_TEMPLATE_NAME } from "@/lib/admin/email/templates/architecture";
import { AUTOMOTIVE_TEMPLATE_NAME } from "@/lib/admin/email/templates/automotive";
import { BAR_TEMPLATE_NAME } from "@/lib/admin/email/templates/bar";
import { CONSTRUCTION_TEMPLATE_NAME } from "@/lib/admin/email/templates/construction";
import { HOTEL_TEMPLATE_NAME } from "@/lib/admin/email/templates/hotel";
import { OUTREACH_COPY, opportunityCards, outreachCopy } from "@/lib/admin/email/templates/outreach-copy";
import type { PremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import { REAL_ESTATE_TEMPLATE_NAME } from "@/lib/admin/email/templates/real-estate";
import { RESTAURANT_TEMPLATE_NAME } from "@/lib/admin/email/templates/restaurant";
import {
  applyPreviewWebsiteMode,
  CUSTOMER_ANALYSIS_INTRO,
} from "@/lib/admin/email/website-copy";
import type { CompanyEmailInput } from "@/lib/admin/email/context";

const PREMIUM_KINDS = [
  "restaurant",
  "bar",
  "construction",
  "architecture",
  "realEstate",
  "hotel",
  "automotive",
] as const satisfies ReadonlyArray<Exclude<PremiumEmailKind, "custom">>;

const TEMPLATE_BY_KIND = {
  restaurant: { name: RESTAURANT_TEMPLATE_NAME, category: "RESTORAN" },
  bar: { name: BAR_TEMPLATE_NAME, category: "BAR" },
  construction: { name: CONSTRUCTION_TEMPLATE_NAME, category: "İNŞAAT" },
  architecture: { name: ARCHITECTURE_TEMPLATE_NAME, category: "MİMARLIK" },
  realEstate: { name: REAL_ESTATE_TEMPLATE_NAME, category: "GAYRİMENKUL" },
  hotel: { name: HOTEL_TEMPLATE_NAME, category: "OTEL" },
  automotive: { name: AUTOMOTIVE_TEMPLATE_NAME, category: "OTOMOTİV" },
} as const;

function company(extras: Partial<CompanyEmailInput> = {}): CompanyEmailInput {
  return {
    companyName: extras.companyName ?? "Mojo Ataşehir",
    website: extras.website ?? "https://www.example.com/",
    district: extras.district ?? "Ataşehir",
    city: extras.city ?? "İstanbul",
    websiteStatus: extras.websiteStatus ?? "WEAK",
    websiteScore: extras.websiteScore ?? 4.2,
    websiteIssues: extras.websiteIssues ?? ["Veralteter visueller Gesamteindruck"],
    recommendedServices: extras.recommendedServices ?? ["Web yeniden tasarım"],
    generalEmail: extras.generalEmail ?? "info@example.com",
    ...extras,
  };
}

function templateFor(kind: Exclude<PremiumEmailKind, "custom">) {
  const row = TEMPLATE_BY_KIND[kind];
  return {
    name: row.name,
    category: row.category,
    subject: "STALE SUBJECT",
    body: "STALE BODY NOT_VERIFIED live fetch failed",
  };
}

function leakScan(html: string, text: string) {
  return assertNoInternalLeak(`${html}\n${text}`);
}

const EXPECTED_PREFILL =
  "Merhaba Salih Bey, Mojo Ataşehir için gönderdiğiniz öneriyi inceledim. Ücretsiz örneği görmek isterim.";

test("all seven premium industries have unique subject, preheader, and follow-on copy", () => {
  const subjects = PREMIUM_KINDS.map((kind) => outreachCopy(kind).subject);
  const preheaders = PREMIUM_KINDS.map((kind) => outreachCopy(kind).preheader);
  const followOns = PREMIUM_KINDS.map((kind) => outreachCopy(kind).followOn.verified);
  assert.equal(new Set(subjects).size, 7);
  assert.equal(new Set(preheaders).size, 7);
  assert.equal(new Set(followOns).size, 7);
  for (const kind of PREMIUM_KINDS) {
    const spec = outreachCopy(kind);
    assert.equal(spec.ctaLabel, "Ücretsiz örneği görmek istiyorum");
    assert.match(spec.eyebrow, /SİZE ÖZEL/);
    assert.equal(spec.defaultOpportunities.length <= 3, true);
  }
});

for (const kind of PREMIUM_KINDS) {
  test(`${kind} premium mail has subject, preheader, single CTA, unsubscribe, and no leaks`, () => {
    const spec = outreachCopy(kind);
    const rendered = renderFromTemplate(
      templateFor(kind),
      company({ companyName: "Ada Grup" }),
    );
    assert.equal(rendered.sendable.sourceOfTruth, "code");
    assert.equal(rendered.subject.length > 0, true);
    assert.equal(rendered.subject.startsWith("Ada Grup"), true);
    assert.doesNotMatch(rendered.subject, /!!!|ACİL|FIRSAT|%100|GARANTİ/);
    assert.match(rendered.bodyHtml, /Merhaba Ada Grup Ekibi/);
    assert.match(
      rendered.bodyHtml,
      new RegExp(spec.preheader.replace(/\{\{\s*companyName\s*\}\}/g, "Ada Grup").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
    assert.match(rendered.bodyHtml, new RegExp(spec.followOn.verified.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(rendered.bodyHtml, /Ücretsiz örneği görmek istiyorum/);
    assert.equal((rendered.bodyHtml.match(/class="salkay-cta-btn"/g) ?? []).length, 1);
    assert.match(rendered.bodyHtml, /Abonelikten çık/);
    assert.match(rendered.bodyHtml, /unsubscribe/);
    assert.match(rendered.bodyHtml, /Sizin için öne çıkan fırsatlar/);
    assert.match(rendered.bodyHtml, /Salih Kaya/);
    assert.doesNotMatch(rendered.bodyHtml, /STALE BODY/);
    assert.doesNotMatch(rendered.bodyHtml, /NOT_VERIFIED/);
    assert.doesNotMatch(rendered.bodyHtml, /live fetch failed/i);
    assert.doesNotMatch(rendered.bodyHtml, /password/i);
    assert.doesNotMatch(rendered.bodyHtml, /ilan bulunamadı|stok yok|booking entegrasyonu yok|rezervasyon sistemi yok/i);
    assert.doesNotMatch(rendered.bodyHtml, /Ücretsiz Fikir Al/);
    assert.doesNotMatch(rendered.bodyHtml, /DİJİTAL WEB SKORU/);
    assert.equal(leakScan(rendered.bodyHtml, rendered.bodyText).length, 0);
    assert.equal(rendered.unresolved, false);
  });
}

test("restaurant VERIFIED / NOT_VERIFIED / NO_WEBSITE keep claim-safe copy", () => {
  const verified = renderFromTemplate(templateFor("restaurant"), company({
    companyName: "Salve Cafe",
    websiteStatus: "WEAK",
    websiteScore: 2.5,
  }));
  assert.equal(verified.context.copyKind, "verified");
  assert.match(verified.bodyHtml, /Web sitenizi sizin için kısaca inceledik/);
  assert.match(verified.bodyHtml, /mobil kullanıcı deneyimi, rezervasyon akışı/);
  assert.match(verified.bodyHtml, /Dijital skor/);
  assert.match(verified.bodyHtml, /2,5/);

  const notVerified = renderFromTemplate(templateFor("restaurant"), company({
    companyName: "Salve Cafe",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: 8.1,
    websiteIssues: ["SSL adı uyuşmuyor. NOT_VERIFIED bırakılamaz", "live fetch failed"],
  }));
  assert.equal(notVerified.context.copyKind, "not_verified");
  assert.doesNotMatch(notVerified.bodyHtml, /Web sitenizi sizin için kısaca inceledik/);
  assert.match(notVerified.bodyHtml, /Dijital görünürlüğünüz için bazı geliştirme fırsatları belirledik/);
  assert.doesNotMatch(notVerified.bodyHtml, /Dijital skor/);
  assert.doesNotMatch(notVerified.bodyHtml, /8,1/);
  assert.doesNotMatch(notVerified.bodyHtml, /NOT_VERIFIED/);
  assert.doesNotMatch(notVerified.bodyHtml, /live fetch failed/i);
  assert.doesNotMatch(notVerified.bodyHtml, /SSL/);
  assert.equal(leakScan(notVerified.bodyHtml, notVerified.bodyText).length, 0);

  const noWebsite = renderFromTemplate(templateFor("restaurant"), company({
    companyName: "Salve Cafe",
    websiteStatus: "NO_WEBSITE",
    website: null,
    websiteScore: 3,
  }));
  assert.equal(noWebsite.context.copyKind, "no_website");
  assert.match(noWebsite.bodyHtml, /Bağımsız web sitesi bulunamadı/);
  assert.doesNotMatch(noWebsite.bodyHtml, /Web sitenizi sizin için kısaca inceledik/);
  assert.match(noWebsite.bodyHtml, new RegExp(CUSTOMER_ANALYSIS_INTRO.no_website.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("missing location and score still render cleanly", () => {
  const rendered = renderFromTemplate(
    templateFor("architecture"),
    company({
      companyName: "Çok Uzun İsimli Bir Mimarlık Ofisi ve Proje Atölyesi",
      district: "",
      city: "",
      websiteScore: null,
      websiteIssues: [],
    }),
  );
  assert.match(rendered.bodyHtml, /Çok Uzun İsimli Bir Mimarlık Ofisi/);
  assert.doesNotMatch(rendered.bodyHtml, /Dijital skor/);
  assert.doesNotMatch(rendered.bodyHtml, /undefined/);
  assert.equal(rendered.unresolved, false);
});

test("WhatsApp prefill is natural and CTA uses wa.me", () => {
  assert.equal(restaurantWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  assert.equal(barWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  assert.equal(constructionWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  assert.equal(architectureWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  assert.equal(realEstateWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  assert.equal(hotelWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  assert.equal(automotiveWhatsAppMessage("Mojo Ataşehir"), EXPECTED_PREFILL);
  const url = restaurantCtaUrl("Mojo Ataşehir");
  assert.match(url, /^https:\/\/wa\.me\/\d+\?text=/);
  assert.match(url, new RegExp(encodeURIComponent("Ücretsiz örneği görmek isterim")));
  const rendered = renderFromTemplate(templateFor("restaurant"), company({ companyName: "Mojo Ataşehir" }));
  assert.match(rendered.bodyHtml, /wa\.me\/\d+/);
  assert.match(rendered.bodyHtml, /Ücretsiz örneği görmek istiyorum/);
  assert.match(rendered.bodyHtml, new RegExp(encodeURIComponent("Ücretsiz örneği görmek isterim")));
});

test("preview website mode only changes preview copy, not claims for unverified", () => {
  const base = company({ websiteStatus: "NOT_VERIFIED", websiteScore: 9 });
  const verifiedPreview = applyPreviewWebsiteMode(base, "verified");
  assert.equal(verifiedPreview.websiteStatus, "WEAK");
  assert.equal(verifiedPreview.websiteScore, 9);
  const notVerified = applyPreviewWebsiteMode(base, "not_verified");
  assert.equal(notVerified.websiteStatus, "NOT_VERIFIED");
  assert.equal(notVerified.websiteScore, null);
  const noWebsite = applyPreviewWebsiteMode(base, "no_website");
  assert.equal(noWebsite.websiteStatus, "NO_WEBSITE");
});

test("opportunity cards stay at three and map known services without inventing missing features", () => {
  const cards = opportunityCards(OUTREACH_COPY.restaurant, [
    "Mobil kullanıcı deneyimi",
    "Rezervasyon entegrasyonu",
    "Yerel SEO",
    "E-ticaret entegrasyonu",
  ]);
  assert.equal(cards.length, 3);
  assert.equal(cards[0]?.title, "Mobil deneyim");
  assert.equal(cards[1]?.title, "Rezervasyon akışı");
  assert.equal(cards[2]?.title, "Yerel görünürlük");
  const hotel = opportunityCards(OUTREACH_COPY.hotel, ["Rezervasyon"]);
  assert.doesNotMatch(hotel.map((card) => card.body).join(" "), /yok|eksik|bulunamadı/);
  const auto = opportunityCards(OUTREACH_COPY.automotive, ["Stok"]);
  assert.doesNotMatch(auto.map((card) => card.body).join(" "), /stok yok|inventory/i);
});

test("code source of truth ignores stale admin HTML for every premium kind", () => {
  for (const kind of PREMIUM_KINDS) {
    const sendable = resolveSendableTemplate(templateFor(kind));
    assert.equal(sendable.sourceOfTruth, "code");
    assert.equal(sendable.editorAffectsSend, false);
    assert.match(sendable.body, new RegExp(`salkay-email:${outreachCopy(kind).marker}`));
  }
});
