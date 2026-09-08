import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import { CopyTextButton } from "@/components/admin/CopyTextButton";
import { RestaurantLeadDeleteButton } from "@/components/admin/RestaurantLeadsTable";
import { RestaurantLeadScore, RestaurantPriorityBadge, RestaurantWebsiteBadge } from "@/components/admin/RestaurantLeadBadges";
import { recommendedContactChannel, restaurantSalesType } from "@/lib/admin/restaurant-no-website";
import {
  buildRestaurantSalesEmail,
  restaurantSalesEmailCopyPack,
} from "@/lib/admin/restaurant-sales-email";

export function OutreachTop20Table({ rows }: { rows: RestaurantLead[] }) {
  if (rows.length === 0) {
    return <p className="admin-help">Top 20 outreach adayı yok.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-rl-table">
        <thead>
          <tr>
            <th>#</th>
            <th>İşletme</th>
            <th>İlçe</th>
            <th>Status</th>
            <th>Lead</th>
            <th>Satış tipi</th>
            <th>Kanal</th>
            <th>Public email</th>
            <th>Email Draft</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const salesType = restaurantSalesType(row.websiteStatus);
            const channel = recommendedContactChannel(row);
            const salesEmail = buildRestaurantSalesEmail(row);
            const copyText = salesEmail ? restaurantSalesEmailCopyPack(salesEmail) : "";
            return (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>
                  <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-strong">
                    {row.restaurantName}
                  </Link>
                </td>
                <td>{row.district}</td>
                <td>
                  <RestaurantWebsiteBadge status={row.websiteStatus} />
                </td>
                <td>
                  <RestaurantLeadScore score={row.leadScore} />
                  <div className="admin-help">
                    <RestaurantPriorityBadge priority={row.priority} />
                  </div>
                </td>
                <td>{salesType ? <code>{salesType}</code> : "—"}</td>
                <td>
                  <strong>{channel.label}</strong>
                  {channel.value ? <div className="admin-help">{channel.value}</div> : null}
                </td>
                <td>
                  {row.publicEmail ? (
                    <a href={`mailto:${row.publicEmail}`}>{row.publicEmail}</a>
                  ) : (
                    <span className="admin-help">Yok</span>
                  )}
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
                    <Link href={`/admin/restaurant-leads/${row.id}`}>View</Link>
                    <Link href={`/admin/restaurant-leads/${row.id}#sales-email-draft`}>Draft</Link>
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
