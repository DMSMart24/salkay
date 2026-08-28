import type { CompanyPriority, OutreachStatus, Prisma, WebsiteStatus } from "@prisma/client";
import { companyFilterWhere, type CompanyFilterInput } from "@/lib/admin/outreach";
import { getPrisma } from "@/lib/admin/prisma";

export type CompanyListQuery = CompanyFilterInput & {
  priority?: CompanyPriority | "";
  tag?: string;
  sort?: string;
  page?: number;
};

const PAGE_SIZE = 25;

const companyListInclude = {
  contacts: {
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
    take: 1,
  },
  group: { select: { id: true, name: true, industry: true } },
  emails: {
    orderBy: { createdAt: "desc" as const },
    take: 8,
    select: {
      id: true,
      direction: true,
      status: true,
      subject: true,
      sentAt: true,
      receivedAt: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CompanyInclude;

export async function listCompanies(input: CompanyListQuery) {
  const prisma = getPrisma();
  const page = Math.max(1, input.page ?? 1);
  const where = companyFilterWhere(input);
  if (input.priority) where.priority = input.priority;
  if (input.tag) where.tags = { has: input.tag };

  const orderBy: Prisma.CompanyOrderByWithRelationInput = (() => {
    switch (input.sort) {
      case "name":
        return { companyName: "asc" };
      case "last":
        return { lastContactedAt: "desc" };
      case "followup":
        return { nextFollowUpAt: "asc" };
      case "priority":
        return { priority: "desc" };
      case "score":
        return { websiteScore: "desc" };
      default:
        return { updatedAt: "desc" };
    }
  })();

  const [total, rows, filteredIds] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: companyListInclude,
    }),
    prisma.company.findMany({
      where,
      select: { id: true },
      take: 500,
    }),
  ]);

  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    filteredIds: filteredIds.map((row) => row.id),
  };
}

export async function getCompanyDetail(id: string) {
  return getPrisma().company.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      group: true,
      contacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      companyNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      emails: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { dueAt: "asc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true } } },
      },
      suppressions: true,
    },
  });
}

export async function listGroups() {
  const prisma = getPrisma();
  const groups = await prisma.leadGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      companies: {
        where: { archivedAt: null },
        select: {
          id: true,
          outreachStatus: true,
          lastContactedAt: true,
        },
      },
    },
  });

  return groups.map((group) => summarizeGroup(group));
}

export async function getGroupDetail(id: string) {
  const group = await getPrisma().leadGroup.findUnique({ where: { id } });
  if (!group) return null;
  return group;
}

export async function getOutreachDashboard() {
  const prisma = getPrisma();
  const where = { archivedAt: null };
  const [total, byOutreach, groups, recentReplies] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.groupBy({
      by: ["outreachStatus"],
      where,
      _count: { outreachStatus: true },
    }),
    listGroups(),
    prisma.emailMessage.findMany({
      where: { direction: "INBOUND" },
      include: {
        company: {
          select: { id: true, companyName: true, group: { select: { name: true } } },
        },
      },
      orderBy: { receivedAt: "desc" },
      take: 6,
    }),
  ]);

  const statusMap = Object.fromEntries(
    byOutreach.map((row) => [row.outreachStatus, row._count.outreachStatus]),
  ) as Record<OutreachStatus, number>;

  return {
    total,
    notContacted: (statusMap.NEW ?? 0) + (statusMap.READY ?? 0),
    sent: statusMap.SENT ?? 0,
    replied: statusMap.REPLIED ?? 0,
    failed: statusMap.FAILED ?? 0,
    doNotContact: statusMap.DO_NOT_CONTACT ?? 0,
    groups,
    recentReplies,
  };
}

export async function findCompanyDuplicates(input: {
  domain?: string | null;
  website?: string | null;
  generalEmail?: string | null;
  contactEmail?: string | null;
  companyName?: string | null;
  city?: string | null;
}) {
  const prisma = getPrisma();
  const clauses: Prisma.CompanyWhereInput[] = [];
  if (input.domain) clauses.push({ domain: input.domain });
  if (input.generalEmail) {
    clauses.push({ generalEmail: { equals: input.generalEmail, mode: "insensitive" } });
    clauses.push({
      contacts: { some: { emailNorm: input.generalEmail } },
    });
  }
  if (input.contactEmail) {
    clauses.push({
      contacts: { some: { emailNorm: input.contactEmail } },
    });
  }
  if (input.companyName && input.city) {
    clauses.push({
      companyName: { equals: input.companyName, mode: "insensitive" },
      city: { equals: input.city, mode: "insensitive" },
    });
  }

  if (clauses.length === 0) {
    return [];
  }

  return prisma.company.findMany({
    where: { OR: clauses },
    select: { id: true, companyName: true, domain: true, generalEmail: true },
    take: 5,
  });
}

export async function listFilterOptions() {
  const [companies, groups] = await Promise.all([
    getPrisma().company.findMany({
      where: { archivedAt: null },
      select: { industry: true, city: true, district: true, country: true, tags: true },
    }),
    getPrisma().leadGroup.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    industries: unique(companies.map((row) => row.industry)),
    cities: unique(companies.map((row) => row.city)),
    districts: unique(companies.map((row) => row.district)),
    countries: unique(companies.map((row) => row.country)),
    tags: unique(companies.flatMap((row) => row.tags)),
    groups,
  };
}

export function summarizeGroup(group: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  city: string | null;
  country: string | null;
  companies: Array<{ outreachStatus: OutreachStatus; lastContactedAt: Date | null }>;
}) {
  const total = group.companies.length;
  const notContacted = group.companies.filter(
    (company) => company.outreachStatus === "NEW" || company.outreachStatus === "READY",
  ).length;
  const sent = group.companies.filter((company) => company.outreachStatus === "SENT").length;
  const replied = group.companies.filter((company) => company.outreachStatus === "REPLIED").length;
  const failed = group.companies.filter((company) => company.outreachStatus === "FAILED").length;
  const doNotContact = group.companies.filter(
    (company) => company.outreachStatus === "DO_NOT_CONTACT",
  ).length;
  const lastSend = group.companies
    .map((company) => company.lastContactedAt)
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const replyRate = sent + replied > 0 ? Math.round((replied / (sent + replied)) * 100) : 0;

  return {
    ...group,
    total,
    notContacted,
    sent,
    replied,
    failed,
    doNotContact,
    lastSend,
    replyRate,
  };
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export type { WebsiteStatus };
