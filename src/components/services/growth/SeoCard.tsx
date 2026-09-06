import { GrowthLink } from "@/components/services/growth/GrowthLink";

export function SeoCard() {
  return (
    <article className="gx-card is-seo">
      <header>
        <span>01</span>
        <p>• GÖRÜNÜRLÜK</p>
      </header>
      <h3>SEO</h3>
      <p>
        Teknik altyapı, içerik mimarisi ve arama görünürlüğünü birlikte
        geliştiriyoruz.
      </p>
      <div className="gx-seo" aria-hidden>
        <div className="gx-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.2" />
            <path d="M15.6 15.6 20 20" />
          </svg>
          <i>salkay dijital büyüme</i>
        </div>
        <ul>
          <li>
            <strong>1.2M</strong>
            <span>Gösterim</span>
            <em>+%54</em>
          </li>
          <li>
            <strong>48K</strong>
            <span>Tıklama</span>
            <em>+%72</em>
          </li>
          <li>
            <strong>3.6%</strong>
            <span>TO Oranı</span>
            <em>+%28</em>
          </li>
        </ul>
        <svg className="gx-bars" viewBox="0 0 180 36" preserveAspectRatio="none">
          <rect x="6" y="20" width="18" height="16" rx="3" />
          <rect x="32" y="14" width="18" height="22" rx="3" />
          <rect x="58" y="18" width="18" height="18" rx="3" />
          <rect x="84" y="10" width="18" height="26" rx="3" />
          <rect x="110" y="8" width="18" height="28" rx="3" />
          <rect x="136" y="4" width="18" height="32" rx="3" />
          <rect x="162" y="2" width="12" height="34" rx="3" />
        </svg>
      </div>
      <GrowthLink>Daha görünür olun</GrowthLink>
    </article>
  );
}
