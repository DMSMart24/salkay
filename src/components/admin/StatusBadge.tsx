import type { CompanyPriority, CompanyStatus, OutreachStatus, WebsiteStatus } from "@prisma/client";
import {
  companyStatusLabels,
  outreachStatusLabels,
  priorityLabels,
  websiteStatusLabels,
} from "@/lib/admin/labels";
import { leadPriorityLabels, type LeadPriorityBand } from "@/lib/admin/qualification";

export function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span className={`admin-badge admin-badge-${status.toLowerCase()}`}>
      {companyStatusLabels[status]}
    </span>
  );
}

export function OutreachBadge({ status }: { status: OutreachStatus }) {
  return (
    <span className={`admin-badge admin-badge-outreach-${status.toLowerCase()}`}>
      {outreachStatusLabels[status]}
    </span>
  );
}

export function WebsiteBadge({ status }: { status: WebsiteStatus }) {
  return (
    <span className={`admin-badge admin-badge-web-${status.toLowerCase()}`}>
      {websiteStatusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: CompanyPriority }) {
  return (
    <span className={`admin-priority admin-priority-${priority.toLowerCase()}`}>
      {priorityLabels[priority]}
    </span>
  );
}

export function LeadPriorityBadge({ band }: { band: LeadPriorityBand }) {
  const slug = band === "A+" ? "aplus" : band.toLowerCase();
  return (
    <span className={`admin-badge admin-badge-lead-${slug}`} title={leadPriorityLabels[band]}>
      {band}
    </span>
  );
}
