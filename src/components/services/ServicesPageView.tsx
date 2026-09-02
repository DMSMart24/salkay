import { Reveal } from "@/components/motion/Reveal";
import { DataShowcase } from "@/components/services/DataShowcase";
import { GrowthShowcase } from "@/components/services/GrowthShowcase";
import {
  FinaleAtmosphere,
  ServicesHeroAtmosphere,
  ServicesHeroSystem,
} from "@/components/services/ServicesVisuals";
import { SystemsShowcase } from "@/components/services/SystemsShowcase";
import { WebShowcase } from "@/components/services/WebShowcase";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function ServicesPageView() {
  const page = getDictionary().servicesPage;

  return (
    <div className="svc-page">
      <section className="svc-hero">
        <ServicesHeroAtmosphere />
        <Container className="svc-shell relative">
          <div className="svc-hero-grid">
            <Reveal>
              <p className="eyebrow inline-flex items-center gap-2 text-cyan">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.hero.eyebrow}
              </p>
              <h1 className="svc-hero-title font-display text-fg">
                <span className="block">{page.hero.titleLine}</span>
                <span>
                  {page.hero.titleBefore}
                  <span className="text-blue">{page.hero.titleAccent}</span>
                </span>
              </h1>
              <p className="svc-hero-lead text-muted">{page.hero.lead}</p>
              <div className="svc-hero-actions">
                <Button href={routes.contact}>{page.hero.primaryCta}</Button>
                <a href="#hizmetler" className="svc-hero-jump">
                  {page.hero.secondaryCta}
                  <span aria-hidden className="svc-arrow">
                    ↓
                  </span>
                </a>
              </div>
            </Reveal>
            <div className="svc-hero-visual">
              <ServicesHeroSystem />
            </div>
          </div>
        </Container>
      </section>

      <section className="svc-approach svc-theme-light">
        <Container className="svc-shell">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-cyan">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
              />
              {page.approach.eyebrow}
            </p>
            <h2 className="svc-section-title font-display text-fg">
              <span className="block">{page.approach.titleLine}</span>
              <span>{page.approach.titleAfter}</span>
            </h2>
            <p className="svc-section-lead text-muted">{page.approach.lead}</p>
          </Reveal>
          <ul className="svc-disciplines">
            {page.approach.disciplines.map((item) => (
              <li key={item} className="svc-discipline">
                <span aria-hidden className="svc-discipline-node" />
                <span className="label text-cyan">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="hizmetler" className="svc-group svc-experience svc-theme-light">
        <span className="svc-showcase-field" aria-hidden />
        <Container className="svc-shell relative">
          <WebShowcase
            eyebrow={page.experience.eyebrow}
            index={page.experience.featureIndex}
            label={page.experience.featureLabel}
            body={page.experience.featureBody}
            cta="Paketleri İncele"
          />
        </Container>
      </section>

      <section className="svc-group svc-systems">
        <span className="svc-sys-field" aria-hidden />
        <Container className="svc-shell relative">
          <SystemsShowcase />
        </Container>
      </section>

      <section className="svc-statement">
        <Container className="svc-shell">
          <Reveal>
            <p className="svc-statement-lines font-display text-fg">
              {page.statement.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="svc-statement-close font-display text-fg">
              {page.statement.closeBefore}
              <span className="text-blue">{page.statement.closeAccent}</span>
              {page.statement.closeAfter}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="svc-group svc-growth svc-theme-light">
        <span className="svc-grow-field" aria-hidden />
        <Container className="svc-shell relative">
          <GrowthShowcase />
        </Container>
      </section>

      <section className="svc-group svc-data">
        <span className="svc-dc-field" aria-hidden />
        <Container className="svc-shell relative">
          <DataShowcase />
        </Container>
      </section>

      <section className="svc-finale">
        <FinaleAtmosphere />
        <Container className="svc-shell relative">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-cyan">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
              />
              {page.finale.eyebrow}
            </p>
            <h2 className="svc-finale-title font-display text-fg">
              <span className="block">{page.finale.titleLine}</span>
              <span>{page.finale.titleAfter}</span>
            </h2>
            <p className="svc-section-lead text-muted">{page.finale.lead}</p>
            <div className="svc-finale-actions">
              <Button href={routes.contact}>{page.finale.primaryCta}</Button>
              <Button href={routes.contact} variant="ghost">
                {page.finale.secondaryCta}
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
