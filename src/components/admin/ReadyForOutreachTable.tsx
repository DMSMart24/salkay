import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import {
  RestaurantLeadScore,
  RestaurantWebsiteBadge,
} from "@/components/admin/RestaurantLeadBadges";
import {
  phoneHref,
  restaurantEmailTrustBadge,
  websiteHref,
} from "@/lib/admin/restaurant-leads";
import { restaurantContactStatusLabels } from "@/lib/admin/labels";

export function ReadyForOutreachTable({ rows }: { rows: RestaurantLead[] }) {
  if (rows.length === 0) {
    return <p className="admin-help">READY FOR OUTREACH adayı yok.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-rl-table">
        <thead>
          <tr>
            <th>Restaurant</th>
            <th>District</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Website</th>
            <th>Website Status</th>
            <th>Lead Score</th>
            <th>Top SEO Problem</th>
            <th>Contact Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const phone = phoneHref(row.phone);
            const site = websiteHref(row.website);
            const emailTrust = restaurantEmailTrustBadge(row);
            return (
              <tr key={row.id}>
                <td>
                  <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-strong">
                    {row.restaurantName}
                  </Link>
                </td>
                <td>{row.district}</td>
                <td>
                  {phone && row.phone ? (
                    <a href={phone}>{row.phone}</a>
                  ) : (
                    <span className="admin-help">—</span>
                  )}
                </td>
                <td>
                  {row.publicEmail ? (
                    <a href={`mailto:${row.publicEmail}`}>{row.publicEmail}</a>
                  ) : (
                    <span className="admin-help">—</span>
                  )}
                  <div>
                    <span className={`admin-badge admin-rl-email-trust admin-rl-email-trust-${emailTrust.toLowerCase()}`}>
                      EMAIL: {emailTrust}
                    </span>
                  </div>
                </td>
                <td>
                  {site ? (
                    <a href={site} target="_blank" rel="noreferrer">
                      {row.websiteDomain || row.website}
                    </a>
                  ) : (
                    <span className="admin-help">—</span>
                  )}
                </td>
                <td>
                  <RestaurantWebsiteBadge status={row.websiteStatus} />
                </td>
                <td>
                  <RestaurantLeadScore score={row.leadScore} />
                </td>
                <td>{row.problem1 || <span className="admin-help">—</span>}</td>
                <td>{restaurantContactStatusLabels[row.contactStatus] ?? row.contactStatus}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
