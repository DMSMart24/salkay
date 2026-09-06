import { CampaignScene } from "@/components/services/data-creative/CampaignScene";

export function InstagramReelPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`ccs-reel${compact ? " is-compact" : ""}`}>
      <CampaignScene tone="reel" compact={compact} />
      <div className="ccs-reel-ui">
        <strong className="font-display">Görünür Olun</strong>
        <span>Küçük adımlar, büyük değişim.</span>
      </div>
      <i className="ccs-play" aria-hidden />
    </div>
  );
}
