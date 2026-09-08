import Link from "next/link";
import type {
  RestaurantContactStatus,
  RestaurantLeadPriority,
  RestaurantRegion,
  RestaurantWebsiteStatus,
} from "@prisma/client";
import { FinalTop20Table } from "@/components/admin/FinalTop20Table";
import { FirstContactRecommendations } from "@/components/admin/FirstContactRecommendations";
import { NoWebsiteOpportunitiesTable } from "@/components/admin/NoWebsiteOpportunitiesTable";
import { OutreachTop20Table } from "@/components/admin/OutreachTop20Table";
import { ReadyForOutreachTable } from "@/components/admin/ReadyForOutreachTable";
import { RestaurantLeadsTable } from "@/components/admin/RestaurantLeadsTable";
import { WebsiteProblemOpportunitiesTable } from "@/components/admin/WebsiteProblemOpportunitiesTable";
import {
  restaurantLeadPriorityLabels,
  restaurantRegionLabels,
  restaurantSalesPriorityFilter,
  restaurantWebsiteStatusLabels,
} from "@/lib/admin/labels";
import { isDatabaseConfigured } from "@/lib/admin/prisma";
import { restaurantLeadsHref } from "@/lib/admin/restaurant-industry";
import {
  getRestaurantLeadStats,
  listFirstContactRecommendations,
  listRestaurantLeads,
  type RestaurantEmailSegment,
  type RestaurantLeadView,
} from "@/lib/admin/restaurant-leads";

export type RestaurantLeadsSearch = {
  q?: string;
  district?: string;
  region?: string;
  priority?: string;
  websiteStatus?: string;
  contactStatus?: string;
  emailSegment?: string;
  email?: string;
  website?: string;
  phone?: string;
  whatsapp?: string;
  view?: string;
  page?: string;
};

type QuickCountKey =
  | "strongest"
  | "readyForOutreach"
  | "noWebsiteSales"
  | "weakSiteSales"
  | "hasPhone"
  | "hasWhatsapp"
  | "hasEmail"
  | "pendingResearch";

const SALES_QUICK_FILTERS: Array<{ view: RestaurantLeadView; label: string; countKey: QuickCountKey }> = [
  { view: "ready-for-outreach", label: "READY FOR OUTREACH", countKey: "readyForOutreach" },
  { view: "strongest", label: "En Güçlü Leadler", countKey: "strongest" },
  { view: "no-website-sales", label: "Sitesi Olmayanlar", countKey: "noWebsiteSales" },
  { view: "weak-site", label: "Kötü Sitesi Olanlar", countKey: "weakSiteSales" },
  { view: "has-phone", label: "Telefonu Olanlar", countKey: "hasPhone" },
  { view: "has-whatsapp", label: "WhatsApp Olanlar", countKey: "hasWhatsapp" },
  { view: "has-email", label: "Email Olanlar", countKey: "hasEmail" },
  { view: "pending-research", label: "Doğrulama Bekleyenler", countKey: "pendingResearch" },
];

const LEGACY_VIEWS: RestaurantLeadView[] = [
  "top",
  "high",
  "no-website",
  "website-problems",
  "needs-verification",
  "has-email",
  "not-contacted",
  "qualified-out",
  "top-20",
  "no-website-opportunities",
  "website-problem-opportunities",
  "strongest",
  "no-website-sales",
  "weak-site",
  "has-phone",
  "has-whatsapp",
  "pending-research",
  "final-top-20",
  "ready-for-outreach",
  "",
];

export function restaurantViewFromParam(value?: string): RestaurantLeadView {
  if (value && LEGACY_VIEWS.includes(value as RestaurantLeadView)) {
    return value as RestaurantLeadView;
  }
  return "top";
}

function isSpecialSalesView(view: RestaurantLeadView) {
  return (
    view === "no-website-opportunities" ||
    view === "website-problem-opportunities" ||
    view === "top-20" ||
    view === "final-top-20" ||
    view === "ready-for-outreach"
  );
}

