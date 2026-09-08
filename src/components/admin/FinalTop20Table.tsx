import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import {
  RestaurantContactBadge,
  RestaurantLeadScore,
  RestaurantPriorityBadge,
  RestaurantWebsiteBadge,
} from "@/components/admin/RestaurantLeadBadges";
import { phoneHref } from "@/lib/admin/restaurant-leads";

export function FinalTop20Table({ rows }: { rows: RestaurantLead[] }) {
  if (rows.length === 0) {
    return <p className="admin-help">FINAL TOP 20 kaydı yok.</p>;
  }

  const ordered = [...rows].sort((a, b) => (a.finalRank ?? 999) - (b.finalRank ?? 999));

  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-rl-table admin-rl-final-top20">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Restaurant</th>
            <th>District</th>
            <th>Rating</th>
            <th>Reviews</th>
            <th>Phone</th>
            <th>Public Email</th>
            <th>Website Status</th>
            <th>Website Score</th>
            <th>Lead Score</th>
            <th>Priority</th>
            <th>Contact Status</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => {
            const phone = phoneHref(row.phone);
            return (
              <tr key={row.id}>
                <td>
                  <strong>{row.finalRank ?? "—"}</strong>
                </td>
                <td>
                  <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-strong">
                    {row.restaurantName}
                  </Link>
                  {row.neighborhood ? <div className="admin-help">{row.neighborhood}</div> : null}
                </td>
                <td>{row.district}</td>
                <td>{row.googleRating != null ? row.googleRating.toFixed(1) : "—"}</td>
                <td>{row.googleReviewCount != null ? row.googleReviewCount : "—"}</td>
                <td>
                  {phone && row.phone ? <a href={phone}>{row.phone}</a> : row.phone || "—"}
                </td>
                <td>{row.publicEmail || "—"}</td>
                <td>
                  <RestaurantWebsiteBadge status={row.websiteStatus} />
                </td>
                <td>{row.websiteScore != null ? row.websiteScore.toFixed(1) : "—"}</td>
                <td>
                  <RestaurantLeadScore score={row.leadScore} />
                </td>
                <td>
                  <RestaurantPriorityBadge priority={row.priority} />
                </td>
                <td>
                  <RestaurantContactBadge status={row.contactStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
