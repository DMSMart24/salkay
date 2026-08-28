"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CompanyStatus } from "@prisma/client";
import { recordActivity } from "@/lib/admin/activity";
import { companyStatusLabels } from "@/lib/admin/labels";
import { normalizeDomain, normalizeEmail, normalizeWebsite, splitTags } from "@/lib/admin/normalize";
import { parseStringList } from "@/lib/admin/outreach";
import { getPrisma } from "@/lib/admin/prisma";
import { findCompanyDuplicates } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";
import { suppressEmail } from "@/lib/admin/suppression";
import {
  bulkStatusSchema,
  companySchema,
  contactSchema,
  noteSchema,
  statusSchema,
  type FormState,
} from "@/lib/admin/validation";

function revalidateCompany(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/emails");
  if (id) revalidatePath(`/admin/companies/${id}`);
}

function companyPayload(formData: FormData, confirmDuplicate: boolean) {
  return companySchema.safeParse({
    companyName: formData.get("companyName"),
    website: formData.get("website") || undefined,
    domain: formData.get("domain") || undefined,
    industry: formData.get("industry") || undefined,
    city: formData.get("city") || undefined,
    district: formData.get("district") || undefined,
    country: formData.get("country") || undefined,
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    generalEmail: formData.get("generalEmail") || undefined,
    source: formData.get("source") || undefined,
    notes: formData.get("notes") || undefined,
    status: formData.get("status") || "NEW",
    outreachStatus: formData.get("outreachStatus") || "NEW",
    websiteScore: formData.get("websiteScore") || undefined,
    websiteStatus: formData.get("websiteStatus") || "UNKNOWN",
    websiteIssues: formData.get("websiteIssues") || undefined,
    recommendedServices: formData.get("recommendedServices") || undefined,
    researchSource: formData.get("researchSource") || undefined,
    groupId: formData.get("groupId") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    tags: formData.get("tags") || undefined,
    confirmDuplicate,
  });
}

export async function createCompanyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = companyPayload(formData, formData.get("confirmDuplicate") === "on");

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz firma." };
  }

  const website = normalizeWebsite(parsed.data.website);
  const domain = normalizeDomain(parsed.data.domain || parsed.data.website);
  const generalEmail = normalizeEmail(parsed.data.generalEmail);
  const duplicates = await findCompanyDuplicates({
    domain,
    generalEmail,
    companyName: parsed.data.companyName,
    city: parsed.data.city,
  });

  if (duplicates.length > 0 && !parsed.data.confirmDuplicate) {
    return {
      error: "Olası kopya bulundu. Onaylamadan oluşturulamıyor.",
      warnings: duplicates.map(
        (row) => `${row.companyName}${row.domain ? ` · ${row.domain}` : ""}`,
      ),
    };
  }

  const company = await getPrisma().$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        companyName: parsed.data.companyName,
        website,
        domain,
        industry: parsed.data.industry,
        city: parsed.data.city,
        district: parsed.data.district,
        country: parsed.data.country,
        address: parsed.data.address,
        phone: parsed.data.phone,
        generalEmail,
        source: parsed.data.source,
        notes: parsed.data.notes,
        status: parsed.data.status,
        outreachStatus: parsed.data.outreachStatus ?? "NEW",
        websiteScore: parsed.data.websiteScore ?? null,
        websiteStatus: parsed.data.websiteStatus ?? "UNKNOWN",
        websiteIssues: parseStringList(parsed.data.websiteIssues),
        recommendedServices: parseStringList(parsed.data.recommendedServices),
        researchSource: parsed.data.researchSource,
        researchedAt: parsed.data.researchSource || parsed.data.websiteScore ? new Date() : null,
        groupId: parsed.data.groupId,
        priority: parsed.data.priority,
        tags: splitTags(parsed.data.tags),
        assignedToId: session.userId,
      },
    });

    await recordActivity(tx, {
      type: "COMPANY_CREATED",
      message: `${created.companyName} eklendi.`,
      userId: session.userId,
      companyId: created.id,
    });

    return created;
  });

  revalidateCompany(company.id);
  redirect(`/admin/companies/${company.id}`);
}

export async function updateCompanyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const id = String(formData.get("companyId") ?? "");
  const parsed = companyPayload(formData, true);

  if (!id || !parsed.success) {
    return { error: parsed.success ? "Firma bulunamadı." : parsed.error.issues[0]?.message };
  }

  await getPrisma().$transaction(async (tx) => {
    await tx.company.update({
      where: { id },
      data: {
        companyName: parsed.data.companyName,
        website: normalizeWebsite(parsed.data.website),
        domain: normalizeDomain(parsed.data.domain || parsed.data.website),
        industry: parsed.data.industry,
        city: parsed.data.city,
        district: parsed.data.district,
        country: parsed.data.country,
        address: parsed.data.address,
        phone: parsed.data.phone,
        generalEmail: normalizeEmail(parsed.data.generalEmail),
        source: parsed.data.source,
        notes: parsed.data.notes,
        status: parsed.data.status,
        outreachStatus: parsed.data.outreachStatus ?? "NEW",
        websiteScore: parsed.data.websiteScore ?? null,
        websiteStatus: parsed.data.websiteStatus ?? "UNKNOWN",
        websiteIssues: parseStringList(parsed.data.websiteIssues),
        recommendedServices: parseStringList(parsed.data.recommendedServices),
        researchSource: parsed.data.researchSource,
        researchedAt: parsed.data.researchSource || parsed.data.websiteScore ? new Date() : null,
        groupId: parsed.data.groupId ?? null,
        priority: parsed.data.priority,
        tags: splitTags(parsed.data.tags),
      },
    });
    await recordActivity(tx, {
      type: "COMPANY_UPDATED",
      message: "Firma bilgileri güncellendi.",
      userId: session.userId,
      companyId: id,
    });
  });

  revalidateCompany(id);
  return { success: "Firma güncellendi." };
}

