import Link from "next/link";
import { RestaurantLeadTable } from "@/components/admin/RestaurantLeadTable";
import { getProspectLeadWorkspace, parseProspectLeadPreset, type ProspectLeadPreset } from "@/lib/admin/restaurant-lead-queries";

export const dynamic = "force-dynamic";

type Search = {
  filter?: string;
  page?: string;
};

const QUICK_FILTERS: Array<{ value: ProspectLeadPreset; label: string }> = [
  { value: "all", label: "ALL" },
  { value: "anadolu", label: "ANADOLU" },
  { value: "avrupa", label: "AVRUPA" },
  { value: "high", label: "HIGH" },
  { value: "medium", label: "MEDIUM" },
  { value: "qualified_out", label: "QUALIFIED OUT" },
  { value: "no_website", label: "NO WEBSITE" },
  { value: "very_weak", label: "VERY WEAK" },
  { value: "weak", label: "WEAK" },
  { value: "average", label: "AVERAGE" },
  { value: "good", label: "GOOD" },
  { value: "premium", label: "PREMIUM" },
  { value: "ready_for_review", label: "READY FOR REVIEW" },
  { value: "needs_review", label: "NEEDS REVIEW" },
  { value: "no_email", label: "NO EMAIL" },
  { value: "email_verified", label: "VERIFIED EMAIL" },
];

export default async function RestaurantLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const preset = parseProspectLeadPreset(params.filter);
  const { stats, rows, total, page, pageCount, firstContact, universe } = await getProspectLeadWorkspace(
    preset,
    Number(params.page || "1"),
  );

  const cards = [
    { label: "Toplam Restoran", value: stats.total, filter: "all" },
    { label: "Anadolu", value: stats.anadolu, filter: "anadolu" },
    { label: "Avrupa", value: stats.avrupa, filter: "avrupa" },
    { label: "High", value: stats.high, filter: "high" },
    { label: "Medium", value: stats.medium, filter: "medium" },
    { label: "Qualified Out", value: stats.qualifiedOut, filter: "qualified_out" },
    { label: "No Website", value: stats.noWebsite, filter: "no_website" },
    { label: "Weak Website", value: stats.weakWebsite, filter: "weak" },
    { label: "Analyzed", value: stats.analyzed, filter: "analyzed" },
    { label: "Ready for Review", value: stats.readyForReview, filter: "ready_for_review" },
    { label: "Needs Review", value: stats.needsReview, filter: "needs_review" },
    { label: "Verified Email", value: stats.verifiedEmail, filter: "email_verified" },
    { label: "No Email", value: stats.noEmail, filter: "no_email" },
    { label: "Fetch Failed", value: stats.fetchFailed, filter: "fetch_failed" },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">RestaurantLead · research pipeline</p>
          <h1>Restaurant-Leads</h1>
          <p className="admin-help">
            Kaynak: Neon <code>RestaurantLead</code> · {universe.count} kayıt · Company CRM ayrı duruyor · e-posta
            gönderilmez
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/companies?industry=Restaurant" className="admin-btn ghost">
            Company CRM (133)
          </Link>
        </div>
      </header>

      <section className="admin-cards">
        {cards.map((card) => (
          <Link key={card.label} href={`/admin/restaurant-leads?filter=${card.filter}`} className="admin-card">
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </Link>
        ))}
      </section>

      {firstContact.length > 0 ? (
        <section className="admin-panel">
          <h2>İlk Temas İçin Önerilenler</h2>
          <p className="admin-help">READY_FOR_REVIEW + doğrulanmış e-posta. Taslak only. Gönderim yok.</p>
          <div className="admin-cards">
            {firstContact.map((lead) => (
              <Link key={lead.id} href={`/admin/restaurant-leads/${lead.id}`} className="admin-card">
                <p>{lead.restaurantName}</p>
                <strong>
                  {lead.salesOpportunityScore ?? "—"}/100 {lead.pitchConfidence ?? ""}
                </strong>
                <span>
                  {lead.district} · {lead.primaryOpportunity ?? "fırsat yok"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="admin-tabs">
        {QUICK_FILTERS.map((item) => (
          <Link
            key={item.value}
            href={`/admin/restaurant-leads?filter=${item.value}`}
            className={preset === item.value ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="admin-help">
        {total} in this filter · page {page}/{pageCount}
      </p>
      <RestaurantLeadTable rows={rows} />

      <div className="admin-pager">
        {page > 1 ? <Link href={`/admin/restaurant-leads?filter=${preset}&page=${page - 1}`}>Önceki</Link> : null}
        <span>
          {page} / {pageCount}
        </span>
        {page < pageCount ? <Link href={`/admin/restaurant-leads?filter=${preset}&page=${page + 1}`}>Sonraki</Link> : null}
      </div>
    </div>
  );
}
