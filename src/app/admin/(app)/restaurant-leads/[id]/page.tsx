import Link from "next/link";
import { notFound } from "next/navigation";
import { updateRestaurantLeadSalesForm } from "@/app/admin/actions/restaurant-leads";
import {
  RestaurantSalesEmailStudio,
  restaurantSalesRegenerateHref,
} from "@/components/admin/RestaurantSalesEmailStudio";
import { RestaurantLeadContactActions } from "@/components/admin/RestaurantLeadContactActions";
import { RestaurantLeadForm } from "@/components/admin/RestaurantLeadForm";
import { RestaurantLeadDeleteButton } from "@/components/admin/RestaurantLeadsTable";
import {
  RestaurantLeadScore,
  RestaurantPriorityBadge,
  RestaurantRegionBadge,
  RestaurantSalesBadge,
  RestaurantWebsiteBadge,
} from "@/components/admin/RestaurantLeadBadges";
import { datetimeLocalValue, formatDate, formatDateTime } from "@/lib/admin/format";
import {
  restaurantRegionLabels,
  restaurantSalesStatusLabels,
  restaurantSalesStatusOrder,
} from "@/lib/admin/labels";
import { isDatabaseConfigured } from "@/lib/admin/prisma";
import {
  getRestaurantLead,
  instagramHref,
  mapsHref,
  phoneHref,
  restaurantEmailSegment,
  restaurantProblemList,
  websiteHref,
  whatsappHref,
} from "@/lib/admin/restaurant-leads";
import {
  blocksRestaurantSalesEmail,
  formatGoogleProof,
  restaurantSalesType,
  usesNoWebsiteCopy,
  usesWebsiteProblemCopy,
} from "@/lib/admin/restaurant-no-website";
import {
  buildRestaurantSalesEmail,
  parseSalesEmailVariant,
} from "@/lib/admin/restaurant-sales-email";

export const dynamic = "force-dynamic";

function ExternalLink({ href, label }: { href: string | null; label?: string | null }) {
  if (!href) return <span>—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label || href}
    </a>
  );
}

