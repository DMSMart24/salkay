import { GoogleAdsPreview } from "@/components/services/data-creative/GoogleAdsPreview";
import { InstagramReelPreview } from "@/components/services/data-creative/InstagramReelPreview";
import { WebsiteHeroPreview } from "@/components/services/data-creative/WebsiteHeroPreview";
import type { Campaign } from "@/components/services/data-creative/campaign-catalog";

export function CampaignPreview({ campaign }: { campaign: Campaign }) {
  return (
    <div className={`ccs-preview is-${campaign.id}`}>
      <div className="ccs-preview-top">
        <p>
          <i aria-hidden />
          AKTİF KAMPANYA
        </p>
        <em>{campaign.status}</em>
      </div>
      <div key={campaign.id} className="ccs-preview-visual">
        {campaign.id === "reel" ? <InstagramReelPreview /> : null}
        {campaign.id === "ads" ? <GoogleAdsPreview /> : null}
        {campaign.id === "hero" ? <WebsiteHeroPreview /> : null}
      </div>
      <ul className="ccs-meta" aria-hidden>
        {campaign.meta.map((item) => (
          <li key={item.label}>
            <b>{item.label}</b>
            <span>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
