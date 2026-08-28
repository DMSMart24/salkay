"use client";

import { useActionState } from "react";
import { publicUnsubscribeAction } from "@/app/admin/actions/outreach";
import { ActionMessage } from "@/components/admin/ActionMessage";
import type { FormState } from "@/lib/admin/validation";

export function UnsubscribeForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    publicUnsubscribeAction,
    {},
  );

  return (
    <form action={action} className="admin-form">
      <ActionMessage state={state} />
      <label>
        E-posta
        <input name="email" type="email" required defaultValue={email} />
      </label>
      <button className="admin-btn" disabled={pending}>
        Listeden çıkar
      </button>
    </form>
  );
}
