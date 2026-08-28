import bcrypt from "bcryptjs";
import { MIN_ADMIN_PASSWORD_LENGTH, readEnvValue } from "@/lib/admin/env";
import { normalizeEmail } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";

export type BootstrapResult =
  | { status: "created"; email: string; role: string }
  | { status: "exists"; email: string; role: string }
  | { status: "skipped"; reason: "missing-env" | "short-password" | "not-empty" };

export async function ensureInitialAdmin(): Promise<BootstrapResult> {
  const prisma = getPrisma();
  const email = normalizeEmail(readEnvValue("ADMIN_EMAIL"));
  const password = readEnvValue("ADMIN_PASSWORD");
  const name = readEnvValue("ADMIN_NAME")?.trim() || "SALKAY Admin";

  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { email: true, role: true },
    });
    if (existing) {
      return { status: "exists", email: existing.email, role: existing.role };
    }
  }

  const otherUsers = await prisma.user.count();
  if (otherUsers > 0) {
    return { status: "skipped", reason: "not-empty" };
  }

  if (!email || !password) {
    return { status: "skipped", reason: "missing-env" };
  }

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return { status: "skipped", reason: "short-password" };
  }

  const created = await prisma.user.create({
    data: {
      email,
      name,
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
    select: { email: true, role: true },
  });

  return { status: "created", email: created.email, role: created.role };
}
