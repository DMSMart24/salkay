"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { getPrisma } from "@/lib/admin/prisma";
import { companiesRestaurantHref } from "@/lib/admin/restaurant-industry";
import {
  findRestaurantLeadDuplicate,
  getRestaurantLead,
  parseLeadDate,
  sanitizeRestaurantLeadWrite,
} from "@/lib/admin/restaurant-leads";
import {
  attachRestaurantLeadDuplicates,
  isImportableLead,
  isUpdatableLead,
  parseRestaurantLeadCsv,
  parseRestaurantLeadImportMode,
  parseRestaurantLeadXlsx,
  summarizeRestaurantLeadPreview,
  buildRestaurantLeadUpdatePatch,
  type RestaurantLeadImportStats,
  type RestaurantLeadPreviewRow,
} from "@/lib/admin/restaurant-leads-import";
import {
  restaurantLeadSchema,
  restaurantLeadSalesSchema,
  restaurantLeadStatusSchema,
  type FormState,
} from "@/lib/admin/validation";

function revalidateLeads(id?: string) {
  revalidatePath("/admin/restaurant-leads");
  revalidatePath("/admin/restaurant-leads/import");
  revalidatePath("/admin/companies");
  if (id) revalidatePath(`/admin/restaurant-leads/${id}`);
}

function leadPayload(formData: FormData) {
  return restaurantLeadSchema.safeParse({
    restaurantName: formData.get("restaurantName"),
    district: formData.get("district"),
    region: formData.get("region") || undefined,
    neighborhood: formData.get("neighborhood") || undefined,
    address: formData.get("address") || undefined,
    website: formData.get("website") || undefined,
    websiteDomain: formData.get("websiteDomain") || undefined,
    websiteStatus: formData.get("websiteStatus") || "NOT_VERIFIED",
    websiteScore: formData.get("websiteScore") || undefined,
    leadScore: formData.get("leadScore") || undefined,
    priority: formData.get("priority") || "PENDING",
    publicEmail: formData.get("publicEmail") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    instagram: formData.get("instagram") || undefined,
    googleMapsUrl: formData.get("googleMapsUrl") || undefined,
    googleRating: formData.get("googleRating") || undefined,
    googleReviewCount: formData.get("googleReviewCount") || undefined,
    category: formData.get("category") || undefined,
    problem1: formData.get("problem1") || undefined,
    problem2: formData.get("problem2") || undefined,
    problem3: formData.get("problem3") || undefined,
    websiteAnalysis: formData.get("websiteAnalysis") || undefined,
    opportunities: formData.get("opportunities") || undefined,
    salkayPitch: formData.get("salkayPitch") || undefined,
    source: formData.get("source") || undefined,
    dateChecked: formData.get("dateChecked") || undefined,
    contactStatus: formData.get("contactStatus") || "NOT_CONTACTED",
    outreachNotes: formData.get("outreachNotes") || undefined,
  });
}

export async function createRestaurantLeadAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = leadPayload(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz restoran lead." };
  }

  const data = sanitizeRestaurantLeadWrite(parsed.data);
  const duplicate = await findRestaurantLeadDuplicate({
    restaurantName: data.restaurantName,
    district: data.district,
  });
  if (duplicate) {
    return {
      error: "Aynı restoran bu ilçede zaten kayıtlı. Mevcut kayıt silinmedi veya üzerine yazılmadı.",
      warnings: [`${duplicate.restaurantName} · ${duplicate.district} → /admin/restaurant-leads/${duplicate.id}`],
    };
  }

  const created = await getPrisma().restaurantLead.create({ data });
  revalidateLeads(created.id);
  redirect(`/admin/restaurant-leads/${created.id}`);
}

