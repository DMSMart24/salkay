import type { CompanyPriority, CompanyStatus, OutreachStatus, WebsiteStatus } from "@prisma/client";
import {
  companyStatusLabels,
  outreachStatusLabels,
  priorityLabels,
  websiteStatusLabels,
} from "@/lib/admin/labels";

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
