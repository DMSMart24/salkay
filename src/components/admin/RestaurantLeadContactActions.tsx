import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import { phoneHref, websiteHref, whatsappHref } from "@/lib/admin/restaurant-leads";

export function RestaurantLeadContactActions({
  lead,
  compact = false,
}: {
  lead: Pick<RestaurantLead, "id" | "phone" | "whatsapp" | "publicEmail" | "website">;
  compact?: boolean;
}) {
  const phone = phoneHref(lead.phone);
  const whatsapp = whatsappHref(lead.whatsapp);
  const website = websiteHref(lead.website);
  const emailDraft = `/admin/restaurant-leads/${lead.id}#sales-email-draft`;

  return (
    <div className="admin-rl-contact-actions">
      {phone ? (
        <a href={phone} className="admin-btn ghost admin-rl-action">
          Ara
        </a>
      ) : null}
      {whatsapp ? (
        <a href={whatsapp} className="admin-btn ghost admin-rl-action" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      ) : null}
      {lead.publicEmail ? (
        <Link href={emailDraft} className="admin-btn ghost admin-rl-action">
          E-posta
        </Link>
      ) : null}
      {website ? (
        <a href={website} className="admin-btn ghost admin-rl-action" target="_blank" rel="noreferrer">
          Siteyi Aç
        </a>
      ) : null}
      {compact ? (
        <Link href={`/admin/restaurant-leads/${lead.id}`} className="admin-btn ghost admin-rl-action">
          Detay
        </Link>
      ) : null}
    </div>
  );
}
