import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { RestaurantLead } from "@prisma/client";
import { isValidEmail, normalizeDomain } from "../src/lib/admin/normalize";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import {
  allowsWebsiteScore,
  blankToNull,
  compareTop20OutreachLeads,
  normalizeLeadKey,
} from "../src/lib/admin/restaurant-leads";
import {
  assertNoWebsiteCopySafe,
  assertWebsiteProblemCopySafe,
  buildNoWebsiteOpportunity,
  buildWebsiteProblemOpportunity,
  recommendedContactChannel,
  restaurantSalesType,
} from "../src/lib/admin/restaurant-no-website";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const FORBIDDEN_THIRD_PARTY = [
  "eatbu.com",
  "parita.tr",
  "parita.com",
  "allzinapp.com",
  "qrdos.com",
  "qrmenu",
];

const KNOWN_WRONG_BRANCH: Array<{ domain: string; note: string }> = [
  { domain: "uzunlarkebap.com.tr", note: "Tuzla zinciri; Kartal Uzunlar değil" },
  { domain: "nevalihotel.com", note: "Şanlıurfa oteli" },
  { domain: "veloralounge.com", note: "UK şirketi; TR site veloralounge.com.tr" },
  { domain: "katibim.com", note: "İnşaat firması" },
  { domain: "seyircafe.com.tr", note: "Ankara" },
  { domain: "seyircafe.net", note: "Aliağa" },
  { domain: "saskinbalik.com", note: "Kadıköy şubesi; Ataşehir değil" },
  { domain: "butcha.com", note: "Üsküdar/Emaar sitede yok" },
];

function looksGuessedEmail(email: string, lead: RestaurantLead) {
  const domain = email.split("@")[1] ?? "";
  const siteDomain = lead.websiteDomain?.toLowerCase() ?? "";
  if (email.includes("example.com") || email.includes("placeholder") || email.includes("salkay")) {
    return "placeholder/example";
  }
  if (email.startsWith("info@") && !siteDomain && lead.websiteStatus === "NO_WEBSITE") {
    return "info@ without official site";
  }
  const emailBase = domain.replace(/^www\./, "").replace(/\.tr$/, "");
  const siteBase = siteDomain.replace(/^www\./, "").replace(/\.tr$/, "");
  if (email.startsWith("info@") && siteDomain && emailBase !== siteBase && !emailBase.startsWith(siteBase) && !siteBase.startsWith(emailBase)) {
    return "info@ domain mismatch";
  }
  return null;
}