export async function changeCompanyStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = statusSchema.safeParse({
    companyId: formData.get("companyId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: "Durum geçersiz." };
  }

  const prisma = getPrisma();
  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    include: { contacts: true },
  });
  if (!company) {
    return { error: "Firma bulunamadı." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: company.id },
      data: { status: parsed.data.status },
    });

    if (parsed.data.status === "DO_NOT_CONTACT") {
      const emails = [company.generalEmail, ...company.contacts.map((row) => row.email)].filter(
        Boolean,
      ) as string[];
      for (const email of emails) {
        await suppressEmail(tx, {
          email,
          reason: "DO_NOT_CONTACT",
          companyId: company.id,
        });
      }
      await recordActivity(tx, {
        type: "MARKED_DO_NOT_CONTACT",
        message: "Firma iletişim dışı bırakıldı.",
        userId: session.userId,
        companyId: company.id,
      });
    } else {
      await recordActivity(tx, {
        type: "STATUS_CHANGED",
        message: `Durum: ${companyStatusLabels[company.status]} → ${companyStatusLabels[parsed.data.status]}`,
        userId: session.userId,
        companyId: company.id,
        metadata: { from: company.status, to: parsed.data.status },
      });
    }
  });

  revalidateCompany(company.id);
  return { success: "Durum güncellendi." };
}

export async function changeCompanyStatusForm(formData: FormData) {
  await changeCompanyStatusAction({}, formData);
}

export async function bulkChangeStatusForm(formData: FormData) {
  await bulkChangeStatusAction(formData);
}

export async function archiveCompanyAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("companyId") ?? "");
  if (!id) return;
  await getPrisma().$transaction(async (tx) => {
    await tx.company.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
    await recordActivity(tx, {
      type: "COMPANY_UPDATED",
      message: "Firma arşivlendi.",
      userId: session.userId,
      companyId: id,
    });
  });
  revalidateCompany(id);
}

export async function bulkChangeStatusAction(formData: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = bulkStatusSchema.safeParse({
    companyIds: formData.getAll("companyIds").map(String),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: "Toplu işlem geçersiz." };
  }

  for (const companyId of parsed.data.companyIds) {
    const data = new FormData();
    data.set("companyId", companyId);
    data.set("status", parsed.data.status);
    await changeCompanyStatusAction({}, data);
  }

  void session;
  return { success: "Toplu durum güncellendi." };
}

export async function addContactAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = contactSchema.safeParse({
    companyId: formData.get("companyId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    linkedin: formData.get("linkedin") || undefined,
    isPrimary: formData.get("isPrimary") === "on",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kişi geçersiz." };
  }

  const emailNorm = normalizeEmail(parsed.data.email);
  const prisma = getPrisma();
  if (emailNorm) {
    const existing = await prisma.contact.findUnique({ where: { emailNorm } });
    if (existing) {
      return { error: "Bu e-posta zaten başka bir kişide kayıtlı." };
    }
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isPrimary) {
      await tx.contact.updateMany({
        where: { companyId: parsed.data.companyId },
        data: { isPrimary: false },
      });
    }

    const created = await tx.contact.create({
      data: {
        companyId: parsed.data.companyId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        role: parsed.data.role,
        email: parsed.data.email || null,
        emailNorm,
        phone: parsed.data.phone,
        linkedin: parsed.data.linkedin,
        isPrimary: Boolean(parsed.data.isPrimary),
        notes: parsed.data.notes,
      },
    });

    await recordActivity(tx, {
      type: "CONTACT_ADDED",
      message: `${created.firstName} ${created.lastName} eklendi.`,
      userId: session.userId,
      companyId: parsed.data.companyId,
    });
  });

  revalidateCompany(parsed.data.companyId);
  return { success: "Kişi eklendi." };
}

export async function addNoteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = noteSchema.safeParse({
    companyId: formData.get("companyId"),
    contactId: formData.get("contactId") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Not geçersiz." };
  }

  await getPrisma().$transaction(async (tx) => {
    await tx.note.create({
      data: {
        companyId: parsed.data.companyId,
        contactId: parsed.data.contactId,
        authorId: session.userId,
        body: parsed.data.body,
      },
    });
    await recordActivity(tx, {
      type: "NOTE_CREATED",
      message: "Not eklendi.",
      userId: session.userId,
      companyId: parsed.data.companyId,
    });
  });

  revalidateCompany(parsed.data.companyId);
  revalidatePath("/admin/tasks");
  return { success: "Not kaydedildi." };
}

export async function applyQuickStatus(companyId: string, status: CompanyStatus) {
  const data = new FormData();
  data.set("companyId", companyId);
  data.set("status", status);
  return changeCompanyStatusAction({}, data);
}
