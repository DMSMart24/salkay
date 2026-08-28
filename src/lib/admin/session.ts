import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { SESSION_COOKIE } from "@/lib/admin/constants";
import { getAuthSecret, randomToken, sha256, signSessionToken, verifySessionCookie } from "@/lib/admin/crypto";
import { getPrisma, isDatabaseConfigured } from "@/lib/admin/prisma";

export { SESSION_COOKIE };
const SESSION_DAYS = 7;

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

export async function createSession(userId: string) {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  const prisma = getPrisma();
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const headerStore = await headers();

  await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt,
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: headerStore.get("user-agent")?.slice(0, 240) ?? null,
    },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSessionToken(token, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const secret = getAuthSecret();
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  jar.delete({ name: SESSION_COOKIE, path: "/" });

  if (!secret || !raw || !isDatabaseConfigured()) {
    return;
  }

  const token = verifySessionCookie(raw, secret);
  if (!token) {
    return;
  }

  await getPrisma().session.deleteMany({
    where: { tokenHash: sha256(token) },
  });
}

export async function getSession(): Promise<AdminSession | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const secret = getAuthSecret();
  if (!secret) {
    return null;
  }

  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  const token = verifySessionCookie(raw, secret);
  if (!token) {
    return null;
  }

  const record = await getPrisma().session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });

  if (!record || record.expiresAt.getTime() <= Date.now()) {
    if (record) {
      await getPrisma().session.delete({ where: { id: record.id } }).catch(() => undefined);
    }
    return null;
  }

  return {
    userId: record.user.id,
    email: record.user.email,
    name: record.user.name,
    role: record.user.role,
  };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
