import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  attachRestaurantLeadDuplicates,
  buildRestaurantLeadUpdatePatch,
  parseRestaurantLeadRow,
  summarizeRestaurantLeadPreview,
} from "../src/lib/admin/restaurant-leads-import";
import { getPrisma } from "../src/lib/admin/prisma";
import { listRestaurantLeads } from "../src/lib/admin/restaurant-leads";

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

loadDotEnv();

const CHECKED = "2026-09-02";

function noWebsite(input: {
  restaurantName: string;
  district: string;
  instagram?: string;
  websiteAnalysis: string;
  salkayPitch: string;
  source: string;
}): Record<string, unknown> {
  return {
    restaurantName: input.restaurantName,
    district: input.district,
    websiteStatus: "NO_WEBSITE",
    websiteScore: null,
    leadScore: 8.4,
    priority: "HIGH",
    instagram: input.instagram,
    problem1:
      "Bağımsız marka websitesi yok; dijital görünürlük dizin, sosyal medya veya üçüncü taraf QR menü ile sınırlı.",
    websiteAnalysis: input.websiteAnalysis,
    opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: input.salkayPitch,
    source: input.source,
    dateChecked: CHECKED,
  };
}

const RESEARCHED_ROWS: Record<string, unknown>[] = [
  {
    restaurantName: "Adanalı Ümit Usta Ocakbaşı & Kebap",
    district: "Kadıköy",
    website: "https://www.umitusta.com.tr/",
    websiteStatus: "WEAK",
    websiteScore: 3.1,
    leadScore: 8.6,
    priority: "HIGH",
    instagram: "https://www.instagram.com/adanaliumitusta/",
    problem1: "Footer’da restoran sitesinin üzerinde “WEB TASARIM ( TIKLAYINIZ )” ajans butonu duruyor.",
    problem2: "Public e-posta yok; iletişim sayfasında yalnızca telefon ve form var.",
    problem3: "Ana sayfada “hızlı siparis olusturabilirsiniz” ASCII yazımı; sipariş Yemek Sepeti’ne kaçıyor.",
    websiteAnalysis:
      "umitusta.com.tr 2026-09-02 açıldı. Kozyatağı / Kozzy AVM ve 0216 380 63 00 sitede. Public e-posta yok. Instagram adanaliumitusta resmi sitede. DB telefonu (+90 554 018 01 01) üzerine yazılmadı.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch:
      "Kozyatağı Adana ocağı; site WordPress ve ajans imzalı. Premium marka yüzü + rezervasyon net SALKAY işi.",
    source: "https://www.umitusta.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "L'Olivetto Restaurant",
    district: "Ataşehir",
    website: "https://lolivetto.com.tr/",
    websiteStatus: "WEAK",
    websiteScore: 3.6,
    leadScore: 8.4,
    priority: "HIGH",
    publicEmail: "info@lolivetto.com.tr",
    problem1: "Ana sayfada “Hosgeldiniz” Türkçe karakter hatası yayında.",
    problem2: "Elroyale şablon metinleri (“En iyisi ile…”, “şehir hayatının içinde bir vaha”) marka anlatısının önüne geçiyor.",
    problem3: "Rezervasyon yalnızca telefon/WhatsApp; sitede bağımsız rezervasyon akışı yok.",
    websiteAnalysis:
      "lolivetto.com.tr 2026-09-02 açıldı. Ataşehir Atatürk Mah. ve +90 216 912 22 21 doğrulandı. Cloudflare e-posta info@lolivetto.com.tr çözüldü; iletişim sayfasında da aynı kutu var.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch:
      "Ataşehir Akdeniz restoranı; mevcut site şablon ve telefon rezervasyonlu. Premium yüz + rezervasyon doğru açı.",
    source: "https://lolivetto.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "KAPLAN KEBAP",
    district: "Maltepe",
    website: "https://kaplankebap.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.4,
    leadScore: 8.5,
    priority: "HIGH",
    publicEmail: "info@kaplankebap.com",
    instagram: "https://www.instagram.com/kaplankebap/",
    problem1: "Ana sayfa tam ekran video splash; menü ve rezervasyon içeriği yok, hemen footer geliyor.",
    problem2: "İletişim formunda e-posta alanı “Telefon Numaranız” placeholder’ı ile yayınlanmış.",
    problem3: "Hello Elementor varsayılan iskelet; GTranslate widget’ı boş wrapper olarak duruyor.",
    websiteAnalysis:
      "kaplankebap.com 2026-09-02 açıldı. Zümrütevler adresi, sipariş 0216 371 56 16 ve info@kaplankebap.com resmi iletişim sayfasında. Instagram kaplankebap resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, MOBILE_UX, RESERVATION_FLOW",
    salkayPitch:
      "Maltepe’de köklü kebap adresi; ana sayfa video splash ve form hatası. Premium restoran yüzü + rezervasyon.",
    source: "https://kaplankebap.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Balıkçı Lokantası",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: Placera/Yandex/Apple Maps site alanı boş. balikcilokantasi.com DNS yok. Bağımsız marka sitesi bulunamadı.",
    salkayPitch: "Kadıköy Rasimpaşa balıkçısı; bağımsız site yok. Yeni marka sitesi + rezervasyon güçlü açı.",
    source: "https://placera.com.tr/balikci/13369249739345755236/",
  }),
  noWebsite({
    restaurantName: "Küçük Filika Balık Restaurant",
    district: "Ataşehir",
    websiteAnalysis:
      "2026-09-02: Yandex/Placera site yok; Facebook kucukfilikabalik. kucukfilika.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Ataşehir İçerenköy balık restoranı; site yok. Marka sitesi + rezervasyon.",
    source: "https://yandex.com.tr/maps/org/kucuk_filika_balik_restoran/35277560412/",
  }),
  noWebsite({
    restaurantName: "By Satır Kasap Izgara",
    district: "Ataşehir",
    websiteAnalysis:
      "2026-09-02: Dizinlerde bysatirkasapizgara.com geçiyor; DNS çözülmüyor, HTTP fail. Aktif varlık QRDOS QR menü. Üçüncü taraf info@bysatirkasapizgara.com yazılmadı.",
    salkayPitch: "Ataşehir kasap-ızgara; listelenen alan adı ölü, bağımsız site yok. Yeni site net iş.",
    source: "https://qrdos.tr/by-satir-kasap-izgara",
  }),
  noWebsite({
    restaurantName: "Ataşehir Sen Kahvaltı",
    district: "Ataşehir",
    websiteAnalysis:
      "2026-09-02: DB adı Ataşehir Sen Kahvaltı. Yalnızca QRDOS QR menü (atasehir-sen-cafe-restoran). senkahvalti.com / atasehirsenkahvalti.com DNS yok. QR üçüncü taraf, bağımsız site değil.",
    salkayPitch: "Ataşehir kahvaltı; kendi domain’i yok, QR menü üçüncü taraf. Yeni site + dijital menü.",
    source: "https://qrdos.tr/atasehir-sen-cafe-restoran",
  }),
  noWebsite({
    restaurantName: "Cozzy Cafe Restaurant Ataşehir",
    district: "Ataşehir",
    websiteAnalysis:
      "2026-09-02: Yandex/Placera site yok. cozzycafe.com 114 byte boş yanıt; bu işletmenin marka sitesi değil, kayda yazılmadı.",
    salkayPitch: "Ataşehir İçerenköy cafe-restaurant; bağımsız site yok. Yeni vitrin.",
    source: "https://yandex.com.tr/maps/org/cozzy_cafe_restaurant/238506912441/",
  }),
  noWebsite({
    restaurantName: "GULE KAFE",
    district: "Üsküdar",
    websiteAnalysis:
      "2026-09-02: Kuzguncuk dizinleri site göstermiyor. gulekafe.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Kuzguncuk kahvaltı kafesi; site yok. Küçük işletme için net yeni site işi.",
    source: "https://localguideworld.com/places/254880/gule-kafe",
  }),
  noWebsite({
    restaurantName: "Kudüs Han",
    district: "Üsküdar",
    instagram: "https://www.instagram.com/khanalquds/",
    websiteAnalysis:
      "2026-09-02: BuMaps kudushan.com listeliyor; DNS yok, HTTP fail. Placera website alanı Instagram khanalquds. Bağımsız site yok.",
    salkayPitch: "Üsküdar Filistin mutfağı; domain ölü, varlık Instagram. Yeni site.",
    source: "https://placera.com.tr/arap-restorani/9087598488534220855/",
  }),
  noWebsite({
    restaurantName: "By İnce Memet",
    district: "Üsküdar",
    websiteAnalysis:
      "2026-09-02: Placera/Menü Burada site yok. incememet.com 403 ve eşleşme doğrulanmadı, kayda yazılmadı. Bağımsız restoran sitesi bulunamadı.",
    salkayPitch: "Beylerbeyi balık/meze; bağımsız site yok. Yeni site + rezervasyon.",
    source: "https://placera.com.tr/aile-restorani/11977492595973930374/",
  }),
  noWebsite({
    restaurantName: "Farika Restaurant",
    district: "Maltepe",
    websiteAnalysis:
      "2026-09-02: Rehberlerde “Web Site Belirtilmedi”. farikarestaurant.com DNS yok. farika.com.tr Farika Parfüm/kozmetik bakım sayfası; restoran değil, yazılmadı.",
    salkayPitch: "Maltepe Yalı meyhane/balık; bağımsız restoran sitesi yok.",
    source: "https://botic.com.tr/farika-restaurant",
  }),
  noWebsite({
    restaurantName: "Posus Cafe Ve Kahvaltı",
    district: "Kartal",
    websiteAnalysis:
      "2026-09-02: Yandex/Menü Burada site yok. posuscafe.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Kartal kahvaltı kafesi; site yok. Yeni site + dijital menü.",
    source: "https://yandex.com.tr/maps/org/posus_kahvalti/1137087422/",
  }),
  noWebsite({
    restaurantName: "Lipa Köfte & Cevapi",
    district: "Kartal",
    websiteAnalysis:
      "2026-09-02: Dizinlerde bağımsız site yok. lipakofte.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Kartal köfte/ćevapi; site yok. Yeni marka vitrini.",
    source: "https://www.google.com/search?q=Lipa+K%C3%B6fte+Cevapi+Kartal",
  }),
  noWebsite({
    restaurantName: "İkinci Bahar Meyhanesi",
    district: "Kartal",
    instagram: "https://www.instagram.com/ikincibaharmeyhanesi/",
    websiteAnalysis:
      "2026-09-02: ikincibaharmeyhanesi.com / ikincibahar.com DNS yok. Dizin website alanı Instagram. Instagram bağımsız site sayılmadı.",
    salkayPitch: "Kartal Kordonboyu meyhane; site yok, Instagram var. Yeni meyhane sitesi.",
    source: "https://istanbul34gazetesi.com/ikinci-bahar-ikinci-baharda-yasanir/",
  }),
  {
    restaurantName: "Katibim",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
  },
  {
    restaurantName: "Ada Ocakbaşı",
    district: "Maltepe",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
  },
];

