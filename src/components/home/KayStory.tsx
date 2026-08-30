import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

const valueIcons = ["shield", "bolt", "layers", "support"] as const;

type ValueIconName = (typeof valueIcons)[number];

function ValueIcon({ name }: { name: ValueIconName }) {
  switch (name) {
    case "shield":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 4.4 L18.6 6.6 V12.2 C18.6 16.2 15.6 19.2 12 20.2 C8.4 19.2 5.4 16.2 5.4 12.2 V6.6 Z" />
          <path d="M9 12 L11.1 14 L15.2 9.6" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M13.2 4.4 L6.8 13.2 H12 L10.8 19.6 L17.4 10.6 H12.2 Z" />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6 8.4 L12 5.6 L18 8.4 L12 11.2 Z" />
          <path d="M6 12 L12 14.8 L18 12" />
          <path d="M6 15.6 L12 18.4 L18 15.6" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M7.2 11.2 V10 C7.2 7.2 9.4 5 12 5 S16.8 7.2 16.8 10 V11.2" />
          <rect x="4.8" y="11.2" width="3.4" height="5.2" rx="1.2" />
          <rect x="15.8" y="11.2" width="3.4" height="5.2" rx="1.2" />
          <path d="M16.8 16.4 V17.2 C16.8 19.2 14.8 20.6 12.4 20.6 H12" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function StatementArt() {
  return (
    <div className="home-statement-art" aria-hidden>
      <span className="home-statement-art-grid" />
      <span className="home-statement-art-glow" />
      <svg className="home-statement-art-wave" viewBox="0 0 420 220" fill="none">
        <path d="M-10 118 C 50 78, 110 168, 180 112 S 300 46, 440 104" />
        <path d="M-16 138 C 60 92, 128 178, 198 128 S 318 64, 448 122" />
        <path d="M-8 96 C 70 64, 140 148, 214 98 S 332 38, 452 88" />
        <circle cx="118" cy="108" r="2.1" />
        <circle cx="214" cy="96" r="1.8" />
        <circle cx="302" cy="78" r="2" />
      </svg>
      <Image
        src="/brand/salkay-a-mark.png"
        alt=""
        width={532}
        height={400}
        sizes="(max-width: 768px) 70vw, 420px"
        className="home-statement-art-mark"
      />
    </div>
  );
}

export function KayStory() {
  const { kayStory } = getDictionary().home;

  return (
    <section
      id="kay"
      data-salkay-brand
      aria-label={kayStory.ariaLabel}
      className="home-statement"
    >
      <Container className="home-statement-shell">
        <div className="home-statement-panel">
          <div className="home-statement-main">
            <Reveal className="home-statement-copy">
              <p className="home-statement-eye">{kayStory.eyebrow}</p>
              <p className="home-statement-line">{kayStory.line}</p>
              <i className="home-statement-rule" />
              <h2 className="home-statement-title font-display">
                <span>{kayStory.team}</span>
                <span>{kayStory.process}</span>
                <em>{kayStory.goal}</em>
              </h2>
              <p className="home-statement-support">{kayStory.support}</p>
            </Reveal>

            <Reveal delay={140} className="home-statement-visual">
              <StatementArt />
            </Reveal>
          </div>

          <ul className="home-statement-values">
            {kayStory.values.map((item, index) => (
              <li key={item.title}>
                <b>
                  <ValueIcon name={valueIcons[index] ?? "shield"} />
                </b>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
