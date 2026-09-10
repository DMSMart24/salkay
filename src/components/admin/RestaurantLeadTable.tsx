import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import { classifyRestaurantEmailOwnership } from "@/lib/admin/restaurant-email-ownership";

export function RestaurantLeadTable({ rows }: { rows: RestaurantLead[] }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Restoran</th>
            <th>Bölge</th>
            <th>Öncelik</th>
            <th>Website</th>
            <th>E-posta</th>
            <th>Sahip</th>
            <th>Draft</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link href={`/admin/restaurant-leads/${row.id}`}>{row.restaurantName}</Link>
                <div className="admin-help">{row.district}</div>
              </td>
              <td>{row.region}</td>
              <td>{row.priority}</td>
              <td>
                {row.websiteStatus}
                {row.overallWebsiteScore != null ? ` · ${row.overallWebsiteScore}` : ""}
              </td>
              <td>{row.emailVerified ? row.publicEmail : row.publicEmail ?? "—"}</td>
              <td>
                {row.publicEmail
                  ? classifyRestaurantEmailOwnership({
                      email: row.publicEmail,
                      website: row.website,
                      websiteDomain: row.websiteDomain,
                      emailSource: row.emailSource,
                    }).classification
                  : "—"}
              </td>
              <td>{row.emailStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
