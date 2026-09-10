import Link from "next/link";
import {
  prepareRestaurantLeadFollowUpDraftsAction,
  refreshRestaurantLeadFollowUpsAction,
} from "@/app/admin/actions/restaurant-lead-tracking";
import { formatDateTime } from "@/lib/admin/format";
import {
  FIRST_WAVE_BULK_SEND_ID,
  getRestaurantLeadOutreachWorkspace,
  isStalePendingDelivery,
} from "@/lib/admin/restaurant-lead-tracking";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "", label: "ALL" },
  { value: "SENT", label: "SENT" },
  { value: "DELIVERED", label: "DELIVERED" },
  { value: "PENDING", label: "PENDING" },
  { value: "DELAYED", label: "DELAYED" },
  { value: "BOUNCED", label: "BOUNCED" },
  { value: "COMPLAINED", label: "COMPLAINED" },
  { value: "REPLIED", label: "REPLIED" },
  { value: "POSITIVE", label: "POSITIVE" },
  { value: "NEGATIVE", label: "NEGATIVE" },
  { value: "NO_REPLY", label: "NO_REPLY" },
  { value: "FOLLOW_UP_DUE", label: "FOLLOW_UP_DUE" },
  { value: "FOLLOW_UP_DRAFT_READY", label: "FOLLOW_UP_DRAFT_READY" },
];

export default async function RestaurantLeadOutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; batchId?: string }>;
}) {
  const params = await searchParams;
  const batchId = params.batchId || FIRST_WAVE_BULK_SEND_ID;
  const workspace = await getRestaurantLeadOutreachWorkspace({
    filter: params.filter,
    batchId,
  });
  const { counters } = workspace;
  const href = (filter?: string) =>
    filter
      ? `/admin/restaurant-leads/outreach?batchId=${batchId}&filter=${filter}`
      : `/admin/restaurant-leads/outreach?batchId=${batchId}`;
  const cards = [
    { label: "Gönderildi", value: counters.sent, filter: "SENT" },
    { label: "Teslim Edildi", value: counters.delivered, filter: "DELIVERED" },
    { label: "Pending", value: counters.pending, filter: "PENDING" },
    { label: "Delayed", value: counters.delayed, filter: "DELAYED" },
    { label: "Bounce", value: counters.bounced, filter: "BOUNCED" },
    { label: "Şikayet", value: counters.complained, filter: "COMPLAINED" },
    { label: "Yanıt Geldi", value: counters.replied, filter: "REPLIED" },
    { label: "Pozitif", value: counters.positive, filter: "POSITIVE" },
    { label: "Negatif", value: counters.negative, filter: "NEGATIVE" },
    { label: "Yanıt Yok", value: counters.noReply, filter: "NO_REPLY" },
    { label: "Follow-up zamanı gelen", value: counters.followUpDue, filter: "FOLLOW_UP_DUE" },
    { label: "Follow-up taslağı hazır", value: counters.followUpDraftReady, filter: "FOLLOW_UP_DRAFT_READY" },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">RestaurantLead · first wave</p>
          <h1>Gönderim sonrası takip</h1>
          <p className="admin-help">
            Bulk send {workspace.batchId} · SENT ≠ DELIVERED · gelen kutusu bağlı değil · follow-up otomatik
            gönderilmez
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/restaurant-leads" className="admin-btn ghost">
            Lead listesi
          </Link>
          <Link href="/admin/emails?tab=bulk&source=leads" className="admin-btn ghost">
            E-posta merkezi
          </Link>
          <Link href="/admin/restaurant-leads/outreach/bounce-recovery" className="admin-btn">
            Bounce recovery
          </Link>
        </div>
      </header>

      <section className="admin-panel">
        <h2>FIRST WAVE REPORT</h2>
        <p>Initial Sent: {counters.sent}</p>
        <p>Delivered: {counters.delivered}</p>
        <p>Pending: {counters.pending}</p>
        <p>Delayed: {counters.delayed}</p>
        <p>Bounced: {counters.bounced}</p>
        <p>Complained: {counters.complained}</p>
        <p>Replies: {counters.replied}</p>
        <p>Positive: {counters.positive}</p>
        <p>Negative: {counters.negative}</p>
        <p>No Reply: {counters.noReply}</p>
        <p>Follow-up Due: {counters.followUpDue}</p>
        <p>Follow-up Draft Ready: {counters.followUpDraftReady}</p>
      </section>

      {counters.pendingOver24h > 0 ? (
        <p className="admin-warning">
          Teslimat durumu henüz alınmadı · {counters.pendingOver24h} kayıt 24 saatten eski. Otomatik yeniden gönderim
          yok.
        </p>
      ) : null}

      <section className="admin-cards">
        {cards.map((card) => (
          <Link key={card.label} href={href(card.filter)} className="admin-card">
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </Link>
        ))}
      </section>

      <div className="admin-actions">
        <form action={refreshRestaurantLeadFollowUpsAction}>
          <button className="admin-btn ghost">Due hesapla</button>
        </form>
        <form action={prepareRestaurantLeadFollowUpDraftsAction}>
          <button className="admin-btn">DUE taslaklarını hazırla</button>
        </form>
      </div>

      <nav className="admin-tabs">
        {FILTERS.map((item) => (
          <Link
            key={item.label}
            href={href(item.value || undefined)}
            className={(workspace.filter === "ALL" && !item.value) || workspace.filter === item.value ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Email</th>
              <th>Sent At</th>
              <th>Delivery Status</th>
              <th>Reply Status</th>
              <th>Follow-Up Status</th>
              <th>Next Follow-Up</th>
              <th>Sales Status</th>
            </tr>
          </thead>
          <tbody>
            {workspace.rows.map((row) => {
              const stale = row.restaurantLead.deliveryStatus === "PENDING" && isStalePendingDelivery(row.sentAt);
              return (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/restaurant-leads/${row.restaurantLeadId}`}>
                      {row.restaurantLead.restaurantName}
                    </Link>
                  </td>
                  <td>{row.toAddress}</td>
                  <td>{formatDateTime(row.sentAt)}</td>
                  <td>
                    {row.restaurantLead.deliveryStatus}
                    {stale ? <div className="admin-warning">Teslimat durumu henüz alınmadı</div> : null}
                  </td>
                  <td>{row.restaurantLead.replyStatus}</td>
                  <td>{row.restaurantLead.followUpStatus}</td>
                  <td>{formatDateTime(row.restaurantLead.nextFollowUpAt)}</td>
                  <td>{row.restaurantLead.salesStatus}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
