"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { recordActivity } from "@/lib/admin/activity";
import { OUTREACH_FROM_DISPLAY_NAME } from "@/lib/admin/email/from";
import { getEmailFrom, getEmailProvider, getOutreachFrom } from "@/lib/admin/email/provider";
import { renderPersonalizedEmail } from "@/lib/admin/email/render";
import { looksLikeHtmlEmail } from "@/lib/admin/email/html";
import {
  BAR_TEMPLATE_SUBJECT,
  barPremiumSource,
  isBarPremiumTemplate,
} from "@/lib/admin/email/templates/bar";
import {
  isRestaurantPremiumTemplate,
  RESTAURANT_TEMPLATE_SUBJECT,
  restaurantPremiumSource,
} from "@/lib/admin/email/templates/restaurant";
import { normalizeEmail } from "@/lib/admin/normalize";
import { isOutreachSendEnabled } from "@/lib/admin/outreach";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { companyIsCampaignEligible, isEmailSuppressed, suppressEmail } from "@/lib/admin/suppression";
import {
  assignMessageSchema,
  campaignSchema,
  composeSchema,
  sendTestEmailSchema,
  taskSchema,
  taskStatusSchema,
  templateSchema,
  type FormState,
} from "@/lib/admin/validation";

function touchCompany(id?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin/templates");
  revalidatePath("/admin/emails");
  revalidatePath("/admin/groups");
  if (id) {
    revalidatePath(`/admin/companies/${id}`);
    revalidatePath("/admin/companies");
  }
}

export async function composeEmailAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = composeSchema.safeParse({
    companyId: formData.get("companyId"),
    contactId: formData.get("contactId") || undefined,
    to: formData.get("to"),
    cc: formData.get("cc") || undefined,
    subject: formData.get("subject"),
    body: formData.get("body"),
    templateId: formData.get("templateId") || undefined,
    saveDraft: formData.get("intent") === "draft",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-posta geçersiz." };
  }

  if (await isEmailSuppressed(parsed.data.to)) {
    return { error: "Bu adres bastırılmış (do-not-contact / unsubscribe)." };
  }

  const prisma = getPrisma();
  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    include: { contacts: true },
  });
  if (!company) {
    return { error: "Firma bulunamadı." };
  }
  if (company.outreachStatus === "DO_NOT_CONTACT" || company.status === "DO_NOT_CONTACT") {
    return { error: "Bu firma iletişim dışı. Gönderim engellendi." };
  }

  const contact = parsed.data.contactId
    ? company.contacts.find((row) => row.id === parsed.data.contactId)
    : company.contacts.find((row) => row.isPrimary) ?? company.contacts[0];

  const template = parsed.data.templateId
    ? await prisma.emailTemplate.findUnique({ where: { id: parsed.data.templateId } })
    : null;
  const rendered = renderPersonalizedEmail({
    subject: parsed.data.subject,
    body: parsed.data.body,
    company,
    templateName: template?.name,
    templateCategory: template?.category,
  });
  const mergedSubject = rendered.subject;
  const mergedBody = rendered.bodyText;
  const mergedHtml =
    looksLikeHtmlEmail(parsed.data.body) ||
    isRestaurantPremiumTemplate(template ?? {}) ||
    isBarPremiumTemplate(template ?? {})
      ? rendered.bodyHtml
      : undefined;

  if (parsed.data.saveDraft) {
    await prisma.$transaction(async (tx) => {
      await tx.emailMessage.create({
        data: {
          companyId: company.id,
          contactId: contact?.id,
          threadId: randomUUID(),
          direction: "OUTBOUND",
          fromAddress: getOutreachFrom() || getEmailFrom() || session.email,
          toAddress: parsed.data.to,
          cc: parsed.data.cc,
          subject: mergedSubject,
          bodyText: mergedBody,
          bodyHtml: mergedHtml,
          status: "DRAFT",
          templateId: parsed.data.templateId,
        },
      });
      await recordActivity(tx, {
        type: "EMAIL_DRAFTED",
        message: `Taslak: ${mergedSubject}`,
        userId: session.userId,
        companyId: company.id,
      });
    });
    touchCompany(company.id);
    return { success: "Taslak kaydedildi. Gönderilmedi." };
  }

  if (!isOutreachSendEnabled()) {
    return {
      error: "Gerçek gönderim kapalı (OUTREACH_SEND_ENABLED). Test e-postası kullanın.",
    };
  }

  const provider = getEmailProvider();
  const sent = await provider.sendEmail({
    to: parsed.data.to,
    cc: parsed.data.cc,
    subject: mergedSubject,
    bodyText: mergedBody,
    bodyHtml: mergedHtml,
    fromName: OUTREACH_FROM_DISPLAY_NAME,
  });

  if (!sent.ok) {
    return { error: sent.error };
  }

  await prisma.$transaction(async (tx) => {
    await tx.emailMessage.create({
      data: {
        companyId: company.id,
        contactId: contact?.id,
        threadId: sent.threadId || sent.providerMessageId,
        providerMessageId: sent.providerMessageId,
        direction: "OUTBOUND",
        fromAddress: getOutreachFrom() || getEmailFrom() || session.email,
        toAddress: parsed.data.to,
        cc: parsed.data.cc,
        subject: mergedSubject,
        bodyText: mergedBody,
        bodyHtml: mergedHtml,
        sentAt: new Date(),
        status: "SENT",
        templateId: parsed.data.templateId,
      },
    });

    await tx.company.update({
      where: { id: company.id },
      data: {
        lastContactedAt: new Date(),
        status: company.status === "NEW" ? "CONTACTED" : company.status,
        outreachStatus: "SENT",
      },
    });

    await recordActivity(tx, {
      type: "EMAIL_SENT",
      message: `E-posta gönderildi: ${mergedSubject}`,
      userId: session.userId,
      companyId: company.id,
    });
  });

  touchCompany(company.id);
  return { success: "E-posta gönderildi." };
}

