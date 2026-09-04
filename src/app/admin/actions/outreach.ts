"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import type { OutreachStatus } from "@prisma/client";
import { recordActivity } from "@/lib/admin/activity";
import { OUTREACH_FROM_DISPLAY_NAME } from "@/lib/admin/email/from";
import { getEmailFrom, getEmailProvider, getOutreachFrom } from "@/lib/admin/email/provider";
import { renderFromTemplate } from "@/lib/admin/email/render";
import { FOLLOW_UP_STOPPED_TAG, nextFollowUpAtAfterSend } from "@/lib/admin/email/sequence";
import { normalizeEmail } from "@/lib/admin/normalize";
import {
  assertBulkRateLimit,
  DEFAULT_BATCH_SIZE,
  evaluateSendEligibility,
  getBatchSize,
  isOutreachSendEnabled,
} from "@/lib/admin/outreach";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { suppressDomain, suppressEmail } from "@/lib/admin/suppression";
import {
  bulkOutreachSchema,
  moveToGroupSchema,
  outreachStatusSchema,
  suppressionSchema,
  type FormState,
} from "@/lib/admin/validation";

export type BulkRecipientPreview = {
  companyId: string;
  companyName: string;
  email: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  score?: string;
  issues?: string[];
};

export type BulkSkippedPreview = {
  companyId: string;
  companyName: string;
  reason: string;
};

export type BulkPreviewState = FormState & {
  recipients?: BulkRecipientPreview[];
  skipped?: BulkSkippedPreview[];
  groupId?: string;
  recipientMode?: string;
  templateId?: string;
  templateName?: string;
  websiteScoreMin?: string;
  allowResend?: boolean;
  batchSize?: string;
  companyIds?: string[];
};

function touchOutreach(ids: string[] = []) {
  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/emails");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/suppression");
  for (const id of ids) {
    revalidatePath(`/admin/companies/${id}`);
  }
}

async function applyOutreachStatus(
  companyId: string,
  outreachStatus: OutreachStatus,
  userId: string,
) {
  const prisma = getPrisma();
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { contacts: true },
  });
  if (!company) return;

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: {
        outreachStatus,
        status: outreachStatus === "DO_NOT_CONTACT" ? "DO_NOT_CONTACT" : company.status,
      },
    });

    if (outreachStatus === "DO_NOT_CONTACT") {
      const emails = [company.generalEmail, ...company.contacts.map((row) => row.email)].filter(
        Boolean,
      ) as string[];
      for (const email of emails) {
        await suppressEmail(tx, {
          email,
          reason: "DO_NOT_CONTACT",
          companyId,
          source: "do-not-contact",
        });
      }
      await recordActivity(tx, {
        type: "MARKED_DO_NOT_CONTACT",
        message: "Firma iletişim dışı bırakıldı.",
        userId,
        companyId,
      });
    } else {
      await recordActivity(tx, {
        type: "STATUS_CHANGED",
        message: `Outreach: ${outreachStatus}`,
        userId,
        companyId,
      });
    }
  });
}

export async function changeOutreachStatusForm(formData: FormData) {
  const session = await requireAdmin();
  const parsed = outreachStatusSchema.safeParse({
    companyId: formData.get("companyId"),
    outreachStatus: formData.get("outreachStatus"),
  });
  if (!parsed.success) return;
  await applyOutreachStatus(parsed.data.companyId, parsed.data.outreachStatus, session.userId);
  touchOutreach([parsed.data.companyId]);
}

export async function bulkChangeOutreachForm(formData: FormData) {
  const session = await requireAdmin();
  const parsed = bulkOutreachSchema.safeParse({
    companyIds: formData.getAll("companyIds").map(String),
    outreachStatus: formData.get("outreachStatus"),
  });
  if (!parsed.success) return;
  for (const companyId of parsed.data.companyIds) {
    await applyOutreachStatus(companyId, parsed.data.outreachStatus, session.userId);
  }
  touchOutreach(parsed.data.companyIds);
}

export async function moveCompaniesToGroupForm(formData: FormData) {
  await requireAdmin();
  const parsed = moveToGroupSchema.safeParse({
    companyIds: formData.getAll("companyIds").map(String),
    groupId: formData.get("groupId"),
  });
  if (!parsed.success) return;
  await getPrisma().company.updateMany({
    where: { id: { in: parsed.data.companyIds } },
    data: { groupId: parsed.data.groupId },
  });
  touchOutreach(parsed.data.companyIds);
  revalidatePath(`/admin/groups/${parsed.data.groupId}`);
}

export async function addCompaniesToGroupForm(formData: FormData) {
  await moveCompaniesToGroupForm(formData);
}

export async function suppressSelectedForm(formData: FormData) {
  const session = await requireAdmin();
  const companyIds = formData.getAll("companyIds").map(String).filter(Boolean);
  const prisma = getPrisma();
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    include: { contacts: true },
  });
  for (const company of companies) {
    await applyOutreachStatus(company.id, "DO_NOT_CONTACT", session.userId);
  }
  touchOutreach(companyIds);
}

