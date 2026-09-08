import { readFileSync } from "node:fs";
import path from "node:path";

type Row = {
  restaurantName: string;
  district: string;
  region: string;
  status: string;
  score: number | null;
  prio: string;
  url: string;
  analysis: string | null;
  problem1: string | null;
  inspect:
    | {
        ok: true;
        status: number;
        finalUrl: string;
        title: string | null;
        h1: string[];
        textLen: number;
        excerpt: string;
        flags: Record<string, boolean>;
      }
    | { ok: false; error: string };
};

const rows = JSON.parse(
  readFileSync(path.join(process.cwd(), "tmp/restaurant-html-inspect.json"), "utf8"),
) as Row[];

const names = [
  "Pişi Mutfak Moda – Kahvaltı & Brunch",
  "SOİ Cadde",
  "Salve Cafe Kadıköy",
  "Sapa İstanbul",
  "Sembol Künefe",
  "Sudi Restoran",
  "THE HUNGER",
  "Nazar Profiterol",
  "Hasan Usta Kebap",
  "Wyn-et Restaurant Döner - İskender",
  "PEPO Restaurant and Bar",
  "Kebapçı Bedri Usta",
  "Pendik Sahil Kebap",
  "Loss Garden Cafe & Restaurant",
  "Meygüsar Ocakbaşı",
  "Tarihi Meşhur Eyüp Sultan Güveççisi",
  "İNCİ BALIK",
  "Meyzen",
  "Mahide Ocakbaşı Beylerbeyi",
  "The Muhtar",
  "Hasan Ustam Ocakbaşı",
  "Mavi Sandal Balıkçısı",
  "Kadıhan Kebap & Künefe",
  "ASF Gurme",
  "Ataşehir Çınaraltı Mangalbaşı",
  "Bridge Nakkaştepe",
  "Kırmızı Et Steak Burger Sosis",
  "L'Olivetto Restaurant",
  "Orçul Restaurant",
  "Seher Restaurant",
  "Sini Et Balık",
  "Shishly Cafe & Bistro",
  "Adanalı Ümit Usta Ocakbaşı & Kebap",
  "Beeves Grill & Brasserie",
  "Holly Hola Cafe & Restaurant İdealtepe Maltepe",
  "KAF Cafe Restoran",
  "Fıccın Restoran",
  "İntiba Döner",
  "Karacabey",
  "HATAY GURME",
  "Bist Bahçe",
];

for (const name of names) {
  const row = rows.find((item) => item.restaurantName === name);
  if (!row) {
    console.log("MISSING", name);
    continue;
  }
  console.log("\n====", row.restaurantName, "|", row.status, row.score, row.prio, "|", row.url);
  console.log("analysis:", (row.analysis ?? "").slice(0, 240));
  console.log("problem1:", row.problem1);
  if (!row.inspect.ok) {
    console.log("FAIL", row.inspect.error);
    continue;
  }
  console.log("http", row.inspect.status, "final", row.inspect.finalUrl, "len", row.inspect.textLen);
  console.log("title", row.inspect.title);
  console.log("h1", row.inspect.h1.join(" / "));
  console.log("excerpt", row.inspect.excerpt.slice(0, 280));
}
