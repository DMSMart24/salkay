import type { Prisma, SuppressionReason } from "@prisma/client";
import { normalizeDomain, normalizeEmail } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";

export async function isEmailSuppressed(email?: string | null) {
  return isAddressSuppressed(email);
}

export async function isAddressSuppressed(email?: string | null) {
  const emailNorm = normalizeEmail(email);
  if (!emailNorm) {
    return false;
  }

  const domain = normalizeDomain(emailNorm.split("@")[1] ?? "") ?? emailNorm.split("@")[1] ?? null;
  const found = await getPrisma().suppression.findFirst({
    where: {
      OR: [{ emailNorm }, ...(domain ? [{ domain }] : [])],
    },
    select: { id: true },
  });
  return Boolean(found);
}

export async function suppressEmail(
  tx: Prisma.TransactionClient | ReturnType<typeof getPrisma>,
  input: {
    email: string;
    reason: SuppressionReason;
    companyId?: string | null;
    contactId?: string | null;
    notes?: string | null;
    source?: string | null;
    domain?: string | null;
  },
) {
  const emailNorm = normalizeEmail(input.email);
  if (!emailNorm) {
    return null;
  }

  const domain =
    normalizeDomain(input.domain) ??
    normalizeDomain(emailNorm.includes("@") ? emailNorm.split("@")[1] : emailNorm);

  return tx.suppression.upsert({
    where: { emailNorm },
    update: {
      reason: input.reason,
      notes: input.notes ?? undefined,
      companyId: input.companyId ?? undefined,
      contactId: input.contactId ?? undefined,
      source: input.source ?? undefined,
      domain: domain ?? undefined,
    },
    create: {
      email: input.email.trim(),
      emailNorm,
      domain,
      reason: input.reason,
      source: input.source ?? "manual",
      notes: input.notes ?? null,
      companyId: input.companyId ?? null,
      contactId: input.contactId ?? null,
    },
  });
}

export async function suppressDomain(
  tx: Prisma.TransactionClient | ReturnType<typeof getPrisma>,
  input: {
    domain: string;
    reason: SuppressionReason;
    notes?: string | null;
    source?: string | null;
    companyId?: string | null;
  },
) {
  const domain = normalizeDomain(input.domain);
  if (!domain) {
    return null;
  }

  const emailNorm = `*@${domain}`;
  return tx.suppression.upsert({
    where: { emailNorm },
    update: {
      reason: input.reason,
      notes: input.notes ?? undefined,
      source: input.source ?? undefined,
      domain,
      companyId: input.companyId ?? undefined,
    },
    create: {
      email: `*@${domain}`,
      emailNorm,
      domain,
      reason: input.reason,
      source: input.source ?? "manual",
      notes: input.notes ?? null,
      companyId: input.companyId ?? null,
    },
  });
}

export async function companyIsCampaignEligible(companyId: string) {
  const company = await getPrisma().company.findUnique({
    where: { id: companyId },
    include: {
      contacts: { select: { email: true, emailNorm: true } },
      suppressions: { select: { id: true } },
    },
  });

  if (
    !company ||
    company.archivedAt ||
    company.status === "DO_NOT_CONTACT" ||
    company.outreachStatus === "DO_NOT_CONTACT"
  ) {
    return false;
  }

  if (company.suppressions.length > 0) {
    return false;
  }

  const emails = [
    company.generalEmail,
    ...company.contacts.map((contact) => contact.email),
  ].filter(Boolean) as string[];

  for (const email of emails) {
    if (await isAddressSuppressed(email)) {
      return false;
    }
  }

  return true;
}
