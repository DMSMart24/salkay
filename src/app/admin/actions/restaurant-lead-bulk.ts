"use server";

import { revalidatePath } from "next/cache";
import {
  clampRestaurantLeadChunkSize,
  chunkRestaurantLeadItems,
  executeRestaurantLeadApprovedLiveSend,
  getSendEligibleRestaurantLeads,
  listFailedRestaurantLeadIds,
  restaurantLeadBulkChecks,
  toRestaurantLeadSnapshots,
  type RestaurantLeadBatchSnapshot,
  type RestaurantLeadSendProgress,
} from "@/lib/admin/restaurant-lead-bulk";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import type { FormState } from "@/lib/admin/validation";

export type RestaurantLeadBulkActionState = FormState & {
  step?: "preview" | "prepared" | "blocked" | "retry";
  mode?: "TEST" | "LIVE";
  batchId?: string;
  snapshots?: RestaurantLeadBatchSnapshot[];
  skipped?: Array<{ id: string; restaurantName: string; reason: string }>;
  checks?: ReturnType<typeof restaurantLeadBulkChecks>;
  progress?: RestaurantLeadSendProgress;
};

function selectedIdsFromForm(formData: FormData) {
  return [...new Set(formData.getAll("leadIds").map((value) => String(value)).filter(Boolean))];
}

async function loadSelectedSnapshots(leadIds: string[]) {
  const universe = await getSendEligibleRestaurantLeads();
  const eligibleById = new Map(universe.eligible.map((row) => [row.id, row]));
  const allById = new Map(universe.rows.map((row) => [row.id, row]));
  const skipped: Array<{ id: string; restaurantName: string; reason: string }> = [];
  const eligible = [];

  for (const id of leadIds) {
    const row = eligibleById.get(id);
    if (row) {
      eligible.push(row);
      continue;
    }
    const known = allById.get(id);
    skipped.push({
      id,
      restaurantName: known?.restaurantName ?? id,
      reason: known?.excludeReasons.join(" · ") || "Lead bulunamadı veya artık uygun değil",
    });
  }

  return { snapshots: toRestaurantLeadSnapshots(eligible), skipped };
}

export async function previewRestaurantLeadBulkAction(
  _prev: RestaurantLeadBulkActionState,
  formData: FormData,
): Promise<RestaurantLeadBulkActionState> {
  await requireAdmin();
  const leadIds = selectedIdsFromForm(formData);
  if (!leadIds.length) {
    return { error: "Önizleme için en az bir alıcı seçin.", step: "preview" };
  }

  const { snapshots, skipped } = await loadSelectedSnapshots(leadIds);
  const chunkSize = clampRestaurantLeadChunkSize(String(formData.get("chunkSize") ?? formData.get("batchSize") ?? ""));
  return {
    step: "preview",
    mode: formData.get("mode") === "LIVE" ? "LIVE" : "TEST",
    snapshots,
    skipped,
    checks: restaurantLeadBulkChecks(snapshots),
    progress: {
      total: snapshots.length,
      processed: 0,
      sent: 0,
      failed: 0,
      status: "IDLE",
      chunkSize,
      chunks: chunkRestaurantLeadItems(snapshots, chunkSize).length,
    },
    success: `${snapshots.length} kişiselleştirilmiş taslak önizlendi. Gönderim yok.`,
  };
}

export async function prepareRestaurantLeadBulkAction(
  _prev: RestaurantLeadBulkActionState,
  formData: FormData,
): Promise<RestaurantLeadBulkActionState> {
  const session = await requireAdmin();
  const leadIds = selectedIdsFromForm(formData);
  const chunkSize = clampRestaurantLeadChunkSize(String(formData.get("chunkSize") ?? formData.get("batchSize") ?? ""));
  const mode = formData.get("mode") === "LIVE" ? "LIVE" : "TEST";
  if (!leadIds.length) {
    return { error: "Hazırlık için alıcı seçin.", step: "preview" };
  }

  const firstPass = await loadSelectedSnapshots(leadIds);
  const recheck = await loadSelectedSnapshots(firstPass.snapshots.map((row) => row.restaurantLeadId));
  const skipped = [
    ...firstPass.skipped,
    ...recheck.skipped.filter((row) => !firstPass.skipped.some((item) => item.id === row.id)),
  ];
  const snapshots = recheck.snapshots;
  if (!snapshots.length) {
    return { error: "Gönderilebilir alıcı kalmadı.", step: "preview", skipped };
  }

  const checks = restaurantLeadBulkChecks(snapshots);
  const prisma = getPrisma();
  const batch = await prisma.restaurantLeadOutreachBatch.create({
    data: {
      mode,
      status: "PREPARED",
      leadIds: snapshots.map((row) => row.restaurantLeadId),
      snapshotJson: JSON.stringify(
        snapshots.map((row) => ({
          ...row,
          eligibilityStatus: "SEND_ELIGIBLE",
        })),
      ),
      checksJson: JSON.stringify({ ...checks, chunkSize }),
      chunkSize,
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      createdById: session.userId,
      sends: {
        create: snapshots.map((row) => ({
          restaurantLeadId: row.restaurantLeadId,
          toAddress: row.recipientEmail,
          subject: row.emailSubject,
          bodyText: row.emailBody,
          status: "PREPARED",
        })),
      },
    },
  });

  revalidatePath("/admin/emails");
  return {
    step: "prepared",
    mode,
    batchId: batch.id,
    snapshots,
    skipped,
    checks,
    progress: {
      total: snapshots.length,
      processed: 0,
      sent: 0,
      failed: 0,
      status: "IDLE",
      chunkSize,
      chunks: chunkRestaurantLeadItems(snapshots, chunkSize).length,
    },
    success: `Gönderim paketi hazırlandı (${snapshots.length}). Resend çağrılmadı. Taslaklar üzerine yazılmadı.`,
  };
}

