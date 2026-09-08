import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import { CopyTextButton } from "@/components/admin/CopyTextButton";
import { RestaurantLeadDeleteButton } from "@/components/admin/RestaurantLeadsTable";
import { RestaurantLeadScore, RestaurantPriorityBadge, RestaurantWebsiteBadge } from "@/components/admin/RestaurantLeadBadges";
import { buildWebsiteProblemOpportunity } from "@/lib/admin/restaurant-no-website";
import { websiteHref } from "@/lib/admin/restaurant-leads";
import {
  buildRestaurantSalesEmail,
  restaurantSalesEmailCopyPack,
} from "@/lib/admin/restaurant-sales-email";

function External({ href, label }: { href: string | null; label?: string | null }) {
  if (!href) return <span>—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label || href}
    </a>
  );
}

export function WebsiteProblemOpportunitiesTable({ rows }: { rows: RestaurantLead[] }) {
  if (rows.length === 0) {
    return <p className="admin-help">WEBSITE_PROBLEM satış adayı yok.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-rl-table admin-rl-noweb-table">
        <thead>
          <tr>
            <th>İşletme</th>
            <th>İlçe</th>
            <th>Status</th>
            <th>W / Lead</th>
            <th>Site</th>
            <th>Somut sorun</th>
            <th>Public email</th>
            <th>Kanal</th>
            <th>Satış tipi</th>
            <th>Email Draft</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const opportunity = buildWebsiteProblemOpportunity(row);
            const salesEmail = buildRestaurantSalesEmail(row);
            const copyText = salesEmail ? restaurantSalesEmailCopyPack(salesEmail) : "";
            return (
              <tr key={row.id}>
                <td>
                  <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-strong">
                    {opportunity.restaurantName}
                  </Link>
                </td>
                <td>{opportunity.district}</td>
                <td>
                  <RestaurantWebsiteBadge status={row.websiteStatus} />
                </td>
                <td>
                  <div className="admin-help">{row.websiteScore != null ? `W ${row.websiteScore.toFixed(1)}` : "—"}</div>
                  <RestaurantLeadScore score={row.leadScore} />
                  <div className="admin-help">
                    <RestaurantPriorityBadge priority={row.priority} />
                  </div>
                </td>
                <td>
                  <External href={websiteHref(opportunity.website)} label={opportunity.website} />
                </td>
                <td className="admin-rl-pitch">{opportunity.problems[0] || "—"}</td>
                <td>
                  {opportunity.publicEmail ? (
                    <a href={`mailto:${opportunity.publicEmail}`}>{opportunity.publicEmail}</a>
                  ) : (
                    <span className="admin-help">Yok — sahte e-posta yok</span>
                  )}
                </td>
                <td>
                  <strong>{opportunity.recommendedChannel.label}</strong>
                  {opportunity.recommendedChannel.value ? (
                    <div className="admin-help">{opportunity.recommendedChannel.value}</div>
                  ) : null}
                </td>
                <td>
                  <code>{opportunity.salesType}</code>
                </td>
                <td>
                  {copyText ? (
                    <CopyTextButton text={copyText} label="Copy Email" className="admin-btn-link" />
                  ) : (
                    <span className="admin-help">—</span>
                  )}
                </td>
                <td>
                  <div className="admin-row-actions">
                    <Link href={`/admin/restaurant-leads/${row.id}#sales-email-draft`}>Draft</Link>
                    <Link href={`/admin/restaurant-leads/${row.id}#edit`}>Edit</Link>
                    <RestaurantLeadDeleteButton id={row.id} name={row.restaurantName} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
