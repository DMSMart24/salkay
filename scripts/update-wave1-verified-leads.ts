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

const RESEARCHED_ROWS: Record<string, unknown>[] = [
  {
    restaurantName: "Nakkaş Kebap Nakkaştepe",
    district: "Üsküdar",
    website: "https://nakkaskebap.com/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 2.6,
    leadScore: 9.1,
    priority: "HIGH",
    instagram: "https://www.instagram.com/nakkaskebap",
    problem1:
      "Ana sayfada Lorem ipsum ve İngilizce demo menü (King Prawns, Carbonara, Fajitas) yayında; Nakkaş kebap menüsü değil.",
    problem2: "İletişim/contact sayfası WordPress PHP hatası veriyor (500).",
    problem3: "Şube sayısı metinde üç, listede iki; Göztepe/Feneryolu/Çekmeköy bilgisi tutarsız.",
    websiteAnalysis:
      "nakkaskebap.com 2026-09-02 açıldı. WordPress şablon; ana sayfada İngilizce demo yemek listesi ve Lorem ipsum. Public e-posta yok. Instagram nakkaskebap resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch:
      "Nakkaştepe'de yüksek hacimli kebap adresi; site hâlâ şablon demo menü gösteriyor. Premium Türkçe restoran yüzü + rezervasyon net SALKAY işi.",
    source: "https://nakkaskebap.com/",
    dateChecked: "2026-09-02",
  },
  {
    restaurantName: "Meyzen",
    district: "Maltepe",
    website: "https://meyzen0.metro.rest/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 1.8,
    leadScore: 8.8,
    priority: "HIGH",
    problem1:
      "Otelimiz / uzun konaklama / romantik hafta sonu / oda servisi gibi restoranla ilgisiz içerik yayında.",
    problem2: "Yanlış sektör şablonu: site otel olarak konumlanıyor, Maltepe fasıl restoranı değil.",
    problem3: "Imprint / yetkili kişi alanında anlamsız “Aaaa” içeriği var.",
    websiteAnalysis:
      "meyzen0.metro.rest 2026-09-02 açıldı. Metro.rest otel şablonu; TR metinde otelimiz, uzun konaklama, oda servisi. Yasal bilgilerde yetkili kişi Aaaa. Public e-posta yok.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch:
      "Maltepe Yalı'da fasıl restoranı; mevcut site otel şablonu. Gerçek restoran yüzü + rezervasyon net SALKAY işi.",
    source: "https://meyzen0.metro.rest/",
    dateChecked: "2026-09-02",
  },
  {
    restaurantName: "ASF Gurme",
    district: "Kartal",
    website: "https://asfgurme.com/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 2.0,
    leadScore: 8.9,
    priority: "HIGH",
    problem1: "Site açıkça yapım aşamasındadır; menü ve sipariş akışı yok.",
    problem2: "Public e-posta yok; iletişim yalnızca telefon.",
    problem3: "Kategori linkleri içerik sayfasına bağlanmıyor; hero blokları tekrar ediyor.",
    websiteAnalysis:
      "asfgurme.com 2026-09-02 açıldı. Kartal Orhantepe adresi ve 0216 606 6374 doğrulandı. Yapım aşaması landing page. E-posta yok.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch:
      "4.9 puanlı Kartal gurme/kahvaltı; site yarım. Tamamlanmış menü + sipariş yüzü güçlü açı.",
    source: "https://asfgurme.com/",
    dateChecked: "2026-09-02",
  },
  {
    restaurantName: "İNCİ BALIK",
    district: "Maltepe",
    website: "https://www.incibalik.com/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 2.5,
    leadScore: 8.7,
    priority: "HIGH",
    problem1: "Site başlığında İzmir geçiyor; işletme Maltepe’de.",
    problem2: "Ürün açıklaması burada yer alacak... placeholder içeriği yayında.",
    problem3: "Şablon/marka tutarsızlığı: Maltepe balık restoranı kimliği sitede yok.",
    websiteAnalysis:
      "incibalik.com 2026-09-02 açıldı. Başlık Online Sipariş | İzmir. Placeholder ürün metni var. Public e-posta yok; ornek@email.com şablon kutusuna yazılmadı.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch:
      "Maltepe Altayçeşme balıkçısı; mevcut site İzmir şablonu ve placeholder. Maltepe kimliğiyle yeniden yazım güçlü açı.",
    source: "https://www.incibalik.com/",
    dateChecked: "2026-09-02",
  },
  {
    restaurantName: "Tarihi Erzurum Kebapçısı",
    district: "Pendik",
    website: "https://www.tarihierzurumkebapcisi.com.tr/",
    websiteStatus: "WEAK",
    websiteScore: 3.3,
    leadScore: 8.6,
    priority: "HIGH",
    instagram: "https://www.instagram.com/tarihierzurumkebapcisi",
    problem1: "Ana sayfada hâlâ COVID/maske/mesafe dönemi içeriği duruyor.",
    problem2: "İletişim sayfasında public e-posta yok; Call Now Button eklentisine bağlı.",
    problem3: "Rezervasyon/menü ilk bakışta telefon dışında net bir conversion akışına bağlanmıyor.",
    websiteAnalysis:
      "tarihierzurumkebapcisi.com.tr 2026-09-02 açıldı. Pendik Esenyalı doğrulandı. Public e-posta yok. Instagram resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, MOBILE_UX, RESERVATION_FLOW",
    salkayPitch:
      "Pendik'te yüksek hacimli cağ kebap; site eski ve pandemi metinli. Premium yenileme + rezervasyon doğru açı.",
    source: "https://www.tarihierzurumkebapcisi.com.tr/",
    dateChecked: "2026-09-02",
  },
  {
    restaurantName: "Sembol Ocakbaşı Çamlıca",
    district: "Üsküdar",
    website: "https://sembolocakbasi.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.2,
    leadScore: 8.5,
    priority: "HIGH",
    publicEmail: "info@sembolocakbasi.com.tr",
    instagram: "https://www.instagram.com/sembolocakbasi",
    problem1: "Çamlıca şube sayfası uzun metin duvarı; rezervasyon ve menü ilk ekranda yok.",
    problem2: "QR menü (qr.sembolocakbasi.com/camlica) PHP hatası basıyor.",
    problem3: "QR menüde instagram takipçi satın al spam bağlantısı görünüyor.",
    websiteAnalysis:
      "sembolocakbasi.com ve Çamlıca şube sayfası 2026-09-02 açıldı. Cloudflare korumalı e-posta info@sembolocakbasi.com.tr çözüldü. Instagram sembolocakbasi. QR menüde PHP notice ve spam link.",
    opportunities: "WEBSITE_REDESIGN, MOBILE_UX, RESERVATION_FLOW",
    salkayPitch:
      "Çamlıca'da yüksek hacimli ocakbaşı; marka sitesi ve QR menü zayıf. Premium şube + rezervasyon yüzü.",
    source: "https://sembolocakbasi.com/sube/camlica",
    dateChecked: "2026-09-02",
  },
  {
    restaurantName: "Feride Meyhanesi",
    district: "Ataşehir",
    website: "https://feridemeyhanesi.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.8,
    leadScore: 8.6,
    priority: "HIGH",
    problem1: "Sosyal mesafe döneminden kalan eski/dönemsel metinler duruyor.",
    problem2: "Site güncel meyhane rezervasyon akışını öne çıkarmıyor.",
    problem3: "Eski dönem içeriği marka ve ziyaret güvenini zayıflatıyor.",
    websiteAnalysis:
      "feridemeyhanesi.com daha önce doğrulandı. Eski/dönemsel içerik, sosyal mesafe dönemi metinleri. Public e-posta doğrulanmadı, boş bırakıldı.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch:
      "Ataşehir meyhane; feridemeyhanesi.com eski dönem metinli. Güncel rezervasyon yüzü net fırsat.",
    source: "https://feridemeyhanesi.com/",
    dateChecked: "2026-09-02",
  },
];

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
      errors: row.errors,
      changedFields: Object.keys(patch),
      patch,
    };
  });

  console.log(
    JSON.stringify(
      {
        mode: apply ? "CONFIRM_UPDATE" : "PREVIEW",
        matched: preview.filter((row) => Boolean(row.existing)).length,
        newLeads: stats.newLeads,
        updates: stats.updates,
        unchanged: stats.unchanged,
        invalid: stats.invalid,
        details,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("\nConfirm için: npx tsx scripts/update-wave1-verified-leads.ts --confirm");
    return;
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

  const names = RESEARCHED_ROWS.map((row) => String(row.restaurantName));
  const after = await prisma.restaurantLead.findMany({
    where: { restaurantName: { in: names } },
    orderBy: [{ leadScore: "desc" }, { restaurantName: "asc" }],
  });
  const [total, notVerified, pending] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { websiteStatus: "NOT_VERIFIED" } }),
    prisma.restaurantLead.count({ where: { priority: "PENDING" } }),
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
          problem1: row.problem1,
          problem2: row.problem2,
          problem3: row.problem3,
        })),
        remaining: { total, notVerified, pending },
        top20,
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
