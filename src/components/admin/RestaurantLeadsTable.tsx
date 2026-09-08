"use client";

import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import { deleteRestaurantLeadForm } from "@/app/admin/actions/restaurant-leads";
import {
  RestaurantLeadScore,
  RestaurantPriorityBadge,
  RestaurantRegionBadge,
  RestaurantSalesBadge,
  RestaurantWebsiteBadge,
} from "@/components/admin/RestaurantLeadBadges";
import { RestaurantLeadContactActions } from "@/components/admin/RestaurantLeadContactActions";
import {
  allowsWebsiteScore,
  phoneHref,
  restaurantEmailSegment,
  whatsappHref,
} from "@/lib/admin/restaurant-leads";

export function RestaurantLeadDeleteButton({
  id,
  name,
  className = "admin-btn-link danger",
}: {
  id: string;
  name: string;
  className?: string;
}) {
  return (
    <form
      action={deleteRestaurantLeadForm}
      onSubmit={(event) => {
        if (!window.confirm(`${name} silinsin mi? Bu işlem geri alınamaz.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="leadId" value={id} />
      <button type="submit" className={className}>
        Delete
      </button>
    </form>
  );
}

export function RestaurantLeadsTable({ rows }: { rows: RestaurantLead[] }) {
  if (rows.length === 0) {
    return <p className="admin-help">Bu filtrelere uyan restoran lead yok.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-rl-table">
        <thead>
          <tr>
            <th>Restoran</th>
            <th>İlçe</th>
            <th>Bölge</th>
            <th>Website Status</th>
            <th>Website Score</th>
            <th>Lead Score</th>
            <th>Priority</th>
            <th>Telefon</th>
            <th>WhatsApp</th>
            <th>Email</th>
            <th>Email Segment</th>
            <th>Satış Durumu</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const phone = phoneHref(row.phone);
            const whatsapp = whatsappHref(row.whatsapp);
            const segment = restaurantEmailSegment(row.websiteStatus);
            return (
              <tr key={row.id}>
                <td>
                  <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-strong">
                    {row.restaurantName}
                  </Link>
                  {row.neighborhood ? <div className="admin-help">{row.neighborhood}</div> : null}
                </td>
                <td>{row.district}</td>
                <td>
                  <RestaurantRegionBadge region={row.region} />
                </td>
                <td>
                  <RestaurantWebsiteBadge status={row.websiteStatus} />
                </td>
                <td>
                  {allowsWebsiteScore(row.websiteStatus) && row.websiteScore != null
                    ? `${row.websiteScore.toFixed(1)} / 10`
                    : "—"}
                </td>
                <td>
                  <RestaurantLeadScore score={row.leadScore} />
                </td>
                <td>
                  <RestaurantPriorityBadge priority={row.priority} />
                </td>
                <td>
                  {phone && row.phone ? <a href={phone}>{row.phone}</a> : row.phone || "—"}
                </td>
                <td>
                  {whatsapp && row.whatsapp ? (
                    <a href={whatsapp} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {row.publicEmail ? <a href={`mailto:${row.publicEmail}`}>{row.publicEmail}</a> : "—"}
                </td>
                <td>{segment ? <code>{segment}</code> : "—"}</td>
                <td>
                  <RestaurantSalesBadge status={row.salesStatus} />
                </td>
                <td>
                  <RestaurantLeadContactActions lead={row} compact />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
