import Link from "next/link";
import {
  approveRestaurantLeadReplacementEmailAction,
  markRestaurantLeadManualContactAction,
  markRestaurantLeadReviewLaterAction,
} from "@/app/admin/actions/restaurant-lead-tracking";
import { getBounceRecoveryWorkspace } from "@/lib/admin/restaurant-lead-bounce-recovery";

export const dynamic = "force-dynamic";

export default async function RestaurantLeadBounceRecoveryPage() {
  const workspace = await getBounceRecoveryWorkspace();
  const { counters } = workspace;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">RestaurantLead · first wave</p>
          <h1>Bounce recovery</h1>
          <p className="admin-help">
            Otomatik e-posta yok · bounced adresler tekrar denenmez · Company değişmez
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/restaurant-leads/outreach" className="admin-btn ghost">
            Takip
          </Link>
        </div>
      </header>

      <section className="admin-cards">
        <div className="admin-card">
          <p>Permanent suppressed</p>
          <strong>{counters.PERMANENT_SUPPRESSED}</strong>
        </div>
        <div className="admin-card">
          <p>Replacement pending</p>
          <strong>{counters.ALTERNATIVE_EMAIL_PENDING_APPROVAL}</strong>
        </div>
        <div className="admin-card">
          <p>Transient review</p>
          <strong>{counters.TRANSIENT_HUMAN_REVIEW}</strong>
        </div>
        <div className="admin-card">
          <p>Manual contact only</p>
          <strong>{counters.MANUAL_CONTACT_ONLY}</strong>
        </div>
      </section>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Bounce Type</th>
              <th>Current Email</th>
              <th>Alternative Email</th>
              <th>Alternative Phone</th>
              <th>WhatsApp</th>
              <th>Instagram</th>
              <th>Contact Form</th>
              <th>Recommended Action</th>
              <th>Suppression Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workspace.rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/admin/restaurant-leads/${row.id}`}>{row.restaurantName}</Link>
                </td>
                <td>{row.bounceType}</td>
                <td>{row.currentEmail}</td>
                <td>
                  {row.alternativeEmail ?? "—"}
                  {row.replacementEmailStatus !== "NONE" ? (
                    <div className="admin-help">{row.replacementEmailStatus}</div>
                  ) : null}
                </td>
                <td>{row.alternativePhone ?? "—"}</td>
                <td>
                  {row.whatsapp ? (
                    <a href={row.whatsapp} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {row.instagram ? (
                    <a href={row.instagram} target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{row.contactForm ? "YES" : "NO"}</td>
                <td>{row.recommendedAction ?? "—"}</td>
                <td>
                  {row.emailSuppressed ? "SUPPRESSED" : "OPEN"}
                  {row.emailSuppressedReason ? <div className="admin-help">{row.emailSuppressedReason}</div> : null}
                </td>
                <td>
                  <div className="admin-rl-actions">
                    {row.alternativeEmail && row.replacementEmailStatus === "NEEDS_HUMAN_APPROVAL" ? (
                      <form action={approveRestaurantLeadReplacementEmailAction}>
                        <input type="hidden" name="leadId" value={row.id} />
                        <button className="admin-btn">Yeni e-postayı onayla</button>
                      </form>
                    ) : null}
                    <form action={markRestaurantLeadManualContactAction}>
                      <input type="hidden" name="leadId" value={row.id} />
                      <button className="admin-btn ghost">Manuel iletişim</button>
                    </form>
                    <form action={markRestaurantLeadReviewLaterAction}>
                      <input type="hidden" name="leadId" value={row.id} />
                      <button className="admin-btn ghost">Daha sonra tekrar değerlendir</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
