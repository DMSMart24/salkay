import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function KayStory() {
  const { kayStory } = getDictionary().home;

  return (
    <section
      id="kay"
      data-salkay-brand
      aria-label={kayStory.ariaLabel}
      className="home-brand"
    >
      <Container>
        <div className="brand-statement">
          <p className="eyebrow text-cyan">{kayStory.eyebrow}</p>
          <p className="brand-statement-line">{kayStory.line}</p>
          <div className="brand-statement-rule" aria-hidden />
          <h2 className="brand-statement-title font-display">
            <span>{kayStory.team}</span>
            <span>{kayStory.process}</span>
            <span className="text-cyan">{kayStory.goal}</span>
          </h2>
          <p className="brand-statement-support">{kayStory.support}</p>
        </div>
      </Container>
    </section>
  );
}
