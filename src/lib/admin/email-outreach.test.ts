import assert from "node:assert/strict";
import { test } from "node:test";
import type { OutreachStatus } from "@prisma/client";
import {
  evaluateEmailOutreachEligibility,
  hasUsableEmail,
  isReadyToEmail,
  selectTop20Outreach,
  type EmailOutreachCompany,
} from "@/lib/admin/email-outreach";

function lead(extras: Partial<EmailOutreachCompany> = {}): EmailOutreachCompany {
  return {
    id: extras.id ?? "lead",
    outreachStatus: extras.outreachStatus ?? "NEW",
    status: extras.status ?? "RESEARCHED",
    tags: extras.tags ?? ["restaurant"],
    priority: extras.priority ?? "MEDIUM",
    leadScore: extras.leadScore ?? 6,
    websiteStatus: extras.websiteStatus ?? "WEAK",
    lastContactedAt: extras.lastContactedAt ?? null,
    generalEmail: extras.generalEmail ?? null,
    contacts: extras.contacts ?? [],
    suppressed: extras.suppressed ?? false,
    archivedAt: extras.archivedAt ?? null,
    ...extras,
  };
}

test("valid email is email-outreach eligible", () => {
  const result = evaluateEmailOutreachEligibility(
    lead({ contacts: [{ email: "info@sudi.example", isPrimary: true }] }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.emailEligible, true);
});

test("no email is blocked from email outreach", () => {
  const result = evaluateEmailOutreachEligibility(lead({ generalEmail: null, contacts: [] }));
  assert.equal(result.ok, false);
  assert.equal(result.emailEligible, false);
  assert.match(result.reason, /e-posta yok/);
});

test("invalid email is blocked from email outreach", () => {
  const result = evaluateEmailOutreachEligibility(lead({ generalEmail: "not-an-email" }));
  assert.equal(result.ok, false);
  assert.match(result.reason, /Geçersiz e-posta/);
});

test("suppressed email is blocked from email outreach", () => {
  const result = evaluateEmailOutreachEligibility(
    lead({ generalEmail: "ok@example.com", suppressed: true }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /Sperrliste/);
});

test("DNC is blocked from email outreach", () => {
  const result = evaluateEmailOutreachEligibility(
    lead({
      outreachStatus: "DO_NOT_CONTACT" as OutreachStatus,
      generalEmail: "ok@example.com",
    }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /İletişim kurma/);
});

test("NO_WEBSITE with valid email is eligible", () => {
  const company = lead({
    websiteStatus: "NO_WEBSITE",
    generalEmail: "hello@forchetta.example",
  });
  const result = evaluateEmailOutreachEligibility(company);
  assert.equal(result.ok, true);
  assert.equal(isReadyToEmail(company), true);
});

test("HIGH priority without email is blocked", () => {
  const company = lead({
    priority: "HIGH",
    leadScore: 9.4,
    websiteStatus: "NO_WEBSITE",
    generalEmail: null,
    contacts: [],
  });
  const result = evaluateEmailOutreachEligibility(company);
  assert.equal(result.ok, false);
  assert.equal(hasUsableEmail(company), false);
});

test("qualified-out lead is blocked even with valid email", () => {
  const result = evaluateEmailOutreachEligibility(
    lead({ tags: ["restaurant", "no-outreach"], generalEmail: "out@example.com" }),
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /Qualified out/);
});

test("Top 20 Outreach contains only email-eligible leads", () => {
  const leads = [
    lead({ id: "no-mail-high", priority: "HIGH", leadScore: 9.9, generalEmail: null }),
    lead({ id: "invalid", leadScore: 9.8, generalEmail: "bad@" }),
    lead({ id: "dnc", leadScore: 9.7, generalEmail: "dnc@example.com", outreachStatus: "DO_NOT_CONTACT" }),
    lead({ id: "suppressed", leadScore: 9.6, generalEmail: "sup@example.com", suppressed: true }),
    lead({ id: "ok-a", leadScore: 8.2, generalEmail: "a@example.com" }),
    lead({ id: "ok-b", leadScore: 7.1, contacts: [{ email: "b@example.com" }] }),
    lead({ id: "no-website-ok", leadScore: 8.8, websiteStatus: "NO_WEBSITE", generalEmail: "noweb@example.com" }),
  ];
  const top = selectTop20Outreach(leads);
  assert.equal(top.every((row) => evaluateEmailOutreachEligibility(row).emailEligible), true);
  assert.deepEqual(top.map((row) => row.id), ["no-website-ok", "ok-a", "ok-b"]);
  assert.equal(top.some((row) => row.id === "no-mail-high"), false);
});
