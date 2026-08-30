import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

const outcomeIcons = ["users", "workflow", "layers", "award"] as const;

type OutcomeIconName = (typeof outcomeIcons)[number];

function OutcomeIcon({ name }: { name: OutcomeIconName }) {
  switch (name) {
    case "users":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="6.2" cy="5.6" r="1.8" />
          <circle cx="10.6" cy="6.2" r="1.4" />
          <path d="M2.8 12.8 C3.2 10.6 4.6 9.4 6.2 9.4 S9.2 10.6 9.6 12.8" />
          <path d="M9.4 12.8 C9.7 11.2 10.6 10.4 11.8 10.4 C13 10.4 13.6 11.2 13.8 12.8" />
        </svg>
      );
    case "workflow":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="5.8" y="2.4" width="4.4" height="3.2" rx="0.6" />
          <rect x="2.4" y="10.4" width="4.4" height="3.2" rx="0.6" />
          <rect x="9.2" y="10.4" width="4.4" height="3.2" rx="0.6" />
          <path d="M8 5.6 V8.2" />
          <path d="M4.6 10.4 V8.2 H11.4 V10.4" />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M8 3.2 L13.2 6 L8 8.8 L2.8 6 Z" />
          <path d="M3.2 8.2 L8 10.8 L12.8 8.2" />
          <path d="M3.2 10.4 L8 13 L12.8 10.4" />
        </svg>
      );
    case "award":
      return (
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="6.2" r="3.2" />
          <path d="M6.2 8.8 L5.4 13.4 L8 11.8 L10.6 13.4 L9.8 8.8" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function OutcomeFlow() {
  return (
    <svg className="sl-outcomes-flow" viewBox="0 0 640 220" aria-hidden>
      <path d="M8 198 C 90 150, 150 190, 230 140 S 380 70, 520 110" />
      <path d="M20 210 C 120 170, 190 210, 290 160 S 430 100, 610 150" />
      <path d="M0 186 C 80 130, 170 168, 260 118 S 410 58, 560 88" />
      <circle cx="86" cy="168" r="2.4" />
      <circle cx="228" cy="141" r="2.1" />
      <circle cx="352" cy="96" r="2.6" />
      <circle cx="508" cy="112" r="2.2" />
      <circle className="is-cyan" cx="292" cy="158" r="2.3" />
    </svg>
  );
}

export function SolutionsOutcomes() {
  const { outcomes } = getDictionary().solutionsPage;

  return (
    <section className="sl-results" aria-labelledby="sl-results-title">
      <div className="sl-shell sl-outcomes-grid">
        <Reveal className="sl-outcomes-copy">
          <h2 id="sl-results-title" className="font-display sl-outcomes-title">
            {outcomes.headline1}
            <br />
            {outcomes.headline2}
            <br />
            {outcomes.headline3}
            <em>.</em>
          </h2>
          <i className="sl-outcomes-rule" />
          <p className="sl-outcomes-support">{outcomes.support}</p>
        </Reveal>

        <ol className="sl-outcomes-list">
          {outcomes.items.map((item, index) => (
            <li key={item.index}>
              <Reveal delay={index * 70} className="sl-outcomes-row">
                <b>
                  <OutcomeIcon name={outcomeIcons[index] ?? "users"} />
                </b>
                <div>
                  <span>{item.index}</span>
                  <h3 className="font-display">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
      <OutcomeFlow />
      <span className="sl-outcomes-dots" aria-hidden />
    </section>
  );
}