export async function RestaurantLeadsWorkspace({
  params,
  industries: _industries,
}: {
  params: RestaurantLeadsSearch;
  industries: string[];
}) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="admin-page">
        <header className="admin-page-head">
          <div>
            <p className="admin-kicker">Firmalar</p>
            <h1>Restoranlar</h1>
            <p className="admin-error">DATABASE_URL tanımlı değil.</p>
          </div>
        </header>
      </div>
    );
  }

  const view = restaurantViewFromParam(params.view);
  const region = (params.region || "") as RestaurantRegion | "";
  const filters = {
    q: params.q,
    district: params.district,
    region,
    priority: (params.priority || "") as RestaurantLeadPriority | "",
    websiteStatus: (params.websiteStatus || "") as RestaurantWebsiteStatus | "",
    contactStatus: (params.contactStatus || "") as RestaurantContactStatus | "",
    emailSegment: (params.emailSegment || "") as RestaurantEmailSegment | "",
    hasEmail: (params.email || "") as "yes" | "no" | "",
    hasWebsite: (params.website || "") as "yes" | "no" | "",
    hasPhone: (params.phone || "") as "yes" | "no" | "",
    hasWhatsapp: (params.whatsapp || "") as "yes" | "no" | "",
    view,
    page: Number(params.page || "1"),
    pageSize: 250,
  };
  const showFirstContact = view === "top" || view === "";
  const [{ rows, page, pageCount, total, districts }, stats, firstContact] = await Promise.all([
    listRestaurantLeads(filters),
    getRestaurantLeadStats(region),
    showFirstContact ? listFirstContactRecommendations(region) : Promise.resolve([]),
  ]);

  const query = (next: Record<string, string | undefined>) =>
    restaurantLeadsHref({
      q: params.q,
      district: params.district,
      region: params.region,
      priority: params.priority,
      websiteStatus: params.websiteStatus,
      contactStatus: params.contactStatus,
      emailSegment: params.emailSegment,
      email: params.email,
      website: params.website,
      phone: params.phone,
      whatsapp: params.whatsapp,
      view,
      ...next,
      page: next.page,
    });

  const showMainWorkspace = !isSpecialSalesView(view);

  const identityCards = [
    {
      label: "Toplam Restoran",
      value: stats.total,
      href: query({ region: undefined, page: "1" }),
      active: !params.region,
    },
    {
      label: "Anadolu",
      value: stats.anadolu,
      href: query({ region: "ANADOLU", page: "1" }),
      active: params.region === "ANADOLU",
    },
    {
      label: "Avrupa",
      value: stats.avrupa,
      href: query({ region: "AVRUPA", page: "1" }),
      active: params.region === "AVRUPA",
    },
  ];

  const salesCards = [
    {
      label: "High",
      value: stats.highPriority,
      href: query({ priority: "HIGH", view: "top", page: "1" }),
      active: params.priority === "HIGH",
    },
    {
      label: "Medium",
      value: stats.medium,
      href: query({ priority: "MEDIUM", view: "top", page: "1" }),
      active: params.priority === "MEDIUM",
    },
    {
      label: "Pending",
      value: stats.pending,
      href: query({ priority: "PENDING", view: "top", page: "1" }),
      active: params.priority === "PENDING",
    },
    {
      label: "Qualified Out",
      value: stats.qualifiedOut,
      href: query({ priority: "QUALIFIED_OUT", view: "top", page: "1" }),
      active: params.priority === "QUALIFIED_OUT",
    },
    {
      label: "No Website",
      value: stats.noWebsite,
      href: query({ websiteStatus: "NO_WEBSITE", view: "top", page: "1" }),
      active: params.websiteStatus === "NO_WEBSITE",
    },
    {
      label: "Weak Website",
      value: stats.weakWebsite,
      href: query({ view: "weak-site", websiteStatus: undefined, page: "1" }),
      active: view === "weak-site",
    },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Restaurant Leads</p>
          <h1>
            {view === "no-website-opportunities"
              ? "No Website Opportunities"
              : view === "website-problem-opportunities"
                ? "Website Problem Opportunities"
                : view === "top-20"
                  ? "Top 20 Outreach"
                  : view === "final-top-20"
                    ? "FINAL TOP 20 — Anadolu Yakası"
                    : view === "ready-for-outreach"
                      ? "READY FOR OUTREACH"
                      : "Restoranlar"}
          </h1>
          <p className="admin-help">
            {view === "no-website-opportunities"
              ? `${total} NO_WEBSITE lead · NO_WEBSITE_EMAIL · Lead Score DESC · e-posta gönderilmez`
              : view === "website-problem-opportunities"
                ? `${total} VERY_WEAK / WEAK / IMPROVABLE · WEBSITE_PROBLEM_EMAIL · Lead Score DESC · e-posta gönderilmez`
                : view === "top-20"
                  ? `${total} HIGH satış adayı · GOOD / VERY_GOOD / NOT_VERIFIED yok`
                  : view === "final-top-20"
                    ? `${total} FINAL TOP 20 · finalRank 1–20 · e-posta gönderilmez`
                    : view === "ready-for-outreach"
                      ? `${total} HIGH · NOT_CONTACTED/READY_TO_CONTACT · NO_WEBSITE/VERY_WEAK/WEAK · kapalı/HOLD hariç`
                      : `${total} restoran · LEAD → ANALİZ → İLETİŞİM → CEVAP → GÖRÜŞME → TEKLİF → WON / LOST`}
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/restaurant-leads/import" className="admin-btn ghost">
            Import Leads
          </Link>
          <Link href="/admin/restaurant-leads/new" className="admin-btn ghost">
            Yeni lead
          </Link>
        </div>
      </header>

      <nav className="admin-tabs admin-rl-region-tabs">
        <Link href={query({ region: undefined, page: "1" })} className={!params.region ? "is-active" : undefined}>
          Tümü
        </Link>
        <Link
          href={query({ region: "ANADOLU", page: "1" })}
          className={params.region === "ANADOLU" ? "is-active" : undefined}
        >
          Anadolu Yakası
        </Link>
        <Link
          href={query({ region: "AVRUPA", page: "1" })}
          className={params.region === "AVRUPA" ? "is-active" : undefined}
        >
          Avrupa Yakası
        </Link>
      </nav>

      <section className="admin-cards admin-rl-stat-cards">
        {[...identityCards, ...salesCards].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`admin-card admin-card-link${card.active ? " is-active" : ""}`}
          >
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </Link>
        ))}
      </section>

      {showFirstContact ? <FirstContactRecommendations rows={firstContact} /> : null}

      {showMainWorkspace ? (
        <nav className="admin-tabs admin-rl-filters admin-rl-quick-sales">
          <Link href={query({ view: "top", page: "1" })} className={view === "top" ? "is-active" : undefined}>
            Tümü
          </Link>
          {SALES_QUICK_FILTERS.map((item) => (
            <Link
              key={item.view}
              href={query({ view: item.view, page: "1" })}
              className={view === item.view ? "is-active" : undefined}
            >
              {item.label} <strong>{stats[item.countKey]}</strong>
            </Link>
          ))}
        </nav>
      ) : (
        <nav className="admin-tabs admin-rl-filters">
          <Link href={query({ view: "top" })}>← Restoranlar</Link>
        </nav>
      )}

      {showMainWorkspace ? (
        <p className="admin-help admin-rl-draft-links">
          Taslak listeleri:{" "}
          <Link href={query({ view: "final-top-20" })}>FINAL TOP 20</Link>
          {" · "}
          <Link href={query({ view: "ready-for-outreach" })}>READY FOR OUTREACH</Link>
          {" · "}
          <Link href={query({ view: "top-20" })}>Top 20 Outreach</Link>
          {" · "}
          <Link href={query({ view: "no-website-opportunities" })}>No Website Opportunities</Link>
          {" · "}
          <Link href={query({ view: "website-problem-opportunities" })}>Website Problem Opportunities</Link>
        </p>
      ) : null}

      <form className="admin-filters" method="get" action="/admin/restaurant-leads">
        <input type="hidden" name="view" value={view} />
        <input name="q" defaultValue={params.q} placeholder="Restoran, ilçe, telefon, e-posta, site" />
        <select name="region" defaultValue={params.region ?? ""}>
          <option value="">Bölge: Tümü</option>
          {Object.entries(restaurantRegionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="district" defaultValue={params.district ?? ""}>
          <option value="">İlçe</option>
          {districts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="websiteStatus" defaultValue={params.websiteStatus ?? ""}>
          <option value="">Website Status</option>
          {Object.entries(restaurantWebsiteStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={params.priority ?? ""}>
          <option value="">Priority</option>
          {restaurantSalesPriorityFilter.map((value) => (
            <option key={value} value={value}>
              {restaurantLeadPriorityLabels[value]}
            </option>
          ))}
        </select>
        <select name="emailSegment" defaultValue={params.emailSegment ?? ""}>
          <option value="">Email Segment</option>
          <option value="NO_WEBSITE_EMAIL">NO_WEBSITE_EMAIL</option>
          <option value="WEBSITE_PROBLEM_EMAIL">WEBSITE_PROBLEM_EMAIL</option>
        </select>
        <select name="phone" defaultValue={params.phone ?? ""}>
          <option value="">Telefon</option>
          <option value="yes">Telefon mevcut</option>
          <option value="no">Telefon yok</option>
        </select>
        <select name="whatsapp" defaultValue={params.whatsapp ?? ""}>
          <option value="">WhatsApp</option>
          <option value="yes">WhatsApp mevcut</option>
          <option value="no">WhatsApp yok</option>
        </select>
        <select name="email" defaultValue={params.email ?? ""}>
          <option value="">Public Email</option>
          <option value="yes">Email mevcut</option>
          <option value="no">Email yok</option>
        </select>
        <button className="admin-btn">Filtrele</button>
      </form>

      {view === "no-website-opportunities" ? (
        <NoWebsiteOpportunitiesTable rows={rows} />
      ) : view === "website-problem-opportunities" ? (
        <WebsiteProblemOpportunitiesTable rows={rows} />
      ) : view === "top-20" ? (
        <OutreachTop20Table rows={rows} />
      ) : view === "final-top-20" ? (
        <FinalTop20Table rows={rows} />
      ) : view === "ready-for-outreach" ? (
        <ReadyForOutreachTable rows={rows} />
      ) : (
        <RestaurantLeadsTable rows={rows} />
      )}

      {view === "ready-for-outreach" ? (
        <p className="admin-help">
          READY FOR OUTREACH: HIGH + NOT_CONTACTED/READY_TO_CONTACT + NO_WEBSITE/VERY_WEAK/WEAK.
          QUALIFIED_OUT ve kapalı/HOLD notlu işletmeler hariç. EMAIL badge outreachNotes trust
          etiketinden türetilir (schema yok). E-posta gönderilmez.
        </p>
      ) : view === "final-top-20" ? (
        <p className="admin-help">
          FINAL TOP 20 Anadolu Yakası: finalRank 1–20 source of truth. Public email yoksa “—”. NOT_VERIFIED
          görünür tutulur; sahte NO_WEBSITE yapılmaz. E-posta / WhatsApp otomatik gönderilmez.
        </p>
      ) : view === "top-20" ? (
        <p className="admin-help">
          Top 20 Outreach: HIGH, Lead Score yüksekten düşüğe. NO_WEBSITE_EMAIL ve WEBSITE_PROBLEM_EMAIL
          ayrı satış metinleridir. QUALIFIED_OUT, GOOD, VERY_GOOD ve NOT_VERIFIED listede yoktur. E-posta
          zorunlu değildir; gönderilmez.
        </p>
      ) : view === "no-website-opportunities" ? (
        <p className="admin-help">
          No Website Opportunities: websiteStatus = NO_WEBSITE, Lead Score yüksekten düşüğe. Satış sistemi
          WEAK/VERY_WEAK metninden ayrıdır — “siteniz kötü/eski” denmez. Google/Instagram varlığını tamamlayan
          bağımsız site (menü + rezervasyon + WhatsApp + Maps + SEO). E-posta gönderilmez; yalnızca taslak.
          Public e-posta yoksa sahte adres üretilmez, doğrulanmış Instagram / WhatsApp / telefon gösterilir.
        </p>
      ) : view === "website-problem-opportunities" ? (
        <p className="admin-help">
          Website Problem Opportunities: VERY_WEAK / WEAK / IMPROVABLE. Doğrulanmış mevcut site sorunları →
          yeniden tasarım. NO_WEBSITE “bağımsız site yok” metni kullanılmaz. E-posta gönderilmez; yalnızca
          taslak. Public e-posta yoksa sahte adres üretilmez.
        </p>
      ) : (
        <div className="admin-pager">
          {page > 1 ? <Link href={query({ view, page: String(page - 1) })}>Önceki</Link> : null}
          <span>
            {page} / {pageCount} · {total} kayıt
          </span>
          {page < pageCount ? <Link href={query({ view, page: String(page + 1) })}>Sonraki</Link> : null}
        </div>
      )}
    </div>
  );
}
