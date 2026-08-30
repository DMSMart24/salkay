import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

const featureIcons = ["portal", "dashboard", "account", "booking"] as const;
const navIcons = ["overview", "projects", "docs", "messages", "invoices", "settings"] as const;
const kpiIcons = ["folder", "message", "document"] as const;
const eventIcons = ["upload", "message", "document"] as const;
const trustIcons = ["shield", "sync", "clock", "expand"] as const;

type PlatformIconName =
  | (typeof featureIcons)[number]
  | (typeof navIcons)[number]
  | (typeof kpiIcons)[number]
  | (typeof eventIcons)[number]
  | (typeof trustIcons)[number]
  | "search"
  | "bell"
  | "mail"
  | "check";

function PlatformIcon({ name }: { name: PlatformIconName }) {
  switch (name) {
    case "portal":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.4" y="3" width="11.2" height="10" rx="1.2" />
          <path d="M2.4 6.2 H13.6" />
          <path d="M6.2 6.2 V13" />
        </svg>
      );
    case "dashboard":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3 12.4 A6.2 6.2 0 0 1 13 12.4" />
          <path d="M8 11.2 L11.2 6.8" />
          <circle cx="8" cy="11.2" r="0.7" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="5.6" r="2.2" />
          <path d="M3.4 13.2 C3.8 10.6 5.6 9.2 8 9.2 S12.2 10.6 12.6 13.2" />
        </svg>
      );
    case "booking":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.6" y="3.4" width="10.8" height="10.2" rx="1.1" />
          <path d="M2.6 6.4 H13.4" />
          <path d="M5.2 2.6 V4.4" />
          <path d="M10.8 2.6 V4.4" />
        </svg>
      );
    case "overview":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.4" y="2.4" width="5" height="5" rx="0.8" />
          <rect x="8.6" y="2.4" width="5" height="5" rx="0.8" />
          <rect x="2.4" y="8.6" width="5" height="5" rx="0.8" />
          <rect x="8.6" y="8.6" width="5" height="5" rx="0.8" />
        </svg>
      );
    case "projects":
    case "folder":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M2.6 5.2 V12.6 H13.4 V6.4 H8.2 L6.8 4.8 H2.6 Z" />
        </svg>
      );
    case "docs":
    case "document":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M5 2.6 H9.2 L13 6.4 V13.4 H5 Z" />
          <path d="M9.2 2.6 V6.4 H13" />
          <path d="M6.6 9 H11.2" />
          <path d="M6.6 11.2 H10.2" />
        </svg>
      );
    case "messages":
    case "message":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3 3.6 H13 V11 H6.6 L3 13.4 Z" />
        </svg>
      );
    case "invoices":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4 2.6 H12 V13.4 L10.4 12.2 L8 13.4 L5.6 12.2 L4 13.4 Z" />
          <path d="M6 6.2 H10" />
          <path d="M6 8.4 H10" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 2.6 V4.2" />
          <path d="M8 11.8 V13.4" />
          <path d="M2.6 8 H4.2" />
          <path d="M11.8 8 H13.4" />
          <path d="M4.2 4.2 L5.3 5.3" />
          <path d="M10.7 10.7 L11.8 11.8" />
          <path d="M11.8 4.2 L10.7 5.3" />
          <path d="M5.3 10.7 L4.2 11.8" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="7" cy="7" r="3.2" />
          <path d="M9.4 9.4 L12.6 12.6" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4.4 7.2 C4.4 5.2 6 3.6 8 3.6 S11.6 5.2 11.6 7.2 V10 L13 11.6 H3 Z" />
          <path d="M6.6 11.8 C6.8 12.8 7.4 13.4 8 13.4 S9.2 12.8 9.4 11.8" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="2.4" y="3.8" width="11.2" height="8.4" rx="1" />
          <path d="M3 4.6 L8 8.4 L13 4.6" />
        </svg>
      );
    case "upload":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 11.6 V4.6" />
          <path d="M5.4 6.8 L8 4.2 L10.6 6.8" />
          <path d="M3.4 12.6 H12.6" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 2.6 L13 4.4 V8.2 C13 11.2 10.6 13.2 8 13.6 C5.4 13.2 3 11.2 3 8.2 V4.4 Z" />
        </svg>
      );
    case "sync":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M12.4 8 A4.4 4.4 0 0 0 5.2 4.8" />
          <path d="M3.6 8 A4.4 4.4 0 0 0 10.8 11.2" />
          <path d="M4.4 3.6 V5.6 H6.4" />
          <path d="M11.6 12.4 V10.4 H9.6" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <path d="M8 5.2 V8.2 L10.2 9.6" />
        </svg>
      );
    case "expand":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M6.4 3.4 H3.4 V6.4" />
          <path d="M9.6 3.4 H12.6 V6.4" />
          <path d="M6.4 12.6 H3.4 V9.6" />
          <path d="M9.6 12.6 H12.6 V9.6" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.6 8.2 L6.6 11.2 L12.4 4.8" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function StepMark({ state }: { state: "done" | "active" | "next" }) {
  switch (state) {
    case "done":
      return <PlatformIcon name="check" />;
    case "active":
      return <em>ACTIVE</em>;
    case "next":
      return null;
    default: {
      const _never: never = state;
      return _never;
    }
  }
}

