import assert from "node:assert/strict";
import { test } from "node:test";
import { assertNoInternalLeak } from "@/lib/admin/email/claim-safety";
import { renderFromTemplate } from "@/lib/admin/email/render";
import {
  evaluateFollowUpEligibility,
  followUpReadyAt,
  followUpSubject,
  inferredSequenceStep,
  resolveCompanySequence,
  threadingHeaders,
  type SequenceCompanyInput,
  type SequenceMessage,
} from "@/lib/admin/email/sequence";
import { followUpCopy } from "@/lib/admin/email/templates/follow-up-copy";
import type { PremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import { ARCHITECTURE_TEMPLATE_NAME } from "@/lib/admin/email/templates/architecture";
import { AUTOMOTIVE_TEMPLATE_NAME } from "@/lib/admin/email/templates/automotive";
import { BAR_TEMPLATE_NAME } from "@/lib/admin/email/templates/bar";
import { CONSTRUCTION_TEMPLATE_NAME } from "@/lib/admin/email/templates/construction";
import { HOTEL_TEMPLATE_NAME } from "@/lib/admin/email/templates/hotel";
import { REAL_ESTATE_TEMPLATE_NAME } from "@/lib/admin/email/templates/real-estate";
import { RESTAURANT_TEMPLATE_NAME } from "@/lib/admin/email/templates/restaurant";
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

const SENT_AT = new Date("2026-08-31T10:00:00.000Z");

function companyInput(extras: Partial<CompanyEmailInput> = {}): CompanyEmailInput {
  return {
    companyName: extras.companyName ?? "Mojo Ataşehir",
    website: extras.website ?? "https://www.example.com/",
    district: extras.district ?? "Ataşehir",
    city: extras.city ?? "İstanbul",
    websiteStatus: extras.websiteStatus ?? "NOT_VERIFIED",
    websiteScore: extras.websiteScore ?? 4.2,
    websiteIssues: extras.websiteIssues ?? [
      "NOT_VERIFIED live fetch failed SSL certificate ERR_CERT",
    ],
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
    subject: "{{companyName}} için kısa bir web analizi",
    body: "STALE BODY NOT_VERIFIED live fetch failed",
  };
}

function baseCompany(extras: Partial<SequenceCompanyInput> = {}): SequenceCompanyInput {
  return {
    outreachStatus: "SENT",
    status: "CONTACTED",
    archivedAt: null,
    followUpStoppedAt: null,
    suppressed: false,
    unsubscribed: false,
    generalEmail: "info@example.com",
    contacts: [],
    tags: [],
    ...extras,
  };
}

function outbound(
  extras: Partial<SequenceMessage> & Pick<SequenceMessage, "status">,
): SequenceMessage {
  return {
    id: extras.id ?? extras.status,
    direction: "OUTBOUND",
    sequenceStep: extras.sequenceStep ?? 0,
    sentAt: extras.sentAt ?? null,
    createdAt: extras.createdAt ?? SENT_AT,
    failureReason: extras.failureReason ?? null,
    ...extras,
  };
}

test("follow-up subject uses Re: thread without spam words", () => {
  assert.equal(followUpSubject("Mojo için kısa bir web analizi"), "Re: Mojo için kısa bir web analizi");
  assert.equal(followUpSubject("Re: Mojo için kısa bir web analizi"), "Re: Mojo için kısa bir web analizi");
  assert.match(followUpSubject("Mojo için kısa bir web analizi"), /^Re:/);
  assert.doesNotMatch(followUpSubject("Mojo için kısa bir web analizi"), /ücretsiz kazanç|son şans|acil fırsat/i);
});

test("sequence step is inferred from follow-up html markers", () => {
  assert.equal(inferredSequenceStep({ bodyHtml: "<!-- salkay-email:restaurant-follow-1 -->" }), 1);
  assert.equal(inferredSequenceStep({ bodyHtml: "<!-- salkay-email:bar-follow-2 -->" }), 2);
  assert.equal(inferredSequenceStep({ bodyText: "normal outreach" }), 0);
});

test("threading headers wrap provider ids when present", () => {
  assert.equal(threadingHeaders(null), undefined);
  assert.deepEqual(threadingHeaders("abc-123"), {
    "In-Reply-To": "<abc-123@salkay.resend>",
    References: "<abc-123@salkay.resend>",
  });
});

test("initial SENT after delay is eligible for follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany(),
    messages: [outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT })],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "READY");
});

