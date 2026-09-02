import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

const teaserIcons = ["request", "crm", "mail", "team", "track"] as const;
const chipIcons = ["crm", "whatsapp", "mail", "calendar", "pay", "api"] as const;
const stepIcons = ["request", "crm", "mail", "team", "track"] as const;
const integrationIcons = ["crm", "mail", "whatsapp", "calendar", "pay", "api"] as const;

type AutoIconName =
  | (typeof teaserIcons)[number]
  | (typeof chipIcons)[number]
  | "bolt"
  | "check";

function AutoIcon({ name }: { name: AutoIconName }) {
  switch (name) {
    case "request":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="3.2" y="2.6" width="9.6" height="10.8" rx="1.1" />
          <path d="M5.6 6 H10.4" />
          <path d="M5.6 8.2 H10.4" />
          <path d="M5.6 10.4 H8.8" />
        </svg>
      );
    case "crm":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="5.4" r="2.1" />
          <path d="M3.6 13 C4 10.6 5.6 9.2 8 9.2 S12 10.6 12.4 13" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.4" y="3.8" width="11.2" height="8.4" rx="1" />
          <path d="M3 4.6 L8 8.4 L13 4.6" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="6.2" cy="5.6" r="1.8" />
          <circle cx="10.6" cy="6.2" r="1.4" />
          <path d="M2.8 12.8 C3.2 10.6 4.6 9.4 6.2 9.4 S9.2 10.6 9.6 12.8" />
          <path d="M9.4 12.8 C9.7 11.2 10.6 10.4 11.8 10.4 C13 10.4 13.6 11.2 13.8 12.8" />
        </svg>
      );
    case "track":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <path d="M8 5 V8.2 L10.2 9.6" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4.2 12.8 L3.4 14.2 L5.4 13.6 C6.2 14 7.1 14.2 8 14.2 C11.4 14.2 14.2 11.4 14.2 8 S11.4 1.8 8 1.8 1.8 4.6 1.8 8 C1.8 9 2 9.9 2.4 10.7 Z" />
          <path d="M5.6 6.4 C5.8 8.2 7.4 9.8 9.4 10.2 C9.8 9.6 10.2 9.2 10.4 8.8 L9.2 8.2 C8.2 8.8 7.2 7.8 7.8 6.8 Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.6" y="3.4" width="10.8" height="10.2" rx="1.1" />
          <path d="M2.6 6.4 H13.4" />
          <path d="M5.2 2.6 V4.4" />
          <path d="M10.8 2.6 V4.4" />
        </svg>
      );
    case "pay":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.2" y="4" width="11.6" height="8" rx="1.1" />
          <path d="M2.2 6.6 H13.8" />
          <path d="M5 10 H8.2" />
        </svg>
      );
    case "api":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="4.2" cy="8" r="1.6" />
          <circle cx="11.8" cy="4.8" r="1.6" />
          <circle cx="11.8" cy="11.2" r="1.6" />
          <path d="M5.7 7.4 L10.3 5.4" />
          <path d="M5.7 8.6 L10.3 10.6" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M9.2 2.4 L4.6 8.6 H8 L6.8 13.6 L12.2 6.8 H8.6 Z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.8 8.2 L6.7 11.1 L12.4 4.9" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function AutoWires() {
  return (
    <svg className="sl-auto-wires" viewBox="0 0 720 520" preserveAspectRatio="none" aria-hidden>
      <path d="M40 90 C 180 40, 280 160, 430 110 S 640 40, 710 120" />
      <path d="M20 240 C 160 200, 260 310, 420 270 S 620 210, 700 300" />
      <path d="M80 430 C 220 390, 340 480, 520 430 S 660 390, 720 450" />
    </svg>
  );
}

export function AutomationScene() {
  const { automation } = getDictionary().solutionsPage;
  const ui = automation.panel;

  return (
    <section id="otomasyon" className="sl-auto" aria-labelledby="sl-auto-title">
      <div className="sl-shell sl-auto-grid">
        <Reveal className="sl-auto-copy">
          <p className="sl-kicker sl-auto-kicker">
            <span>{automation.index}</span>
            {automation.label}
          </p>
          <h2 id="sl-auto-title" className="font-display sl-auto-title">
            {automation.title1}
            <br />
            <em>{automation.titleAccent}</em> {automation.title2}
          </h2>
          <p className="sl-auto-body">{automation.body}</p>
          <p className="sl-auto-outcome">{automation.outcome}</p>
          <ol className="sl-auto-teaser">
            {automation.flow.map((step, index) => (
              <li key={step}>
                <span>
                  <AutoIcon name={teaserIcons[index] ?? "request"} />
                  {step}
                </span>
                {index < automation.flow.length - 1 ? <i /> : null}
              </li>
            ))}
          </ol>
          <ul className="sl-auto-chips">
            {automation.nodes.map((item, index) => (
              <li key={item}>
                <AutoIcon name={chipIcons[index] ?? "crm"} />
                {item}
              </li>
            ))}
          </ul>
          <span className="sl-auto-guides" aria-hidden />
        </Reveal>

        <div className="sl-auto-stage">
          <AutoWires />
          <Reveal delay={80} className="sl-auto-board">
            <article className="sl-auto-flow" aria-hidden="true">
              <header className="sl-auto-topbar">
                <strong>
                  <b>
                    <AutoIcon name="bolt" />
                  </b>
                  {ui.title}
                </strong>
                <small>
                  {ui.live}
                  <i />
                </small>
              </header>

              <ol className="sl-auto-steps">
                {ui.steps.map((step, index) => (
                  <li key={step.title}>
                    <b>
                      <AutoIcon name={stepIcons[index] ?? "request"} />
                    </b>
                    <div>
                      <strong>{step.title}</strong>
                      <span>{step.body}</span>
                    </div>
                    <em>
                      {step.time}
                      <u>
                        <AutoIcon name="check" />
                      </u>
                    </em>
                  </li>
                ))}
              </ol>

              <ul className="sl-auto-metrics">
                {ui.metrics.map((metric, index) => (
                  <li key={metric.label}>
                    <small>{metric.label}</small>
                    <strong>{metric.value}</strong>
                    {index === ui.metrics.length - 1 ? (
                      <svg className="sl-auto-spark" viewBox="0 0 64 18" aria-hidden>
                        <path d="M1 13 L12 11 L22 14 L32 7 L42 9 L52 4 L63 6" />
                      </svg>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>

            <div className="sl-auto-aside">
              <aside className="sl-auto-status" aria-hidden="true">
                <p>{ui.statusTitle}</p>
                <div className="sl-auto-ring">
                  <svg viewBox="0 0 80 80">
                    <defs>
                      <linearGradient id="sl-auto-ring-grad" x1="8%" y1="0%" x2="92%" y2="100%">
                        <stop offset="0%" stopColor="#1554F0" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                    </defs>
                    <circle cx="40" cy="40" r="32" />
                    <circle className="sl-auto-ring-value" cx="40" cy="40" r="32" />
                  </svg>
                  <em>{ui.statusValue}</em>
                </div>
                <span>{ui.statusBody}</span>
              </aside>

              <aside className="sl-auto-integrations" aria-hidden="true">
                <p>{ui.integrationsTitle}</p>
                <ul>
                  {ui.integrations.map((item, index) => (
                    <li key={item}>
                      <b>
                        <AutoIcon name={integrationIcons[index] ?? "crm"} />
                      </b>
                      {item}
                      <i />
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
