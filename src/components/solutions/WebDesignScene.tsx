import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

const featureIcons = ["globe", "layout", "rocket", "devices", "chart"] as const;
const principleIcons = ["target", "pen", "code"] as const;
const metricIcons = ["bolt", "shield", "phone"] as const;
const deviceIcons = ["desktop", "tablet", "mobile"] as const;

type LineIconName =
  | (typeof featureIcons)[number]
  | (typeof principleIcons)[number]
  | (typeof metricIcons)[number]
  | (typeof deviceIcons)[number];

function LineIcon({ name }: { name: LineIconName }) {
  switch (name) {
    case "globe":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <path d="M8 2.8 C6.2 4.6 5.4 6.4 5.4 8 S6.2 11.4 8 13.2 C9.8 11.4 10.6 9.6 10.6 8 S9.8 4.6 8 2.8 Z" />
          <path d="M3 8 H13" />
        </svg>
      );
    case "layout":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.4" y="3" width="11.2" height="10" rx="1.2" />
          <path d="M2.4 6.2 H13.6" />
          <path d="M6.4 6.2 V13" />
        </svg>
      );
    case "rocket":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 2.4 C9.6 3.6 11.2 5.8 11.2 8.4 C11.2 10 10.4 11.4 9.2 12.4 L8 13.2 L6.8 12.4 C5.6 11.4 4.8 10 4.8 8.4 C4.8 5.8 6.4 3.6 8 2.4 Z" />
          <circle cx="8" cy="7.4" r="1.1" />
          <path d="M5.6 11.6 L4.6 13.4" />
          <path d="M10.4 11.6 L11.4 13.4" />
        </svg>
      );
    case "devices":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.2" y="3.4" width="8.2" height="6.4" rx="0.9" />
          <path d="M4.4 9.8 H8.2" />
          <rect x="9.4" y="6.8" width="4.2" height="6" rx="0.9" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M2.6 12.6 H13.4" />
          <path d="M4 10.4 V12.6" />
          <path d="M7.2 7.6 V12.6" />
          <path d="M10.4 5.2 V12.6" />
          <path d="M4 8.2 L7.2 6.2 L10.4 4.2 L13 5.6" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <circle cx="8" cy="8" r="2.4" />
          <circle cx="8" cy="8" r="0.6" />
        </svg>
      );
    case "pen":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M10.6 2.8 L13.2 5.4 L6.2 12.4 H3.6 V9.8 Z" />
          <path d="M9.2 4.2 L11.8 6.8" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M6 4.4 L3.4 8 L6 11.6" />
          <path d="M10 4.4 L12.6 8 L10 11.6" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M9.2 2.4 L4.4 8.8 H8 L6.8 13.6 L11.8 7.2 H8.2 Z" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 2.4 L13.2 4.2 V8.2 C13.2 11.1 10.9 13.2 8 14 C5.1 13.2 2.8 11.1 2.8 8.2 V4.2 Z" />
          <path d="M5.8 8 L7.4 9.6 L10.4 6.4" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="4.6" y="2.2" width="6.8" height="11.6" rx="1.2" />
          <path d="M7 3.3 H9" />
        </svg>
      );
    case "desktop":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.2" y="3" width="11.6" height="7.4" rx="1" />
          <path d="M6.2 12.8 H9.8" />
          <path d="M8 10.4 V12.8" />
        </svg>
      );
    case "tablet":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="4" y="2.4" width="8" height="11.2" rx="1.2" />
          <circle cx="8" cy="12.2" r="0.45" />
        </svg>
      );
    case "mobile":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="5.2" y="2.2" width="5.6" height="11.6" rx="1.1" />
          <path d="M7 3.2 H9" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function BrandMark({ className, sizes }: { className: string; sizes: string }) {
  return (
    <Image
      src="/brand/salkay-a-mark.png"
      alt=""
      width={532}
      height={400}
      sizes={sizes}
      className={className}
    />
  );
}

function SiteLogo({ className }: { className: string }) {
  return (
    <Image
      src="/brand/salkay-logo-official-header.png"
      alt=""
      width={308}
      height={72}
      sizes="120px"
      className={className}
    />
  );
}

function WebArt() {
  return (
    <div className="sl-web-art" aria-hidden>
      <span className="sl-web-art-grid" />
      <span className="sl-web-art-glow" />
      <svg className="sl-web-art-waves" viewBox="0 0 280 160" fill="none">
        <path d="M-10 118 C 40 88, 90 148, 140 108 S 220 52, 300 96" />
        <path d="M-16 132 C 48 98, 102 156, 156 118 S 236 68, 308 108" />
      </svg>
      <div className="sl-web-art-mount">
        <span className="sl-web-art-fill" />
      </div>
      <BrandMark className="sl-web-art-mark" sizes="(max-width: 480px) 52vw, 380px" />
    </div>
  );
}