test("initial DRAFT is not eligible for follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ outreachStatus: "NEW" }),
    messages: [outbound({ status: "DRAFT", sequenceStep: 0 })],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "PENDING");
});

test("company REPLIED stops follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ outreachStatus: "REPLIED" }),
    messages: [outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT })],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "STOPPED");
  assert.match(result.reason, /Yanıtlandı/);
});

test("company DO_NOT_CONTACT blocks follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ outreachStatus: "DO_NOT_CONTACT" }),
    messages: [outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT })],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "STOPPED");
});

test("suppression blocks follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ suppressed: true }),
    messages: [outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT })],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "STOPPED");
  assert.match(result.reason, /Sperrliste/);
});

test("unsubscribe blocks follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ unsubscribed: true }),
    messages: [outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT })],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Abonelikten/);
});

test("bounce blocks follow-up 1", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany(),
    messages: [
      outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT }),
      outbound({ id: "bounce", status: "BOUNCED", sequenceStep: 0, sentAt: SENT_AT }),
    ],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Geri döndü/);
});

test("follow-up 1 SENT makes follow-up 2 eligible after delay", () => {
  const follow1SentAt = followUpReadyAt(1, SENT_AT);
  const result = evaluateFollowUpEligibility({
    company: baseCompany(),
    messages: [
      outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT }),
      outbound({ id: "fu1", status: "SENT", sequenceStep: 1, sentAt: follow1SentAt, createdAt: follow1SentAt }),
    ],
    step: 2,
    now: followUpReadyAt(2, follow1SentAt),
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "READY");
});

test("follow-up 1 pending blocks follow-up 2", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany(),
    messages: [outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT })],
    step: 2,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "PENDING");
});

test("follow-up 2 SENT completes the sequence", () => {
  const follow1SentAt = followUpReadyAt(1, SENT_AT);
  const follow2SentAt = followUpReadyAt(2, follow1SentAt);
  const view = resolveCompanySequence({
    company: baseCompany(),
    messages: [
      outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT }),
      outbound({ id: "fu1", status: "SENT", sequenceStep: 1, sentAt: follow1SentAt, createdAt: follow1SentAt }),
      outbound({ id: "fu2", status: "SENT", sequenceStep: 2, sentAt: follow2SentAt, createdAt: follow2SentAt }),
    ],
    now: follow2SentAt,
  });
  assert.equal(view.complete, true);
  assert.equal(view.followUp2.status, "SENT");
  assert.equal(view.nextFollowUp, null);
});

test("manual email REPLIED status stops later follow-ups", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany(),
    messages: [
      outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT }),
      outbound({ id: "reply", status: "REPLIED", sequenceStep: 0, sentAt: SENT_AT }),
    ],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "STOPPED");
});