export async function addSuppressionRecordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = suppressionSchema.safeParse({
    email: formData.get("email") || undefined,
    domain: formData.get("domain") || undefined,
    reason: formData.get("reason") || "MANUAL",
    notes: formData.get("notes") || undefined,
    source: formData.get("source") || "manual",
    companyId: formData.get("companyId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Sperrliste kaydı geçersiz." };
  }

  if (parsed.data.domain && !parsed.data.email) {
    await suppressDomain(getPrisma(), {
      domain: parsed.data.domain,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
      source: parsed.data.source,
      companyId: parsed.data.companyId,
    });
  } else if (parsed.data.email) {
    await suppressEmail(getPrisma(), {
      email: parsed.data.email,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
      source: parsed.data.source,
      companyId: parsed.data.companyId,
    });
  }

  await recordActivity(getPrisma(), {
    type: "MARKED_DO_NOT_CONTACT",
    message: `${parsed.data.email || parsed.data.domain} sperrlistesine eklendi.`,
    userId: session.userId,
  });
  revalidatePath("/admin/suppression");
  revalidatePath("/admin/settings");
  return { success: "Sperrliste güncellendi." };
}

async function loadBulkCandidates(formData: FormData) {
  const prisma = getPrisma();
  const groupId = String(formData.get("groupId") ?? "") || undefined;
  const mode = String(formData.get("recipientMode") ?? "selected");
  const selectedIds = formData.getAll("companyIds").map(String).filter(Boolean);
  const scoreMin = Number(formData.get("websiteScoreMin") || 0);
  const allowResend = formData.get("allowResend") === "on" || formData.get("allowResend") === "true";

  const hasEmailClause = {
    OR: [
      { generalEmail: { not: null } },
      { contacts: { some: { email: { not: null } } } },
    ],
  };

  const where = {
    archivedAt: null,
    ...(groupId ? { groupId } : {}),
    ...(mode === "selected" ? { id: { in: selectedIds } } : {}),
    ...(mode === "unsent" ? { outreachStatus: { in: ["NEW", "READY"] as OutreachStatus[] } } : {}),
    ...(mode === "score" && scoreMin ? { websiteScore: { gte: scoreMin } } : {}),
    ...(mode === "selected" ? {} : hasEmailClause),
  };

  const companies = await prisma.company.findMany({
    where,
    include: {
      contacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
    },
    take: 200,
  });

  return { companies, allowResend, mode };
}

export async function previewBulkSendAction(
  _prev: BulkPreviewState,
  formData: FormData,
): Promise<BulkPreviewState> {
  await requireAdmin();
  const templateId = String(formData.get("templateId") ?? "");
  if (!templateId) {
    return { error: "Şablon seçin." };
  }

  const template = await getPrisma().emailTemplate.findUnique({ where: { id: templateId } });
  if (!template || !template.active) {
    return { error: "Aktif şablon bulunamadı." };
  }

  const { companies, allowResend } = await loadBulkCandidates(formData);
  const recipients: BulkRecipientPreview[] = [];
  const skipped: BulkSkippedPreview[] = [];

  for (const company of companies) {
    const eligibility = await evaluateSendEligibility({ ...company, allowResend });
    if (!eligibility.ok) {
      skipped.push({ companyId: company.id, companyName: company.companyName, reason: eligibility.reason });
      continue;
    }
    const rendered = renderFromTemplate(template, company);
    recipients.push({
      companyId: company.id,
      companyName: company.companyName,
      email: eligibility.email,
      subject: rendered.subject,
      body: rendered.bodyText,
      bodyHtml: rendered.bodyHtml,
      score: rendered.context.scoreLabel,
      issues: rendered.context.issues,
    });
  }

  return {
    recipients,
    skipped,
    groupId: String(formData.get("groupId") ?? ""),
    recipientMode: String(formData.get("recipientMode") ?? "selected"),
    templateId,
    templateName: template.name,
    websiteScoreMin: String(formData.get("websiteScoreMin") ?? ""),
    allowResend: formData.get("allowResend") === "on" || formData.get("allowResend") === "true",
    batchSize: String(formData.get("batchSize") ?? "20"),
    companyIds: formData.getAll("companyIds").map(String).filter(Boolean),
    success: `${recipients.length} alıcı hazır. ${skipped.length} atlandı. Gerçek gönderim yok.`,
  };
}

