import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/session";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  const group = await getPrisma().leadGroup.findUnique({
    where: { id },
    include: {
      companies: {
        where: { archivedAt: null },
        orderBy: { companyName: "asc" },
        include: { contacts: { take: 1, orderBy: { isPrimary: "desc" } } },
      },
    },
  });
  if (!group) {
    return new NextResponse("Grup bulunamadı", { status: 404 });
  }

  const header = [
    "companyName",
    "website",
    "email",
    "phone",
    "industry",
    "city",
    "district",
    "outreachStatus",
    "websiteScore",
  ];
  const lines = [
    header.join(","),
    ...group.companies.map((company) =>
      [
        company.companyName,
        company.website ?? "",
        company.generalEmail ?? company.contacts[0]?.email ?? "",
        company.phone ?? "",
        company.industry ?? "",
        company.city ?? "",
        company.district ?? "",
        company.outreachStatus,
        company.websiteScore ?? "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${group.slug}.csv"`,
    },
  });
}
