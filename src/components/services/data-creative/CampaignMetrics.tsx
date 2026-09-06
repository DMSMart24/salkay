import type { Campaign } from "@/components/services/data-creative/campaign-catalog";

export function CampaignMetrics({ campaign }: { campaign: Campaign }) {
  return (
    <div className="ccs-metrics">
      <header>
        <p>KAMPANYA PERFORMANSI</p>
        <em>Son 30 gün</em>
      </header>
      <ul>
        {campaign.metrics.map((item) => (
          <li key={item.label} className="ccs-metric">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <p>Hedeflerinize ulaşma yolunda sağlam adımlarla ilerliyorsunuz.</p>
    </div>
  );
}
