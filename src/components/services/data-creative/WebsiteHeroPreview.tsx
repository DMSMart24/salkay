import Image from "next/image";
import { CampaignScene } from "@/components/services/data-creative/CampaignScene";

export function WebsiteHeroPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`ccs-web${compact ? " is-compact" : ""}`}>
      <div className="ccs-web-bar" aria-hidden>
        <i />
        <i />
        <i />
        <em>salkay.com</em>
      </div>
      <div className="ccs-web-nav" aria-hidden>
        <Image
          src="/brand/salkay-logo-header.png"
          alt=""
          width={72}
          height={17}
          className="ccs-web-logo"
        />
        <span>Hizmetler</span>
        <span>Paketler</span>
        <b>İletişim</b>
      </div>
      <div className="ccs-web-hero">
        <CampaignScene tone="hero" compact={compact} />
        <div className="ccs-web-copy">
          <strong className="font-display">Fikri gerçeğe dönüştürür.</strong>
          <span>Küçük adımlar, büyük değişim.</span>
        </div>
      </div>
    </div>
  );
}
