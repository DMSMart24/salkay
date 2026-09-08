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
      "Bağımsız marka websitesi yok; dijital görünürlük dizin, sosyal medya veya üçüncü taraf sayfalarla sınırlı.",
    websiteAnalysis: input.websiteAnalysis,
    opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: input.salkayPitch,
    source: input.source,
    dateChecked: CHECKED,
  };
}

const RESEARCHED_ROWS: Record<string, unknown>[] = [
  {
    restaurantName: "Kadıhan Kebap & Künefe",
    district: "Kadıköy",
    website: "https://kadihan.com.tr/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 2.4,
    leadScore: 8.8,
    priority: "HIGH",
    instagram: "https://www.instagram.com/kadihantr",
    problem1: "Site tek kartlık iletişim landing; menü, hakkında ve rezervasyon sayfası yok.",
    problem2: "Public e-posta yok; aksiyon yalnızca telefon ve Instagram.",
    problem3: "HTML charset bozulması: Kebap & Künefe metni sayfada bozuk karakterlerle görünüyor.",
    websiteAnalysis:
      "kadihan.com.tr 2026-09-02 açıldı. Osmanağa Kıvanç Sk. ve 0216 414 2 888 doğrulandı. Instagram kadihantr resmi sitede. Menü/iletişim sayfası yok.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Kadıköy kebap-künefe; site kartvizit landing. Tam restoran sitesi net SALKAY işi.",
    source: "https://kadihan.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Affan Ocakbaşı",
    district: "Kadıköy",
    website: "https://www.affanocakbasi.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.4,
    leadScore: 8.5,
    priority: "HIGH",
    instagram: "https://www.instagram.com/affanocakbasi/",
    problem1: "Public e-posta yok; iletişim ve rezervasyon yalnızca telefon.",
    problem2: "İletişim sayfasında saat “12:00 -2359” yazımı eksik/hatalı.",
    problem3: "Arama kutusu İngilizce “Search…”; Flatsome/WordPress şablon izi belirgin.",
    websiteAnalysis:
      "affanocakbasi.com 2026-09-02 açıldı. Fenerbahçe adresi ve 0530 661 23 31 sitede. Public e-posta yok. Instagram affanocakbasi resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch: "Fenerbahçe Antakya ocağı; site şablon ve telefona kilitli. Premium yüz + rezervasyon.",
    source: "https://www.affanocakbasi.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Beeves Grill & Brasserie",
    district: "Ataşehir",
    website: "https://www.beevesteak.com/",
    websiteStatus: "IMPROVABLE",
    websiteScore: 5.8,
    leadScore: 7.0,
    priority: "MEDIUM",
    publicEmail: "info@beevesteak.com",
    problem1: "Viewport user-scalable=no; mobil yakınlaştırma kapalı.",
    problem2: "Rezervasyon header’da yalnızca tel linki; bağımsız online rezervasyon akışı yok.",
    problem3: "Footer’da Web Tasarım / Paragon Tasarım ajans imzası duruyor.",
    websiteAnalysis:
      "beevesteak.com 2026-09-02 açıldı. Ataşehir Ihlamur Blv. ve 0216 688 32 04 doğrulandı. info@beevesteak.com resmi iletişimde. Menü/şube/franchise sayfaları var; skor GOOD değil.",
    opportunities: "MOBILE_UX, RESERVATION_FLOW, BRAND_REFRESH",
    salkayPitch:
      "Ataşehir steakhouse; site çalışıyor ama mobil ve rezervasyon zayıf. İkinci dalga / MEDIUM.",
    source: "https://www.beevesteak.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Zübeyir Ocakbaşı Ataşehir",
    district: "Ataşehir",
    website: "https://zubeyirocakbasi.com.tr/",
    websiteStatus: "WEAK",
    websiteScore: 3.7,
    leadScore: 8.3,
    priority: "HIGH",
    publicEmail: "info@zubeyirocakbasi.com.tr",
    problem1: "Ana sayfa metni “arih ve kültürü…” diye kesik başlıyor.",
    problem2: "Sosyal ikonlar href=“#”; çalışmayan boş bağlantılar.",
    problem3: "Ataşehir sayfası ağırlıklı fotoğraf galerisi; rezervasyon/menü akışı yok.",
    websiteAnalysis:
      "zubeyirocakbasi.com.tr 2026-09-02 açıldı. Ataşehir şube sayfası Barbaros / Ardıç Sk. ve 0216 504 85 41 ile DB telefonu eşleşti. info@zubeyirocakbasi.com.tr resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch: "Zübeyir Ataşehir şubesi; marka sitesi eski. Şube odaklı yenileme.",
    source: "https://zubeyirocakbasi.com.tr/atasehir.html",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Social Lounge Restaurant Cafe",
    district: "Ataşehir",
    website: "https://www.sociallounge.com.tr/",
    websiteStatus: "WEAK",
    websiteScore: 3.9,
    leadScore: 8.3,
    priority: "HIGH",
    instagram: "https://www.instagram.com/socialloungeistanbul/",
    problem1: "Public e-posta yok; iletişim sayfasında yalnızca telefon.",
    problem2: "Instagram feed görselleri plugin placeholder.png; 2023 tarihli cache kırık.",
    problem3: "Rezervasyon sayfası içeriksiz; yalnızca header telefonu.",
    websiteAnalysis:
      "sociallounge.com.tr 2026-09-02 açıldı. Barbaros Begonya Sk. ve 0216 709 37 38 doğrulandı. Public e-posta yok. Instagram socialloungeistanbul resmi sitede. TR/EN karışık kopya.",
    opportunities: "WEBSITE_REDESIGN, RESERVATION_FLOW, BRAND_REFRESH",
    salkayPitch: "Ataşehir lounge; Elementor site ve kırık rezervasyon. Premium yenileme.",
    source: "https://www.sociallounge.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Della Fame",
    district: "Ataşehir",
    website: "https://dellafame.com.tr/",
    websiteStatus: "WEAK",
    websiteScore: 3.8,
    leadScore: 8.2,
    priority: "HIGH",
    publicEmail: "info@dellafame.com.tr",
    instagram: "https://www.instagram.com/dellafametr/",
    problem1: "Menü sayfası yemek listesi değil; FLAVORS pazarlama metni + arka plan görseli.",
    problem2: "Asıl menü qr-menu / görsel butona kaçıyor; tarayıcıda okunabilir menü yok.",
    problem3: "Nav’da “Franchıse” Türkçe ı karakteri hatalı.",
    websiteAnalysis:
      "dellafame.com.tr 2026-09-02 açıldı. Ataşehir Bulvarı ve +90 501 058 90 11 sitede. Cloudflare e-posta info@dellafame.com.tr çözüldü. Instagram dellafametr resmi sitede.",
    opportunities: "DIGITAL_MENU, WEBSITE_REDESIGN, RESERVATION_FLOW",
    salkayPitch: "Ataşehir İtalyan; menü sitede okunmuyor. Dijital menü + rezervasyon.",
    source: "https://dellafame.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Ataşehir Çınaraltı Mangalbaşı",
    district: "Ataşehir",
    website: "https://www.atasehircinaralti.com/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 2.8,
    leadScore: 8.6,
    priority: "HIGH",
    publicEmail: "info@atasehircinaralti.com",
    problem1: "WordPress 4.6.29 yayında; yıllardır güncellenmemiş çekirdek.",
    problem2: "Title “Çınaraltı MangalbaşıÇınaraltı Mangalbaşı” diye birleşik tekrar ediyor.",
    problem3: "Footer Instagram bağlantısı href=“#”; çalışmıyor.",
    websiteAnalysis:
      "atasehircinaralti.com 2026-09-02 açıldı. Barbaros Halk Cad. ve 0216 575 44 44 doğrulandı. info@atasehircinaralti.com footer’da. Visual Composer + Slider Revolution 5.2.6.",
    opportunities: "WEBSITE_REDESIGN, MOBILE_UX, RESERVATION_FLOW",
    salkayPitch: "Ataşehir mangalbaşı; site 2016-dönemi WordPress. Sıfırdan yenileme.",
    source: "https://www.atasehircinaralti.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Kuleli Yakamoz Restaurant",
    district: "Üsküdar",
    website: "https://www.yakamozbalik.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.2,
    leadScore: 8.5,
    priority: "HIGH",
    publicEmail: "bilgi@yakamozbalik.com",
    instagram: "https://instagram.com/kuleliyakamoz/",
    problem1: "Copyright 2015; jQuery 1.11.2 ve eski Fancybox iskeleti yayında.",
    problem2: "Footer’da “Web Tasarım” ajans linki (verabilisim.com).",
    problem3: "Rezervasyon formunda etiket “Rezervayon Notu”; bazı sosyal ikonlar href=“#”.",
    websiteAnalysis:
      "yakamozbalik.com 2026-09-02 açıldı. Kuleli Cad. No:69 ve 0216 318 9505 iletişim sayfasında. bilgi@yakamozbalik.com resmi iletişimde. Instagram kuleliyakamoz resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, MOBILE_UX, RESERVATION_FLOW",
    salkayPitch: "Kuleli boğaz balıkçısı; site 2015. Premium boğaz yüzü.",
    source: "https://www.yakamozbalik.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Hakiki Kebap",
    district: "Üsküdar",
    website: "https://www.hakikikebap.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.3,
    leadScore: 8.5,
    priority: "HIGH",
    publicEmail: "info@hakikikebap.com",
    problem1: "Title ve OG başlığında “Üskükar İstanbul” yazım hatası.",
    problem2: "Ana metinde “Güzleryüzlü Servis” ve “aferatiflerimizle” yazım hataları.",
    problem3: "Avada/Fusion şablon; rezervasyon ilk bakışta sipariş telefonuna bağlı.",
    websiteAnalysis:
      "hakikikebap.com 2026-09-02 açıldı. Bağlarbaşı Cumhuriyet Cad. ve 0216 495 87 87 doğrulandı. info@hakikikebap.com header ve iletişimde.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH, RESERVATION_FLOW",
    salkayPitch: "Üsküdar 1972 kebap; sitede bariz yazım hataları. Marka yenileme.",
    source: "https://www.hakikikebap.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Wyn-et Restaurant Döner - İskender",
    district: "Maltepe",
    website: "https://wyn-et.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.5,
    leadScore: 8.4,
    priority: "HIGH",
    publicEmail: "bilgi@wyn-et.com",
    problem1: "html lang=en; meta description boş.",
    problem2: "Create React App iskeleti; noscript “enable JavaScript” dışında içerik yok.",
    problem3: "Metinde “Wyn-et Restorant” yazımı; menü görsel/CTA’ya bağlı.",
    websiteAnalysis:
      "wyn-et.com 2026-09-02 açıldı (JS render). Days Hotel Maltepe, 0216 755 20 20 ve bilgi@wyn-et.com sitede. Eminönü şubesi de listeleniyor.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, MOBILE_UX",
    salkayPitch: "Maltepe otel içi döner; React iskelet site. Bağımsız restoran yüzü.",
    source: "https://wyn-et.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Moda Meyhanesi",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: Dizinlerde bağımsız site yok. modameyhanesi.com Saca Grup ana sayfası; bu meyhane değil, kayda yazılmadı.",
    salkayPitch: "Moda meyhane; kendi sitesi yok. Yeni meyhane vitrini.",
    source: "https://www.meyhankoli.com/restoran/moda-meyhanesi-413",
  }),
  noWebsite({
    restaurantName: "Asırlık Balık Restaurant",
    district: "Kadıköy",
    instagram: "https://www.instagram.com/asirlik.kadikoy",
    websiteAnalysis:
      "2026-09-02: Yandex/Meyhankoli site yok; Instagram asirlik.kadikoy. asirlikbalik.com DNS yok.",
    salkayPitch: "Kadıköy Güneşlibahçe balık; site yok. Yeni site + rezervasyon.",
    source: "https://yandex.com.tr/maps/org/asirlik_balik_restaurant/61468615147/",
  }),
  noWebsite({
    restaurantName: "Morn Kadıköy",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: Dizinlerde bağımsız site yok. mornkadikoy.com hosting default page; marka sitesi değil, yazılmadı. morn.com.tr fail.",
    salkayPitch: "Yoğurtçu Parkı brunch; kendi sitesi yok. Brunch marka sitesi.",
    source: "https://gastromagazin.com.tr/kadikoyun-yeni-yildizi-morn-kadikoy/",
  }),
  noWebsite({
    restaurantName: "Ustam Ocakbaşı",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: Meyhankoli/YNY site yok. ustamocakbasi.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Göztepe ocakbaşı; site yok. Yeni site.",
    source: "https://foodos.yemekneredeyenir.com/restoran/ustam-ocakbasi-istanbul",
  }),
  noWebsite({
    restaurantName: "Agapia Kadıköy Meyhanesi",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: Kadife Sk. meyhanesi için bağımsız site yok. agapiamezze.com DNS yok (başka konsept/adres, yazılmadı).",
    salkayPitch: "Kadıköy Barlar Sokağı meyhanesi; site yok.",
    source: "https://foodos.yemekneredeyenir.com/restoran/agapia-meyhanesi-istanbul",
  }),
  noWebsite({
    restaurantName: "Kristal Meyhanesi",
    district: "Üsküdar",
    websiteAnalysis:
      "2026-09-02: Placera site yok. kristalmeyhanesi.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "İcadiye meyhane; site yok. Yeni meyhane sitesi.",
    source: "https://placera.com.tr/arabaya-servis-bari/3604197968222203454/",
  }),
  noWebsite({
    restaurantName: "Via Balık Restaurant",
    district: "Üsküdar",
    websiteAnalysis:
      "2026-09-02: Placera site yok. Eski fırsat ilanında viabalik.com geçiyor; DNS yok, HTTP fail. Bağımsız site yok.",
    salkayPitch: "Beylerbeyi iskele balık; listelenen domain ölü. Yeni site.",
    source: "https://placera.com.tr/angler-balik-restorani/13710732616797347606/",
  }),
  {
    restaurantName: "Foça Balık Restaurant",
    district: "Ataşehir",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
  },
  {
    restaurantName: "Bridge Nakkaştepe",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
  },
  {
    restaurantName: "Bağevi Kebapçısı",
    district: "Üsküdar",
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
  const qualifiedOut = details.filter((row) => row.priority === "QUALIFIED_OUT");
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
          (row) =>
            `${row.restaurantName} — ${row.district} (${row.websiteStatus} / ${row.websiteScore} / ${row.priority})`,
        ),
        qualifiedOut: qualifiedOut.map((row) => `${row.restaurantName} — ${row.district}`),
        details,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("\nConfirm için: npx tsx scripts/update-wave3-verified-leads.ts --confirm");
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
        wave3NoWebsite: after.filter((row) => row.websiteStatus === "NO_WEBSITE").length,
        wave3NotVerified: after.filter((row) => row.websiteStatus === "NOT_VERIFIED").length,
        remaining: { total, notVerified, high },
        emails: after
          .filter((row) => row.publicEmail)
          .map((row) => `${row.restaurantName}: ${row.publicEmail}`),
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
