"use client";

import { useState } from "react";
import { CampaignFormatCard } from "@/components/services/data-creative/CampaignFormatCard";
import { CampaignMetrics } from "@/components/services/data-creative/CampaignMetrics";
import { CampaignPreview } from "@/components/services/data-creative/CampaignPreview";
import { CampaignTimeline } from "@/components/services/data-creative/CampaignTimeline";
import { campaigns } from "@/components/services/data-creative/campaign-catalog";

export function CreativeCampaignStudio() {
  const [active, setActive] = useState(0);
  const campaign = campaigns[active] ?? campaigns[0];

  return (
    <div className="ccs">
      <p className="sr-only">Örnek arayüz. Gerçek müşteri verisi değildir.</p>
      <div className="ccs-board">
        <CampaignPreview campaign={campaign} />
        <CampaignMetrics campaign={campaign} />
      </div>
      <div className="ccs-formats">
        {campaigns.map((item, index) => (
          <CampaignFormatCard
            key={item.id}
            campaign={item}
            active={index === active}
            onSelect={() => setActive(index)}
          />
        ))}
      </div>
      <CampaignTimeline />
    </div>
  );
}
