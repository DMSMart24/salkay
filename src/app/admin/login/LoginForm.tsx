"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions/auth";
import { LoginFields } from "@/components/admin/SimpleForms";
import type { FormState } from "@/lib/admin/validation";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return <LoginFields action={action} state={state} pending={pending} />;
}