test("follow-up copy has no internal claims and all 7 industries render", () => {
  const hooks = new Set<string>();
  for (const kind of PREMIUM_KINDS) {
    const first = renderFromTemplate(templateFor(kind), companyInput(), { sequenceStep: 1 });
    const second = renderFromTemplate(templateFor(kind), companyInput(), { sequenceStep: 2 });
    const copy1 = followUpCopy(kind, 1);
    const copy2 = followUpCopy(kind, 2);
    hooks.add(copy1.body.join(" "));
    assert.equal(first.subject.startsWith("Re:"), true);
    assert.equal(second.subject.startsWith("Re:"), true);
    assert.match(first.bodyHtml, /Ücretsiz örneği görmek istiyorum/);
    assert.match(second.bodyHtml, /İletişime geçmek istiyorum/);
    assert.match(first.bodyHtml, /Abonelikten çık/);
    assert.match(second.bodyHtml, /Abonelikten çık/);
    assert.match(first.bodyHtml, /Salih Kaya/);
    assert.match(first.bodyHtml, /salkay-email:[a-z-]+-follow-1/);
    assert.equal(assertNoInternalLeak(`${first.bodyHtml}\n${first.bodyText}`).length, 0);
    assert.equal(assertNoInternalLeak(`${second.bodyHtml}\n${second.bodyText}`).length, 0);
    assert.doesNotMatch(first.bodyHtml, /NOT_VERIFIED|live fetch failed|ERR_CERT|websiteIssues|salesPitch/i);
    assert.doesNotMatch(second.bodyHtml, /NOT_VERIFIED|live fetch failed|ERR_CERT|websiteIssues|salesPitch/i);
    assert.doesNotMatch(first.bodyText, /son şans|kaçırmayın|sınırlı süre/i);
    assert.doesNotMatch(second.bodyText, /son şans|kaçırmayın|sınırlı süre/i);
    assert.ok(copy1.body.some((line) => line.includes("gözden kaçmış")));
    assert.ok(copy2.body.some((line) => line.includes("gündeminizde değilse")));
  }
  assert.equal(hooks.size, 7);
});

function dueFollowUp1() {
  return {
    messages: [outbound({ status: "SENT" as const, sequenceStep: 0 as const, sentAt: SENT_AT })],
    step: 1 as const,
    now: followUpReadyAt(1, SENT_AT),
  };
}

test("no email and sequence due is blocked from follow-up", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ generalEmail: null, contacts: [] }),
    ...dueFollowUp1(),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /e-posta yok/);
});

test("invalid email and sequence due is blocked from follow-up", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ generalEmail: "not-an-email" }),
    ...dueFollowUp1(),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Geçersiz e-posta/);
});

test("suppressed and follow-up due is blocked", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ suppressed: true }),
    ...dueFollowUp1(),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Sperrliste/);
});

test("DNC and follow-up due is blocked", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ outreachStatus: "DO_NOT_CONTACT" }),
    ...dueFollowUp1(),
  });
  assert.equal(result.ok, false);
});

test("replied and follow-up due is blocked", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ outreachStatus: "REPLIED" }),
    ...dueFollowUp1(),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Yanıtlandı/);
});

test("unsubscribed and follow-up due is blocked", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany({ unsubscribed: true }),
    ...dueFollowUp1(),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Abonelikten/);
});

test("bounced and follow-up due is blocked", () => {
  const result = evaluateFollowUpEligibility({
    company: baseCompany(),
    messages: [
      outbound({ status: "SENT", sequenceStep: 0, sentAt: SENT_AT }),
      outbound({ id: "bounce", status: "BOUNCED", sequenceStep: 0, sentAt: SENT_AT }),
    ],
    step: 1,
    now: followUpReadyAt(1, SENT_AT),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /Geri döndü/);
});

test("industry follow-up hooks stay short and distinct", () => {
  const restaurant = followUpCopy("restaurant", 1).body.join(" ");
  const bar = followUpCopy("bar", 1).body.join(" ");
  const construction = followUpCopy("construction", 1).body.join(" ");
  const architecture = followUpCopy("architecture", 1).body.join(" ");
  const realEstate = followUpCopy("realEstate", 1).body.join(" ");
  const hotel = followUpCopy("hotel", 1).body.join(" ");
  const automotive = followUpCopy("automotive", 1).body.join(" ");
  assert.match(restaurant, /rezervasyon|mobil deneyim/);
  assert.match(bar, /etkinlik|rezervasyon/);
  assert.match(construction, /proje|referans/);
  assert.match(architecture, /portföy|proje sunumu/);
  assert.match(realEstate, /ilan|mobil iletişim/);
  assert.match(hotel, /rezervasyon|oda sunumu/);
  assert.match(automotive, /araç sunumu|WhatsApp|randevu/);
  assert.notEqual(restaurant, bar);
  assert.notEqual(construction, architecture);
});
