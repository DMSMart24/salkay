import { HeroExperience } from "@/components/home/HeroExperience";
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
          <div className="hero-read">
            <p className="eyebrow hero-eyebrow">
              <span className="hero-eyebrow-dot" aria-hidden />
              {hero.eyebrow}
            </p>
            <h1 className="hero-title font-display font-bold text-fg">
              <span className="hero-title-line">
                <span className="hero-title-segment">{hero.titleBefore}</span>{" "}
                <span className="hero-title-accent">{hero.titleAccent}</span>
              </span>{" "}
              <span className="hero-title-line hero-title-line-soft">{hero.titleAfter}</span>
            </h1>
            <p className="hero-lead text-muted">{hero.lead}</p>
          </div>
          <div className="hero-actions">
            <Button href={sections.contact} className="hero-cta">
              {hero.primaryCta}
            </Button>
            <Button href={sections.webDesign} variant="ghost" className="hero-cta-secondary">
              {hero.secondaryCta}
            </Button>
          </div>
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
        </div>
      </Container>
    </HeroExperience>
  );
}
