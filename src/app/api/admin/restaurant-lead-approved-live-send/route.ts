import {
  clampRestaurantLeadChunkSize,
  executeRestaurantLeadApprovedLiveSend,
  getSendEligibleRestaurantLeads,
  restaurantLeadBulkChecks,
  toRestaurantLeadSnapshots,
} from "@/lib/admin/restaurant-lead-bulk";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const APPROVED_SNAPSHOT_ID = "cmtvgi8d70000dfbgz5dft438";
const CONFIRM = "SEND_APPROVED_50";

type TokenizedChecks = {
  liveSendToken?: string;
  consumedAt?: string;
  chunkSize?: number;
  liveSend?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    confirm?: string;
    mode?: string;
    batchId?: string;
    token?: string;
  };

  if (body.confirm !== CONFIRM || body.mode !== "LIVE" || !body.batchId || !body.token) {
    return Response.json({ error: "rejected" }, { status: 400 });
  }

  const prisma = getPrisma();
  const batch = await prisma.restaurantLeadOutreachBatch.findUnique({
    where: { id: body.batchId },
  });
  if (!batch || batch.mode !== "LIVE") {
    return Response.json({ error: "batch_not_found" }, { status: 404 });
  }

  const checks = JSON.parse(batch.checksJson) as TokenizedChecks;
  if (!checks.liveSendToken || checks.liveSendToken !== body.token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (checks.consumedAt) {
    return Response.json({ error: "already_consumed" }, { status: 409 });
  }

  await prisma.restaurantLeadOutreachBatch.update({
    where: { id: batch.id },
    data: {
      checksJson: JSON.stringify({ ...checks, consumedAt: new Date().toISOString() }),
    },
  });

  const universe = await getSendEligibleRestaurantLeads();
  const eligibleById = new Map(universe.eligible.map((row) => [row.id, row]));
  const approvedIds = batch.leadIds;
  const approved = [];
  const skipped = [];
  for (const id of approvedIds) {
    const row = eligibleById.get(id);
    if (row?.publicEmail && row.emailSubject && row.emailBody) {
      approved.push({
        restaurantLeadId: row.id,
        restaurantName: row.restaurantName,
        recipientEmail: row.publicEmail,
        emailSubject: row.emailSubject,
        emailBody: row.emailBody,
      });
      continue;
    }
    const known = universe.rows.find((item) => item.id === id);
    skipped.push({
      restaurant: known?.restaurantName ?? id,
      reason: known?.excludeReasons.join(" · ") || "No longer SEND_ELIGIBLE",
    });
  }

  const report = await executeRestaurantLeadApprovedLiveSend({
    approved,
    createdById: "admin-live-confirm",
    sourceSnapshotId: batch.id || APPROVED_SNAPSHOT_ID,
    chunkSize: batch.chunkSize || clampRestaurantLeadChunkSize(null),
  });

  const sentHistory = report.liveBulkSendId
    ? await prisma.restaurantLeadSendHistory.findMany({
        where: { batchId: report.liveBulkSendId, status: "SENT" },
        select: { restaurantLeadId: true },
      })
    : [];

  for (const row of sentHistory) {
    const lead = await prisma.restaurantLead.findUnique({
      where: { id: row.restaurantLeadId },
      select: { salesStatus: true, contactStatus: true, contactAttempts: true },
    });
    if (!lead) continue;
    await prisma.restaurantLead.update({
      where: { id: row.restaurantLeadId },
      data: {
        lastContactAt: new Date(),
        contactAttempts: lead.contactAttempts + 1,
        salesStatus:
          lead.salesStatus === "NEW" || lead.salesStatus === "READY_TO_CONTACT" ? "CONTACTED" : lead.salesStatus,
        contactStatus:
          lead.contactStatus === "NOT_CONTACTED" || lead.contactStatus === "READY_TO_CONTACT"
            ? "CONTACTED"
            : lead.contactStatus,
      },
    });
  }

  return Response.json({
    LIVE_BULK_SEND_ID: report.liveBulkSendId,
    INITIAL_ELIGIBLE: universe.eligible.length,
    FINAL_ELIGIBLE: report.finalEligible,
    SKIPPED_BEFORE_SEND: report.skippedBeforeSend.length + skipped.length,
    ATTEMPTED: report.attempted,
    SENT_SUCCESSFULLY: report.sentSuccessfully,
    FAILED: report.failed,
    UNSENT: report.unsent,
    skipped: [...skipped, ...report.skippedBeforeSend],
    CHUNKS_COMPLETED: report.chunksCompleted,
    RESEND_CALLED: report.resendCalled ? "YES" : "NO",
    PROVIDER_MESSAGE_IDS_STORED: report.providerMessageIdsStored,
    DUPLICATE_SENDS_BLOCKED: report.duplicateSendsBlocked,
    COMPANY_ROWS_MUTATED: report.companyRowsMutated,
    FINAL_STATUS: report.finalStatus,
    checks: restaurantLeadBulkChecks(toRestaurantLeadSnapshots(universe.eligible)),
  });
}
