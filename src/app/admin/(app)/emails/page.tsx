import Link from "next/link";
import { BulkSendWizard } from "@/components/admin/BulkSendWizard";
import { ComposeEmail } from "@/components/admin/ComposeEmail";
import { describeEmailProvider } from "@/lib/admin/email/provider";
import { formatDateTime } from "@/lib/admin/format";
import { emailStatusLabels } from "@/lib/admin/labels";
import { isOutreachSendEnabled } from "@/lib/admin/outreach";
import { inferredSequenceStep, sequenceStepLabel } from "@/lib/admin/email/sequence";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

type Search = {
  tab?: string;
  ids?: string | string[];
  groupId?: string;
  companyId?: string;
};

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? (params.ids || params.groupId ? "bulk" : "single");
  const selectedIds = (Array.isArray(params.ids) ? params.ids : params.ids ? [params.ids] : []).filter(Boolean);
  const prisma = getPrisma();
  const provider = describeEmailProvider();

  const [groups, templates, companies, messages] = await Promise.all([
    prisma.leadGroup.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.emailTemplate.findMany({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.company.findMany({
      where: { archivedAt: null },
      include: {
        contacts: { take: 3, orderBy: { isPrimary: "desc" } },
        group: { select: { name: true, industry: true } },
      },
      orderBy: { companyName: "asc" },
      take: 200,
    }),
    prisma.emailMessage.findMany({
      where:
        tab === "failed"
          ? { status: { in: ["FAILED", "BOUNCED"] } }
          : tab === "drafts"
            ? { status: { in: ["DRAFT", "QUEUED"] } }
            : tab === "sent"
              ? { direction: "OUTBOUND", status: { in: ["SENT", "DELIVERED"] } }
              : undefined,
      include: { company: { select: { id: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  ]);

  const composeCompany =
    companies.find((company) => company.id === params.companyId) ??
    companies.find((company) => selectedIds.includes(company.id)) ??
    companies[0];

  const tabs = [
    ["single", "Tek E-posta"],
    ["bulk", "Toplu Gönderim"],
    ["sent", "Gönderilenler"],
    ["failed", "Başarısız"],
    ["drafts", "Taslaklar"],
  ] as const;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">E-Mails</p>
          <h1>E-posta merkezi</h1>
          <p className="admin-help">
            Sağlayıcı: {provider.id} · {provider.configured ? "hazır" : "yapılandırılmadı"} · Toplu gerçek
            gönderim {isOutreachSendEnabled() ? "açık" : "kapalı (test/taslak)"}
          </p>
        </div>
      </header>

      <nav className="admin-tabs">
        {tabs.map(([value, label]) => (
          <Link key={value} href={`/admin/emails?tab=${value}`} className={tab === value ? "is-active" : undefined}>
            {label}
          </Link>
        ))}
      </nav>

      {tab === "single" ? (
        <section className="admin-panel">
          <h2>Tek e-posta</h2>
          {composeCompany ? (
            <ComposeEmail
              companyId={composeCompany.id}
              companyName={composeCompany.companyName}
              website={composeCompany.website}
              city={composeCompany.city}
              industry={composeCompany.industry}
              groupName={composeCompany.group?.name}
              groupIndustry={composeCompany.group?.industry}
              contacts={composeCompany.contacts}
              templates={templates}
              outreachSendEnabled={isOutreachSendEnabled()}
            />
          ) : (
            <p className="admin-help">Önce bir firma ekleyin.</p>
          )}
          <form method="get" className="admin-filters">
            <input type="hidden" name="tab" value="single" />
            <select name="companyId" defaultValue={composeCompany?.id ?? ""}>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
            <button className="admin-btn ghost">Firma seç</button>
          </form>
        </section>
      ) : null}

      {tab === "bulk" ? (
        <BulkSendWizard
          groups={groups}
          templates={templates}
          selectedIds={selectedIds}
          defaultGroupId={params.groupId}
          sendEnabled={isOutreachSendEnabled()}
        />
      ) : null}

      {tab === "sent" || tab === "failed" || tab === "drafts" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Firma</th>
                <th>Konu</th>
                <th>Sequence</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>
                    {message.company ? (
                      <Link href={`/admin/companies/${message.company.id}`}>{message.company.companyName}</Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{message.subject}</td>
                  <td>{sequenceStepLabel(inferredSequenceStep(message))}</td>
                  <td>
                    {emailStatusLabels[message.status]}
                    {message.failureReason ? ` · ${message.failureReason}` : ""}
                  </td>
                  <td>{formatDateTime(message.sentAt ?? message.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
