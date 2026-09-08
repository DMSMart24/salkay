import { readFileSync } from "node:fs";
import path from "node:path";

type Probe = {
  restaurantName: string;
  district: string;
  region: string;
  phone: string | null;
  whatsapp: string | null;
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
};

const probe = JSON.parse(
  readFileSync(path.join(process.cwd(), "tmp/restaurant-website-probe.json"), "utf8"),
) as Probe[];

console.log("\n=== NOT_VERIFIED no URL ===");
for (const row of probe.filter((item) => item.current.websiteStatus === "NOT_VERIFIED" && !item.current.website)) {
  console.log(
    `${row.region} | ${row.restaurantName} | ${row.district} | phone=${Boolean(row.phone)} ig=${Boolean(row.instagram)} maps=${Boolean(row.googleMapsUrl)} prio=${row.current.priority}`,
  );
}

console.log("\n=== IMPROVABLE HIGH ===");
for (const row of probe.filter((item) => item.current.websiteStatus === "IMPROVABLE" && item.current.priority === "HIGH")) {
  console.log(row.restaurantName, row.district, row.current.websiteScore, row.current.website);
}

console.log("\n=== German / generic leftover copy ===");
for (const row of probe) {
  const blob = `${row.current.websiteAnalysis ?? ""} ${row.current.problem1 ?? ""} ${row.current.salkayPitch ?? ""}`;
  if (/moderner|bestehend|Bereits|Restaurantauftritt|stark|Geliştirilebilir|site geliştir/i.test(blob)) {
    console.log(row.restaurantName, "|", row.current.problem1, "|", (row.current.websiteAnalysis ?? "").slice(0, 120));
  }
}

console.log("\n=== Mahide / The Muhtar / Hasan Ustam / ASF / Çınaraltı Mangal / Kadıhan ===");
for (const name of [
  "Mahide Ocakbaşı Beylerbeyi",
  "The Muhtar",
  "Hasan Ustam Ocakbaşı",
  "ASF Gurme",
  "Ataşehir Çınaraltı Mangalbaşı",
  "Kadıhan Kebap & Künefe",
  "SOİ Cadde",
  "Adile Sultan Ev Yemekleri",
]) {
  const row = probe.find((item) => item.restaurantName === name);
  if (!row) continue;
  console.log("\n--", name, row.current.websiteStatus, row.current.websiteScore);
  console.log(row.current.problem1);
  console.log((row.current.websiteAnalysis ?? "").slice(0, 400));
}
