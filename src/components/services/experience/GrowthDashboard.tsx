const kpis = [
  { label: "Ziyaretçi", value: "24.8K", delta: "+%128" },
  { label: "Dönüşüm", value: "3.4%", delta: "+%62" },
  { label: "Performans", value: "98", delta: "+%40" },
] as const;

export function GrowthDashboard() {
  return (
    <article className="svc-dash" aria-hidden>
      <svg className="svc-dash-orbit" viewBox="0 0 640 400" preserveAspectRatio="none">
        <rect x="2" y="2" width="636" height="396" rx="24" />
      </svg>
      <header className="svc-dash-head">
        <p className="svc-dash-brand">
          <i />
          SALKAY
        </p>
        <span>Son 30 Gün</span>
      </header>
      <div className="svc-dash-intro">
        <h3>Markanız Daha İleriye</h3>
        <p>Dijitalde büyüyün.</p>
      </div>
      <div className="svc-dash-chart">
        <span className="svc-dash-lift">+%128 Ziyaretçi Artışı</span>
        <svg viewBox="0 0 320 110" preserveAspectRatio="none">
          <path
            className="svc-dash-line"
            d="M6 92 C42 86 58 70 86 64 C118 57 132 38 164 34 C196 30 214 48 246 28 C272 14 292 18 314 10"
          />
        </svg>
      </div>
      <div className="svc-dash-stats">
        {kpis.map((item) => (
          <div key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <em>{item.delta}</em>
          </div>
        ))}
      </div>
    </article>
  );
}
