"use server";

import { redirect } from "next/navigation";
import { loginAdmin } from "@/lib/admin/auth";
import { isDatabaseConfigured } from "@/lib/admin/prisma";
import { destroySession } from "@/lib/admin/session";
import type { FormState } from "@/lib/admin/validation";

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isDatabaseConfigured()) {
    return { error: "DATABASE_URL tanımlı değil." };
  }

  const result = await loginAdmin({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if ("error" in result && result.error) {
    return { error: result.error };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
