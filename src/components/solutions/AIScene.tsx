import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

const cardIcons = ["target", "flag", "chart", "arrow"] as const;
const flowIcons = ["doc", "search", "flag", "info", "check"] as const;
const trustIcons = ["shield", "sync", "clock", "expand"] as const;

type AiIconName =
  | (typeof cardIcons)[number]
  | (typeof flowIcons)[number]
  | (typeof trustIcons)[number]
  | "globe"
  | "loader"
  | "trend";

function AiIcon({ name }: { name: AiIconName }) {
  switch (name) {
    case "globe":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <path d="M8 2.8 C6.2 4.6 5.4 6.4 5.4 8 S6.2 11.4 8 13.2 C9.8 11.4 10.6 9.6 10.6 8 S9.8 4.6 8 2.8 Z" />
          <path d="M3 8 H13" />
        </svg>
      );
    case "loader":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M12.2 8 A4.2 4.2 0 1 0 8 12.2" />
          <path d="M11.1 5.2 L12.4 8 L9.6 8.4" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="8" cy="8" r="0.7" />
        </svg>
      );
    case "flag":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4.2 13.2 V3.2" />
          <path d="M4.2 3.2 H11.4 L9.8 5.8 L11.4 8.4 H4.2" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 3 A5 5 0 1 1 3.4 11.2" />
          <path d="M8 3 V8 H12.2" />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.2 8 H12.6" />
          <path d="M9.2 4.6 L12.8 8 L9.2 11.4" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M5 2.6 H9.2 L13 6.4 V13.4 H5 Z" />
          <path d="M9.2 2.6 V6.4 H13" />
          <path d="M6.6 9 H11.2" />
          <path d="M6.6 11.2 H10.2" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="7" cy="7" r="3.2" />
          <path d="M9.4 9.4 L12.6 12.6" />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="5.2" />
          <path d="M8 7.2 V11.2" />
          <path d="M8 4.9 V5.5" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.8 8.2 L6.7 11.1 L12.4 4.9" />
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
    case "trend":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M2.6 11.4 L6.2 7.6 L8.8 9.4 L13.4 4.4" />
          <path d="M10.2 4.4 H13.4 V7.6" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function AiCore() {
  return (
    <svg className="sl-ai-core" viewBox="0 0 280 280" aria-hidden>
      <defs>
        <radialGradient id="sl-ai-orb" cx="46%" cy="40%" r="52%">
          <stop offset="0%" stopColor="#9ec4ff" />
          <stop offset="38%" stopColor="#246bfd" />
          <stop offset="100%" stopColor="#6a4cff" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <circle className="sl-ai-core-ring" cx="140" cy="140" r="128" />
      <circle className="sl-ai-core-ring" cx="140" cy="140" r="98" />
      <circle className="sl-ai-core-ring" cx="140" cy="140" r="68" />
      <ellipse className="sl-ai-core-orbit" cx="140" cy="140" rx="118" ry="42" />
      <ellipse className="sl-ai-core-orbit is-tilt" cx="140" cy="140" rx="108" ry="70" />
      <circle className="sl-ai-core-orb" cx="140" cy="140" r="34" />
      <circle className="sl-ai-core-node" cx="248" cy="128" r="3.2" />
      <circle className="sl-ai-core-node" cx="52" cy="154" r="2.4" />
      <circle className="sl-ai-core-node" cx="186" cy="48" r="2.2" />
      <circle className="sl-ai-core-node" cx="96" cy="232" r="2" />
      <circle className="sl-ai-core-node is-cyan" cx="214" cy="204" r="2.6" />
    </svg>
  );
}

