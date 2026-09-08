import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Probe = {
  restaurantName: string;
  district: string;
  region: string;
  phone: string | null;
  instagram: string | null;
  googleMapsUrl: string | null;
  current: {
    website: string | null;
    websiteStatus: string;
    websiteScore: number | null;
    leadScore: number | null;
    priority: string;
    websiteAnalysis: string | null;
    problem1: string | null;
    salkayPitch: string | null;
  };
  probe: {
    kind: string;
    status: number | null;
    title: string | null;
    error: string | null;
    signals: string[];
    excerpt: string;
    host: string | null;
    finalUrl: string | null;
  };
};

const probe = JSON.parse(
  readFileSync(path.join(process.cwd(), "tmp/restaurant-website-probe.json"), "utf8"),
) as Probe[];

const emptyByStatus: Record<string, number> = {};
for (const row of probe) {
  if (!row.current.websiteAnalysis) {
    emptyByStatus[row.current.websiteStatus] = (emptyByStatus[row.current.websiteStatus] ?? 0) + 1;
  }
}
console.log("empty analysis by status", emptyByStatus);

const live = probe.filter((row) => row.probe.kind === "site");
console.log("\n=== LIVE SITES needing review (not already overridden names) ===");
const overrideNames = new Set([
  "Valuna",
  "Hayri Usta Ocakbaşı Beyoğlu",
  "Morn Kadıköy",
  "Urfam Sur Ocakbaşı",
  "Feride Meyhanesi",
  "Meyhane Istanbul",
  "Ocakbaşı Zervan Restaurant",
  "Fülane Restaurant",
  "ASTEK Restaurant & Meyhane",
  "Güler Ocakbaşı Restaurant",
  "Cremia Cafe & Rest",
  "Albatros Restaurant",
  "Sur Ocakbaşı",
  "Mojo Ataşehir",
  "UMUS İstanbul",
  "Palukçu",
  "Köz Kanat Ataşehir",
  "Beluga Fish Gourmet",
  "Develi Ataşehir",
  "Fauna",
  "Ikaria Balık Restaurant",
  "Nazenin Restaurant",
  "Sensus Wine & Food Ataşehir",
  "Grill Prime Palladium Tower",
  "Restohan Kebap Bomonti",
]);

const rows = live
  .filter((row) => !overrideNames.has(row.restaurantName))
  .map((row) => ({
    name: row.restaurantName,
    district: row.district,
    region: row.region,
    status: row.current.websiteStatus,
    score: row.current.websiteScore,
    prio: row.current.priority,
    url: row.current.website,
    title: row.probe.title,
    signals: row.probe.signals,
    emptyAnalysis: !row.current.websiteAnalysis,
    problem1: row.current.problem1,
    excerpt: row.probe.excerpt.slice(0, 220),
  }));

writeFileSync(
  path.join(process.cwd(), "tmp/restaurant-live-sites-review.json"),
  JSON.stringify(rows, null, 2),
);
console.log("live sites to review", rows.length);

const byStatus: Record<string, number> = {};
for (const row of rows) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
console.log("live review by current status", byStatus);

console.log("\n=== empty analysis LIVE sites ===");
for (const row of rows.filter((item) => item.emptyAnalysis)) {
  console.log(
    `${row.status} ${row.score} | ${row.name} | ${row.url} | ${row.title} | ${row.signals.join(",")}`,
  );
}

console.log("\n=== NO_WEBSITE with URL (should not happen) ===");
for (const row of probe.filter((item) => item.current.websiteStatus === "NO_WEBSITE" && item.current.website)) {
  console.log(row.restaurantName, row.current.website, row.probe.kind);
}

console.log("\n=== HIGH + GOOD mismatch ===");
for (const row of probe.filter(
  (item) =>
    (item.current.websiteStatus === "GOOD" || item.current.websiteStatus === "VERY_GOOD") &&
    item.current.priority !== "QUALIFIED_OUT",
)) {
  console.log(row.restaurantName, row.current.priority, row.current.websiteStatus);
}
