"use server";

import { revalidatePath } from "next/cache";
import { recordActivity } from "@/lib/admin/activity";
import {
  attachDuplicates,
  parseResearchCsv,
  parseResearchJson,
  type ImportPreviewRow,
} from "@/lib/admin/import";
import { slugify } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import type { FormState } from "@/lib/admin/validation";

export type ImportPreviewState = FormState & {
  rows?: ImportPreviewRow[];
  format?: "json" | "csv";
  groupId?: string;
  source?: string;
};

async function ensureGroup(name?: string | null, fallbackId?: string | null) {
  const prisma = getPrisma();
  if (fallbackId) {
    const existing = await prisma.leadGroup.findUnique({ where: { id: fallbackId } });
    if (existing) return existing.id;
  }
  if (!name) return null;
  const slug = slugify(name);
  const found = await prisma.leadGroup.findFirst({
    where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] },
  });
  if (found) return found.id;
  const created = await prisma.leadGroup.create({
    data: { name, slug, country: "Türkiye" },
  });
  return created.id;
}

export async function previewImportAction(
  _prev: ImportPreviewState,
  formData: FormData,
): Promise<ImportPreviewState> {
  await requireAdmin();
  const format = formData.get("format") === "csv" ? "csv" : "json";
  const source = String(formData.get("source") ?? "");
  const groupId = String(formData.get("groupId") ?? "") || undefined;
  if (!source.trim()) {
    return { error: "İçe aktarılacak JSON veya CSV yapıştırın." };
  }

  const parsed = format === "csv" ? parseResearchCsv(source) : parseResearchJson(source);
  if (parsed.parseError) {
    return { error: parsed.parseError };
  }

  const rows = await attachDuplicates(parsed.rows);
  const invalid = rows.filter((row) => row.errors.length > 0).length;
  const duplicates = rows.filter((row) => row.duplicate).length;
  return {
    rows,
    format,
    groupId,
    source,
    success: `${rows.length} satır önizlendi. ${invalid} geçersiz, ${duplicates} zaten mevcut.`,
  };
}

export async function confirmImportAction(
  _prev: ImportPreviewState,
  formData: FormData,
): Promise<ImportPreviewState> {
  const session = await requireAdmin();
  const format = formData.get("format") === "csv" ? "csv" : "json";
  const source = String(formData.get("source") ?? "");
  const fallbackGroupId = String(formData.get("groupId") ?? "") || null;
  const onDuplicate = formData.get("onDuplicate") === "update" ? "update" : "skip";
  const parsed = format === "csv" ? parseResearchCsv(source) : parseResearchJson(source);
  if (parsed.parseError) {
    return { error: parsed.parseError };
  }

  const rows = await attachDuplicates(parsed.rows);
  const valid = rows.filter((row) => row.errors.length === 0);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const prisma = getPrisma();
  const groupIds = new Map<string, string | null>();
  for (const row of valid) {
    const key = row.group || fallbackGroupId || "";
    if (!groupIds.has(key)) {
      groupIds.set(key, await ensureGroup(row.group, fallbackGroupId));
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const row of valid) {
      const groupId = groupIds.get(row.group || fallbackGroupId || "") ?? null;
      const data = {
        companyName: row.companyName,
        website: row.website,
        domain: row.domain,
        generalEmail: row.emailNorm,
        phone: row.phone,
        industry: row.industry,
        city: row.city,
        district: row.district,
        country: row.country ?? "Türkiye",
        websiteScore: row.websiteScore,
        websiteStatus: row.websiteStatus ?? "UNKNOWN",
        websiteIssues: row.websiteIssues ?? [],
        recommendedServices: row.recommendedServices ?? [],
        leadScore: row.leadScore ?? null,
        scoreDesign: row.scoreDesign ?? null,
        scoreMobile: row.scoreMobile ?? null,
        scoreUx: row.scoreUx ?? null,
        scoreConversion: row.scoreConversion ?? null,
        scoreTechnical: row.scoreTechnical ?? null,
        scoreSeo: row.scoreSeo ?? null,
        opportunities: row.opportunities ?? [],
        salesPitch: row.salesPitch,
        instagram: row.instagram,
        address: row.address,
        researchSource: row.researchSource,
        researchedAt: row.researchSource || row.websiteScore || row.leadScore ? new Date() : null,
        groupId,
        outreachStatus: "NEW" as const,
        source: row.researchSource ?? "import",
      };

      if (row.duplicate) {
        if (onDuplicate === "update") {
          await tx.company.update({
            where: { id: row.duplicate.id },
            data,
          });
          updated += 1;
        } else {
          skipped += 1;
        }
        continue;
      }

      await tx.company.create({ data });
      created += 1;
    }

    await recordActivity(tx, {
      type: "COMPANIES_IMPORTED",
      message: `İçe aktarma: ${created} yeni, ${updated} güncellendi, ${skipped} atlandı.`,
      userId: session.userId,
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/groups");
  return {
    success: `${created} firma eklendi. ${updated} güncellendi. ${skipped} atlandı. E-posta gönderilmedi.`,
    rows,
    format,
    groupId: fallbackGroupId ?? undefined,
  };
}
