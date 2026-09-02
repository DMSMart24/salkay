import { getDictionary } from "@/i18n/get-dictionary";

const sideIcons = ["search", "target", "rise"] as const;
const benefitIcons = ["person", "bars", "shield", "pair"] as const;
const journey = [
  { title: "İçerik", icon: "doc" },
  { title: "Görünürlük", icon: "search" },
  { title: "Kitle", icon: "pair" },
  { title: "Büyüme", icon: "rise" },
] as const;

type LineIcon = (typeof sideIcons)[number] | (typeof benefitIcons)[number] | "doc";

export function GrowthShowcase() {
  const growth = getDictionary().servicesPage.growth;

  return (
    <div className="svc-grow">
      <div className="svc-grow-head">
        <div>
          <p className="svc-grow-eye">
            <span aria-hidden />
            {growth.eyebrow}
          </p>
          <h2 className="svc-grow-title font-display">
            <span>{growth.titleLine1}</span>
            <span>{growth.titleLine2}</span>
            <em>{growth.titleAccent}</em>
          </h2>
        </div>
        <p className="svc-grow-intro">{growth.intro}</p>
        <GrowthChart />
      </div>

      <div className="svc-grow-mods">
        {growth.items.map((item, index) => (
          <article key={item.index} className="svc-grow-mod">
            <b>{item.index}</b>
            <div className="svc-grow-copy">
              <p>
                <i aria-hidden />
                {item.label}
              </p>
              <h3 className="font-display">{item.title}</h3>
              <span>{item.body}</span>
            </div>
            <div className="svc-grow-visual">
              <ModuleVisual index={item.index} />
            </div>
            <span className="svc-grow-mark">
              <GrowIcon name={sideIcons[index] ?? "search"} />
            </span>
          </article>
        ))}
      </div>

      <ul className="svc-grow-benefits">
        {growth.benefits.map((item, index) => (
          <li key={item.title}>
            <GrowIcon name={benefitIcons[index] ?? "person"} />
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrowthChart() {
  return (
    <svg className="svc-grow-chart" viewBox="0 0 220 160" aria-hidden>
      <circle cx="110" cy="88" r="62" />
      <circle cx="110" cy="88" r="42" />
      <circle cx="110" cy="88" r="22" />
      <path d="M28 20 H192 M28 140 H192 M40 8 V148 M180 8 V148" />
      <rect x="46" y="98" width="12" height="28" rx="2" />
      <rect x="68" y="86" width="12" height="40" rx="2" />
      <rect x="90" y="74" width="12" height="52" rx="2" />
      <rect x="112" y="62" width="12" height="64" rx="2" />
      <rect x="134" y="50" width="12" height="76" rx="2" />
      <rect x="156" y="40" width="12" height="86" rx="2" />
      <path d="M40 118 C72 112 88 86 112 78 C136 70 150 48 178 36" />
      <path d="M168 28 L180 32 L172 44" />
    </svg>
  );
}

function ModuleVisual({ index }: { index: string }) {
  switch (index) {
    case "04":
      return <SeoVisual />;
    case "05":
      return <AdsVisual />;
    case "06":
      return <JourneyVisual />;
    default:
      return null;
  }
}

function SeoVisual() {
  return (
    <div className="svc-grow-seo" aria-hidden>
      <div className="svc-grow-search">
        <span>
          <GrowIcon name="search" />
        </span>
        <i />
      </div>
      <ul>
        <li>
          <b>✓</b>
          <em>Technical</em>
        </li>
        <li>
          <b>✓</b>
          <em>Content</em>
        </li>
        <li>
          <b>✓</b>
          <em>Visibility</em>
        </li>
      </ul>
      <span className="svc-grow-orb">
        <GrowIcon name="search" />
        <svg viewBox="0 0 32 16">
          <path d="M2 13 C8 11 12 7 16 8 C21 9 24 4 30 3" />
        </svg>
      </span>
    </div>
  );
}

function AdsVisual() {
  return (
    <div className="svc-grow-ads" aria-hidden>
      <span className="svc-grow-ads-mark">ADS</span>
      <ul>
        <li>
          <em>Gösterim</em>
          <svg viewBox="0 0 64 20">
            <path d="M2 15 C12 14 18 8 28 10 C40 13 48 6 62 5" />
          </svg>
        </li>
        <li>
          <em>Tıklama</em>
          <svg viewBox="0 0 64 20">
            <path d="M2 12 C14 13 22 7 34 9 C46 11 52 6 62 4" />
          </svg>
        </li>
        <li>
          <em>Dönüşüm</em>
          <svg viewBox="0 0 64 20">
            <path d="M2 16 C16 14 24 10 36 11 C48 12 54 6 62 7" />
          </svg>
        </li>
      </ul>
      <span className="svc-grow-donut">
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="24" r="14" className="is-arc" />
        </svg>
      </span>
    </div>
  );
}

function JourneyVisual() {
  return (
    <ol className="svc-grow-journey" aria-hidden>
      {journey.map((step) => (
        <li key={step.title}>
          <span>
            <GrowIcon name={step.icon} />
          </span>
          <em>{step.title}</em>
        </li>
      ))}
    </ol>
  );
}

function GrowIcon({ name }: { name: LineIcon }) {
  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="11" cy="11" r="6.2" />
          <path d="M15.6 15.6 20 20" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 2.8 V5.6 M12 18.4 V21.2 M2.8 12 H5.6 M18.4 12 H21.2" />
        </svg>
      );
    case "rise":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M4 16.5 9.2 11 13 13.6 20 6.5" />
          <path d="M14.6 6.5 H20 V12" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M8 4.5h6.2L18 8.2V19.5H8Z" />
          <path d="M14.2 4.5V8.2H18" />
          <path d="M10.2 12h5.6M10.2 15h4.2" />
        </svg>
      );
    case "person":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="12" cy="8.2" r="2.6" />
          <path d="M6.6 18.5c.8-3.2 2.8-4.8 5.4-4.8s4.6 1.6 5.4 4.8" />
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M5 18.5h14" />
          <path d="M7 18.5V12h3v6.5M11.5 18.5V8h3v10.5M16 18.5V10h3v8.5" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M12 3.5 5.4 6.1v5.2c0 4.1 2.8 7.8 6.6 9.1 3.8-1.3 6.6-5 6.6-9.1V6.1Z" />
        </svg>
      );
    case "pair":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="9" cy="8.4" r="2.2" />
          <circle cx="15.4" cy="9.2" r="1.8" />
          <path d="M4.8 18c.6-2.8 2.2-4.2 4.2-4.2s3.6 1.4 4.2 4.2" />
          <path d="M13.4 18c.4-2 1.6-3 3-3s2.5 1 2.9 3" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}
