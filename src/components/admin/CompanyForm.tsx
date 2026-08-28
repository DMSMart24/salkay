"use client";

import { useActionState } from "react";
import type { Company, OutreachStatus, WebsiteStatus } from "@prisma/client";
import { createCompanyAction, updateCompanyAction } from "@/app/admin/actions/crm";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { outreachStatusLabels, websiteStatusLabels } from "@/lib/admin/labels";
import type { FormState } from "@/lib/admin/validation";

const outreachStatuses = Object.keys(outreachStatusLabels) as OutreachStatus[];
const websiteStatuses = Object.keys(websiteStatusLabels) as WebsiteStatus[];

type CompanyFormProps = {
  mode: "create" | "edit";
  company?: Company;
  groups?: Array<{ id: string; name: string }>;
};

export function CompanyForm({ mode, company, groups = [] }: CompanyFormProps) {
  const action = mode === "create" ? createCompanyAction : updateCompanyAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="admin-form">
      {company ? <input type="hidden" name="companyId" value={company.id} /> : null}
      <input type="hidden" name="status" value={company?.status ?? "NEW"} />
      <input type="hidden" name="priority" value={company?.priority ?? "MEDIUM"} />
      <ActionMessage state={state} />
      {state.warnings?.length ? (
        <label className="admin-check">
          <input type="checkbox" name="confirmDuplicate" />
          Yine de oluştur
        </label>
      ) : null}
      <div className="admin-grid-2">
        <label>
          Firma
          <input name="companyName" required defaultValue={company?.companyName} />
        </label>
        <label>
          Grup
          <select name="groupId" defaultValue={company?.groupId ?? ""}>
            <option value="">Grup yok</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Website
          <input name="website" defaultValue={company?.website ?? ""} />
        </label>
        <label>
          Domain
          <input name="domain" defaultValue={company?.domain ?? ""} />
        </label>
        <label>
          Sektör
          <input name="industry" defaultValue={company?.industry ?? ""} />
        </label>
        <label>
          Genel e-posta
          <input name="generalEmail" type="email" defaultValue={company?.generalEmail ?? ""} />
        </label>
        <label>
          Telefon
          <input name="phone" defaultValue={company?.phone ?? ""} />
        </label>
        <label>
          Şehir
          <input name="city" defaultValue={company?.city ?? ""} />
        </label>
        <label>
          İlçe
          <input name="district" defaultValue={company?.district ?? ""} />
        </label>
        <label>
          Ülke
          <input name="country" defaultValue={company?.country ?? "Türkiye"} />
        </label>
        <label>
          Outreach durumu
          <select name="outreachStatus" defaultValue={company?.outreachStatus ?? "NEW"}>
            {outreachStatuses.map((status) => (
              <option key={status} value={status}>
                {outreachStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Website skoru
          <input
            name="websiteScore"
            type="number"
            min={1}
            max={10}
            defaultValue={company?.websiteScore ?? ""}
          />
        </label>
        <label>
          Website durumu
          <select name="websiteStatus" defaultValue={company?.websiteStatus ?? "UNKNOWN"}>
            {websiteStatuses.map((status) => (
              <option key={status} value={status}>
                {websiteStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kaynak
          <input name="researchSource" defaultValue={company?.researchSource ?? company?.source ?? ""} />
        </label>
        <label>
          Etiketler
          <input name="tags" placeholder="web, seo" defaultValue={company?.tags.join(", ") ?? ""} />
        </label>
      </div>
      <label>
        Tespit edilen sorunlar
        <textarea
          name="websiteIssues"
          rows={3}
          defaultValue={company?.websiteIssues.join("\n") ?? ""}
        />
      </label>
      <label>
        Önerilen SALKAY hizmetleri
        <textarea
          name="recommendedServices"
          rows={2}
          defaultValue={company?.recommendedServices.join("\n") ?? ""}
        />
      </label>
      <label>
        Notlar
        <textarea name="notes" rows={3} defaultValue={company?.notes ?? ""} />
      </label>
      <button className="admin-btn" disabled={pending}>
        {mode === "create" ? "Firmayı kaydet" : "Değişiklikleri kaydet"}
      </button>
    </form>
  );
}
