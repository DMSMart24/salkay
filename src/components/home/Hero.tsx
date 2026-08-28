import { HeroExperience } from "@/components/home/HeroExperience";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { sections } from "@/lib/routes";

export function Hero() {
  const { hero } = getDictionary().home;

  return (
    <HeroExperience>
      <Container className="hero-shell">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-cyan">
              <span className="h-1.5 w-1.5 bg-cyan shadow-[0_0_12px_var(--c-cyan)]" />
              {hero.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="hero-title font-display font-bold text-fg">
              <span className="hero-title-segment">{hero.titleBefore}</span>{" "}
              <span className="hero-title-accent text-blue">
                {hero.titleAccent}
              </span>{" "}
              <span className="hero-title-segment">{hero.titleAfter}</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="hero-lead text-muted">{hero.lead}</p>
          </Reveal>
          <Reveal delay={180}>
            <div className="hero-actions">
              <Button href={sections.contact} className="hero-cta">
                {hero.primaryCta}
              </Button>
              <Button href={sections.services} variant="ghost">
                {hero.secondaryCta}
              </Button>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="hero-meta font-mono text-faint uppercase">
              <span className="hero-meta-group">
                <span>{hero.metaItems[0]}</span>
                <span aria-hidden className="hero-meta-dot">
                  ·
                </span>
                <span>{hero.metaItems[1]}</span>
              </span>
              <span aria-hidden className="hero-meta-dot hero-meta-break">
                ·
              </span>
              <span className="hero-meta-group">
                <span>{hero.metaItems[2]}</span>
                <span aria-hidden className="hero-meta-dot">
                  ·
                </span>
                <span>{hero.metaItems[3]}</span>
              </span>
            </p>
          </Reveal>
        </div>
      </Container>

      <p className="scroll-cue pointer-events-none text-center">
        <span className="eyebrow block text-[0.62rem] tracking-[0.22em] text-faint">
          {hero.scrollCue}
        </span>
        <span
          aria-hidden
          className="scroll-cue-line mx-auto mt-2 block h-7 w-px origin-top bg-fg/20"
        />
      </p>
    </HeroExperience>
  );
}
