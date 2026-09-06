export function GrowthAnalytics() {
  return (
    <aside className="gx-analytics" aria-hidden>
      <span className="gx-radar" />
      <article className="gx-panel">
        <header>
          <p>Toplam Görünürlük</p>
          <span>Son 6 Ay</span>
        </header>
        <div className="gx-metric">
          <strong>+%142</strong>
          <em>Son 6 ayda organik trafik artışı</em>
        </div>
        <div className="gx-chart">
          <svg viewBox="0 0 360 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gx-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0055ff" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0055ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="gx-chart-fill"
              d="M8 118 C48 112 72 96 108 88 C148 78 176 92 216 64 C252 42 292 48 352 18 V140 H8 Z"
            />
            <path
              className="gx-chart-line"
              d="M8 118 C48 112 72 96 108 88 C148 78 176 92 216 64 C252 42 292 48 352 18"
            />
          </svg>
          <ol>
            <li>Oca</li>
            <li>Şub</li>
            <li>Mar</li>
            <li>Nis</li>
            <li>May</li>
            <li>Haz</li>
          </ol>
        </div>
      </article>
      <div className="gx-chip is-search">
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="6.2" />
          <path d="M15.6 15.6 20 20" />
        </svg>
        <div>
          <strong>1.2M Arama gösterimi</strong>
          <em>+%54</em>
        </div>
      </div>
      <div className="gx-chip is-visit">
        <b />
        <div>
          <strong>8.4K Ziyaretçi</strong>
          <em>+%68</em>
        </div>
      </div>
      <p className="gx-note">
        Daha geniş kitlelere ulaşın.
        <span>Arama görünürlüğünüz her geçen gün artsın.</span>
      </p>
    </aside>
  );
}
