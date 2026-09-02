import { getDictionary } from "@/i18n/get-dictionary";

const metricLabels = ["Ziyaretçiler", "Dönüşümler", "Kampanya Performansı"] as const;
const processIcons = ["bulb", "clap", "mega"] as const;

type DcIcon = (typeof processIcons)[number] | "bars" | "play";

export function DataShowcase() {
  const data = getDictionary().servicesPage.data;
  const analytics = data.items[0];
  const creative = data.items[1];

  return (
    <div className="svc-dc">
      <div className="svc-dc-head">
        <p className="svc-dc-eye">
          <span aria-hidden />
          {data.eyebrow}
        </p>
        <h2 className="svc-dc-title font-display">
          <span>{data.titleBefore}</span>
          <span>{data.titleAfter}</span>
        </h2>
      </div>

      <div className="svc-dc-mods">
        <article className="svc-dc-mod">
          <b>{analytics.index}</b>
          <div className="svc-dc-copy">
            <p>
              <i aria-hidden />
              {analytics.label}
            </p>
            <h3 className="font-display">{analytics.title}</h3>
            <span>{analytics.body}</span>
          </div>
          <div className="svc-dc-visual">
            <AnalyticsDash />
          </div>
          <span className="svc-dc-mark">
            <DcIcon name="bars" />
          </span>
        </article>

        <article className="svc-dc-mod is-video">
          <b>{creative.index}</b>
          <div className="svc-dc-copy">
            <p>
              <i aria-hidden />
              {creative.label}
            </p>
            <h3 className="font-display">{creative.title}</h3>
            <span>{creative.body}</span>
          </div>
          <div className="svc-dc-visual">
            <CreativePlayer />
          </div>
          <ul className="svc-dc-steps">
            {data.process.map((step, index) => (
              <li key={step.index}>
                <span>
                  <DcIcon name={processIcons[index] ?? "bulb"} />
                </span>
                <strong>{step.title}</strong>
                <em>{step.body}</em>
              </li>
            ))}
          </ul>
          <span className="svc-dc-mark">
            <DcIcon name="play" />
          </span>
        </article>
      </div>
    </div>
  );
}

function AnalyticsDash() {
  return (
    <div className="svc-dc-dash" aria-hidden>
      <div className="svc-dc-dash-top">
        {metricLabels.map((label, index) => (
          <div key={label} className="svc-dc-metric">
            <em>
              <i />
              {label}
            </em>
            <svg viewBox="0 0 88 28">
              <path
                className="svc-dc-line"
                d={
                  index === 0
                    ? "M2 20 C14 19 20 12 32 14 C46 16 54 8 70 7 C78 6 84 9 86 8"
                    : index === 1
                      ? "M2 16 C16 18 24 10 38 12 C52 14 60 8 86 6"
                      : "M2 18 C12 16 22 20 34 12 C48 4 58 14 72 10 C80 8 84 11 86 9"
                }
              />
            </svg>
          </div>
        ))}
        <span className="svc-dc-donut">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="14" />
            <circle cx="24" cy="24" r="14" className="is-arc" />
            <circle cx="24" cy="24" r="14" className="is-arc-2" />
          </svg>
        </span>
      </div>
      <div className="svc-dc-dash-bot">
        <div className="svc-dc-perf">
          <em>Zaman İçinde Performans</em>
          <svg viewBox="0 0 220 72">
            <path d="M8 18 H212 M8 36 H212 M8 54 H212" />
            <path
              className="svc-dc-line"
              d="M8 58 C28 54 42 40 62 42 C84 44 98 22 122 26 C148 30 164 16 188 18 C200 19 210 14 212 12"
            />
            <circle cx="62" cy="42" r="2.2" />
            <circle cx="122" cy="26" r="2.2" />
            <circle cx="188" cy="18" r="2.2" />
          </svg>
        </div>
        <div className="svc-dc-chan">
          <em>Kanal Dağılımı</em>
          <ul>
            <li className="is-a">
              <i />
            </li>
            <li className="is-b">
              <i />
            </li>
            <li className="is-c">
              <i />
            </li>
            <li className="is-d">
              <i />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CreativePlayer() {
  return (
    <div className="svc-dc-player" aria-hidden>
      <span className="svc-dc-play">
        <svg viewBox="0 0 24 24">
          <path d="M9 7.2 17.2 12 9 16.8Z" />
        </svg>
      </span>
      <div className="svc-dc-rail">
        <svg viewBox="0 0 16 16">
          <path d="M5.2 3.8 12.2 8 5.2 12.2Z" />
        </svg>
        <b>
          <em />
        </b>
      </div>
    </div>
  );
}

function DcIcon({ name }: { name: DcIcon }) {
  switch (name) {
    case "bars":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M4 16.5 9.2 11 13 13.6 20 6.5" />
          <path d="M14.6 6.5 H20 V12" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <rect x="4.5" y="6" width="15" height="12" rx="1.8" />
          <path d="M10.2 9.2 15.2 12 10.2 14.8Z" />
        </svg>
      );
    case "bulb":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M12 4.4a5.1 5.1 0 0 0-3.2 9.1c.5.4.8 1 .8 1.6V16h4.8v-.9c0-.6.3-1.2.8-1.6A5.1 5.1 0 0 0 12 4.4Z" />
          <path d="M10 18.2h4M10.6 20h2.8" />
        </svg>
      );
    case "clap":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M5.4 9.2 9.2 4.8l2.2 1.8-3.8 4.4Z" />
          <path d="M9.6 8.6 13.2 4.6l2.4 2-3.6 4" />
          <path d="M6.2 10.4h11.2v8.2H6.2Z" />
        </svg>
      );
    case "mega":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M5.2 10.2h3.2L16.6 6v12L8.4 13.8H5.2Z" />
          <path d="M8.2 13.8v3.2l2.4-1.2" />
          <path d="M18.2 9.4c.8.7 1.2 1.6 1.2 2.6s-.4 1.9-1.2 2.6" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}
