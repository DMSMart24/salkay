import { normalizeEmail } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";

export async function findAssociationByEmail(email?: string | null) {
  const emailNorm = normalizeEmail(email);
  if (!emailNorm) {
    return { companyId: null, contactId: null };
  }

  const contact = await getPrisma().contact.findUnique({
    where: { emailNorm },
    select: { id: true, companyId: true },
  });
  if (contact) {
    return { companyId: contact.companyId, contactId: contact.id };
  }

  const company = await getPrisma().company.findFirst({
    where: { generalEmail: { equals: emailNorm, mode: "insensitive" } },
    select: { id: true },
  });

  return { companyId: company?.id ?? null, contactId: null };
}
