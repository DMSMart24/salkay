import Image from "next/image";
import {
  campaignVisuals,
  type CampaignTone,
} from "@/components/services/data-creative/campaign-assets";

export function CampaignScene({
  tone,
  compact = false,
}: {
  tone: CampaignTone;
  compact?: boolean;
}) {
  const visual = campaignVisuals[tone];

  return (
    <div className={`ccs-scene is-${tone}`} aria-hidden>
      <Image
        src={visual.src}
        alt=""
        fill
        sizes={compact ? "(max-width: 767px) 86vw, 240px" : "(max-width: 767px) 92vw, 520px"}
        className="ccs-scene-photo"
      />
      <span className="ccs-scene-shade" />
    </div>
  );
}
