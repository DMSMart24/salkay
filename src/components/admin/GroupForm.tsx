"use client";

import { useActionState } from "react";
import { createGroupAction, updateGroupAction } from "@/app/admin/actions/groups";
import { ActionMessage } from "@/components/admin/ActionMessage";
import type { FormState } from "@/lib/admin/validation";

type GroupFormProps = {
  group?: {
    id: string;
    name: string;
    description?: string | null;
    industry?: string | null;
    city?: string | null;
    country?: string | null;
  };
};

export function GroupForm({ group }: GroupFormProps) {
  const action = group ? updateGroupAction : createGroupAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="admin-form">
      {group ? <input type="hidden" name="groupId" value={group.id} /> : null}
      <ActionMessage state={state} />
      <div className="admin-grid-2">
        <label>
          Grup adı
          <input name="name" required defaultValue={group?.name} placeholder="İstanbul Restoranlar" />
        </label>
        <label>
          Sektör
          <input name="industry" defaultValue={group?.industry ?? ""} placeholder="Restaurant" />
        </label>
        <label>
          Şehir
          <input name="city" defaultValue={group?.city ?? ""} />
        </label>
        <label>
          Ülke
          <input name="country" defaultValue={group?.country ?? "Türkiye"} />
        </label>
      </div>
      <label>
        Açıklama
        <textarea name="description" rows={2} defaultValue={group?.description ?? ""} />
      </label>
      <button className="admin-btn" disabled={pending}>
        {group ? "Grubu kaydet" : "Grup oluştur"}
      </button>
    </form>
  );
}
