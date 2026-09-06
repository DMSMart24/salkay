const lines = [
  { className: "is-a", d: "M8 118 C48 112 72 78 110 82 C150 86 178 48 230 52 C280 56 318 34 372 38 C410 40 448 28 508 22" },
  { className: "is-b", d: "M8 132 C52 128 80 102 118 108 C162 116 196 84 248 90 C300 96 338 70 390 74 C430 76 468 64 508 58" },
  { className: "is-c", d: "M8 148 C56 144 88 126 128 130 C176 136 214 118 266 122 C318 126 356 108 408 112 C446 114 478 104 508 98" },
] as const;

const ticks = ["1 Kas", "8 Kas", "15 Kas", "22 Kas", "30 Kas"] as const;

export function PerformanceChart() {
  return (
    <div className="dcr-chart">
      <header>
        <strong>Zaman içinde performans</strong>
        <ul>
          <li>Ziyaretçi</li>
          <li>Dönüşüm</li>
          <li>Gelir</li>
        </ul>
      </header>
      <div className="dcr-chart-plot">
        <i className="dcr-tip">
          18 Kas 2024
          <span>Ziyaretçi 4.8K · Dönüşüm 172 · Gelir ₺86K</span>
        </i>
        <svg viewBox="0 0 520 168" preserveAspectRatio="none" aria-hidden>
          <path className="dcr-grid" d="M8 28 H512 M8 68 H512 M8 108 H512 M8 148 H512" />
          {lines.map((line) => (
            <g key={line.className}>
              <path className={`dcr-line ${line.className}`} d={line.d} />
              <circle
                className={`dcr-dot ${line.className}`}
                r="3"
                style={{ offsetPath: `path("${line.d}")` }}
              />
            </g>
          ))}
        </svg>
      </div>
      <ol>
        {ticks.map((tick) => (
          <li key={tick}>{tick}</li>
        ))}
      </ol>
    </div>
  );
}
