import Link from "next/link";
import { notFound } from "next/navigation";
import {
  markDoNotContactForm,
  moveCompaniesToGroupForm,
} from "@/app/admin/actions/outreach";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { ComposeEmail } from "@/components/admin/ComposeEmail";
import { NoteForm } from "@/components/admin/SimpleForms";
import { OutreachBadge, WebsiteBadge } from "@/components/admin/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import { directionLabels, emailStatusLabels } from "@/lib/admin/labels";
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
      select: { id: true, name: true, subject: true, body: true },
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
            contacts={company.contacts}
            templates={templates}
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
              <dt>Konum</dt>
              <dd>{[company.district, company.city, company.country].filter(Boolean).join(", ") || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel">
          <h2>Website Analizi</h2>
          <dl className="admin-dl">
            <div>
              <dt>Skor</dt>
              <dd>{company.websiteScore ?? "—"}</dd>
            </div>
            <div>
              <dt>Durum</dt>
              <dd>
                <WebsiteBadge status={company.websiteStatus} />
              </dd>
            </div>
            <div>
              <dt>Kaynak</dt>
              <dd>{company.researchSource || "—"}</dd>
            </div>
          </dl>
          <p>{company.websiteIssues.join(", ") || "Tespit edilen sorun yok."}</p>
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
