import { GrowthLink } from "@/components/services/growth/GrowthLink";

export function GoogleAdsCard() {
  return (
    <article className="gx-card is-ads">
      <header>
        <span>02</span>
        <p>• REKLAM</p>
      </header>
      <h3>Google Ads</h3>
      <p>
        Arama ve performans odaklı, ölçülebilir reklam kampanyaları yönetiyoruz.
      </p>
      <div className="gx-ads" aria-hidden>
        <div className="gx-ads-top">
          <strong>Kampanya Performansı</strong>
          <span>Son 30 Gün</span>
        </div>
        <ul>
          <li>
            <b>24.8K</b>
            <span>Tıklama</span>
            <em>+%65</em>
          </li>
          <li>
            <b>1.2K</b>
            <span>Dönüşüm</span>
            <em>+%80</em>
          </li>
          <li>
            <b>₺42</b>
            <span>Maliyet/Dönüşüm</span>
            <em className="is-down">-%35</em>
          </li>
        </ul>
        <div className="gx-ads-chart">
          <span>1.2K dönüşüm</span>
          <svg viewBox="0 0 220 56" preserveAspectRatio="none">
            <path d="M4 44 C36 42 52 30 78 28 C110 25 128 36 156 18 C178 8 196 14 216 8" />
          </svg>
        </div>
      </div>
      <GrowthLink>Daha fazla müşteriye ulaşın</GrowthLink>
    </article>
  );
}
