import Link from "next/link";
import { notFound } from "next/navigation";
import {
  markDoNotContactForm,
  moveCompaniesToGroupForm,
} from "@/app/admin/actions/outreach";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { ComposeEmail } from "@/components/admin/ComposeEmail";
import { NoteForm } from "@/components/admin/SimpleForms";
import { LeadPriorityBadge, OutreachBadge, WebsiteBadge } from "@/components/admin/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import { directionLabels, emailStatusLabels, websiteStatusLabels } from "@/lib/admin/labels";
import { isOutreachSendEnabled } from "@/lib/admin/outreach";
import {
  formatScore,
  leadPriorityBand,
  opportunityLabels,
  isOpportunityType,
} from "@/lib/admin/qualification";
import { getPrisma } from "@/lib/admin/prisma";
import { getCompanyDetail } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyDetail(id);
  if (!company) {
    notFound();
  }

  const [templates, groups] = await Promise.all([
    getPrisma().emailTemplate.findMany({
      where: { active: true },
      select: { id: true, name: true, category: true, subject: true, body: true },
      orderBy: { name: "asc" },
    }),
    getPrisma().leadGroup.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const primary = company.contacts.find((row) => row.isPrimary) ?? company.contacts[0];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firma</p>
          <h1>{company.companyName}</h1>
          <div className="admin-meta">
            <OutreachBadge status={company.outreachStatus} />
            {company.group ? <Link href={`/admin/groups/${company.group.id}`}>{company.group.name}</Link> : null}
            {company.website ? (
              <a href={company.website} target="_blank" rel="noreferrer">
                {company.website}
              </a>
            ) : null}
          </div>
        </div>
        <div className="admin-actions" id="compose">
          <ComposeEmail
            companyId={company.id}
            companyName={company.companyName}
            website={company.website}
            city={company.city}
            industry={company.industry}
            groupName={company.group?.name}
            groupIndustry={company.group?.industry}
            contacts={company.contacts}
            templates={templates}
            outreachSendEnabled={isOutreachSendEnabled()}
          />
          <form action={moveCompaniesToGroupForm} className="admin-inline-form">
            <input type="hidden" name="companyIds" value={company.id} />
            <select name="groupId" defaultValue={company.groupId ?? ""} required>
              <option value="" disabled>
                Gruba taşı
              </option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button className="admin-btn ghost">Gruba Taşı</button>
          </form>
          <form action={markDoNotContactForm}>
            <input type="hidden" name="companyId" value={company.id} />
            <button className="admin-btn ghost">İletişim Kurma</button>
          </form>
        </div>
      </header>

      <div className="admin-detail-grid">
        <section className="admin-panel">
          <h2>Firma Bilgileri</h2>
          <dl className="admin-dl">
            <div>
              <dt>Sektör / grup</dt>
              <dd>{company.group?.name || company.industry || "—"}</dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>{company.website || "—"}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{company.generalEmail || primary?.email || "—"}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{company.phone || "—"}</dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>{company.instagram || "—"}</dd>
            </div>
            <div>
              <dt>Konum</dt>
              <dd>{[company.district, company.city, company.country].filter(Boolean).join(", ") || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <h2>Lead Qualifizierung</h2>
          <dl className="admin-dl admin-qual">
            <div>
              <dt>Website Score</dt>
              <dd className="admin-qual-score">
                {company.websiteStatus === "NO_WEBSITE"
                  ? "—"
                  : formatScore(company.websiteScore)
                    ? `${formatScore(company.websiteScore)} / 10`
                    : "—"}
              </dd>
            </div>
            <div>
              <dt>
                Lead Score <span className="admin-qual-internal">INTERN</span>
              </dt>
              <dd className="admin-qual-score">
                {formatScore(company.leadScore) ? `${formatScore(company.leadScore)} / 10` : "—"}
              </dd>
            </div>
            <div>
              <dt>Website</dt>
              <dd>
                <WebsiteBadge status={company.websiteStatus} />
              </dd>
            </div>
            <div>
              <dt>Opportunity</dt>
              <dd>
                {company.opportunities.filter(isOpportunityType).map((item) => opportunityLabels[item]).join(", ") ||
                  "—"}
              </dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                {typeof company.leadScore === "number" ? (
                  <LeadPriorityBadge band={leadPriorityBand(company.leadScore)} />
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt>Last reviewed</dt>
              <dd>{company.researchedAt ? formatDate(company.researchedAt) : "—"}</dd>
            </div>
          </dl>
          {company.websiteStatus !== "NO_WEBSITE" &&
          (company.scoreDesign != null ||
            company.scoreMobile != null ||
            company.scoreUx != null ||
            company.scoreConversion != null ||
            company.scoreTechnical != null ||
            company.scoreSeo != null) ? (
            <p className="admin-help">
              Design {formatScore(company.scoreDesign) ?? "—"} / 2 · Mobile{" "}
              {formatScore(company.scoreMobile) ?? "—"} / 2 · UX {formatScore(company.scoreUx) ?? "—"} / 2 ·
              Conversion {formatScore(company.scoreConversion) ?? "—"} / 2 · Technik{" "}
              {formatScore(company.scoreTechnical) ?? "—"} / 1 · SEO {formatScore(company.scoreSeo) ?? "—"} / 1
            </p>
          ) : null}
          {company.websiteStatus === "NO_WEBSITE" ? (
            <p className="admin-help">{websiteStatusLabels.NO_WEBSITE}</p>
          ) : null}
          <h3>Website Analysis</h3>
          {company.websiteIssues.length === 0 ? (
            <p className="admin-help">Henüz analiz noktası yok.</p>
          ) : (
            <ol className="admin-analysis-list">
              {company.websiteIssues.slice(0, 4).map((issue, index) => (
                <li key={`${issue}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {issue}
                </li>
              ))}
            </ol>
          )}
          <h3>Recommended Pitch</h3>
          <p>{company.salesPitch || "—"}</p>
          <p className="admin-help">
            Önerilen hizmetler: {company.recommendedServices.join(", ") || "—"}
          </p>
        </section>

        <section className="admin-panel">
          <h2>E-posta Geçmişi</h2>
          {company.emails.length === 0 ? (
            <p className="admin-help">Henüz e-posta yok.</p>
          ) : (
            company.emails.map((message) => (
              <article key={message.id} className="admin-msg">
                <p>
                  <strong>{directionLabels[message.direction]}</strong> · {emailStatusLabels[message.status]} ·{" "}
                  {formatDateTime(message.sentAt ?? message.receivedAt ?? message.createdAt)}
                </p>
                <p>{message.subject}</p>
                <pre>{message.bodyText}</pre>
              </article>
            ))
          )}
        </section>

        <section className="admin-panel" id="note">
          <h2>Notlar</h2>
          <ul className="admin-list">
            {company.companyNotes.map((note) => (
              <li key={note.id}>
                <strong>{note.author.name}</strong>
                <span>
                  {note.body} · {formatDateTime(note.createdAt)}
                </span>
              </li>
            ))}
          </ul>
          <NoteForm companyId={company.id} />
        </section>

        <section className="admin-panel" id="edit">
          <h2>Düzenle</h2>
          <CompanyForm mode="edit" company={company} groups={groups} />
        </section>
      </div>

      <p>
        <Link href="/admin/companies">← Firmen</Link>
        {company.lastContactedAt ? (
          <span className="admin-help"> · Son e-posta {formatDate(company.lastContactedAt)}</span>
        ) : null}
      </p>
    </div>
  );
}