export async function updateRestaurantLeadAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("leadId") ?? "");
  const parsed = leadPayload(formData);
  if (!id || !parsed.success) {
    return { error: parsed.success ? "Lead bulunamadı." : parsed.error.issues[0]?.message };
  }

  const existing = await getRestaurantLead(id);
  if (!existing) {
    return { error: "Lead bulunamadı." };
  }

  const data = sanitizeRestaurantLeadWrite(parsed.data);
  const duplicate = await findRestaurantLeadDuplicate({
    restaurantName: data.restaurantName,
    district: data.district,
    excludeId: id,
  });
  if (duplicate) {
    return {
      error: "Aynı restoran bu ilçede zaten kayıtlı. Mevcut kayıt silinmedi veya üzerine yazılmadı.",
      warnings: [`${duplicate.restaurantName} · ${duplicate.district}`],
    };
  }

  try {
    await getPrisma().restaurantLead.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Aynı restoran bu ilçede zaten kayıtlı." };
    }
    throw error;
  }

  revalidateLeads(id);
  return { success: "Lead güncellendi." };
}

export async function deleteRestaurantLeadForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("leadId") ?? "");
  if (!id) return;
  await getPrisma().restaurantLead.delete({ where: { id } }).catch(() => undefined);
  revalidateLeads();
  redirect(companiesRestaurantHref());
}

export async function updateRestaurantLeadStatusForm(formData: FormData) {
  await requireAdmin();
  const parsed = restaurantLeadStatusSchema.safeParse({
    id: formData.get("leadId"),
    contactStatus: formData.get("contactStatus"),
  });
  if (!parsed.success) {
    return;
  }
  await getPrisma().restaurantLead.update({
    where: { id: parsed.data.id },
    data: { contactStatus: parsed.data.contactStatus },
  });
  revalidateLeads(parsed.data.id);
}

const ENGAGING_SALES_STATUSES = new Set([
  "CONTACTED",
  "REPLIED",
  "INTERESTED",
  "MEETING",
  "PROPOSAL",
]);

export async function updateRestaurantLeadSalesForm(formData: FormData) {
  await requireAdmin();
  const parsed = restaurantLeadSalesSchema.safeParse({
    id: formData.get("leadId"),
    salesStatus: formData.get("salesStatus"),
    lastContactAt: formData.get("lastContactAt") || undefined,
    nextFollowUpAt: formData.get("nextFollowUpAt") || undefined,
    contactAttempts: formData.get("contactAttempts") || undefined,
  });
  if (!parsed.success) {
    return;
  }

  const existing = await getRestaurantLead(parsed.data.id);
  if (!existing) {
    return;
  }

  const nextStatus = parsed.data.salesStatus;
  let lastContactAt = parseLeadDate(parsed.data.lastContactAt ?? null);
  const nextFollowUpAt = parseLeadDate(parsed.data.nextFollowUpAt ?? null);
  let contactAttempts = parsed.data.contactAttempts ?? existing.contactAttempts;

  if (!parsed.data.lastContactAt) {
    lastContactAt = existing.lastContactAt;
    if (ENGAGING_SALES_STATUSES.has(nextStatus) && !lastContactAt) {
      lastContactAt = new Date();
    }
  }
  if (
    existing.salesStatus !== nextStatus &&
    ENGAGING_SALES_STATUSES.has(nextStatus) &&
    (existing.salesStatus === "NEW" || existing.salesStatus === "READY_TO_CONTACT") &&
    (parsed.data.contactAttempts === undefined ||
      parsed.data.contactAttempts === existing.contactAttempts)
  ) {
    contactAttempts = existing.contactAttempts + 1;
  }

  await getPrisma().restaurantLead.update({
    where: { id: existing.id },
    data: {
      salesStatus: nextStatus,
      lastContactAt,
      nextFollowUpAt,
      contactAttempts,
    },
  });
  revalidateLeads(existing.id);
}

export type RestaurantLeadImportState = FormState & {
  rows?: RestaurantLeadPreviewRow[];
  stats?: RestaurantLeadImportStats;
  payload?: string;
  mode?: "create" | "update";
};

