import type { PrismaClient } from "@prisma/client";
import {
  BAR_GROUP_INDUSTRY,
  BAR_GROUP_NAME,
  BAR_TEMPLATE_CATEGORY,
  BAR_TEMPLATE_NAME,
  BAR_TEMPLATE_SUBJECT,
  barPremiumSource,
} from "@/lib/admin/email/templates/bar";
import { slugify } from "@/lib/admin/normalize";

export async function ensureBarOutreachRecords(
  prisma: PrismaClient,
  userId: string,
) {
  const slug = slugify(BAR_GROUP_NAME);
  const existingGroup = await prisma.leadGroup.findFirst({
    where: { OR: [{ slug }, { name: BAR_GROUP_NAME }] },
    select: { id: true },
  });
  let groupCreated = false;
  if (!existingGroup) {
    await prisma.leadGroup.create({
      data: {
        name: BAR_GROUP_NAME,
        slug,
        industry: BAR_GROUP_INDUSTRY,
        country: "Türkiye",
      },
    });
    groupCreated = true;
  }

  const existingTemplate = await prisma.emailTemplate.findFirst({
    where: { name: BAR_TEMPLATE_NAME },
    select: { id: true },
  });
  if (existingTemplate) {
    return { groupCreated, templateCreated: false, templateId: existingTemplate.id };
  }

  const created = await prisma.emailTemplate.create({
    data: {
      name: BAR_TEMPLATE_NAME,
      category: BAR_TEMPLATE_CATEGORY,
      language: "tr",
      active: true,
      authorId: userId,
      subject: BAR_TEMPLATE_SUBJECT,
      body: barPremiumSource(),
    },
  });
  return { groupCreated, templateCreated: true, templateId: created.id };
}
