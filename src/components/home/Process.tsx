import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

const stepIcons = ["target", "pen", "code", "chart"] as const;

type StepIconName = (typeof stepIcons)[number];

function StepIcon({ name }: { name: StepIconName }) {
  switch (name) {
    case "target":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="7.2" />
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="12" cy="12" r="0.8" />
        </svg>
      );
    case "pen":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M14.6 5.2 L18.8 9.4 L9.2 19 H5 V14.8 Z" />
          <path d="M12.8 7 L17 11.2" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M9 7.4 L4.8 12 L9 16.6" />
          <path d="M15 7.4 L19.2 12 L15 16.6" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5 18.2 H19" />
          <path d="M7.6 14.2 V18.2" />
          <path d="M12 10.2 V18.2" />
          <path d="M16.4 6.6 V18.2" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function TitleWithCyanPeriod({ text }: { text: string }) {
  const base = text.replace(/\.$/, "");

  return (
    <>
      {base}
      <i>.</i>
    </>
  );
}

export function Process() {
  const { process } = getDictionary().home;

  return (
    <section id="surec" className="home-process">
      <span className="home-process-haze" aria-hidden />
      <span className="home-process-grid" aria-hidden />

      <Container className="home-process-shell">
        <Reveal className="home-process-head">
          <p className="home-process-eye">
            <span aria-hidden className="home-process-dot" />
            {process.eyebrow}
          </p>
          <h2 className="home-process-title font-display">
            <TitleWithCyanPeriod text={process.title} />
          </h2>
          <p className="home-process-lead">{process.lead}</p>
        </Reveal>

        <ol className="home-process-list">
          {process.steps.map((step, index) => (
            <li key={step.index}>
              <Reveal delay={index * 70}>
                <article className="home-process-step">
                  <span className="home-process-node">
                    <b>{step.index}</b>
                  </span>
                  <div className="home-process-card">
                    <div className="home-process-copy">
                      <h3 className="home-process-name font-display">{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                    <span className="home-process-icon">
                      <StepIcon name={stepIcons[index] ?? "target"} />
                    </span>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