const TARGET_KEYS = RESEARCHED_ROWS.map((row) => ({
  restaurantName: String(row.restaurantName),
  district: String(row.district),
}));

async function main() {
  const apply = process.argv.includes("--confirm");
  const parsed = RESEARCHED_ROWS.map((row, index) => parseRestaurantLeadRow(row, index + 2));
  const preview = await attachRestaurantLeadDuplicates(parsed, "update");
  const stats = summarizeRestaurantLeadPreview(preview, "update");

  const details = preview.map((row) => {
    const patch = row.existing ? buildRestaurantLeadUpdatePatch(row.existing, row) : {};
    return {
      restaurantName: row.restaurantName,
      district: row.district,
      action: row.importAction,
      matchedId: row.existing?.id ?? null,
      websiteStatus: row.websiteStatus,
      websiteScore: row.websiteScore,
      leadScore: row.leadScore,
      priority: row.priority,
      errors: row.errors,
      changedFields: Object.keys(patch),
    };
  });

  const noWebsiteRows = details.filter((row) => row.websiteStatus === "NO_WEBSITE");
  const notVerifiedRows = details.filter((row) => row.websiteStatus === "NOT_VERIFIED");
  const scoredRows = details.filter(
    (row) => row.websiteStatus !== "NO_WEBSITE" && row.websiteStatus !== "NOT_VERIFIED",
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? "CONFIRM_UPDATE" : "PREVIEW",
        matched: preview.filter((row) => Boolean(row.existing)).length,
        newLeads: stats.newLeads,
        updates: stats.updates,
        unchanged: stats.unchanged,
        invalid: stats.invalid,
        noWebsite: noWebsiteRows.map((row) => `${row.restaurantName} — ${row.district}`),
        notVerified: notVerifiedRows.map((row) => `${row.restaurantName} — ${row.district}`),
        scored: scoredRows.map(
          (row) => `${row.restaurantName} — ${row.district} (${row.websiteStatus} / ${row.websiteScore})`,
        ),
        details,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("\nConfirm için: npx tsx scripts/update-wave2-verified-leads.ts --confirm");
    return;
  }

  if (stats.newLeads > 0) {
    throw new Error("Update modunda yeni kayıt oluşturulmamalı.");
  }

  const prisma = getPrisma();
  let updated = 0;
  for (const row of preview) {
    if (row.importAction !== "update" || !row.existing) continue;
    const existing = await prisma.restaurantLead.findUnique({ where: { id: row.existing.id } });
    if (!existing) continue;
    const data = buildRestaurantLeadUpdatePatch(existing, row);
    if (Object.keys(data).length === 0) continue;
    await prisma.restaurantLead.update({ where: { id: existing.id }, data });
    updated += 1;
  }

  const after = await prisma.restaurantLead.findMany({
    where: {
      OR: TARGET_KEYS.map((key) => ({
        restaurantName: key.restaurantName,
        district: key.district,
      })),
    },
    orderBy: [{ leadScore: { sort: "desc" } }, { restaurantName: "asc" }],
  });
  const [total, notVerified, high] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { websiteStatus: "NOT_VERIFIED" } }),
    prisma.restaurantLead.count({ where: { priority: "HIGH" } }),
  ]);
  const top20 = await listRestaurantLeads({ view: "top-20" });

  console.log(
    JSON.stringify(
      {
        updated,
        after: after.map((row) => ({
          restaurantName: row.restaurantName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          priority: row.priority,
          publicEmail: row.publicEmail,
          website: row.website,
        })),
        wave2NoWebsite: after.filter((row) => row.websiteStatus === "NO_WEBSITE").length,
        wave2NotVerified: after.filter((row) => row.websiteStatus === "NOT_VERIFIED").length,
        remaining: { total, notVerified, high },
        top20: top20.rows.map((row, index) => ({
          rank: index + 1,
          restaurantName: row.restaurantName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          priority: row.priority,
          publicEmail: row.publicEmail,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
