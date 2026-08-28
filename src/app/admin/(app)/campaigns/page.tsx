import { CampaignForm } from "@/components/admin/SimpleForms";
import { formatDateTime } from "@/lib/admin/format";
import { campaignStatusLabels } from "@/lib/admin/labels";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const prisma = getPrisma();
  const [campaigns, templates] = await Promise.all([
    prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { recipients: true } }, template: true },
    }),
    prisma.emailTemplate.findMany({
      where: { active: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Kampagnen</p>
          <h1>Kampanyalar</h1>
        </div>
      </header>
      <p className="admin-help">
        V1 taslak kampanyadır. Toplu gönderim, hız aşımı veya spam korumasını aşacak bir akış yok.
      </p>
      <CampaignForm templates={templates} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Durum</th>
              <th>Şablon</th>
              <th>Alıcı</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaignStatusLabels[campaign.status]}</td>
                <td>{campaign.template?.name ?? "—"}</td>
                <td>{campaign._count.recipients}</td>
                <td>{formatDateTime(campaign.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
