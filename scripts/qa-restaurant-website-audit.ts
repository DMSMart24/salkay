import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Prisma, RestaurantLead, RestaurantLeadPriority, RestaurantWebsiteStatus } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import { applyRestaurantLeadStatusRules, blankToNull, normalizeLeadKey } from "../src/lib/admin/restaurant-leads";
import { normalizeDomain, normalizeWebsite } from "../src/lib/admin/normalize";

type Probe = {
  id: string;
  restaurantName: string;
  district: string;
  region: "ANADOLU" | "AVRUPA";
  phone: string | null;
  whatsapp: string | null;
  publicEmail: string | null;
  instagram: string | null;
  googleMapsUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  outreachNotes: string | null;
  current: {
    website: string | null;
    websiteDomain: string | null;
    websiteStatus: RestaurantWebsiteStatus;
    websiteScore: number | null;
    leadScore: number | null;
    priority: RestaurantLeadPriority;
    problem1: string | null;
    problem2: string | null;
    problem3: string | null;
    websiteAnalysis: string | null;
    opportunities: string | null;
    salkayPitch: string | null;
  };
  probe: {
    inputUrl: string | null;
    kind:
      | "none"
      | "social"
      | "directory"
      | "dead"
      | "redirect-social"
      | "parking"
      | "placeholder"
      | "site";
    status: number | null;
    finalUrl: string | null;
    host: string | null;
    ssl: boolean;
    error: string | null;
    title: string | null;
    signals: string[];
    excerpt: string;
  };
};

const SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "m.facebook.com",
  "linktr.ee",
  "linktree.com",
  "bio.link",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "wa.me",
  "api.whatsapp.com",
];

const DIRECTORY_HOSTS = [
  "yemeksepeti.com",
  "getir.com",
  "trendyol.com",
  "tripadvisor.com",
  "tripadvisor.com.tr",
  "maps.google.com",
  "google.com",
  "goo.gl",
  "maps.app.goo.gl",
  "foursquare.com",
  "zomato.com",
  "thefork.com",
  "restoranlar.com",
  "mekanist.com",
];

const OUT_DIR = path.join(process.cwd(), "tmp");
const PROBE_PATH = path.join(OUT_DIR, "restaurant-website-probe.json");
const PATCH_PATH = path.join(OUT_DIR, "restaurant-website-patches.json");

function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), name);
    if (!existsSync(envPath)) continue;
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
}

