import type {
  RestaurantContactStatus,
  RestaurantLeadPriority,
  RestaurantRegion,
  RestaurantSalesStatus,
  RestaurantWebsiteStatus,
} from "@prisma/client";
import {
  restaurantContactStatusLabels,
  restaurantLeadPriorityLabels,
  restaurantRegionLabels,
  restaurantSalesStatusLabels,
  restaurantWebsiteStatusLabels,
} from "@/lib/admin/labels";
import { leadScoreBand, leadScoreBandLabels } from "@/lib/admin/restaurant-leads";

export function RestaurantWebsiteBadge({ status }: { status: RestaurantWebsiteStatus }) {
  return (
    <span className={`admin-badge admin-badge-web-${status.toLowerCase()}`}>
      {restaurantWebsiteStatusLabels[status]}
    </span>
  );
}

export function RestaurantRegionBadge({ region }: { region: RestaurantRegion }) {
  return (
    <span className={`admin-badge admin-rl-region admin-rl-region-${region.toLowerCase()}`}>
      {restaurantRegionLabels[region]}
    </span>
  );
}

export function RestaurantPriorityBadge({ priority }: { priority: RestaurantLeadPriority }) {
  return (
    <span className={`admin-rl-priority admin-rl-priority-${priority.toLowerCase()}`}>
      {restaurantLeadPriorityLabels[priority]}
    </span>
  );
}

export function RestaurantContactBadge({ status }: { status: RestaurantContactStatus }) {
  return (
    <span className={`admin-badge admin-rl-contact admin-rl-contact-${status.toLowerCase()}`}>
      {restaurantContactStatusLabels[status]}
    </span>
  );
}

export function RestaurantSalesBadge({ status }: { status: RestaurantSalesStatus }) {
  return (
    <span className={`admin-badge admin-rl-sales admin-rl-sales-${status.toLowerCase()}`}>
      {restaurantSalesStatusLabels[status]}
    </span>
  );
}

export function RestaurantLeadScore({ score }: { score: number | null }) {
  const band = leadScoreBand(score);
  if (band == null || score == null) {
    return <span className="admin-help">—</span>;
  }
  return (
    <span className={`admin-rl-score admin-rl-score-${band}`} title={leadScoreBandLabels[band]}>
      {score.toFixed(1)}
      <small>{leadScoreBandLabels[band]}</small>
    </span>
  );
}