export async function confirmRestaurantLeadBulkSendAction(
  _prev: RestaurantLeadBulkActionState,
  formData: FormData,
): Promise<RestaurantLeadBulkActionState> {
  await requireAdmin();
  const batchId = String(formData.get("batchId") ?? "");
  const confirmed = formData.get("reviewed") === "on" || formData.get("reviewed") === "true";
  if (!batchId) return { error: "Paket bulunamadı.", step: "blocked" };
  if (!confirmed) {
    return { error: "Gönderim için kontrol kutusunu işaretleyin.", step: "prepared", batchId };
  }

  const prisma = getPrisma();
  const batch = await prisma.restaurantLeadOutreachBatch.findUnique({ where: { id: batchId } });
  if (!batch) return { error: "Paket bulunamadı.", step: "blocked" };

  const original = JSON.parse(batch.snapshotJson) as RestaurantLeadBatchSnapshot[];
  const { snapshots: fresh, skipped } = await loadSelectedSnapshots(
    original.map((row) => row.restaurantLeadId ?? row.id),
  );
  if (!fresh.length) {
    await prisma.restaurantLeadOutreachBatch.update({
      where: { id: batchId },
      data: { status: "BLOCKED" },
    });
    return {
      error: "Gönderilebilir alıcı kalmadı. Resend çağrılmadı.",
      step: "blocked",
      batchId,
      skipped,
    };
  }

  if (batch.mode !== "LIVE") {
    await prisma.restaurantLeadOutreachBatch.update({
      where: { id: batchId },
      data: { status: "BLOCKED" },
    });
    return {
      step: "blocked",
      mode: batch.mode,
      batchId,
      snapshots: fresh,
      skipped,
      checks: restaurantLeadBulkChecks(fresh),
      error: "Test modu: gerçek e-posta gönderilmez. Resend çağrılmadı.",
    };
  }

  const report = await executeRestaurantLeadApprovedLiveSend({
    approved: fresh.map((row) => ({
      restaurantLeadId: row.restaurantLeadId,
      restaurantName: row.restaurantName,
      recipientEmail: row.recipientEmail,
      emailSubject: row.emailSubject,
      emailBody: row.emailBody,
    })),
    createdById: "admin-live-confirm",
    sourceSnapshotId: batchId,
    chunkSize: batch.chunkSize || clampRestaurantLeadChunkSize(null),
  });

  return {
    step: report.finalStatus === "COMPLETED" ? "prepared" : "blocked",
    mode: "LIVE",
    batchId: report.liveBulkSendId,
    snapshots: fresh,
    skipped,
    checks: restaurantLeadBulkChecks(fresh),
    progress: {
      total: report.finalEligible,
      processed: report.attempted,
      sent: report.sentSuccessfully,
      failed: report.failed.length,
      status: report.finalStatus === "COMPLETED" ? "DONE" : "BLOCKED",
      chunkSize: batch.chunkSize || clampRestaurantLeadChunkSize(null),
      chunks: report.chunksCompleted,
    },
    success:
      report.finalStatus === "COMPLETED"
        ? `${report.sentSuccessfully} e-posta gönderildi.`
        : undefined,
    error:
      report.finalStatus === "COMPLETED"
        ? undefined
        : `${report.finalStatus}: sent=${report.sentSuccessfully} failed=${report.failed.length} unsent=${report.unsent.length}`,
  };
}

export async function retryFailedRestaurantLeadBulkAction(
  _prev: RestaurantLeadBulkActionState,
  formData: FormData,
): Promise<RestaurantLeadBulkActionState> {
  const session = await requireAdmin();
  const batchId = String(formData.get("batchId") ?? "");
  if (!batchId) return { error: "Paket bulunamadı.", step: "retry" };

  const failedIds = await listFailedRestaurantLeadIds(batchId);
  if (!failedIds.length) {
    return {
      step: "retry",
      batchId,
      snapshots: [],
      success: "Yeniden denenecek başarısız alıcı yok. Başarılı gönderiler tekrarlanmaz.",
    };
  }

  const { snapshots, skipped } = await loadSelectedSnapshots(failedIds);
  if (!snapshots.length) {
    return { error: "Başarısız alıcılar artık uygun değil.", step: "retry", batchId, skipped };
  }

  const checks = restaurantLeadBulkChecks(snapshots);
  const chunkSize = clampRestaurantLeadChunkSize(String(formData.get("chunkSize") ?? ""));
  const prisma = getPrisma();
  const batch = await prisma.restaurantLeadOutreachBatch.create({
    data: {
      mode: formData.get("mode") === "LIVE" ? "LIVE" : "TEST",
      status: "PREPARED",
      leadIds: snapshots.map((row) => row.restaurantLeadId),
      snapshotJson: JSON.stringify(snapshots),
      checksJson: JSON.stringify({ ...checks, retryOf: batchId, failedOnly: true }),
      chunkSize,
      createdById: session.userId,
      sends: {
        create: snapshots.map((row) => ({
          restaurantLeadId: row.restaurantLeadId,
          toAddress: row.recipientEmail,
          subject: row.emailSubject,
          bodyText: row.emailBody,
          status: "PREPARED",
        })),
      },
    },
  });

  revalidatePath("/admin/emails");
  return {
    step: "prepared",
    mode: batch.mode,
    batchId: batch.id,
    snapshots,
    skipped,
    checks,
    success: `Yalnızca ${snapshots.length} başarısız alıcı yeniden hazırlandı. Başarılı gönderiler tekrarlanmadı.`,
  };
}
