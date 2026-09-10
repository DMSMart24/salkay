import type { Prisma, RestaurantLead } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";

export const EXPECTED_RESTAURANT_LEAD_COUNT = 101;

export function restaurantLeadDatasetWhere(): Prisma.RestaurantLeadWhereInput {
  return {};
}

export async function listRestaurantLeadDataset() {
  const prisma = getPrisma();
  const rows = await prisma.restaurantLead.findMany({
    where: restaurantLeadDatasetWhere(),
    select: { id: true, region: true, analysisStatus: true, emailStatus: true },
    orderBy: [{ restaurantName: "asc" }, { id: "asc" }],
  });
  return {
    ids: rows.map((row) => row.id),
    count: rows.length,
    anadolu: rows.filter((row) => row.region === "ANADOLU").length,
    avrupa: rows.filter((row) => row.region === "AVRUPA").length,
    analyzed: rows.filter((row) => row.analysisStatus !== "NOT_STARTED").length,
    ready: rows.filter((row) => row.emailStatus === "READY_FOR_REVIEW").length,
  };
}

export async function assertRestaurantLeadDataset(label: string, loadedIds?: string[]) {
  const universe = await listRestaurantLeadDataset();
  if (universe.count !== EXPECTED_RESTAURANT_LEAD_COUNT) {
    throw new Error(
      `${label} ABORT: RestaurantLead count is ${universe.count}, expected ${EXPECTED_RESTAURANT_LEAD_COUNT}.`,
    );
  }
  if (loadedIds) {
    const unique = [...new Set(loadedIds)];
    if (unique.length !== universe.count) {
      throw new Error(`${label} ABORT: loaded ${unique.length}, source of truth is ${universe.count}.`);
    }
    const missing = universe.ids.filter((id) => !unique.includes(id));
    const extra = unique.filter((id) => !universe.ids.includes(id));
    if (missing.length || extra.length) {
      throw new Error(`${label} ABORT: ID mismatch. missing=${missing.length} extra=${extra.length}`);
    }
  }
  return universe;
}

export type RestaurantLeadRow = RestaurantLead;
