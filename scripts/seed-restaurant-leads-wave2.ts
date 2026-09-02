import { PrismaClient, type Prisma } from "@prisma/client";
import { normalizeCompanyName, normalizeDomain, normalizeEmail, slugify } from "../src/lib/admin/normalize";
import {
  companyPriorityFromLeadScore,
  sanitizeQualificationWrite,
  websiteStatusFromScore,
} from "../src/lib/admin/qualification";

type Wave2Lead = {
  companyName: string;
  category: string;
  district: string;
  city: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  extraPhone?: string;
  websiteScore: number;
  leadScore: number;
  opportunities: string[];
  websiteIssues: string[];
  recommendedServices: string[];
  salesPitch: string;
  notes: string;
  researchSource: string;
  outreachTag: "outreach-first" | "outreach-second" | "outreach-low" | "no-outreach";
};

const leads: Wave2Lead[] = [
  {
    companyName: "Bayındır Et & Kebap",
    category: "Kebap",
    district: "Pendik",
    city: "İstanbul",
    address: "Fevzi Çakmak, Mimar Sinan Cd. No:23 A Blok, 34899 Pendik/İstanbul",
    website: "https://bayindirrestoran.com/",
    email: "info@bayindirrestoran.com",
    phone: "+902164822424",
    websiteScore: 2.0,
    leadScore: 9.5,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH", "MOBILE_UX"],
    websiteIssues: [
      "Web sitesinde markanızla ilgisiz demo içerikleri ve yabancı ürünler halen yayında.",
      "Online mağaza bölümünde dolar fiyatlı örnek deniz ürünleri bulunması marka güvenini zayıflatıyor.",
      "Menü ve ana sayfa içeriklerinde Bayındır markasıyla uyuşmayan metinler bulunuyor.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Restoran hikâyesi ve içerik", "Mobil kullanıcı deneyimi"],
    salesPitch:
      "Mevcut siteyi yamalamak yerine Bayındır'ın kebap, kahvaltı ve aile restoranı kimliğini premium şekilde sunan, mobil öncelikli yeni web sitesi.",
    notes:
      "Wave 2 verified research. Homepage still shows unrelated demo/template copy including Lorem ipsum and foreign seafood shop items. Menu text includes 'Tuzdan Balık Menü'. First outreach wave.",
    researchSource: "https://bayindirrestoran.com/",
    outreachTag: "outreach-first",
  },
  {
    companyName: "Nayman Restoran",
    category: "Kebap",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Kozyatağı Mah. Kocayol Cad. No:56 Kadıköy/İstanbul",
    website: "https://www.naymanrestoran.com/",
    email: "info@naymanrestoran.com",
    phone: "+902163800606",
    websiteScore: 2.4,
    leadScore: 9.3,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH", "RESERVATION_FLOW"],
    websiteIssues: [
      "Web sitesindeki bazı İngilizce hazır şablon içerikleri Nayman'ın gerçek marka kimliğiyle uyuşmuyor.",
      "Ana sayfa restoran deneyimini anlatmak yerine ağırlıklı olarak menü yönlendirmesine dayanıyor.",
      "Rezervasyon, konum ve ziyaret aksiyonları daha güçlü bir kullanıcı akışına dönüştürülebilir.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Rezervasyon entegrasyonu", "Restoran hikâyesi ve içerik"],
    salesPitch:
      "Nayman'ın Kozyatağı marka değerini, kebap/lahmacun uzmanlığını ve atmosferini premium restoran sitesiyle yeniden konumlandır.",
    notes:
      "Wave 2 verified research. Kozyatağı / Kadıköy. Hero repeats menu CTA; About section has English template copy. First outreach wave.",
    researchSource: "https://www.naymanrestoran.com/",
    outreachTag: "outreach-first",
  },
  {
    companyName: "Cremia Cafe & Rest",
    category: "Cafe Restaurant",
    district: "Üsküdar",
    city: "İstanbul",
    address: "Mimar Sinan, Uncular Cd. No:26/A, Üsküdar/İstanbul",
    website: "https://cremiacafe.com/",
    email: "info@cremiacafe.com",
    phone: "+905377245904",
    websiteScore: 2.7,
    leadScore: 9.1,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH", "MOBILE_UX"],
    websiteIssues: [
      "Sayfada ziyaretçiye açık kalan hazır şablon/placeholder içerikleri bulunuyor.",
      "İletişim bilgilerinde farklı e-posta adreslerinin görünmesi güven ve tutarlılık açısından iyileştirilebilir.",
      "Türkçe ve İngilizce arayüz öğeleri daha bütünlüklü bir marka deneyimine dönüştürülebilir.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Restoran hikâyesi ve içerik", "Mobil kullanıcı deneyimi"],
    salesPitch: "Üsküdar lokasyonunu, menüyü ve mekan atmosferini öne çıkaran temiz premium redesign.",
    notes:
      "Wave 2 verified research. Placeholder Latin copy still visible. Footer shows a different mailbox than the published contact email. First outreach wave.",
    researchSource: "https://cremiacafe.com/",
    outreachTag: "outreach-first",
  },
  {
    companyName: "Orçul Restaurant",
    category: "Restaurant",
    district: "Kartal",
    city: "İstanbul",
    address: "Karlıktepe, Fahri Korutürk Cd. 9/A Kartal/İstanbul",
    website: "https://www.orculrestaurant.com/",
    email: "info@orculrestaurant.com",
    phone: "+905353364865",
    websiteScore: 3.0,
    leadScore: 8.9,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH", "RESERVATION_FLOW"],
    websiteIssues: [
      "Mevcut site daha çok restoran içi QR menü sistemi olarak çalışıyor; dışarıdan gelen yeni müşteriye marka deneyimini yeterince anlatmıyor.",
      "Mekan, mutfak ve restoran hikayesi daha güçlü görsel sunumla öne çıkarılabilir.",
      "Rezervasyon, yol tarifi ve ziyaret odaklı kullanıcı akışı geliştirilebilir.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Rezervasyon entegrasyonu", "Restoran hikâyesi ve içerik"],
    salesPitch:
      "QR menü vitrinini, Kartal'daki restoran kimliğini ve ziyaret aksiyonlarını öne çıkaran premium bir marka sitesine dönüştürmek.",
    notes:
      "Wave 2 verified research. Site behaves like an in-house QR/digital-menu system (cart, waiter call, table number). Wi-Fi credentials are visible on the public page — INTERNAL only, never include the password in customer email. First outreach wave.",
    researchSource: "https://www.orculrestaurant.com/",
    outreachTag: "outreach-first",
  },
  {
    companyName: "SOİ Cadde",
    category: "Restaurant",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Caddebostan, Bağdat Cd., Kadıköy/İstanbul",
    website: "https://soicadde.com/",
    email: "info@soicadde.com",
    phone: "+905352775300",
    websiteScore: 3.2,
    leadScore: 8.8,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH", "RESERVATION_FLOW"],
    websiteIssues: [
      "Çalışma saatleri ve bazı içeriklerde profesyonel sunumu zayıflatan format/tutarlılık problemleri bulunuyor.",
      "Caddebostan lokasyonu ve restoran atmosferi dijital tarafta daha güçlü konumlandırılabilir.",
      "Rezervasyon ve ziyaret aksiyonları daha net bir conversion akışına dönüştürülebilir.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Rezervasyon entegrasyonu", "Restoran hikâyesi ve içerik"],
    salesPitch:
      "Caddebostan konumunu ve restoran atmosferini netleştiren, rezervasyon odaklı premium bir dijital vitrin.",
    notes:
      "Wave 2 verified research. Opening-hours formatting is inconsistent (8:Am / 8:PM). Generic brand copy. First outreach wave.",
    researchSource: "https://soicadde.com/",
    outreachTag: "outreach-first",
  },
  {
    companyName: "UMUS İstanbul",
    category: "Restaurant",
    district: "Maltepe",
    city: "İstanbul",
    address: "Çınar Mah. Turgut Özal Blv. No:85 Maltepe/İstanbul",
    website: "https://www.umusistanbul.com/",
    email: "info@umusistanbul.com",
    phone: "+905351002057",
    websiteScore: 4.2,
    leadScore: 8.1,
    opportunities: ["WEBSITE_REDESIGN", "RESERVATION_FLOW", "BRAND_REFRESH"],
    websiteIssues: [
      "Marka mesajı var ancak metinler yer yer dil kalitesi açısından sadeleştirilebilir.",
      "QR menü öne çıkıyor; rezervasyon ve ziyaret aksiyonları daha güçlü hale getirilebilir.",
      "Mekân atmosferi ve sosyal kanıt daha etkili sunulabilir.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Rezervasyon entegrasyonu", "Restoran hikâyesi ve içerik"],
    salesPitch:
      "Maltepe konumunu ve mekan atmosferini daha net anlatan, rezervasyon odaklı sade bir premium yenileme.",
    notes: "Wave 2 verified research. Brand message exists but copy quality is uneven. First outreach wave.",
    researchSource: "https://www.umusistanbul.com/",
    outreachTag: "outreach-first",
  },
  {
    companyName: "Döner Ustası Çetin Yalçın",
    category: "Döner",
    district: "Kartal",
    city: "İstanbul",
    address: "Akdeniz Caddesi No:12 Kartal/İstanbul",
    website: "https://ducy.com.tr/",
    email: "info@ducy.com.tr",
    phone: "+902167593546",
    websiteScore: 4.8,
    leadScore: 7.7,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "RESERVATION_FLOW"],
    websiteIssues: [
      "1992'den beri güçlü bir marka hikâyesi var; dijital sunum daha modern hale getirilebilir.",
      "Ana sayfadaki içerik yoğunluğu ve tipografik sunum sadeleştirilebilir.",
      "Mobil kullanıcı için rezervasyon, yol tarifi ve sipariş aksiyonları daha belirgin olabilir.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Mobil kullanıcı deneyimi", "Rezervasyon entegrasyonu"],
    salesPitch:
      "1992 marka hikâyesini koruyarak Kartal döner kimliğini daha sade, mobil öncelikli bir restoran yüzüne taşımak.",
    notes: "Wave 2 verified research. Second outreach wave.",
    researchSource: "https://ducy.com.tr/",
    outreachTag: "outreach-second",
  },
  {
    companyName: "Zekibey İskender",
    category: "İskender",
    district: "Üsküdar",
    city: "İstanbul",
    address: "Mimar Sinan, Tavukçu Bakkal Sk. No:1 Üsküdar/İstanbul",
    website: "https://zekibeyiskender.com.tr/",
    email: "info@zekibeyiskender.com.tr",
    phone: "+902163104821",
    websiteScore: 5.2,
    leadScore: 7.5,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "BRAND_REFRESH"],
    websiteIssues: [
      "1969'dan gelen güçlü bir hikâye mevcut; görsel ve UX sunumu daha premium hale getirilebilir.",
      "Menü ve blog yapısı var; tarihsel marka değeri dijital tarafta daha güçlü kullanılabilir.",
      "Fiziksel mekân deneyimi sitede daha net bir ziyaret aksiyonuna bağlanabilir.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Mobil kullanıcı deneyimi", "Restoran hikâyesi ve içerik"],
    salesPitch:
      "1969'dan gelen İskender kimliğini Üsküdar mekân deneyimiyle birleştiren daha premium bir dijital sunum.",
    notes: "Wave 2 verified research. Second outreach wave.",
    researchSource: "https://zekibeyiskender.com.tr/",
    outreachTag: "outreach-second",
  },
  {
    companyName: "Madalyalı Restoran",
    category: "Restaurant",
    district: "Ataşehir",
    city: "İstanbul",
    address: "Ferhatpaşa Yolu Sk. No:133 Dudullu OSB/Ataşehir/İstanbul",
    website: "https://madalyali.com.tr/",
    email: "info@madalyali.com.tr",
    phone: "+902164710482",
    websiteScore: 5.8,
    leadScore: 7.0,
    opportunities: ["WEBSITE_REDESIGN", "RESERVATION_FLOW", "BRAND_REFRESH"],
    websiteIssues: [
      "Rezervasyon çağrısı mevcut; site temel fonksiyonları karşılıyor.",
      "1986 marka hikâyesi dijital tarafta daha premium sunulabilir.",
      "Dönüşüm ve görsel hiyerarşi ilk outreach dalgasından sonra değerlendirilebilir.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Rezervasyon entegrasyonu"],
    salesPitch:
      "1986 marka hikâyesini koruyarak rezervasyon ve premium sunumu güçlendiren bir yenileme; A lead'lerden sonra.",
    notes: "Wave 2 verified research. Second outreach wave. Evaluate after A leads.",
    researchSource: "https://madalyali.com.tr/",
    outreachTag: "outreach-second",
  },
  {
    companyName: "Karacabey",
    category: "Restaurant",
    district: "Maltepe",
    city: "İstanbul",
    address: "Cevizli Mah. Bağdat Cad. No:571 Maltepe/İstanbul",
    website: "https://www.karacabey.com.tr/",
    email: "info@karacabey.com.tr",
    phone: "+902164410506",
    extraPhone: "0531 222 9 222",
    websiteScore: 6.3,
    leadScore: 6.4,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH"],
    websiteIssues: [
      "Güçlü bir marka hikâyesi ve temel restoran bilgileri mevcut.",
      "Site makul seviyede; belirgin bir premium redesign fırsatı varsa ileride değerlendirilebilir.",
      "İlk outreach dalgasına alınmamalı.",
    ],
    recommendedServices: ["Web yeniden tasarım"],
    salesPitch:
      "Köklü Maltepe markası; site zaten makul. Yalnızca net bir premium fırsat görülürse ileride outreach.",
    notes:
      "Wave 2 verified research. Low priority / benchmark. Second published phone 0531 222 9 222. Do not include in first outreach wave.",
    researchSource: "https://www.karacabey.com.tr/",
    outreachTag: "outreach-low",
  },
  {
    companyName: "Bist Bahçe",
    category: "Cafe Restaurant",
    district: "Maltepe",
    city: "İstanbul",
    address: "Yalı Rıhtım Caddesi No:62/A, Ardıçlık Sok No:2, Maltepe/İstanbul",
    website: "https://bistbahce.com/",
    email: "info@bahceistanbul.com.tr",
    phone: "+905417109747",
    websiteScore: 6.5,
    leadScore: 6.1,
    opportunities: ["WEBSITE_REDESIGN", "BRAND_REFRESH"],
    websiteIssues: [
      "Menü, etkinlik, çalışma saatleri ve iletişim mevcut.",
      "Site aktif içerik yayınlıyor.",
      "Premium iyileştirme mümkün fakat yüksek öncelikli satış lead'i değil.",
    ],
    recommendedServices: ["Web yeniden tasarım"],
    salesPitch:
      "Aktif içerikli Maltepe bahçe/cafe sitesi; premium iyileştirme mümkün, ilk dalgada değil.",
    notes:
      "Wave 2 verified research. Public mailbox is info@bahceistanbul.com.tr on bistbahce.com. Low priority. Do not include first outreach wave.",
    researchSource: "https://bistbahce.com/",
    outreachTag: "outreach-low",
  },
  {
    companyName: "Sudi Restoran",
    category: "Restaurant",
    district: "Ataşehir",
    city: "İstanbul",
    address: "Atatürk Mah., Atapark Cd., Trendist Dükkan B11 Blok No:3/PA Ataşehir/İstanbul",
    website: "https://www.sudirestoran.com/",
    email: "info@sudirestoran.com",
    phone: "+902162666036",
    websiteScore: 7.4,
    leadScore: 4.8,
    opportunities: ["WEBSITE_REDESIGN"],
    websiteIssues: [
      "Rezervasyon ve sipariş akışı mevcut.",
      "Türkçe ve Farsça içerik mevcut.",
      "Marka ve mutfak konumlandırması belirgin; düşük öncelik.",
    ],
    recommendedServices: ["Web yeniden tasarım"],
    salesPitch:
      "Fonksiyonel Ataşehir restoran sitesi; mutfak konumlandırması net. İlk outreach dalgasına alınmamalı.",
    notes: "Wave 2 verified research. Low priority. Do not include in first outreach wave.",
    researchSource: "https://www.sudirestoran.com/",
    outreachTag: "outreach-low",
  },
];

