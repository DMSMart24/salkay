import type { ActivityType, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";

export async function recordActivity(
  tx: Prisma.TransactionClient | ReturnType<typeof getPrisma>,
  input: {
    type: ActivityType;
    message: string;
    userId?: string | null;
    companyId?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  return tx.activity.create({
    data: {
      type: input.type,
      message: input.message,
      userId: input.userId ?? null,
      companyId: input.companyId ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}
