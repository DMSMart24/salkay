import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/LoginForm";
import { ensureInitialAdmin } from "@/lib/admin/bootstrap";
import { getAuthSecret } from "@/lib/admin/crypto";
import { isDatabaseConfigured } from "@/lib/admin/prisma";
import { getSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  if (await getSession()) {
    redirect("/admin");
  }

  const bootstrap = isDatabaseConfigured() ? await ensureInitialAdmin() : null;

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-kicker">SALKAY Internal</p>
        <h1>Admin CRM</h1>
        <p className="admin-help">Yalnızca yetkili SALKAY ekibi.</p>
        {!isDatabaseConfigured() ? (
          <p className="admin-error">DATABASE_URL tanımlı değil.</p>
        ) : null}
        {!getAuthSecret() ? (
          <p className="admin-error">AUTH_SECRET en az 32 karakter olmalı.</p>
        ) : null}
        {bootstrap?.status === "skipped" && bootstrap.reason === "short-password" ? (
          <p className="admin-error">
            İlk admin oluşturulamadı. ADMIN_PASSWORD en az 8 karakter olmalı.
          </p>
        ) : null}
        {bootstrap?.status === "skipped" && bootstrap.reason === "missing-env" ? (
          <p className="admin-error">
            İlk admin oluşturulamadı. ADMIN_EMAIL ve ADMIN_PASSWORD Production ortamında tanımlı
            olmalı.
          </p>
        ) : null}
        <LoginForm />
      </div>
    </div>
  );
}