function hostOf(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function hostMatches(host: string | null, list: string[]) {
  if (!host) return false;
  return list.some((item) => host === item || host.endsWith(`.${item}`));
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectSignals(html: string, finalUrl: string | null) {
  const lower = html.toLowerCase();
  const text = stripTags(html).toLowerCase();
  const signals: string[] = [];
  const add = (flag: string, test: boolean) => {
    if (test) signals.push(flag);
  };

  add("viewport", /name=["']viewport["']/i.test(html));
  add("https", Boolean(finalUrl?.startsWith("https://")));
  add("tel", /href=["']tel:/i.test(html) || /tel:\+?9?0?\d{10}/i.test(html));
  add("whatsapp", /wa\.me|api\.whatsapp|whatsapp/i.test(html));
  add("menu", /menü|menu|digital.?menu|qr.?menu/i.test(lower));
  add("reservation", /rezervasyon|reservation|book.?a.?table|reserve/i.test(lower));
  add("hours", /çalışma saat|opening hours|hafta içi|pazar/i.test(text));
  add("maps", /google\.com\/maps|maps\.app\.goo|harita/i.test(lower));
  add("instagram", /instagram\.com/i.test(html));
  add("cta", /sipariş|order now|online order|whatsapp|rezervasyon|iletişim|contact/i.test(lower));
  add("bootstrap3", /bootstrap@(3\.|\/3\.)|bootstrap\/3/i.test(html));
  add("jquery1", /jquery[.-]1\.\d/i.test(html));
  add("wordpress", /wp-content|wordpress/i.test(html));
  add("hello-world", /hello world! welcome to wordpress/i.test(text));
  add("lorem", /lorem ipsum/i.test(html));
  add("coming-soon", /coming soon|yakında|under construction|bakımdayız|site hazırlanıyor/i.test(text));
  add("parked", /domain for sale|bu alan adı|parked free|sedo|dan\.com|godaddy/i.test(text));
  add("hosting-default", /default web site page|cpanel|plesk|apache2 ubuntu default|nginx is running|index of \//i.test(text));
  add("wix", /wix\.com|static\.wixstatic/i.test(html));
  add("shopify", /cdn\.shopify|myshopify/i.test(html));
  add("encoding-mojibake", /Ã¼|Ã§|ÅŸ|ÄŸ|�/.test(html));
  add("flash", /application\/x-shockwave-flash|\.swf/i.test(html));
  add("frameset", /<frameset/i.test(html));
  add("thin-content", stripTags(html).length < 400);
  return signals;
}

async function fetchSite(raw: string | null): Promise<Probe["probe"]> {
  const inputUrl = normalizeWebsite(raw);
  if (!inputUrl) {
    return {
      inputUrl: null,
      kind: "none",
      status: null,
      finalUrl: null,
      host: null,
      ssl: false,
      error: null,
      title: null,
      signals: [],
      excerpt: "",
    };
  }

  const startHost = hostOf(inputUrl);
  if (hostMatches(startHost, SOCIAL_HOSTS)) {
    return {
      inputUrl,
      kind: "social",
      status: null,
      finalUrl: inputUrl,
      host: startHost,
      ssl: inputUrl.startsWith("https://"),
      error: null,
      title: null,
      signals: ["social-url"],
      excerpt: "",
    };
  }
  if (hostMatches(startHost, DIRECTORY_HOSTS) || startHost?.includes("google.")) {
    return {
      inputUrl,
      kind: "directory",
      status: null,
      finalUrl: inputUrl,
      host: startHost,
      ssl: inputUrl.startsWith("https://"),
      error: null,
      title: null,
      signals: ["directory-url"],
      excerpt: "",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch(inputUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const finalUrl = response.url || inputUrl;
    const host = hostOf(finalUrl);
    const html = (await response.text()).slice(0, 180_000);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
    const signals = collectSignals(html, finalUrl);
    let kind: Probe["probe"]["kind"] = "site";
    if (hostMatches(host, SOCIAL_HOSTS)) kind = "redirect-social";
    else if (hostMatches(host, DIRECTORY_HOSTS) || host?.includes("google.")) kind = "directory";
    else if (signals.includes("parked")) kind = "parking";
    else if (signals.includes("coming-soon") || signals.includes("hosting-default") || signals.includes("hello-world")) {
      kind = "placeholder";
    } else if (response.status >= 400) kind = "dead";

    return {
      inputUrl,
      kind,
      status: response.status,
      finalUrl,
      host,
      ssl: finalUrl.startsWith("https://"),
      error: null,
      title,
      signals,
      excerpt: stripTags(html).slice(0, 500),
    };
  } catch (error) {
    return {
      inputUrl,
      kind: "dead",
      status: null,
      finalUrl: null,
      host: startHost,
      ssl: inputUrl.startsWith("https://"),
      error: error instanceof Error ? error.message : String(error),
      title: null,
      signals: ["fetch-failed"],
      excerpt: "",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(items: T[], size: number, worker: (item: T, index: number) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await worker(items[index] as T, index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => run()));
  return out;
}

function nameTokens(name: string) {
  return normalizeLeadKey(name)
    .replace(/restaurant|restoran|cafe|meyhane|ocakbaşı|ocakbasi|kebap|balık|balik|&/g, " ")
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 4)
    .slice(0, 3);
}

function brandMismatch(name: string, title: string | null, excerpt: string, host: string | null) {
  const tokens = nameTokens(name);
  if (tokens.length === 0) return false;
  const hay = `${title ?? ""} ${excerpt} ${host ?? ""}`.toLocaleLowerCase("tr");
  return !tokens.some((token) => hay.includes(token));
}

type Assessment = {
  websiteStatus: RestaurantWebsiteStatus;
  websiteScore: number | null;
  leadScore: number | null;
  priority: RestaurantLeadPriority;
  problem1: string | null;
  problem2: string | null;
  problem3: string | null;
  websiteAnalysis: string;
  opportunities: string;
  salkayPitch: string;
  website: string | null;
  websiteDomain: string | null;
};

function problems(items: Array<string | null | undefined>) {
  return items.filter((item): item is string => Boolean(item)).slice(0, 3);
}

function assess(row: Probe): Assessment {
  const name = row.restaurantName;
  const hasPhone = Boolean(blankToNull(row.phone) || blankToNull(row.whatsapp));
  const socialProof = [
    row.instagram ? "Instagram" : null,
    row.googleMapsUrl ? "Google işletme profili" : null,
  ].filter(Boolean);
  const socialLine =
    socialProof.length > 0
      ? `Müşteri ${socialProof.join(" ve ")} üzerinden bulunuyor.`
      : "Bağımsız bir restoran sitesi yok.";

  const noWebsite = (analysis: string, extraProblems: string[] = []): Assessment => {
    const rules = applyRestaurantLeadStatusRules({
      websiteStatus: "NO_WEBSITE",
      websiteScore: null,
      leadScore: hasPhone ? 8.8 : 7.4,
      priority: hasPhone ? "HIGH" : "MEDIUM",
    });
    const list = problems([
      extraProblems[0] ?? "Bağımsız restoran websitesı yok.",
      extraProblems[1] ?? (socialProof.length ? `${socialProof.join(" / ")} site yerine kullanılıyor.` : null),
      extraProblems[2] ?? (hasPhone ? null : "Doğrulanmış telefon da yok; ilk temas kanalı zayıf."),
    ]);
    return {
      websiteStatus: "NO_WEBSITE",
      websiteScore: rules.websiteScore,
      leadScore: rules.leadScore,
      priority: rules.priority,
      problem1: list[0] ?? null,
      problem2: list[1] ?? null,
      problem3: list[2] ?? null,
      websiteAnalysis: analysis,
      opportunities: "WEBSITE_NEW, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
      salkayPitch: `${name} için modern restoran sitesi + dijital menü + WhatsApp + rezervasyon. ${socialLine}`,
      website: hostMatches(hostOf(row.current.website), SOCIAL_HOSTS) || hostMatches(hostOf(row.current.website), DIRECTORY_HOSTS)
        ? null
        : row.current.website,
      websiteDomain:
        hostMatches(hostOf(row.current.website), SOCIAL_HOSTS) || hostMatches(hostOf(row.current.website), DIRECTORY_HOSTS)
          ? null
          : row.current.websiteDomain,
    };
  };

  switch (row.probe.kind) {
    case "none":
      return noWebsite(
        `Bağımsız website bulunamadı; ${name} kaydında URL yok. ${socialLine}`,
      );
    case "social":
      return noWebsite(
        `${name} için kayıtlı adres bağımsız site değil (${row.probe.host}). Instagram/sosyal link website sayılmaz. ${socialLine}`,
        ["Kayıtlı URL Instagram/sosyal profil; bağımsız website yok.", `${row.probe.host} website yerine kullanılıyor.`],
      );
    case "directory":
      return noWebsite(
        `${name} için kayıtlı adres dizin/platform (${row.probe.host}); bağımsız restoran sitesi değil. ${socialLine}`,
        ["Kayıtlı URL Google/Yemeksepeti/Tripadvisor benzeri dizin.", "Bağımsız restoran websitesı yok."],
      );
    case "redirect-social":
      return noWebsite(
        `${row.probe.inputUrl} açılınca ${row.probe.host} sosyal/dizin adresine yönleniyor. Bağımsız restoran sitesi yok. ${socialLine}`,
        ["Website URL’si sosyal profile yönleniyor.", "Kullanılabilir restoran sitesi yok."],
      );
    case "parking":
      return noWebsite(
        `${row.probe.host} park edilmiş / satışta bir domain; restoran sitesi değil. ${socialLine}`,
        ["Domain park edilmiş veya satılık.", "Kullanılabilir restoran sitesi yok."],
      );
    case "placeholder":
      return noWebsite(
        `${row.probe.host} coming soon / hosting varsayılanı / WordPress “Hello world” seviyesinde. Kullanılabilir restoran vitrini yok. ${socialLine}`,
        [
          row.probe.signals.includes("hello-world")
            ? "WordPress kurulum sayfası / Hello world içeriği yayında."
            : row.probe.signals.includes("coming-soon")
              ? "Domain yalnızca coming soon / bakım sayfası gösteriyor."
              : "Hosting varsayılan sayfası; restoran sitesi yok.",
          "Menü, rezervasyon ve işletme vitrini yok.",
        ],
      );
    case "dead":
      return noWebsite(
        row.probe.error
          ? `${row.probe.inputUrl} açılamadı (${row.probe.error.slice(0, 120)}). Çalışan bağımsız site yok. ${socialLine}`
          : `${row.probe.inputUrl} ${row.probe.status ?? "hata"} döndü; çalışan restoran sitesi yok. ${socialLine}`,
        ["Kayıtlı website açılmıyor veya hata veriyor.", "Kullanılabilir restoran sitesi yok."],
      );
    case "site":
      break;
    default: {
      const _never: never = row.probe.kind;
      throw new Error(`Unhandled probe kind: ${_never}`);
    }
  }

  const s = new Set(row.probe.signals);
  const mismatch = brandMismatch(name, row.probe.title, row.probe.excerpt, row.probe.host);
  const missingCore = [!s.has("menu"), !s.has("reservation"), !s.has("whatsapp"), !s.has("tel")].filter(Boolean).length;
  const technicalPain =
    s.has("encoding-mojibake") || s.has("flash") || s.has("frameset") || s.has("thin-content") || !s.has("viewport");
  const oldStack = s.has("bootstrap3") || s.has("jquery1") || s.has("lorem");

  const problemList: string[] = [];
  if (mismatch) {
    problemList.push(
      `Açık sayfa başlığı/içeriği (${row.probe.title || row.probe.host}) ${name} markasıyla örtüşmüyor.`,
    );
  }
  if (!s.has("viewport")) problemList.push("Viewport meta yok; mobil uyum şüpheli / muhtemelen masaüstü site.");
  if (s.has("encoding-mojibake")) problemList.push("Türkçe karakterler bozuk görünüyor (encoding).");
  if (s.has("lorem")) problemList.push("Sayfada Lorem ipsum / şablon demo metin duruyor.");
  if (!s.has("menu")) problemList.push("Menüye net bir erişim yok veya HTML’de menü akışı görünmüyor.");
  if (!s.has("reservation") && !s.has("whatsapp")) {
    problemList.push("Rezervasyon veya WhatsApp CTA’sı görünür değil.");
  } else if (!s.has("reservation")) {
    problemList.push("Rezervasyon akışı yok; dönüşüm WhatsApp/telefonla sınırlı.");
  }
  if (!s.has("tel") && !s.has("whatsapp")) problemList.push("Sitede tıklanabilir telefon veya WhatsApp yok.");
  if (!s.has("hours")) problemList.push("Çalışma saatleri sitede net değil.");
  if (!s.has("maps")) problemList.push("Adres/harita bağlantısı zayıf veya yok.");
  if (s.has("thin-content")) problemList.push("Sayfa içeriği çok ince; restoran vitrini oluşmamış.");
  if (oldStack) problemList.push("Eski şablon / jQuery-Bootstrap izi; tasarım güncel durmuyor.");
  if (!s.has("https")) problemList.push("Güvenli HTTPS bağlantısı yok.");

  let status: RestaurantWebsiteStatus = "IMPROVABLE";
  let websiteScore = 6.2;

  if (mismatch || s.has("lorem") || (s.has("thin-content") && missingCore >= 3) || (!s.has("viewport") && missingCore >= 2)) {
    status = "VERY_WEAK";
    websiteScore = mismatch ? 2.4 : 2.8;
  } else if (!s.has("viewport") || oldStack || missingCore >= 3 || s.has("encoding-mojibake") || s.has("flash")) {
    status = "WEAK";
    websiteScore = 4.1;
  } else if (missingCore <= 1 && s.has("viewport") && s.has("https") && (s.has("menu") || s.has("reservation")) && !oldStack) {
    status = s.has("reservation") && s.has("menu") && s.has("whatsapp") && s.has("instagram") ? "GOOD" : "IMPROVABLE";
    websiteScore = status === "GOOD" ? 7.6 : 6.4;
  } else if (missingCore >= 2 || !s.has("cta")) {
    status = "WEAK";
    websiteScore = 4.6;
  }

  if (status === "GOOD" && s.has("reservation") && s.has("menu") && s.has("whatsapp") && s.has("maps") && !mismatch && !technicalPain) {
    status = "VERY_GOOD";
    websiteScore = 8.8;
  }

  const rules = applyRestaurantLeadStatusRules({
    websiteStatus: status,
    websiteScore,
    leadScore:
      status === "NO_WEBSITE" || status === "VERY_WEAK"
        ? hasPhone
          ? 9.0
          : 7.6
        : status === "WEAK"
          ? hasPhone
            ? 8.4
            : 7.0
          : status === "IMPROVABLE"
            ? hasPhone
              ? 7.2
              : 6.2
            : 5.0,
    priority:
      status === "GOOD" || status === "VERY_GOOD"
        ? "QUALIFIED_OUT"
        : status === "IMPROVABLE"
          ? "MEDIUM"
          : hasPhone
            ? "HIGH"
            : "MEDIUM",
  });

  const list = problems(problemList);
  const analysisBits = [
    `${name} sitesi ${row.probe.finalUrl} üzerinden kontrol edildi (HTTP ${row.probe.status ?? "?"} · ${row.probe.host}).`,
    row.probe.title ? `Sayfa başlığı: “${row.probe.title.slice(0, 90)}”.` : null,
    mismatch ? "Marka adı sitede net doğrulanamadı." : null,
    s.has("viewport") ? "Mobil viewport var." : "Mobil viewport yok.",
    s.has("menu") ? "Menü izi var." : "Menü akışı zayıf.",
    s.has("reservation") ? "Rezervasyon izi var." : "Rezervasyon CTA’sı yok.",
    s.has("whatsapp") ? "WhatsApp izi var." : "WhatsApp CTA yok.",
  ].filter(Boolean);

  const pitch =
    status === "VERY_WEAK"
      ? `${name}: tam redesign + mobil + menü + WhatsApp/rezervasyon. Mevcut site güven vermiyor.`
      : status === "WEAK"
        ? `${name}: redesign veya conversion odaklı iyileştirme (menü, CTA, mobil).`
        : status === "IMPROVABLE"
          ? `${name}: temel site çalışıyor; ${list[0] ?? "dönüşüm ve mobil detayları"} netleştirilmeli.`
          : `${name}: site satış için düşük öncelik; redesign gerekmez.`;

  return {
    websiteStatus: rules.priority === "QUALIFIED_OUT" ? status : status,
    websiteScore: rules.websiteScore,
    leadScore: rules.leadScore,
    priority: rules.priority,
    problem1: list[0] ?? null,
    problem2: list[1] ?? null,
    problem3: list[2] ?? null,
    websiteAnalysis: analysisBits.join(" "),
    opportunities:
      status === "GOOD" || status === "VERY_GOOD"
        ? "LOW_PRIORITY_KEEP"
        : status === "IMPROVABLE"
          ? "CONVERSION_IMPROVE, MOBILE_POLISH"
          : "WEBSITE_REDESIGN, DIGITAL_MENU, WHATSAPP_CTA, RESERVATION_FLOW",
    salkayPitch: pitch,
    website: row.current.website,
    websiteDomain: row.current.websiteDomain,
  };
}

function analysisPatch(existing: RestaurantLead, next: Assessment): Prisma.RestaurantLeadUpdateInput {
  const patch: Prisma.RestaurantLeadUpdateInput = {};
  const assign = <K extends keyof Assessment>(field: K, value: Assessment[K]) => {
    const current = existing[field as keyof RestaurantLead];
    if (current === value) return;
    if (typeof current === "number" && typeof value === "number" && Math.abs(current - value) < 0.05) return;
    (patch as Record<string, unknown>)[field] = value;
  };

  assign("websiteStatus", next.websiteStatus);
  assign("websiteScore", next.websiteScore);
  assign("leadScore", next.leadScore);
  assign("priority", next.priority);
  assign("problem1", next.problem1);
  assign("problem2", next.problem2);
  assign("problem3", next.problem3);
  assign("websiteAnalysis", next.websiteAnalysis);
  assign("opportunities", next.opportunities);
  assign("salkayPitch", next.salkayPitch);
  if (next.website !== existing.website) patch.website = next.website;
  if (next.websiteDomain !== existing.websiteDomain) patch.websiteDomain = next.websiteDomain;
  patch.dateChecked = new Date("2026-09-04T00:00:00.000Z");
  return patch;
}

async function main() {
  loadDotEnv();
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL missing");
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const prisma = getPrisma();
  const apply = process.argv.includes("--apply");
  const reuse = process.argv.includes("--reuse-probe") && existsSync(PROBE_PATH);

  const before = await prisma.restaurantLead.count();
  if (before !== 239) {
    throw new Error(`Safety stop: RestaurantLead count is ${before}, expected 239`);
  }

  const leads = await prisma.restaurantLead.findMany({
    orderBy: [{ region: "asc" }, { restaurantName: "asc" }],
  });

  let probes: Probe[];
  if (reuse) {
    probes = JSON.parse(readFileSync(PROBE_PATH, "utf8")) as Probe[];
    console.log(`Reusing ${probes.length} probes from ${PROBE_PATH}`);
  } else {
    console.log(`Probing ${leads.length} restaurant websites...`);
    probes = await mapPool(leads, 6, async (lead, index) => {
      const probe = await fetchSite(lead.website);
      if ((index + 1) % 20 === 0) {
        console.log(`  ${index + 1}/${leads.length} ${lead.restaurantName} → ${probe.kind} ${probe.status ?? ""}`);
      }
      return {
        id: lead.id,
        restaurantName: lead.restaurantName,
        district: lead.district,
        region: lead.region,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        publicEmail: lead.publicEmail,
        instagram: lead.instagram,
        googleMapsUrl: lead.googleMapsUrl,
        googleRating: lead.googleRating,
        googleReviewCount: lead.googleReviewCount,
        outreachNotes: lead.outreachNotes,
        current: {
          website: lead.website,
          websiteDomain: lead.websiteDomain,
          websiteStatus: lead.websiteStatus,
          websiteScore: lead.websiteScore,
          leadScore: lead.leadScore,
          priority: lead.priority,
          problem1: lead.problem1,
          problem2: lead.problem2,
          problem3: lead.problem3,
          websiteAnalysis: lead.websiteAnalysis,
          opportunities: lead.opportunities,
          salkayPitch: lead.salkayPitch,
        },
        probe,
      };
    });
    writeFileSync(PROBE_PATH, JSON.stringify(probes, null, 2));
    console.log(`Wrote ${PROBE_PATH}`);
  }

  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  const proposed = probes.map((row) => {
    const existing = leadById.get(row.id);
    if (!existing) throw new Error(`Missing lead ${row.id}`);
    const next = assess(row);
    const patch = analysisPatch(existing, next);
    return { row, next, patch, changed: Object.keys(patch).filter((key) => key !== "dateChecked") };
  });

  writeFileSync(
    PATCH_PATH,
    JSON.stringify(
      proposed.map((item) => ({
        id: item.row.id,
        restaurantName: item.row.restaurantName,
        district: item.row.district,
        region: item.row.region,
        phone: item.row.phone,
        website: item.next.website,
        from: {
          websiteStatus: item.row.current.websiteStatus,
          websiteScore: item.row.current.websiteScore,
          leadScore: item.row.current.leadScore,
          priority: item.row.current.priority,
        },
        to: {
          websiteStatus: item.next.websiteStatus,
          websiteScore: item.next.websiteScore,
          leadScore: item.next.leadScore,
          priority: item.next.priority,
          problem1: item.next.problem1,
          websiteAnalysis: item.next.websiteAnalysis,
          salkayPitch: item.next.salkayPitch,
        },
        probeKind: item.row.probe.kind,
        changed: item.changed,
      })),
      null,
      2,
    ),
  );

  const statusChanged = proposed.filter((item) => item.row.current.websiteStatus !== item.next.websiteStatus).length;
  const scoreChanged = proposed.filter((item) => item.row.current.websiteScore !== item.next.websiteScore).length;
  const analysisChanged = proposed.filter((item) => item.row.current.websiteAnalysis !== item.next.websiteAnalysis).length;
  const byStatus = proposed.reduce<Record<string, number>>((acc, item) => {
    acc[item.next.websiteStatus] = (acc[item.next.websiteStatus] ?? 0) + 1;
    return acc;
  }, {});
  const high = proposed.filter((item) => item.next.priority === "HIGH");
  console.log({
    total: proposed.length,
    byStatus,
    statusChanged,
    scoreChanged,
    analysisChanged,
    high: high.length,
    highAnadolu: high.filter((item) => item.row.region === "ANADOLU").length,
    highAvrupa: high.filter((item) => item.row.region === "AVRUPA").length,
  });

  if (!apply) {
    console.log("Dry-run only. Re-run with --apply after reviewing tmp/restaurant-website-patches.json");
    return;
  }

  let updated = 0;
  await prisma.$transaction(
    async (tx) => {
      const count = await tx.restaurantLead.count();
      if (count !== 239) throw new Error(`Abort: count ${count}`);
      for (const item of proposed) {
        const data = item.patch;
        const keys = Object.keys(data).filter((key) => key !== "dateChecked");
        if (keys.length === 0) continue;
        const existing = await tx.restaurantLead.findUnique({ where: { id: item.row.id } });
        if (!existing) throw new Error(`Missing ${item.row.id}`);
        if (
          existing.restaurantName !== item.row.restaurantName ||
          existing.district !== item.row.district ||
          existing.region !== item.row.region ||
          existing.phone !== item.row.phone
        ) {
          throw new Error(`Identity drift on ${item.row.id}`);
        }
        await tx.restaurantLead.update({
          where: { id: item.row.id },
          data,
        });
        updated += 1;
      }
      const after = await tx.restaurantLead.count();
      if (after !== 239) throw new Error(`Abort after write: ${after}`);
    },
    { timeout: 180000, maxWait: 20000 },
  );

  const after = await prisma.restaurantLead.count();
  console.log(`Applied ${updated} analysis updates. RestaurantLead count ${after}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