export async function queueBulkSendAction(
  _prev: BulkPreviewState,
  formData: FormData,
): Promise<BulkPreviewState> {
  const session = await requireAdmin();
  if (formData.get("confirm") !== "on" && formData.get("confirm") !== "true") {
    return { error: "Gönderim için açık onay gerekli." };
  }

  const limited = assertBulkRateLimit(session.userId);
  if (limited) {
    return { error: limited };
  }

  const preview = await previewBulkSendAction({}, formData);
  if (preview.error || !preview.recipients?.length) {
    return preview.error ? preview : { error: "Uygun alıcı yok.", skipped: preview.skipped };
  }

  const batchSize = getBatchSize(String(formData.get("batchSize") || DEFAULT_BATCH_SIZE));
  const batch = preview.recipients.slice(0, batchSize);
  const templateId = String(formData.get("templateId") ?? "") || null;
  const sendEnabled = isOutreachSendEnabled();
  const provider = getEmailProvider();
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    for (const recipient of batch) {
      const company = await tx.company.findUnique({
        where: { id: recipient.companyId },
        include: { contacts: true },
      });
      if (!company) continue;
      const eligibility = await evaluateSendEligibility({ ...company, allowResend: formData.get("allowResend") === "on" });
      if (!eligibility.ok) continue;

      const contact = company.contacts.find((row) => row.isPrimary) ?? company.contacts[0];
      const message = await tx.emailMessage.create({
        data: {
          companyId: company.id,
          contactId: contact?.id,
          threadId: randomUUID(),
          direction: "OUTBOUND",
          fromAddress: getOutreachFrom() || getEmailFrom() || session.email,
          toAddress: eligibility.email,
          subject: recipient.subject,
          bodyText: recipient.body,
          bodyHtml: recipient.bodyHtml,
          status: sendEnabled ? "QUEUED" : "DRAFT",
          templateId,
        },
      });

      if (sendEnabled && provider.configured) {
        await tx.emailMessage.update({
          where: { id: message.id },
          data: { status: "SENDING" },
        });
        const sent = await provider.sendEmail({
          to: eligibility.email,
          subject: recipient.subject,
          bodyText: recipient.body,
          bodyHtml: recipient.bodyHtml,
          fromName: OUTREACH_FROM_DISPLAY_NAME,
        });
        if (sent.ok) {
          await tx.emailMessage.update({
            where: { id: message.id },
            data: {
              status: "SENT",
              providerMessageId: sent.providerMessageId,
              threadId: sent.threadId || sent.providerMessageId,
              sentAt: new Date(),
            },
          });
          await tx.company.update({
            where: { id: company.id },
            data: {
              lastContactedAt: new Date(),
              outreachStatus: "SENT",
              nextFollowUpAt: nextFollowUpAtAfterSend(0),
            },
          });
        } else {
          await tx.emailMessage.update({
            where: { id: message.id },
            data: { status: "FAILED", failureReason: sent.error },
          });
          await tx.company.update({
            where: { id: company.id },
            data: { outreachStatus: "FAILED" },
          });
        }
      } else {
        await recordActivity(tx, {
          type: "EMAIL_QUEUED",
          message: `Taslak/kuyruk: ${recipient.subject}`,
          userId: session.userId,
          companyId: company.id,
        });
      }
    }

    await recordActivity(tx, {
      type: sendEnabled ? "EMAIL_SENT" : "EMAIL_QUEUED",
      message: sendEnabled
        ? `${batch.length} e-posta gönderim denemesi.`
        : `${batch.length} e-posta taslak olarak kaydedildi. Gerçek gönderim kapalı.`,
      userId: session.userId,
    });
  });

  touchOutreach(batch.map((row) => row.companyId));
  return {
    recipients: batch,
    skipped: preview.skipped,
    success: sendEnabled
      ? `${batch.length} alıcı işlendi.`
      : `Test modu: ${batch.length} taslak kaydedildi. OUTREACH_SEND_ENABLED açık değil; gerçek e-posta gitmedi.`,
  };
}

export async function markDoNotContactForm(formData: FormData) {
  const data = new FormData();
  data.set("companyId", String(formData.get("companyId") ?? ""));
  data.set("outreachStatus", "DO_NOT_CONTACT");
  await changeOutreachStatusForm(data);
}

export async function markCompanyRepliedForm(formData: FormData) {
  const data = new FormData();
  data.set("companyId", String(formData.get("companyId") ?? ""));
  data.set("outreachStatus", "REPLIED");
  await changeOutreachStatusForm(data);
}

export async function stopFollowUpSequenceForm(formData: FormData) {
  await requireAdmin();
  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId) return;
  const company = await getPrisma().company.findUnique({
    where: { id: companyId },
    select: { tags: true },
  });
  if (!company) return;
  const tags = company.tags.includes(FOLLOW_UP_STOPPED_TAG)
    ? company.tags
    : [...company.tags, FOLLOW_UP_STOPPED_TAG];
  await getPrisma().company.update({
    where: { id: companyId },
    data: { tags, nextFollowUpAt: null },
  });
  touchOutreach([companyId]);
}

export async function publicUnsubscribeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const emailNorm = normalizeEmail(email);
  if (!emailNorm) {
    return { error: "Geçerli bir e-posta girin." };
  }

  await suppressEmail(getPrisma(), {
    email,
    reason: "UNSUBSCRIBE",
    source: "unsubscribe",
    notes: "Public unsubscribe form",
  });
  return { success: "Adres listenizden çıkarıldı. Tekrar iletişime geçilmeyecek." };
}
