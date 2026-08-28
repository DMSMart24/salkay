import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/session";

export default async function AdminAppLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <AdminShell userName={session.name} userEmail={session.email}>
      {children}
    </AdminShell>
  );
}