async function parseImportSource(formData: FormData) {
  const file = formData.get("file");
  const pasted = String(formData.get("source") ?? "");

  if (file instanceof File && file.size > 0) {
    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      return parseRestaurantLeadXlsx(buffer);
    }
    return parseRestaurantLeadCsv(buffer.toString("utf8"));
  }

  if (pasted.trim()) {
    return parseRestaurantLeadCsv(pasted);
  }

  return { rows: [], parseError: "CSV/XLSX dosyası seçin veya CSV yapıştırın." };
}

export async function previewRestaurantLeadImportAction(
  _prev: RestaurantLeadImportState,
  formData: FormData,
): Promise<RestaurantLeadImportState> {
  await requireAdmin();
  const mode = parseRestaurantLeadImportMode(formData.get("mode"));
  const parsed = await parseImportSource(formData);
  if (parsed.parseError) {
    return { error: parsed.parseError };
  }

  const rows = await attachRestaurantLeadDuplicates(parsed.rows, mode);
  const stats = summarizeRestaurantLeadPreview(rows, mode);
  const summary =
    mode === "update"
      ? `${stats.total} satır: ${stats.newLeads} eşleşmeyen, ${stats.updates} güncelleme, ${stats.unchanged} değişmedi, ${stats.invalid} geçersiz. Confirm edilmeden yazılmaz.`
      : `${stats.total} satır: ${stats.newLeads} yeni, ${stats.duplicates} kopya, ${stats.invalid} geçersiz.`;
  return {
    rows,
    stats,
    payload: JSON.stringify(rows, (key, value) => (key === "existing" ? undefined : value)),
    mode,
    success: summary,
  };
}

export async function confirmRestaurantLeadImportAction(
  _prev: RestaurantLeadImportState,
  formData: FormData,
): Promise<RestaurantLeadImportState> {
  await requireAdmin();
  const mode = parseRestaurantLeadImportMode(formData.get("mode"));
  const payload = String(formData.get("payload") ?? "");
  if (!payload) {
    return { error: "Önce içe aktarmayı önizleyin." };
  }

  let rows: RestaurantLeadPreviewRow[];
  try {
    rows = JSON.parse(payload) as RestaurantLeadPreviewRow[];
  } catch {
    return { error: "Önizleme verisi okunamadı. Tekrar önizleyin." };
  }

  const checked = await attachRestaurantLeadDuplicates(rows, mode);

  if (mode === "update") {
    const updatable = checked.filter(isUpdatableLead);
    let updated = 0;

    await getPrisma().$transaction(
      async (tx) => {
        for (const row of updatable) {
          const existing = await tx.restaurantLead.findUnique({ where: { id: row.existing!.id } });
          if (!existing) continue;
          const data = buildRestaurantLeadUpdatePatch(existing, row);
          if (Object.keys(data).length === 0) continue;
          await tx.restaurantLead.update({ where: { id: existing.id }, data });
          updated += 1;
        }
      },
      { timeout: 120000, maxWait: 20000 },
    );

    revalidateLeads();
    const stats = summarizeRestaurantLeadPreview(checked, mode);
    return {
      rows: checked,
      stats,
      mode,
      success: `${updated} lead güncellendi. ${stats.newLeads} eşleşmeyen satır yazılmadı. ${stats.unchanged} değişmedi. ${stats.invalid} geçersiz. Yeni kayıt oluşturulmadı.`,
    };
  }

  const importable = checked.filter(isImportableLead);
  let created = 0;

  await getPrisma().$transaction(
    async (tx) => {
      for (const row of importable) {
        const data = sanitizeRestaurantLeadWrite(row);
        await tx.restaurantLead.create({ data });
        created += 1;
      }
    },
    { timeout: 120000, maxWait: 20000 },
  );

  revalidateLeads();
  const stats = summarizeRestaurantLeadPreview(checked, mode);
  return {
    rows: checked,
    stats,
    mode,
    success: `${created} lead eklendi. ${stats.duplicates} kopya atlandı. ${stats.invalid} geçersiz satır yazılmadı.`,
  };
}