function ShowcaseHeadline({
  title1,
  title2,
}: {
  title1: string;
  title2: string;
}) {
  const accent = title2.replace(/\.$/, "");

  return (
    <h3 className="font-display">
      {title1}
      <br />
      {accent}
      <i>.</i>
    </h3>
  );
}

export function WebDesignScene() {
  const { web } = getDictionary().solutionsPage;
  const specItems = web.showcase.specs.split(/\s*[•·]\s*/).filter(Boolean);

  return (
    <section id="web-design" className="sl-web" aria-labelledby="sl-web-title">
      <span className="sl-web-dots-field" aria-hidden />
      <svg className="sl-web-flow" viewBox="0 0 920 220" fill="none" aria-hidden>
        <path d="M-40 168 C 90 70, 210 210, 340 128 S 560 36, 710 150 S 880 90, 980 118" />
        <path d="M-20 188 C 120 96, 240 220, 370 148 S 580 58, 730 166 S 900 112, 990 136" />
        <circle cx="214" cy="132" r="2.2" />
        <circle cx="676" cy="118" r="2" />
      </svg>

      <div className="sl-shell sl-web-grid">
        <Reveal className="sl-web-copy">
          <p className="sl-web-kicker">
            <span>
              <b>{web.index}</b>
              <i />
            </span>
            {web.label}
          </p>
          <h2 id="sl-web-title" className="font-display sl-web-title">
            {web.title1}
            <br />
            {web.title2}
            <br />
            <em>{web.titleAccent1}</em>
            <br />
            <em>{web.titleAccent2}</em>
          </h2>
          <p className="sl-web-outcome">
            {web.outcome.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <ul className="sl-web-tiles">
            {web.features.map((item, index) => (
              <li key={item}>
                <LineIcon name={featureIcons[index] ?? "globe"} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ul className="sl-web-principles">
            {web.principles.map((item, index) => (
              <li key={item.label}>
                <b>
                  <LineIcon name={principleIcons[index] ?? "target"} />
                </b>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.body}</small>
                </span>
                <i />
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="sl-web-stage">
          <div className="sl-web-frame">
            <Reveal className="sl-web-browser-reveal">
              <article className="sl-web-browser" aria-hidden="true">
                <header className="sl-web-chrome">
                  <span className="sl-web-dots" />
                </header>
                <div className="sl-web-site">
                  <div className="sl-web-site-bar">
                    <SiteLogo className="sl-web-site-logo" />
                    <i className="sl-web-site-burger" />
                  </div>
                  <div className="sl-web-site-hero">
                    <div className="sl-web-site-copy">
                      <p>{web.showcase.eyebrow}</p>
                      <ShowcaseHeadline
                        title1={web.showcase.title1}
                        title2={web.showcase.title2}
                      />
                      <em className="sl-web-site-body">{web.showcase.body}</em>
                      <span className="sl-web-site-cta">{web.showcase.primary}</span>
                    </div>
                    <WebArt />
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={160} className="sl-web-device-reveal">
              <article className="sl-web-device" aria-hidden="true">
                <div className="sl-web-device-screen">
                  <div className="sl-web-device-bar">
                    <SiteLogo className="sl-web-device-logo" />
                    <i />
                  </div>
                  <p>
                    WEB DESIGN ·
                    <br />
                    DIGITAL
                    <br />
                    EXPERIENCES
                  </p>
                  <ShowcaseHeadline
                    title1={web.showcase.title1}
                    title2={web.showcase.title2}
                  />
                  <span className="sl-web-device-cta">{web.showcase.primary}</span>
                  <div className="sl-web-device-art">
                    <WebArt />
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>

        <Reveal delay={80} className="sl-web-bottom">
          <ul className="sl-web-metrics">
            {web.metrics.map((item, index) => (
              <li key={item.label}>
                <b>
                  <LineIcon name={metricIcons[index] ?? "bolt"} />
                </b>
                <span>
                  <strong>{item.value}</strong>
                  <small>{item.label}</small>
                </span>
              </li>
            ))}
          </ul>
          <ul className="sl-web-captions">
            {web.showcase.devices.map((item, index) => (
              <li key={item} data-active={index === 0 ? "true" : undefined}>
                <span className="sl-web-caption-icon">
                  <LineIcon name={deviceIcons[index] ?? "desktop"} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="sl-web-specs">
            {specItems.map((item, index) => (
              <span key={item}>
                {index > 0 ? <i aria-hidden /> : null}
                {item.trim()}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
