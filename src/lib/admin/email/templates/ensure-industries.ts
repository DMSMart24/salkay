import type { PrismaClient } from "@prisma/client";
import { industrySpec } from "@/lib/admin/email/templates/premium-industry";
import type { PremiumIndustryKind } from "@/lib/admin/email/templates/premium-kind";
import { premiumHtmlSource } from "@/lib/admin/email/templates/premium-source";

export async function ensureIndustryTemplateRecord(
  prisma: PrismaClient,
  userId: string,
  kind: PremiumIndustryKind,
) {
  const spec = industrySpec(kind);
  const existing = await prisma.emailTemplate.findFirst({
    where: { name: spec.templateName },
    select: { id: true },
  });
  if (existing) {
    return { templateCreated: false, templateId: existing.id };
  }

  const created = await prisma.emailTemplate.create({
    data: {
      name: spec.templateName,
      category: spec.category,
      language: "tr",
      active: true,
      authorId: userId,
      subject: spec.subject,
      body: premiumHtmlSource(kind),
    },
  });
  return { templateCreated: true, templateId: created.id };
}