export function PlatformScene() {
  const { platform } = getDictionary().solutionsPage;
  const { portal } = platform;
  const [outcomeBefore, outcomeAfter] = platform.outcome.split(platform.outcomeAccent);

  return (
    <section id="platformlar" className="sl-platform" aria-labelledby="sl-platform-title">
      <div className="sl-shell sl-platform-grid">
        <Reveal className="sl-platform-copy">
          <p className="sl-kicker sl-platform-kicker">
            <span>{platform.index}</span>
            {platform.label}
          </p>
          <h2 id="sl-platform-title" className="font-display sl-platform-title">
            {platform.title1}
            <br />
            <em>{platform.titleAccent}</em>
            <br />
            {platform.title2}
          </h2>
          <p className="sl-platform-body">{platform.body}</p>
          <ul className="sl-platform-chips">
            {platform.features.map((item, index) => (
              <li key={item}>
                <PlatformIcon name={featureIcons[index] ?? "portal"} />
                {item}
              </li>
            ))}
          </ul>
          <p className="sl-platform-outcome">
            {outcomeBefore}
            <em>{platform.outcomeAccent}</em>
            {outcomeAfter}
          </p>
          <span className="sl-platform-guides" aria-hidden />
        </Reveal>

        <div className="sl-platform-stage">
          <Reveal delay={80} className="sl-platform-frame-reveal">
            <article className="sl-platform-frame" aria-hidden="true">
              <header className="sl-platform-topbar">
                <span className="sl-platform-dots" />
                <strong>{portal.brand}</strong>
                <div className="sl-platform-tools">
                  <span className="sl-platform-search">
                    <PlatformIcon name="search" />
                    {portal.search}
                  </span>
                  <span className="sl-platform-bell">
                    <PlatformIcon name="bell" />
                    <b>2</b>
                  </span>
                  <span className="sl-platform-user">SK</span>
                  <i className="sl-platform-chevron" />
                </div>
              </header>

              <div className="sl-platform-app">
                <aside className="sl-platform-side">
                  <div className="sl-platform-brand">
                    <Image
                      src="/brand/salkay-a-mark.png"
                      alt=""
                      width={532}
                      height={400}
                      sizes="28px"
                    />
                    <span>
                      SALKAY
                      <small>PORTAL</small>
                    </span>
                  </div>
                  <nav>
                    {platform.nav.map((item, index) => (
                      <span key={item} className={index === 0 ? "is-on" : undefined}>
                        <PlatformIcon name={navIcons[index] ?? "overview"} />
                        {item}
                      </span>
                    ))}
                  </nav>
                  <div className="sl-platform-secure">
                    <b>
                      {portal.secure}
                      <i />
                    </b>
                    <p>{portal.secureBody}</p>
                  </div>
                </aside>

                <div className="sl-platform-main">
                  <p className="sl-platform-label">{portal.customer}</p>
                  <div className="sl-platform-hello">
                    <h3 className="font-display">{platform.welcome}</h3>
                    <small>
                      <i />
                      {portal.systemActive}
                    </small>
                  </div>

                  <ul className="sl-platform-kpis">
                    {platform.metrics.map((metric, index) => (
                      <li key={metric.label}>
                        <span>{metric.label}</span>
                        <strong className="font-display">{metric.value}</strong>
                        <b>
                          <PlatformIcon name={kpiIcons[index] ?? "folder"} />
                        </b>
                      </li>
                    ))}
                  </ul>

                  <div className="sl-platform-panels">
                    <div className="sl-platform-project">
                      <div className="sl-platform-project-head">
                        <div>
                          <p>{portal.projectKicker}</p>
                          <h4>{portal.projectName}</h4>
                          <small>Status: {portal.projectStatus}</small>
                        </div>
                        <div className="sl-platform-ring">
                          <svg viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="32" />
                            <circle className="sl-platform-ring-value" cx="40" cy="40" r="32" />
                          </svg>
                          <em>{portal.progress}</em>
                        </div>
                      </div>
                      <span className="sl-platform-bar" />
                      <ol>
                        {portal.steps.map((step) => (
                          <li key={step.index} data-state={step.state}>
                            <small>{step.index}</small>
                            <b>{step.title}</b>
                            <StepMark state={step.state} />
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="sl-platform-activity">
                      <p>{portal.activityTitle}</p>
                      <ul>
                        {portal.events.map((event, index) => (
                          <li key={event.title}>
                            <b>
                              <PlatformIcon name={eventIcons[index] ?? "upload"} />
                            </b>
                            <span>
                              {event.title}
                              <small>{event.time}</small>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            <aside className="sl-platform-float" aria-hidden="true">
              <p>
                <PlatformIcon name="mail" />
                {portal.messageLabel}
              </p>
              <div>
                <span>SK</span>
                <strong>
                  {portal.messageName}
                  <em>“{portal.messageBody}”</em>
                </strong>
                <i />
              </div>
            </aside>
          </Reveal>
        </div>

        <ul className="sl-platform-trust">
          {portal.trust.map((item, index) => (
            <li key={item.label}>
              <PlatformIcon name={trustIcons[index] ?? "shield"} />
              <span>
                {item.label}
                <small>{item.body}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