export default async function RestaurantLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const { id } = await params;
  const query = await searchParams;
  const lead = await getRestaurantLead(id);
  if (!lead) {
    notFound();
  }

  const website = websiteHref(lead.website);
  const instagram = instagramHref(lead.instagram);
  const maps = mapsHref(lead.googleMapsUrl);
  const whatsapp = whatsappHref(lead.whatsapp);
  const phone = phoneHref(lead.phone);
  const salesType = restaurantSalesType(lead.websiteStatus);
  const draftVariant = parseSalesEmailVariant(query.draft);
  const salesEmail = buildRestaurantSalesEmail(lead, draftVariant);
  const googleProof = formatGoogleProof(lead);
  const segment = restaurantEmailSegment(lead.websiteStatus);
  const problems = restaurantProblemList(lead);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firmalar · Restoranlar</p>
          <h1>{lead.restaurantName}</h1>
          <div className="admin-meta">
            <span>
              {lead.district}
              {lead.neighborhood ? ` / ${lead.neighborhood}` : ""}
            </span>
            <RestaurantRegionBadge region={lead.region} />
            <RestaurantLeadScore score={lead.leadScore} />
            <RestaurantPriorityBadge priority={lead.priority} />
            <RestaurantSalesBadge status={lead.salesStatus} />
            {lead.isFinalTop20 && lead.finalRank != null ? <code>FINAL #{lead.finalRank}</code> : null}
            {salesType ? <code>{salesType}</code> : null}
          </div>
        </div>
        <div className="admin-actions">
          <Link href="/admin/companies?industry=Restaurant" className="admin-btn ghost">
            Firmalar · Restoranlar
          </Link>
          <RestaurantLeadDeleteButton id={lead.id} name={lead.restaurantName} className="admin-btn ghost" />
        </div>
      </header>

      <p className="admin-help admin-rl-sales-banner">
        Satış akışı: LEAD → ANALİZ → İLETİŞİM → CEVAP → GÖRÜŞME → TEKLİF → WON / LOST. Analiz skorları bu
        formdan değişmez. E-posta gönderilmez.
      </p>

      {usesNoWebsiteCopy(lead.websiteStatus) ? (
        <p className="admin-help admin-rl-sales-banner">
          Satış sistemi A: NO_WEBSITE_EMAIL. Bağımsız web sitesi yok → Google/Instagram varlığını tamamlayan
          profesyonel site (menü + rezervasyon + WhatsApp + Maps + SEO). WEAK/VERY_WEAK “siteniz kötü” metni
          uygulanmaz. E-posta gönderilmez.
        </p>
      ) : usesWebsiteProblemCopy(lead.websiteStatus) ? (
        <p className="admin-help admin-rl-sales-banner">
          Satış sistemi B: WEBSITE_PROBLEM_EMAIL. Mevcut sitede görülen somut sorunlar → yeniden tasarım.
          NO_WEBSITE “bağımsız site yok” metni uygulanmaz. E-posta gönderilmez.
        </p>
      ) : lead.websiteStatus === "NOT_VERIFIED" ? (
        <p className="admin-help admin-rl-sales-banner">
          NOT_VERIFIED / PENDING. Kanıt yetersiz; satış maili hazırlanmaz. Zorla sınıflandırılmaz.
        </p>
      ) : blocksRestaurantSalesEmail(lead.websiteStatus) ? (
        <p className="admin-help admin-rl-sales-banner">
          GOOD / VERY_GOOD → QUALIFIED_OUT. Satış maili hazırlanmaz.
        </p>
      ) : null}

      <section className="admin-panel admin-rl-contact-bar">
        <h2>İletişim aksiyonları</h2>
        <RestaurantLeadContactActions lead={lead} />
      </section>

      <form action={updateRestaurantLeadSalesForm} className="admin-inline-form admin-panel">
        <input type="hidden" name="leadId" value={lead.id} />
        <label>
          Satış durumu
          <select name="salesStatus" defaultValue={lead.salesStatus}>
            {restaurantSalesStatusOrder.map((value) => (
              <option key={value} value={value}>
                {restaurantSalesStatusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Son temas
          <input type="datetime-local" name="lastContactAt" defaultValue={datetimeLocalValue(lead.lastContactAt)} />
        </label>
        <label>
          Sonraki takip
          <input
            type="datetime-local"
            name="nextFollowUpAt"
            defaultValue={datetimeLocalValue(lead.nextFollowUpAt)}
          />
        </label>
        <label>
          Temas sayısı
          <input type="number" min={0} name="contactAttempts" defaultValue={lead.contactAttempts} />
        </label>
        <button className="admin-btn">Satış durumunu kaydet</button>
      </form>

      {salesEmail ? (
        <RestaurantSalesEmailStudio
          draft={salesEmail}
          regenerateHref={restaurantSalesRegenerateHref(lead.id, salesEmail.variant)}
        />
      ) : null}

      <div className="admin-detail-grid">
        <section className="admin-panel">
          <h2>İşletme</h2>
          <dl className="admin-dl">
            <div>
              <dt>Restaurant Name</dt>
              <dd>{lead.restaurantName}</dd>
            </div>
            <div>
              <dt>District</dt>
              <dd>{lead.district}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{restaurantRegionLabels[lead.region]}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{phone && lead.phone ? <a href={phone}>{lead.phone}</a> : lead.phone || "—"}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <ExternalLink href={whatsapp} label={lead.whatsapp} />
              </dd>
            </div>
            <div>
              <dt>Public Email</dt>
              <dd>
                {lead.publicEmail ? <a href={`mailto:${lead.publicEmail}`}>{lead.publicEmail}</a> : "—"}
              </dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>
                <ExternalLink href={website} label={lead.website} />
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <ExternalLink href={instagram} label={lead.instagram} />
              </dd>
            </div>
            <div>
              <dt>Google Maps</dt>
              <dd>
                <ExternalLink href={maps} label={lead.googleMapsUrl ? "Haritayı aç" : null} />
              </dd>
            </div>
            <div>
              <dt>Google rating / reviews</dt>
              <dd>{googleProof || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <h2>Analiz</h2>
          <dl className="admin-dl">
            <div>
              <dt>Website Status</dt>
              <dd>
                <RestaurantWebsiteBadge status={lead.websiteStatus} />
              </dd>
            </div>
            <div>
              <dt>Website Score</dt>
              <dd>{lead.websiteScore != null ? `${lead.websiteScore.toFixed(1)} / 10` : "—"}</dd>
            </div>
            <div>
              <dt>Lead Score</dt>
              <dd>
                <span className="admin-qual-internal">INTERN</span>
                <RestaurantLeadScore score={lead.leadScore} />
              </dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                <RestaurantPriorityBadge priority={lead.priority} />
              </dd>
            </div>
            <div>
              <dt>Domain</dt>
              <dd>{lead.websiteDomain || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <h2>Problem</h2>
          {problems.length > 0 ? (
            <ol className="admin-rl-problem-list">
              {problems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : (
            <p className="admin-help">Kayıtlı problem yok.</p>
          )}
        </section>

        <section className="admin-panel">
          <h2>SEO Opportunity</h2>
          <p>{lead.opportunities || "—"}</p>
        </section>

        <section className="admin-panel">
          <h2>Pitch Angle</h2>
          <p>{lead.salkayPitch || "—"}</p>
        </section>

        <section className="admin-panel">
          <h2>Verification Notes</h2>
          <p>{lead.websiteAnalysis || "—"}</p>
        </section>

        <section className="admin-panel">
          <h2>Satış</h2>
          <dl className="admin-dl">
            <div>
              <dt>Email Segment</dt>
              <dd>{segment ? <code>{segment}</code> : "—"}</dd>
            </div>
            <div>
              <dt>Sales Status</dt>
              <dd>
                <RestaurantSalesBadge status={lead.salesStatus} />
              </dd>
            </div>
            <div>
              <dt>Last Contact</dt>
              <dd>{formatDateTime(lead.lastContactAt)}</dd>
            </div>
            <div>
              <dt>Next Follow-up</dt>
              <dd>{formatDateTime(lead.nextFollowUpAt)}</dd>
            </div>
            <div>
              <dt>Contact Attempts</dt>
              <dd>{lead.contactAttempts}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <h2>Notlar</h2>
          <dl className="admin-dl">
            <div>
              <dt>Outreach Notes</dt>
              <dd>{lead.outreachNotes || "—"}</dd>
            </div>
            <div>
              <dt>FINAL TOP 20 Rank</dt>
              <dd>{lead.isFinalTop20 && lead.finalRank != null ? `#${lead.finalRank}` : "—"}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{lead.source || "—"}</dd>
            </div>
            <div>
              <dt>Date Checked</dt>
              <dd>{formatDate(lead.dateChecked)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(lead.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="admin-panel">
        <h2>Edit</h2>
        <RestaurantLeadForm mode="edit" lead={lead} />
      </section>
    </div>
  );
}
