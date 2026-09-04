import Link from "next/link";
import { OutreachTable } from "@/components/admin/OutreachTable";
import { getRestaurantLeadWorkspace, listFilterOptions, parseRestaurantLeadPreset } from "@/lib/admin/queries";
import type { RestaurantLeadPreset } from "@/lib/admin/email-outreach";

export const dynamic = "force-dynamic";

type Search = {
  filter?: string;
  page?: string;
};

const QUICK_FILTERS: Array<{ value: RestaurantLeadPreset; label: string }> = [
  { value: "all", label: "Alle" },
  { value: "top", label: "Top Leads" },
  { value: "high", label: "High Priority" },
  { value: "no_website", label: "No Website" },
  { value: "has_email", label: "Has Email" },
  { value: "no_email", label: "No Email" },
  { value: "ready_to_email", label: "Ready to Email" },
  { value: "not_contacted", label: "Not Contacted" },
  { value: "qualified_out", label: "Qualified Out" },
  { value: "top20", label: "Top 20 Outreach" },
];

export default async function RestaurantLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const preset = parseRestaurantLeadPreset(params.filter);
  const [{ stats, rows, total, page, pageCount, filteredIds }, options] = await Promise.all([
    getRestaurantLeadWorkspace(preset, Number(params.page || "1")),
    listFilterOptions(),
  ]);

  const cards = [
    { label: "Total Leads", value: stats.total, filter: "all" },
    { label: "High Priority", value: stats.highPriority, filter: "high" },
    { label: "No Website", value: stats.noWebsite, filter: "no_website" },
    { label: "Website Problems", value: stats.websiteProblems, filter: "all" },
    { label: "Has Email", value: stats.hasEmail, filter: "has_email" },
    { label: "Ready to Email", value: stats.readyToEmail, filter: "ready_to_email" },
    { label: "Contacted", value: stats.contacted, filter: "contacted" },
    { label: "Interested", value: stats.interested, filter: "all" },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Restaurant Leads</p>
          <h1>Restaurant-Leads</h1>
          <p className="admin-help">
            {total} in diesem Filter · E-Mail-Outreach nur mit gültiger Adresse · keine Leads gelöscht
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/emails?tab=bulk" className="admin-btn">
            Bulk E-Mail
          </Link>
          <Link href="/admin/companies?industry=Restaurant" className="admin-btn ghost">
            Alle Firmen
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

      <OutreachTable
        rows={rows}
        filteredIds={filteredIds}
        groups={options.groups}
        emailHref="/admin/emails?tab=bulk"
        showEmailLane
      />

      <div className="admin-pager">
        {page > 1 ? (
          <Link href={`/admin/restaurant-leads?filter=${preset}&page=${page - 1}`}>Önceki</Link>
        ) : null}
        <span>
          {page} / {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={`/admin/restaurant-leads?filter=${preset}&page=${page + 1}`}>Sonraki</Link>
        ) : null}
      </div>
    </div>
  );
}
