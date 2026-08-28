"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordActivity } from "@/lib/admin/activity";
import { isEmailCtaConfigured, salkayPhone } from "@/lib/admin/email/assets";
import { renderPersonalizedEmail } from "@/lib/admin/email/render";
import {
  RESTAURANT_TEMPLATE_NAME,
  RESTAURANT_TEMPLATE_SUBJECT,
  restaurantPremiumSource,
} from "@/lib/admin/email/templates/restaurant";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { templateSchema, type FormState } from "@/lib/admin/validation";

export type TemplatePreviewState = FormState & {
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  score?: string;
  issues?: string[];
  internalIssues?: string[];
  customerIssues?: string[];
  issueReviewNeeded?: string[];
  recipient?: string;
  companyName?: string;
  unresolved?: boolean;
  ctaConfigured?: boolean;
  phoneVisible?: boolean;
};

function touchTemplates(id?: string) {
  revalidatePath("/admin/templates");
  revalidatePath("/admin/emails");
  if (id) revalidatePath(`/admin/templates/${id}`);
}

export async function updateTemplateAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("templateId") ?? "");
  const parsed = templateSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    language: formData.get("language") || "tr",
    active: formData.get("active") !== "off",
  });
  if (!id || !parsed.success) {
    return { error: parsed.success ? "Şablon bulunamadı." : parsed.error.issues[0]?.message };
  }

  await getPrisma().emailTemplate.update({
    where: { id },
    data: {
      ...parsed.data,
      active: parsed.data.active ?? true,
    },
  });
  touchTemplates(id);
  return { success: "Şablon güncellendi." };
}

export async function duplicateTemplateForm(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("templateId") ?? "");
  if (!id) return;
  const template = await getPrisma().emailTemplate.findUnique({ where: { id } });
  if (!template) return;
  const copy = await getPrisma().emailTemplate.create({
    data: {
      name: `${template.name} (kopya)`,
      category: template.category,
      subject: template.subject,
      body: template.body,
      language: template.language,
      active: false,
      authorId: session.userId,
    },
  });
  touchTemplates(copy.id);
  redirect(`/admin/templates/${copy.id}`);
}

export async function ensureRestaurantTemplateForm(formData: FormData) {
  void formData;
  const session = await requireAdmin();
  const prisma = getPrisma();
  const existing = await prisma.emailTemplate.findFirst({
    where: { name: RESTAURANT_TEMPLATE_NAME },
  });
  if (existing) {
    redirect(`/admin/templates/${existing.id}`);
  }

  const created = await prisma.emailTemplate.create({
    data: {
      name: RESTAURANT_TEMPLATE_NAME,
      category: "RESTORAN",
      language: "tr",
      active: true,
      authorId: session.userId,
      subject: RESTAURANT_TEMPLATE_SUBJECT,
      body: restaurantPremiumSource(),
    },
  });
  await recordActivity(prisma, {
    type: "TEMPLATE_CREATED",
    message: RESTAURANT_TEMPLATE_NAME,
    userId: session.userId,
  });
  touchTemplates(created.id);
  redirect(`/admin/templates/${created.id}`);
}

export async function resetRestaurantTemplateForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("templateId") ?? "");
  if (!id) return;
  await getPrisma().emailTemplate.update({
    where: { id },
    data: {
      name: RESTAURANT_TEMPLATE_NAME,
      category: "RESTORAN",
      language: "tr",
      subject: RESTAURANT_TEMPLATE_SUBJECT,
      body: restaurantPremiumSource(),
    },
  });
  touchTemplates(id);
}

export async function previewTemplateAction(
  _prev: TemplatePreviewState,
  formData: FormData,
): Promise<TemplatePreviewState> {
  await requireAdmin();
  const templateId = String(formData.get("templateId") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  if (!templateId || !companyId) {
    return { error: "Şablon ve önizleme firması seçin." };
  }

  const [template, company] = await Promise.all([
    getPrisma().emailTemplate.findUnique({ where: { id: templateId } }),
    getPrisma().company.findUnique({
      where: { id: companyId },
      include: { contacts: true },
    }),
  ]);
  if (!template || !company) {
    return { error: "Şablon veya firma bulunamadı." };
  }

  const subject = String(formData.get("subject") ?? "").trim() || template.subject;
  const body = String(formData.get("body") ?? "").trim() || template.body;
  const rendered = renderPersonalizedEmail({
    subject,
    body,
    company,
  });

  return {
    success: "Önizleme hazır. Veritabanı değişmedi, e-posta gönderilmedi.",
    subject: rendered.subject,
    bodyHtml: rendered.bodyHtml,
    bodyText: rendered.bodyText,
    score: rendered.context.scoreLabel,
    issues: rendered.context.customerIssues,
    internalIssues: rendered.context.internalIssues,
    customerIssues: rendered.context.customerIssues,
    issueReviewNeeded: rendered.context.issueReviewNeeded,
    recipient: rendered.context.vars.companyEmail,
    companyName: company.companyName,
    unresolved: rendered.unresolved,
    ctaConfigured: isEmailCtaConfigured(),
    phoneVisible: Boolean(salkayPhone()),
  };
}

export async function saveTemplateTestDraftForm(formData: FormData) {
  const session = await requireAdmin();
  const templateId = String(formData.get("templateId") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  if (!templateId || !companyId) return;

  const [template, company] = await Promise.all([
    getPrisma().emailTemplate.findUnique({ where: { id: templateId } }),
    getPrisma().company.findUnique({
      where: { id: companyId },
      include: { contacts: true },
    }),
  ]);
  if (!template || !company) return;

  const rendered = renderPersonalizedEmail({
    subject: template.subject,
    body: template.body,
    company,
  });
  const contact = company.contacts.find((row) => row.isPrimary) ?? company.contacts[0];

  await getPrisma().emailMessage.create({
    data: {
      companyId: company.id,
      contactId: contact?.id,
      threadId: `preview-${company.id}-${Date.now()}`,
      direction: "OUTBOUND",
      fromAddress: session.email,
      toAddress: rendered.context.vars.companyEmail || session.email,
      subject: rendered.subject,
      bodyText: rendered.bodyText,
      bodyHtml: rendered.bodyHtml,
      status: "DRAFT",
      templateId: template.id,
    },
  });
  revalidatePath("/admin/emails");
  revalidatePath("/admin/inbox");
}
