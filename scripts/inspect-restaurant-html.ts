import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Probe = {
  id: string;
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
    problem2: string | null;
    problem3: string | null;
    salkayPitch: string | null;
  };
  probe: { kind: string };
};

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function inspect(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const html = (await response.text()).slice(0, 220_000);
    const text = stripTags(html);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
    const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((match) => stripTags(match[1] ?? ""))
      .filter(Boolean)
      .slice(0, 3);
    const lower = html.toLowerCase();
    const flags = {
      viewport: /name=["']viewport["']/i.test(html),
      https: response.url.startsWith("https://"),
      tel: /href=["']tel:/i.test(html),
      whatsapp: /wa\.me|api\.whatsapp/i.test(html),
      menu: /menü|menu|dijital.?menü|qr.?menü/i.test(lower),
      reservation: /rezervasyon|reservation|book.?a.?table/i.test(lower),
      hours: /çalışma saat|opening hours|hafta içi/i.test(text.toLowerCase()),
      maps: /google\.com\/maps|maps\.app\.goo/i.test(lower),
      instagram: /instagram\.com/i.test(html),
      wordpress: /wp-content|wordpress/i.test(html),
      wix: /wix\.com|static\.wixstatic/i.test(html),
      bootstrap3: /bootstrap@(3\.|\/3\.)|bootstrap\/3/i.test(html),
      jquery1: /jquery[.-]1\.\d/i.test(html),
      lorem: /lorem ipsum/i.test(html),
      helloWorld: /hello world! welcome to wordpress/i.test(text.toLowerCase()),
      comingSoon: /coming soon|yakında|yenileniyoruz|under construction/i.test(text.toLowerCase()),
      encoding: /Ã¼|Ã§|ÅŸ|ÄŸ|�/.test(html),
      thin: text.length < 450,
    };
    return {
      ok: true as const,
      status: response.status,
      finalUrl: response.url,
      title,
      h1,
      textLen: text.length,
      excerpt: text.slice(0, 420),
      flags,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(items: T[], size: number, worker: (item: T) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await worker(items[index] as T);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => run()));
  return out;
}

async function main() {
  const probe = JSON.parse(
    readFileSync(path.join(process.cwd(), "tmp/restaurant-website-probe.json"), "utf8"),
  ) as Probe[];
  const withUrl = probe.filter((row) => row.current.website);
  console.log("inspecting", withUrl.length);
  const results = await mapPool(withUrl, 5, async (row) => ({
    id: row.id,
    restaurantName: row.restaurantName,
    district: row.district,
    region: row.region,
    phone: Boolean(row.phone),
    status: row.current.websiteStatus,
    score: row.current.websiteScore,
    prio: row.current.priority,
    url: row.current.website,
    analysis: row.current.websiteAnalysis,
    problem1: row.current.problem1,
    inspect: await inspect(row.current.website as string),
  }));
  mkdirSync(path.join(process.cwd(), "tmp"), { recursive: true });
  writeFileSync(path.join(process.cwd(), "tmp/restaurant-html-inspect.json"), JSON.stringify(results, null, 2));
  const failed = results.filter((row) => !row.inspect.ok);
  console.log("failed", failed.length);
  for (const row of failed) {
    console.log("FAIL", row.restaurantName, row.url, "inspect" in row && "error" in row.inspect ? row.inspect.error : "");
  }
  console.log("wrote tmp/restaurant-html-inspect.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