export function AIScene() {
  const { ai } = getDictionary().solutionsPage;
  const ui = ai.interface;
  const [outcomeBefore] = ai.outcome.split(ai.outcomeAccent);

  return (
    <section id="ai" className="sl-ai" aria-labelledby="sl-ai-title">
      <div className="sl-shell sl-ai-grid">
        <Reveal className="sl-ai-copy">
          <p className="sl-kicker sl-ai-kicker">
            <span>{ai.index}</span>
            {ai.label}
          </p>
          <h2 id="sl-ai-title" className="font-display sl-ai-title">
            {ai.title1}
            <br />
            <em>{ai.titleAccent}</em>
            <br />
            {ai.title2}
          </h2>
          <p className="sl-ai-body">{ai.body}</p>
          <p className="sl-ai-outcome">
            {outcomeBefore}
            <em>{ai.outcomeAccent}</em>
          </p>
          <span className="sl-ai-guides" aria-hidden />
        </Reveal>

        <div className="sl-ai-stage">
          <AiCore />
          <Reveal delay={80} className="sl-ai-frame-reveal">
            <article className="sl-ai-frame" aria-hidden="true">
              <header className="sl-ai-topbar">
                <div className="sl-ai-brand">
                  <Image
                    src="/brand/salkay-a-mark.png"
                    alt=""
                    width={532}
                    height={400}
                    sizes="22px"
                  />
                  <strong>
                    {ui.brand}
                    <em>{ui.product}</em>
                  </strong>
                </div>
                <small className="sl-ai-live">
                  <span className="sl-ai-live-full">{ui.live}</span>
                  <span className="sl-ai-live-short">{ui.liveShort}</span>
                  <i />
                </small>
              </header>

              <p className="sl-ai-label">{ui.analysisLabel}</p>

              <div className="sl-ai-request">
                <div>
                  <h3>{ui.requestTitle}</h3>
                  <div className="sl-ai-meta">
                    <span>
                      <b>
                        <AiIcon name="globe" />
                      </b>
                      <small>{ui.sourceLabel}</small>
                      {ui.sourceValue}
                    </span>
                    <span>
                      <b>
                        <AiIcon name="loader" />
                      </b>
                      <small>{ui.statusLabel}</small>
                      {ui.statusValue}
                    </span>
                  </div>
                </div>
                <div className="sl-ai-ring">
                  <svg viewBox="0 0 80 80">
                    <defs>
                      <linearGradient id="sl-ai-ring-grad" x1="8%" y1="0%" x2="92%" y2="100%">
                        <stop offset="0%" stopColor="#246bfd" />
                        <stop offset="100%" stopColor="#16c7ff" />
                      </linearGradient>
                    </defs>
                    <circle cx="40" cy="40" r="32" />
                    <circle className="sl-ai-ring-value" cx="40" cy="40" r="32" />
                  </svg>
                  <em>{ui.confidenceValue}</em>
                  <small>{ui.confidence}</small>
                </div>
              </div>

              <ul className="sl-ai-intel">
                {ui.cards.map((card, index) => (
                  <li key={card.label}>
                    <b>
                      <AiIcon name={cardIcons[index] ?? "target"} />
                    </b>
                    <small>{card.label}</small>
                    <strong>{card.value}</strong>
                    {card.detail ? <span>{card.detail}</span> : null}
                  </li>
                ))}
              </ul>

              <div className="sl-ai-gap">
                <p className="sl-ai-label">{ui.missingLabel}</p>
                <div className="sl-ai-gap-row">
                  <span>{ui.missingField}</span>
                  <em>{ui.missingPill}</em>
                </div>
                <p className="sl-ai-suggest">
                  <b>{ui.suggestionLabel}</b> {ui.suggestionBody}
                </p>
              </div>

              <ol className="sl-ai-flow">
                {ui.flow.map((step, index) => (
                  <li key={step} data-active={index === ui.flow.length - 1 ? "true" : undefined}>
                    <b>
                      <AiIcon name={flowIcons[index] ?? "doc"} />
                    </b>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
            <aside className="sl-ai-float" aria-hidden="true">
              <p>✦ {ui.floatLabel}</p>
              <strong>{ui.floatBody}</strong>
              <div>
                <span>
                  {ui.floatPriorityLabel}: <em>{ui.floatPriority}</em>
                </span>
                <AiIcon name="trend" />
              </div>
            </aside>
          </Reveal>
        </div>

        <ul className="sl-ai-trust">
          {ui.trust.map((item, index) => (
            <li key={item.label}>
              <AiIcon name={trustIcons[index] ?? "shield"} />
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
