import Link from "next/link";
import { AnalyticsKpiCard } from "@/components/services/data-creative/AnalyticsKpiCard";
import { ChannelDistribution } from "@/components/services/data-creative/ChannelDistribution";
import { PerformanceChart } from "@/components/services/data-creative/PerformanceChart";
import { routes } from "@/lib/routes";

const kpis = [
  { label: "Ziyaretçiler", value: "124.8K", delta: "+%12" },
  { label: "Dönüşümler", value: "3.6%", delta: "+%28" },
  { label: "Kampanya ROI", value: "4.2x", delta: "+%34" },
  { label: "Gelir", value: "₺1.24M", delta: "+%18" },
] as const;

export function AnalyticsShowcase() {
  return (
    <article className="dcr-card is-analytics">
      <div className="dcr-copy">
        <b>01</b>
        <p>VERİ</p>
        <h3 className="font-display">Analitik</h3>
        <span>
          Trafik, kullanıcı davranışı, dönüşüm ve kampanya performansını ölçerek
          kararlarınızı gerçek verilerle destekliyoruz.
        </span>
        <Link href={routes.contact} className="dcr-btn">
          Detayları keşfet
          <em aria-hidden>→</em>
        </Link>
        <p className="sr-only">Örnek arayüz. Gerçek müşteri verisi değildir.</p>
      </div>

      <div className="dcr-dash" aria-hidden>
        <div className="dcr-dash-top">
          <label>
            <span>Son 30 gün</span>
            <select defaultValue="30" tabIndex={-1} aria-hidden>
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
              <option value="90">Son 90 gün</option>
            </select>
          </label>
          <em>
            <i />
            Tüm sistemler aktif
          </em>
        </div>
        <div className="dcr-kpis">
          {kpis.map((item, index) => (
            <AnalyticsKpiCard key={item.label} {...item} index={index} />
          ))}
        </div>
        <div className="dcr-dash-grid">
          <PerformanceChart />
          <div className="dcr-side">
            <ChannelDistribution />
            <div className="dcr-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" />
                <circle className="is-arc" cx="60" cy="60" r="46" />
              </svg>
              <strong>72%</strong>
              <span>Hedefe ilerleme</span>
            </div>
            <p className="dcr-note">Bu ay %28 daha fazla dönüşüm</p>
          </div>
        </div>
      </div>
    </article>
  );
}