export async function sendTestEmailAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = sendTestEmailSchema.safeParse({
    companyId: formData.get("companyId"),
    templateId: formData.get("templateId"),
    testEmail: formData.get("testEmail"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Test e-postası geçersiz." };
  }

  const testEmail = normalizeEmail(parsed.data.testEmail);
  if (!testEmail) {
    return { error: "Geçerli bir test e-posta adresi girin." };
  }

  const prisma = getPrisma();
  const [company, template] = await Promise.all([
    prisma.company.findUnique({
      where: { id: parsed.data.companyId },
      include: { contacts: true },
    }),
    prisma.emailTemplate.findUnique({ where: { id: parsed.data.templateId } }),
  ]);
  if (!company) {
    return { error: "Firma bulunamadı." };
  }
  if (!template) {
    return { error: "Şablon bulunamadı." };
  }

  const bar = isBarPremiumTemplate(template);
  const restaurant = !bar && isRestaurantPremiumTemplate(template);
  const rendered = renderPersonalizedEmail({
    subject: bar ? BAR_TEMPLATE_SUBJECT : restaurant ? RESTAURANT_TEMPLATE_SUBJECT : template.subject,
    body: bar ? barPremiumSource() : restaurant ? restaurantPremiumSource() : template.body,
    company,
    templateName: template.name,
    templateCategory: template.category,
  });
  if (rendered.unresolved) {
    return { error: "Şablonda çözülmemiş merge alanı var. Test gönderilmedi." };
  }

  const provider = getEmailProvider();
  if (!provider.configured) {
    return { error: "E-posta sağlayıcısı yapılandırılmadı. RESEND_API_KEY ve EMAIL_FROM ekleyin." };
  }

  const sent = await provider.sendEmail({
    to: testEmail,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml,
    fromName: OUTREACH_FROM_DISPLAY_NAME,
  });
  if (!sent.ok) {
    return { error: sent.error };
  }

  return { success: `Test e-postası gönderildi: ${testEmail}` };
}

export async function createTaskAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = taskSchema.safeParse({
    companyId: formData.get("companyId"),
    contactId: formData.get("contactId") || undefined,
    title: formData.get("title"),
    dueAt: formData.get("dueAt"),
    type: formData.get("type") || "FOLLOW_UP",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Görev geçersiz." };
  }

  const dueAt = new Date(parsed.data.dueAt);
  if (Number.isNaN(dueAt.getTime())) {
    return { error: "Geçerli bir tarih girin." };
  }

  await getPrisma().$transaction(async (tx) => {
    await tx.task.create({
      data: {
        companyId: parsed.data.companyId,
        contactId: parsed.data.contactId,
        authorId: session.userId,
        title: parsed.data.title,
        dueAt,
        type: parsed.data.type,
        notes: parsed.data.notes,
      },
    });

    if (parsed.data.type === "FOLLOW_UP" || parsed.data.type === "MEETING") {
      await tx.company.update({
        where: { id: parsed.data.companyId },
        data: { nextFollowUpAt: dueAt },
      });
    }

    await recordActivity(tx, {
      type: parsed.data.type === "MEETING" ? "MEETING_ADDED" : "FOLLOW_UP_SCHEDULED",
      message: parsed.data.title,
      userId: session.userId,
      companyId: parsed.data.companyId,
      metadata: { dueAt: dueAt.toISOString(), type: parsed.data.type },
    });
  });

  touchCompany(parsed.data.companyId);
  return { success: "Görev oluşturuldu." };
}

export async function updateTaskStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = taskStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const task = await getPrisma().task.update({
    where: { id: parsed.data.taskId },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "COMPLETED") {
    await recordActivity(getPrisma(), {
      type: "TASK_COMPLETED",
      message: `${task.title} tamamlandı.`,
      userId: session.userId,
      companyId: task.companyId,
    });
  }

  touchCompany(task.companyId);
}

export async function createTemplateAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = templateSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    language: formData.get("language") || "tr",
    active: formData.get("active") !== "off",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Şablon geçersiz." };
  }

  await getPrisma().$transaction(async (tx) => {
    await tx.emailTemplate.create({
      data: {
        ...parsed.data,
        active: parsed.data.active ?? true,
        authorId: session.userId,
      },
    });
    await recordActivity(tx, {
      type: "TEMPLATE_CREATED",
      message: `Şablon: ${parsed.data.name}`,
      userId: session.userId,
    });
  });

  revalidatePath("/admin/templates");
  return { success: "Şablon kaydedildi." };
}

