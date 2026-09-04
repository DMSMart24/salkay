"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordActivity } from "@/lib/admin/activity";
import { salkayPhone } from "@/lib/admin/email/assets";
import { renderFromTemplate } from "@/lib/admin/email/render";
import { isFollowUpStep, parseSequenceStep } from "@/lib/admin/email/sequence";
import { followUpCopy } from "@/lib/admin/email/templates/follow-up-copy";
import { resolveSendableTemplate } from "@/lib/admin/email/sendable";
import {
  BAR_GROUP_NAME,
  BAR_TEMPLATE_CATEGORY,
  BAR_TEMPLATE_NAME,
  BAR_TEMPLATE_SUBJECT,
  barPremiumSource,
} from "@/lib/admin/email/templates/bar";
import { ensureBarOutreachRecords } from "@/lib/admin/email/templates/ensure-bar";
import { ensureIndustryTemplateRecord } from "@/lib/admin/email/templates/ensure-industries";
import { outreachCopy } from "@/lib/admin/email/templates/outreach-copy";
import { industrySpec } from "@/lib/admin/email/templates/premium-industry";
import {
  isCodeBackedPremiumKind,
  isPremiumIndustryKind,
  PREMIUM_INDUSTRY_KINDS,
  resolvePremiumEmailKind,
  type PremiumIndustryKind,
} from "@/lib/admin/email/templates/premium-kind";
import { premiumHtmlSource } from "@/lib/admin/email/templates/premium-source";
import {
  RESTAURANT_TEMPLATE_NAME,
  RESTAURANT_TEMPLATE_SUBJECT,
  restaurantPremiumSource,
} from "@/lib/admin/email/templates/restaurant";
import { applyPreviewWebsiteMode, parsePreviewWebsiteMode } from "@/lib/admin/email/website-copy";
import { mergeTemplate } from "@/lib/admin/merge";
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
  droppedIssues?: string[];
  copyKind?: string;
  sourceOfTruth?: "code" | "database";
  editorAffectsSend?: boolean;
  preheader?: string;
  ctaLabel?: string;
  recipient?: string;
  companyName?: string;
  unresolved?: boolean;
  ctaConfigured?: boolean;
  phoneVisible?: boolean;
  sequenceStep?: number;
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

  const sendable = resolveSendableTemplate(parsed.data);
  await getPrisma().emailTemplate.update({
    where: { id },
    data: {
      ...parsed.data,
      subject: sendable.subject || parsed.data.subject,
      body: sendable.body || parsed.data.body,
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

function parseIndustryKind(raw: string): PremiumIndustryKind | null {
  return (PREMIUM_INDUSTRY_KINDS as readonly string[]).includes(raw)
    ? (raw as PremiumIndustryKind)
    : null;
}

export async function ensureBarTemplateForm(formData: FormData) {
  void formData;
  const session = await requireAdmin();
  const prisma = getPrisma();
  const result = await ensureBarOutreachRecords(prisma, session.userId);
  if (result.groupCreated) {
    await recordActivity(prisma, {
      type: "GROUP_CREATED",
      message: `Grup: ${BAR_GROUP_NAME}`,
      userId: session.userId,
    });
    revalidatePath("/admin/groups");
    revalidatePath("/admin/companies");
  }
  if (result.templateCreated) {
    await recordActivity(prisma, {
      type: "TEMPLATE_CREATED",
      message: BAR_TEMPLATE_NAME,
      userId: session.userId,
    });
    touchTemplates(result.templateId);
  }
  redirect(`/admin/templates/${result.templateId}`);
}

export async function resetBarTemplateForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("templateId") ?? "");
  if (!id) return;
  await getPrisma().emailTemplate.update({
    where: { id },
    data: {
      name: BAR_TEMPLATE_NAME,
      category: BAR_TEMPLATE_CATEGORY,
      language: "tr",
      subject: BAR_TEMPLATE_SUBJECT,
      body: barPremiumSource(),
    },
  });
  touchTemplates(id);
}

export async function ensureIndustryTemplateForm(formData: FormData) {
  const session = await requireAdmin();
  const kind = parseIndustryKind(String(formData.get("industry") ?? ""));
  if (!kind) return;
  const prisma = getPrisma();
  const spec = industrySpec(kind);
  const result = await ensureIndustryTemplateRecord(prisma, session.userId, kind);
  if (result.templateCreated) {
    await recordActivity(prisma, {
      type: "TEMPLATE_CREATED",
      message: spec.templateName,
      userId: session.userId,
    });
    touchTemplates(result.templateId);
  }
  redirect(`/admin/templates/${result.templateId}`);
}

export async function resetIndustryTemplateForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("templateId") ?? "");
  if (!id) return;
  const prisma = getPrisma();
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) return;
  const kind = resolvePremiumEmailKind({
    name: template.name,
    category: template.category,
    body: template.body,
  });
  if (!isPremiumIndustryKind(kind)) return;
  const spec = industrySpec(kind);
  await prisma.emailTemplate.update({
    where: { id },
    data: {
      name: spec.templateName,
      category: spec.category,
      language: "tr",
      subject: spec.subject,
      body: premiumHtmlSource(kind),
    },
  });
  touchTemplates(id);
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

  const editorSubject = String(formData.get("subject") ?? "").trim() || template.subject;
  const editorBody = String(formData.get("body") ?? "").trim() || template.body;
  const sendable = resolveSendableTemplate(template);
  const previewCompany = applyPreviewWebsiteMode(
    company,
    parsePreviewWebsiteMode(String(formData.get("previewStatus") ?? "actual")),
  );
  const sequenceStep = parseSequenceStep(String(formData.get("sequenceStep") ?? "0"));
  const rendered = renderFromTemplate(
    sendable.editorAffectsSend
      ? { ...template, subject: editorSubject, body: editorBody }
      : template,
    previewCompany,
    { sequenceStep },
  );
  const followCopy = isFollowUpStep(sequenceStep) ? followUpCopy(sendable.kind, sequenceStep) : null;
  const preheader = followCopy
    ? followCopy.preheader
    : isCodeBackedPremiumKind(sendable.kind)
      ? mergeTemplate(outreachCopy(sendable.kind).preheader, {
          companyName: rendered.context.vars.companyName,
        })
      : "";

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
    droppedIssues: rendered.context.droppedIssues,
    copyKind: rendered.context.copyKind,
    sourceOfTruth: rendered.sendable.sourceOfTruth,
    editorAffectsSend: rendered.sendable.editorAffectsSend,
    preheader,
    ctaLabel: followCopy
      ? followCopy.ctaLabel
      : isCodeBackedPremiumKind(sendable.kind)
        ? outreachCopy(sendable.kind).ctaLabel
        : undefined,
    recipient: rendered.context.vars.companyEmail,
    companyName: company.companyName,
    sequenceStep,
    unresolved: rendered.unresolved,
    ctaConfigured: rendered.context.ctaConfigured,
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

  const rendered = renderFromTemplate(template, company);
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
