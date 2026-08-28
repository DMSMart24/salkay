import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { ensureInitialAdmin } from "@/lib/admin/bootstrap";
import { getAuthSecret } from "@/lib/admin/crypto";
import { normalizeEmail } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";
import { consumeLoginAttempt } from "@/lib/admin/rate-limit";
import { createSession } from "@/lib/admin/session";
import { loginSchema } from "@/lib/admin/validation";

async function clientIp() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function loginAdmin(input: unknown) {
  if (!getAuthSecret()) {
    return { error: "AUTH_SECRET tanımlı değil. En az 32 karakterlik bir sır ayarlayın." };
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz giriş." };
  }

  const ip = await clientIp();
  const email = normalizeEmail(parsed.data.email);
  if (!email) {
    return { error: "Geçerli bir e-posta girin." };
  }

  const limitKey = `${ip}:${email}`;
  const limited = consumeLoginAttempt(limitKey);
  if (!limited.ok) {
    return { error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." };
  }

  const prisma = getPrisma();
  const bootstrap = await ensureInitialAdmin();

  const recent = await prisma.loginAttempt.count({
    where: {
      ip,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      success: false,
    },
  });
  if (recent >= 20) {
    return { error: "Bu IP için giriş geçici olarak kilitlendi." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;

  await prisma.loginAttempt.create({
    data: { email, ip, success: Boolean(user && valid) },
  });

  if (!user || !valid) {
    if (!user && bootstrap.status === "skipped") {
      if (bootstrap.reason === "short-password") {
        return {
          error:
            "İlk admin oluşturulamadı. ADMIN_PASSWORD en az 8 karakter olmalı.",
        };
      }
      if (bootstrap.reason === "missing-env") {
        return {
          error:
            "İlk admin oluşturulamadı. ADMIN_EMAIL ve ADMIN_PASSWORD Production ortamında tanımlı olmalı.",
        };
      }
    }
    return { error: "E-posta veya şifre hatalı." };
  }

  await createSession(user.id);
  return { success: true };
}