export async function toggleTemplateAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("templateId") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await getPrisma().emailTemplate.update({
    where: { id },
    data: { active },
  });
  revalidatePath("/admin/templates");
}

export async function createCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    templateId: formData.get("templateId") || undefined,
    industry: formData.get("industry") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
    statusFilter: formData.get("statusFilter") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kampanya geçersiz." };
  }

  const prisma = getPrisma();
  const companies = await prisma.company.findMany({
    where: {
      archivedAt: null,
      status: parsed.data.statusFilter ?? { not: "DO_NOT_CONTACT" },
      industry: parsed.data.industry
        ? { equals: parsed.data.industry, mode: "insensitive" }
        : undefined,
      city: parsed.data.city ? { contains: parsed.data.city, mode: "insensitive" } : undefined,
      country: parsed.data.country
        ? { contains: parsed.data.country, mode: "insensitive" }
        : undefined,
    },
    select: { id: true },
  });

  const eligibleIds: string[] = [];
  for (const company of companies) {
    if (await companyIsCampaignEligible(company.id)) {
      eligibleIds.push(company.id);
    }
  }

  await prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        status: "DRAFT",
        templateId: parsed.data.templateId,
        filtersJson: JSON.stringify({
          industry: parsed.data.industry,
          city: parsed.data.city,
          country: parsed.data.country,
          statusFilter: parsed.data.statusFilter,
        }),
        authorId: session.userId,
        recipients: {
          create: eligibleIds.map((companyId) => ({ companyId })),
        },
      },
    });
    await recordActivity(tx, {
      type: "CAMPAIGN_CREATED",
      message: `Kampanya taslağı: ${campaign.name} (${eligibleIds.length} alıcı)`,
      userId: session.userId,
    });
  });

  revalidatePath("/admin/campaigns");
  return {
    success: `Taslak kampanya oluşturuldu. ${eligibleIds.length} uygun alıcı. Toplu gönderim V1'de kapalı.`,
  };
}

