import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import { CopyTextButton } from "@/components/admin/CopyTextButton";
import { RestaurantLeadDeleteButton } from "@/components/admin/RestaurantLeadsTable";
import { RestaurantLeadScore, RestaurantPriorityBadge } from "@/components/admin/RestaurantLeadBadges";
import { buildNoWebsiteOpportunity } from "@/lib/admin/restaurant-no-website";
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

export function NoWebsiteOpportunitiesTable({ rows }: { rows: RestaurantLead[] }) {
  if (rows.length === 0) {
    return <p className="admin-help">NO_WEBSITE satış adayı yok.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-rl-table admin-rl-noweb-table">
        <thead>
          <tr>
            <th>İşletme</th>
            <th>İlçe</th>
            <th>Lead</th>
            <th>Telefon</th>
            <th>Public email</th>
            <th>Instagram</th>
            <th>WhatsApp</th>
            <th>Google Maps</th>
            <th>Google</th>
            <th>Kanal</th>
            <th>Satış tipi</th>
            <th>Pitch</th>
            <th>Email Draft</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const opportunity = buildNoWebsiteOpportunity(row);
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
                  <RestaurantLeadScore score={row.leadScore} />
                  <div className="admin-help">
                    <RestaurantPriorityBadge priority={row.priority} />
                  </div>
                </td>
                <td>{opportunity.phone || "—"}</td>
                <td>
                  {opportunity.publicEmail ? (
                    <a href={`mailto:${opportunity.publicEmail}`}>{opportunity.publicEmail}</a>
                  ) : (
                    <span className="admin-help">Yok — sahte e-posta yok</span>
                  )}
                </td>
                <td>
                  <External href={opportunity.instagramHref} label={opportunity.instagram} />
                </td>
                <td>
                  <External href={opportunity.whatsappHref} label={opportunity.whatsapp} />
                </td>
                <td>
                  <External href={opportunity.googleMapsHref} label={opportunity.googleMapsUrl ? "Maps" : null} />
                </td>
                <td>{opportunity.googleProof || "—"}</td>
                <td>
                  <strong>{opportunity.recommendedChannel.label}</strong>
                  {opportunity.recommendedChannel.value ? (
                    <div className="admin-help">{opportunity.recommendedChannel.value}</div>
                  ) : null}
                </td>
                <td>
                  <code>{opportunity.salesType}</code>
                </td>
                <td className="admin-rl-pitch">{opportunity.salkayPitch || "—"}</td>
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
