import { readFileSync } from "node:fs";
import path from "node:path";

type Row = {
  restaurantName: string;
  district: string;
  region: string;
  phone: boolean;
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

function flagLine(flags: Record<string, boolean>) {
  return Object.entries(flags)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(",");
}

for (const row of rows) {
  if (!row.inspect.ok) {
    console.log(`FAIL | ${row.status} | ${row.restaurantName} | ${row.url} | ${row.inspect.error}`);
    continue;
  }
  const missing = ["viewport", "tel", "whatsapp", "menu", "reservation", "hours", "maps", "instagram"].filter(
    (key) => !row.inspect.flags[key],
  );
  const warn = ["lorem", "helloWorld", "comingSoon", "encoding", "thin", "bootstrap3", "jquery1"].filter(
    (key) => row.inspect.flags[key],
  );
  console.log(
    [
      row.status.padEnd(12),
      String(row.score ?? "-").padEnd(4),
      row.prio.padEnd(14),
      `${row.restaurantName} (${row.district})`,
      `http=${row.inspect.status}`,
      `len=${row.inspect.textLen}`,
      `title=${(row.inspect.title ?? "").slice(0, 70)}`,
      warn.length ? `WARN=${warn.join(",")}` : "warn=-",
      missing.length ? `miss=${missing.join(",")}` : "miss=-",
      `emptyA=${row.analysis ? "n" : "Y"}`,
    ].join(" | "),
  );
}
