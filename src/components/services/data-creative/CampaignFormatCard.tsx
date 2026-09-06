import { GoogleAdsPreview } from "@/components/services/data-creative/GoogleAdsPreview";
import { InstagramReelPreview } from "@/components/services/data-creative/InstagramReelPreview";
import { WebsiteHeroPreview } from "@/components/services/data-creative/WebsiteHeroPreview";
import type { Campaign } from "@/components/services/data-creative/campaign-catalog";

const labels = {
  reel: "Instagram Reels",
  ads: "Google Ads",
  hero: "Website Hero",
} as const;

export function CampaignFormatCard({
  campaign,
  active,
  onSelect,
}: {
  campaign: Campaign;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`ccs-format is-${campaign.id}${active ? " is-on" : ""}`}
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${labels[campaign.id]} kampanyasını göster`}
    >
      <span className="ccs-format-visual">
        {campaign.id === "reel" ? <InstagramReelPreview compact /> : null}
        {campaign.id === "ads" ? <GoogleAdsPreview compact /> : null}
        {campaign.id === "hero" ? <WebsiteHeroPreview compact /> : null}
      </span>
      <span className="ccs-format-meta">
        <em>{labels[campaign.id]}</em>
        <span>
          {campaign.stats.map((item) => (
            <small key={item.label}>
              {item.label === "Durum" ? "Durum: Aktif" : `${item.label} ${item.value}`}
            </small>
          ))}
        </span>
      </span>
    </button>
  );
}