async function main() {
  loadDotEnv();
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL missing");
  }

  const prisma = getPrisma();
  const leads = await prisma.restaurantLead.findMany({
    orderBy: [{ leadScore: { sort: "desc", nulls: "last" } }, { restaurantName: "asc" }],
  });

  const issues: string[] = [];
  const byStatus = new Map<string, number>();
  const byPriority = new Map<string, number>();

  for (const lead of leads) {
    byStatus.set(lead.websiteStatus, (byStatus.get(lead.websiteStatus) ?? 0) + 1);
    byPriority.set(lead.priority, (byPriority.get(lead.priority) ?? 0) + 1);
  }

  const keys = new Map<string, RestaurantLead[]>();
  for (const lead of leads) {
    const key = `${lead.nameNorm}||${lead.districtNorm}`;
    const list = keys.get(key) ?? [];
    list.push(lead);
    keys.set(key, list);
  }
  const duplicates = [...keys.entries()].filter(([, rows]) => rows.length > 1);

  const notVerified = leads.filter((row) => row.websiteStatus === "NOT_VERIFIED");
  const noWebsite = leads.filter((row) => row.websiteStatus === "NO_WEBSITE");
  const websiteProblem = leads.filter((row) =>
    ["VERY_WEAK", "WEAK", "IMPROVABLE"].includes(row.websiteStatus),
  );
  const good = leads.filter((row) => row.websiteStatus === "GOOD" || row.websiteStatus === "VERY_GOOD");

  for (const lead of notVerified) {
    if (lead.websiteScore != null) issues.push(`NOT_VERIFIED websiteScore: ${lead.restaurantName}`);
    if (lead.leadScore != null) issues.push(`NOT_VERIFIED leadScore: ${lead.restaurantName}`);
    if (lead.priority !== "PENDING") issues.push(`NOT_VERIFIED priority ${lead.priority}: ${lead.restaurantName}`);
    if (restaurantSalesType(lead.websiteStatus) != null) {
      issues.push(`NOT_VERIFIED has sales type: ${lead.restaurantName}`);
    }
  }

  for (const lead of noWebsite) {
    if (lead.websiteScore != null) issues.push(`NO_WEBSITE websiteScore: ${lead.restaurantName}`);
    if (restaurantSalesType(lead.websiteStatus) !== "NO_WEBSITE_EMAIL") {
      issues.push(`NO_WEBSITE sales type: ${lead.restaurantName}`);
    }
    if (lead.website || lead.websiteDomain) {
      issues.push(`NO_WEBSITE stored URL ${lead.website || lead.websiteDomain}: ${lead.restaurantName}`);
    }
    const draft = buildNoWebsiteOpportunity(lead);
    const forbidden = [
      ...assertNoWebsiteCopySafe(draft.emailBody),
      ...assertNoWebsiteCopySafe(draft.emailSubject),
    ];
    if (forbidden.length) {
      issues.push(`NO_WEBSITE draft forbidden copy (${forbidden.join(", ")}): ${lead.restaurantName}`);
    }
  }

  for (const lead of websiteProblem) {
    if (restaurantSalesType(lead.websiteStatus) !== "WEBSITE_PROBLEM_EMAIL") {
      issues.push(`website-problem sales type: ${lead.restaurantName}`);
    }
    if (!allowsWebsiteScore(lead.websiteStatus) || lead.websiteScore == null) {
      issues.push(`website-problem missing websiteScore: ${lead.restaurantName}`);
    }
    if (!blankToNull(lead.website) && !blankToNull(lead.websiteDomain)) {
      issues.push(`website-problem missing URL: ${lead.restaurantName}`);
    }
    if (!blankToNull(lead.problem1)) {
      issues.push(`website-problem missing problem1: ${lead.restaurantName}`);
    }
    const draft = buildWebsiteProblemOpportunity(lead);
    const forbidden = [
      ...assertWebsiteProblemCopySafe(draft.emailBody),
      ...assertWebsiteProblemCopySafe(draft.emailSubject),
    ];
    if (forbidden.length) {
      issues.push(`WEBSITE_PROBLEM draft mixed NO_WEBSITE copy (${forbidden.join(", ")}): ${lead.restaurantName}`);
    }
  }

  for (const lead of good) {
    if (lead.priority !== "QUALIFIED_OUT") {
      issues.push(`GOOD/VERY_GOOD not QUALIFIED_OUT (${lead.priority}): ${lead.restaurantName}`);
    }
    if (restaurantSalesType(lead.websiteStatus) != null) {
      issues.push(`GOOD/VERY_GOOD has sales type: ${lead.restaurantName}`);
    }
  }

  const guessedEmails: Array<{ name: string; email: string; reason: string }> = [];
  const invalidEmails: string[] = [];
  for (const lead of leads) {
    const email = blankToNull(lead.publicEmail);
    if (!email) continue;
    if (!isValidEmail(email)) invalidEmails.push(`${lead.restaurantName}: ${email}`);
    const guessed = looksGuessedEmail(email, lead);
    if (guessed) guessedEmails.push({ name: lead.restaurantName, email, reason: guessed });
  }

  const wrongBranch: Array<{ name: string; domain: string; note: string }> = [];
  const thirdParty: Array<{ name: string; domain: string }> = [];
  for (const lead of leads) {
    const domain = (lead.websiteDomain || normalizeDomain(lead.website) || "").toLowerCase();
    if (!domain) continue;
    for (const known of KNOWN_WRONG_BRANCH) {
      if (domain === known.domain || domain.endsWith(`.${known.domain}`)) {
        wrongBranch.push({ name: `${lead.restaurantName} — ${lead.district}`, domain, note: known.note });
      }
    }
    for (const forbidden of FORBIDDEN_THIRD_PARTY) {
      if (domain.includes(forbidden.replace(/^www\./, ""))) {
        thirdParty.push({ name: `${lead.restaurantName} — ${lead.district}`, domain });
      }
    }
  }

  const top20Source = leads.filter(
    (row) =>
      row.priority === "HIGH" &&
      row.websiteStatus !== "GOOD" &&
      row.websiteStatus !== "VERY_GOOD" &&
      row.websiteStatus !== "NOT_VERIFIED",
  );
  const top20 = [...top20Source].sort(compareTop20OutreachLeads).slice(0, 20);

  const top20Leaks = top20.filter(
    (row) =>
      row.priority === "QUALIFIED_OUT" ||
      row.websiteStatus === "GOOD" ||
      row.websiteStatus === "VERY_GOOD" ||
      row.websiteStatus === "NOT_VERIFIED",
  );

  const named = (needle: string) =>
    leads.filter((row) => row.restaurantName.toLocaleLowerCase("tr").includes(needle.toLocaleLowerCase("tr")));

  const pendikSahil = named("Pendik Sahil")[0] ?? null;
  const lossGarden = named("Loss Garden")[0] ?? null;
  const katibim = named("Katibim")[0] ?? null;
  const butcha = named("Butcha")[0] ?? null;

  const salesNoWebsite = noWebsite;
  const salesWebsiteProblem = websiteProblem;
  const salesLeads = [...salesNoWebsite, ...salesWebsiteProblem];

  const withEmail = salesLeads.filter((row) => blankToNull(row.publicEmail));
  const withIg = salesLeads.filter((row) => blankToNull(row.instagram));
  const withWa = salesLeads.filter((row) => blankToNull(row.whatsapp));

  const top20Report = top20.map((row, index) => {
    const channel = recommendedContactChannel(row);
    return {
      rank: index + 1,
      restaurantName: row.restaurantName,
      district: row.district,
      websiteStatus: row.websiteStatus,
      websiteScore: row.websiteScore,
      leadScore: row.leadScore,
      priority: row.priority,
      salesType: restaurantSalesType(row.websiteStatus),
      channel: channel.channel,
      channelValue: channel.value,
      publicEmail: row.publicEmail,
      instagram: row.instagram,
      whatsapp: row.whatsapp,
      phone: row.phone,
    };
  });

  console.log(
    JSON.stringify(
      {
        totals: {
          total: leads.length,
          duplicate: duplicates.length,
          researched: leads.length - notVerified.length,
          counts: Object.fromEntries(byStatus),
          priorities: Object.fromEntries(byPriority),
          noWebsiteEmail: salesNoWebsite.length,
          websiteProblemEmail: salesWebsiteProblem.length,
          salesPublicEmail: withEmail.length,
          salesInstagram: withIg.length,
          salesWhatsapp: withWa.length,
          high: byPriority.get("HIGH") ?? 0,
        },
        specials: {
          pendikSahil: pendikSahil
            ? {
                websiteStatus: pendikSahil.websiteStatus,
                websiteScore: pendikSahil.websiteScore,
                salesType: restaurantSalesType(pendikSahil.websiteStatus),
                website: pendikSahil.website,
              }
            : null,
          lossGarden: lossGarden
            ? {
                websiteStatus: lossGarden.websiteStatus,
                websiteScore: lossGarden.websiteScore,
                salesType: restaurantSalesType(lossGarden.websiteStatus),
                website: lossGarden.website,
              }
            : null,
          katibim: katibim
            ? {
                websiteStatus: katibim.websiteStatus,
                leadScore: katibim.leadScore,
                websiteScore: katibim.websiteScore,
                priority: katibim.priority,
                website: katibim.website,
              }
            : null,
          butcha: butcha
            ? {
                websiteStatus: butcha.websiteStatus,
                leadScore: butcha.leadScore,
                websiteScore: butcha.websiteScore,
                priority: butcha.priority,
                website: butcha.website,
              }
            : null,
        },
        issues,
        duplicates: duplicates.map(([key, rows]) => ({
          key,
          names: rows.map((row) => `${row.restaurantName} / ${row.district}`),
        })),
        guessedEmails,
        invalidEmails,
        wrongBranch,
        thirdParty,
        top20Leaks: top20Leaks.map((row) => `${row.restaurantName} ${row.websiteStatus} ${row.priority}`),
        notVerified: notVerified.map((row) => `${row.restaurantName} — ${row.district}`),
        allEmails: leads
          .filter((row) => row.publicEmail)
          .map((row) => `${row.restaurantName} [${row.websiteStatus}] ${row.publicEmail}`),
        noWebsiteMissingChannel: salesNoWebsite
          .filter((row) => recommendedContactChannel(row).channel === "NONE")
          .map((row) => row.restaurantName),
        websiteProblemMissingProblem: websiteProblem
          .filter((row) => !blankToNull(row.problem1))
          .map((row) => row.restaurantName),
        goodLeads: good.map(
          (row) => `${row.restaurantName} — ${row.district} ${row.websiteStatus} ${row.priority} ${row.leadScore}`,
        ),
        top20: top20Report,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