const unverifiedSkipped = [
  "Balkanika Restoran",
  "Dragos Balık",
  "Pişiköy",
  "Magic Akademi",
  "Rolik Istanbul Kadıköy",
  "Kaffeine Üsküdar",
  "Crepera",
  "Doyuyotr",
  "Karayel",
  "Uskudar Kofte",
];

function digits(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function phoneVariants(phone: string) {
  const raw = digits(phone);
  const local = raw.startsWith("90") ? raw.slice(2) : raw.startsWith("0") ? raw.slice(1) : raw;
  return [...new Set([phone, `+90${local}`, `0${local}`, local].filter(Boolean))];
}

async function findExisting(prisma: PrismaClient, lead: Wave2Lead) {
  const domain = normalizeDomain(lead.website);
  const emailNorm = normalizeEmail(lead.email);
  const phones = phoneVariants(lead.phone);
  return prisma.company.findFirst({
    where: {
      OR: [
        { companyName: { equals: lead.companyName, mode: "insensitive" } },
        ...(domain ? [{ domain }] : []),
        ...(emailNorm ? [{ generalEmail: { equals: emailNorm, mode: "insensitive" as const } }] : []),
        ...(emailNorm ? [{ contacts: { some: { emailNorm } } }] : []),
        ...(phones.length ? [{ phone: { in: phones } }] : []),
      ],
    },
    select: {
      id: true,
      companyName: true,
      domain: true,
      generalEmail: true,
      websiteScore: true,
      leadScore: true,
      websiteStatus: true,
      group: { select: { name: true } },
    },
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();

  try {
    const restaurantWhere: Prisma.CompanyWhereInput = {
      OR: [
        { industry: { contains: "restaurant", mode: "insensitive" } },
        { group: { name: { contains: "restoran", mode: "insensitive" } } },
      ],
    };
    const before = await prisma.company.count({ where: restaurantWhere });
    const groupName = "Restoranlar";
    const group =
      (await prisma.leadGroup.findFirst({
        where: { OR: [{ slug: slugify(groupName) }, { name: { equals: groupName, mode: "insensitive" } }] },
      })) ?? null;

    const dry: Array<Record<string, unknown>> = [];
    const toCreate: Wave2Lead[] = [];
    const skippedExisting: Array<{ lead: string; existing: string; reason: string }> = [];

    const sapa = await prisma.company.findFirst({
      where: {
        OR: [
          { companyName: { contains: "Sapa", mode: "insensitive" } },
          { domain: "sapaistanbul.com" },
          { generalEmail: { equals: "info@sapaistanbul.com", mode: "insensitive" } },
        ],
      },
      select: { id: true, companyName: true, websiteScore: true, websiteStatus: true, leadScore: true },
    });

    for (const lead of leads) {
      const existing = await findExisting(prisma, lead);
      if (existing) {
        skippedExisting.push({
          lead: lead.companyName,
          existing: existing.companyName,
          reason: "name/domain/email/phone match — no overwrite",
        });
        dry.push({ lead: lead.companyName, action: "SKIP_EXISTING", existing: existing.companyName });
        continue;
      }
      toCreate.push(lead);
      dry.push({
        lead: lead.companyName,
        action: "CREATE",
        district: lead.district,
        websiteStatus: websiteStatusFromScore(lead.websiteScore),
        websiteScore: lead.websiteScore,
        leadScore: lead.leadScore,
        priority: companyPriorityFromLeadScore(lead.leadScore),
        email: lead.email,
        contact: "CREATE generic Genel İletişim",
        group: group?.name ?? groupName,
      });
    }

    console.log(
      JSON.stringify(
        {
          mode: apply ? "APPLY" : "DRY_RUN",
          restaurantCountBefore: before,
          group: group ? { id: group.id, name: group.name } : null,
          toCreate: toCreate.map((row) => row.companyName),
          existingMatches: skippedExisting,
          qualifiedOut: sapa
            ? [
                {
                  name: "Sapa İstanbul",
                  reason: "Already in CRM as benchmark; do not overwrite verified data",
                  existing: sapa.companyName,
                  websiteStatus: sapa.websiteStatus,
                  websiteScore: sapa.websiteScore,
                },
              ]
            : [{ name: "Sapa İstanbul", reason: "QUALIFIED_OUT / already handled" }],
          unverifiedSkipped,
          contactsToCreate: toCreate.length,
          contactsToUpdate: 0,
        },
        null,
        2,
      ),
    );

    if (!apply) {
      return;
    }
    if (!group) {
      throw new Error("Restoranlar group missing");
    }

    const created: Array<Record<string, unknown>> = [];
    for (const lead of toCreate) {
      const again = await findExisting(prisma, lead);
      if (again) continue;

      const qualification = sanitizeQualificationWrite({
        websiteStatus: websiteStatusFromScore(lead.websiteScore),
        websiteScore: lead.websiteScore,
        leadScore: lead.leadScore,
        opportunities: lead.opportunities,
      });
      const domain = normalizeDomain(lead.website);
      const emailNorm = normalizeEmail(lead.email);
      const company = await prisma.company.create({
        data: {
          companyName: lead.companyName,
          website: lead.website,
          domain,
          industry: "Restaurant",
          city: lead.city,
          district: lead.district,
          country: "Türkiye",
          address: lead.address,
          phone: lead.phone,
          generalEmail: emailNorm,
          source: "restaurant-research-2026-09-wave2",
          notes: lead.notes,
          status: "RESEARCHED",
          outreachStatus: "NEW",
          websiteScore: qualification.websiteScore,
          websiteStatus: qualification.websiteStatus,
          websiteIssues: lead.websiteIssues.slice(0, 3),
          recommendedServices: lead.recommendedServices.slice(0, 3),
          leadScore: qualification.leadScore,
          opportunities: qualification.opportunities,
          salesPitch: lead.salesPitch,
          researchSource: lead.researchSource,
          researchedAt: new Date("2026-09-02T12:00:00.000Z"),
          groupId: group.id,
          priority: companyPriorityFromLeadScore(lead.leadScore),
          tags: ["restaurant", "anadolu-yakasi", "research-wave-2", lead.outreachTag, lead.category.toLowerCase()],
        },
      });

      let contactCreated = false;
      if (emailNorm) {
        const existingContact = await prisma.contact.findUnique({ where: { emailNorm } });
        if (!existingContact) {
          await prisma.contact.create({
            data: {
              companyId: company.id,
              firstName: "Genel",
              lastName: "İletişim",
              role: "Genel",
              email: emailNorm,
              emailNorm,
              phone: lead.phone,
              isPrimary: true,
            },
          });
          contactCreated = true;
        }
      }

      created.push({
        name: company.companyName,
        district: company.district,
        websiteStatus: company.websiteStatus,
        websiteScore: company.websiteScore,
        leadScore: company.leadScore,
        priority: company.priority,
        email: company.generalEmail,
        contactCreated,
        group: group.name,
      });
    }

    const after = await prisma.company.count({ where: restaurantWhere });
    const imported = await prisma.company.findMany({
      where: { source: "restaurant-research-2026-09-wave2" },
      include: { contacts: true, group: { select: { name: true } } },
      orderBy: { leadScore: "desc" },
    });

    const domains = imported.map((row) => row.domain).filter(Boolean);
    const emails = imported.map((row) => normalizeEmail(row.generalEmail)).filter(Boolean);
    const phones = imported.map((row) => digits(row.phone)).filter(Boolean);

    console.log(
      JSON.stringify(
        {
          restaurantCountAfter: after,
          createdCount: created.length,
          created,
          verified: imported.map((row) => ({
            name: row.companyName,
            district: row.district,
            website: row.website,
            email: row.generalEmail,
            phone: row.phone,
            websiteStatus: row.websiteStatus,
            websiteScore: row.websiteScore,
            leadScore: row.leadScore,
            priority: row.priority,
            issues: row.websiteIssues.length,
            salesPitch: Boolean(row.salesPitch),
            group: row.group?.name ?? null,
            contacts: row.contacts.map((contact) => ({
              name: `${contact.firstName} ${contact.lastName}`.trim(),
              email: contact.email,
              primary: contact.isPrimary,
            })),
          })),
          duplicateDomains: domains.length !== new Set(domains).size,
          duplicateEmails: emails.length !== new Set(emails).size,
          duplicatePhones: phones.length !== new Set(phones).size,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "wave2 failed");
  process.exit(1);
});