export async function assignMessageAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = assignMessageSchema.safeParse({
    messageId: formData.get("messageId"),
    companyId: formData.get("companyId"),
    contactId: formData.get("contactId") || undefined,
  });
  if (!parsed.success) {
    return { error: "Eşleştirme geçersiz." };
  }

  await getPrisma().$transaction(async (tx) => {
    const message = await tx.emailMessage.update({
      where: { id: parsed.data.messageId },
      data: {
        companyId: parsed.data.companyId,
        contactId: parsed.data.contactId,
      },
    });
    if (message.direction === "INBOUND") {
      await tx.emailMessage.update({
        where: { id: message.id },
        data: { status: "REPLIED" },
      });
      await tx.company.update({
        where: { id: parsed.data.companyId },
        data: { outreachStatus: "REPLIED" },
      });
      await recordActivity(tx, {
        type: "REPLY_RECEIVED",
        message: "Yanıt firmaya bağlandı.",
        userId: session.userId,
        companyId: parsed.data.companyId,
      });
    }
    await recordActivity(tx, {
      type: "MESSAGE_ASSIGNED",
      message: "Mesaj firmaya bağlandı.",
      userId: session.userId,
      companyId: parsed.data.companyId,
    });
  });

  touchCompany(parsed.data.companyId);
  return { success: "Mesaj eşleştirildi." };
}

export async function assignMessageForm(formData: FormData) {
  await assignMessageAction({}, formData);
}

export async function syncInboxForm(formData: FormData) {
  void formData;
  await syncInboxAction();
}

export async function syncInboxAction(): Promise<FormState> {
  await requireAdmin();
  const result = await getEmailProvider().syncInbox();
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin/inbox");
  return { success: `${result.imported} mesaj içe aktarıldı.` };
}

export async function addSuppressionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const email = String(formData.get("email") ?? "");
  const emailNorm = normalizeEmail(email);
  if (!emailNorm) {
    return { error: "Geçerli bir e-posta girin." };
  }

  await suppressEmail(getPrisma(), {
    email,
    reason: "MANUAL",
    notes: String(formData.get("notes") ?? "") || null,
  });
  await recordActivity(getPrisma(), {
    type: "MARKED_DO_NOT_CONTACT",
    message: `${emailNorm} bastırıldı.`,
    userId: session.userId,
  });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/suppression");
  return { success: "Adres bastırıldı." };
}

export async function seedExampleTemplateForm(formData: FormData) {
  void formData;
  await seedExampleTemplateAction();
}

export async function seedExampleTemplateAction(): Promise<FormState> {
  const session = await requireAdmin();
  const prisma = getPrisma();
  const existing = await prisma.emailTemplate.findFirst({
    where: { name: "Website önerisi" },
  });
  if (existing) {
    return { success: "Örnek şablon zaten var." };
  }

  await prisma.emailTemplate.create({
    data: {
      name: "Website önerisi",
      category: "GENEL",
      language: "tr",
      active: true,
      authorId: session.userId,
      subject: "Web siteniz hakkında kısa bir öneri",
      body: `Merhaba {{companyName}} ekibi,

Web sitenizi incelerken birkaç geliştirme fırsatı fark ettik.

SALKAY olarak modern web tasarımı, özel yazılım ve dijital büyüme çözümleri geliştiriyoruz.

İsterseniz mevcut siteniz için kısa ve ücretsiz bir değerlendirme paylaşabiliriz.

Saygılarımla,
Salih
SALKAY`,
    },
  });
  revalidatePath("/admin/templates");
  return { success: "Örnek şablon eklendi. Otomatik gönderim yok." };
}
