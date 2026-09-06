import { CampaignScene } from "@/components/services/data-creative/CampaignScene";

export function GoogleAdsPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`ccs-ads${compact ? " is-compact" : ""}`}>
      <div className="ccs-ads-visual">
        <CampaignScene tone="ads" compact={compact} />
        <div className="ccs-ads-overlay">
          <strong className="font-display">Daha ileri bir yarın</strong>
          <span>Küçük adımlar, büyük değişim.</span>
        </div>
      </div>
      <div className="ccs-ads-chrome">
        <p>salkay.com</p>
        <strong>Daha ileri bir yarın</strong>
        <span>Küçük adımlar, büyük değişim.</span>
        <em>Daha fazla bilgi</em>
      </div>
    </div>
  );
}
