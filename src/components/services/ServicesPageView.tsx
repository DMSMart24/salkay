import { Reveal } from "@/components/motion/Reveal";
import {
  DataMergeVisual,
  ExperienceVisual,
  EyebrowLabel,
  FinaleAtmosphere,
  GrowthVisual,
  ServiceIcon,
  ServicesHeroAtmosphere,
  ServicesHeroSystem,
} from "@/components/services/ServicesVisuals";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

const systemKinds = ["software", "config", "ai"] as const;
const growthKinds = ["seo", "ads", "marketing"] as const;
const dataKinds = ["analytics", "creative"] as const;

export function ServicesPageView() {
  const page = getDictionary().servicesPage;

  return (
    <div className="svc-page">
      <section className="svc-hero">
        <ServicesHeroAtmosphere />
        <Container className="svc-shell relative">
          <div className="svc-hero-grid">
            <Reveal>
              <p className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.hero.eyebrow}
              </p>
              <h1 className="svc-hero-title font-display text-cream">
                <span className="block">{page.hero.titleLine}</span>
                <span>
                  {page.hero.titleBefore}
                  <span className="hero-title-accent">{page.hero.titleAccent}</span>
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

      <section className="svc-approach">
        <Container className="svc-shell">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.approach.eyebrow}
              </p>
              <h2 className="svc-section-title font-display text-cream">
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

      <section id="hizmetler" className="svc-group svc-experience">
        <Container className="svc-shell">
          <Reveal>
            <h2 className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.experience.eyebrow}
              </h2>
          </Reveal>
          <article id="web-tasarim" className="svc-card svc-feature">
            <div className="svc-feature-copy">
              <div className="svc-card-head">
                <span className="svc-index" aria-hidden>
                  {page.experience.featureIndex}
                </span>
                <EyebrowLabel>{page.experience.featureLabel}</EyebrowLabel>
              </div>
              <h3 className="svc-feature-title font-display text-fg">
                {page.experience.featureTitle}
              </h3>
              <p className="svc-card-body text-muted">
                {page.experience.featureBody}
              </p>
            </div>
            <div className="svc-visual">
              <ExperienceVisual />
            </div>
          </article>
          <article id="web-development" className="svc-card svc-support">
            <div className="svc-card-head">
              <span className="svc-index" aria-hidden>
                {page.experience.supportIndex}
              </span>
              <span aria-hidden className="svc-node" />
            </div>
            <h3 className="svc-card-title font-display text-fg">
              {page.experience.supportTitle}
            </h3>
            <p className="svc-card-body text-muted">
              {page.experience.supportBody}
            </p>
          </article>
        </Container>
      </section>

      <section className="svc-group svc-systems">
        <Container className="svc-shell">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.systems.eyebrow}
              </p>
              <h2 className="svc-section-title font-display text-cream">
                {page.systems.title}
              </h2>
          </Reveal>
          <div className="svc-systems-grid">
            <div aria-hidden className="svc-systems-links">
              <span className="svc-connect svc-connect-1" />
              <span className="svc-connect svc-connect-2" />
            </div>
            {page.systems.items.map((item, index) => {
              const kind = systemKinds[index];
              return (
              <Reveal key={item.title} delay={index * 70}>
                <article className="svc-card svc-module">
                  <div className="svc-card-head">
                    <span className="svc-index" aria-hidden>
                      {item.index}
                    </span>
                    {kind ? <ServiceIcon kind={kind} /> : null}
                  </div>
                  <EyebrowLabel>{item.label}</EyebrowLabel>
                  <h3 className="svc-card-title font-display text-fg">
                    {item.title}
                  </h3>
                  <p className="svc-card-body text-muted">{item.body}</p>
                </article>
              </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="svc-statement">
        <Container className="svc-shell">
          <Reveal>
            <p className="svc-statement-lines font-display text-cream">
              {page.statement.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="svc-statement-close font-display text-cream">
              {page.statement.closeBefore}
              <span className="hero-title-accent">{page.statement.closeAccent}</span>
              {page.statement.closeAfter}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="svc-group svc-growth">
        <Container className="svc-shell">
          <div className="svc-growth-head">
            <Reveal>
              <p className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.growth.eyebrow}
              </p>
              <h2 className="svc-section-title font-display text-cream">
                <span className="block">{page.growth.titleLine1}</span>
                <span className="block">{page.growth.titleLine2}</span>
                <span className="hero-title-accent">{page.growth.titleAccent}</span>
              </h2>
            </Reveal>
            <div className="svc-growth-visual">
              <GrowthVisual />
            </div>
          </div>
          <div className="svc-growth-grid">
            {page.growth.items.map((item, index) => {
              const kind = growthKinds[index];
              return (
              <Reveal key={item.title} delay={index * 70}>
                <article className="svc-card svc-module">
                  <div className="svc-card-head">
                    <span className="svc-index" aria-hidden>
                      {item.index}
                    </span>
                    {kind ? <ServiceIcon kind={kind} /> : null}
                  </div>
                  <EyebrowLabel>{item.label}</EyebrowLabel>
                  <h3 className="svc-card-title font-display text-fg">
                    {item.title}
                  </h3>
                  <p className="svc-card-body text-muted">{item.body}</p>
                </article>
              </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="svc-group svc-data">
        <Container className="svc-shell">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.data.eyebrow}
              </p>
              <h2 className="svc-section-title font-display text-cream">
              <span>{page.data.titleBefore}</span>
              <span className="block">{page.data.titleAfter}</span>
            </h2>
          </Reveal>
          <div className="svc-data-grid">
            {page.data.items.map((item, index) => {
              const kind = dataKinds[index];
              return (
              <Reveal key={item.title} delay={index * 70}>
                <article className="svc-card svc-module svc-data-card">
                  <div className="svc-card-head">
                    <span className="svc-index" aria-hidden>
                      {item.index}
                    </span>
                    {kind ? <ServiceIcon kind={kind} /> : null}
                  </div>
                  <EyebrowLabel>{item.label}</EyebrowLabel>
                  <h3 className="svc-card-title font-display text-fg">
                    {item.title}
                  </h3>
                  <p className="svc-card-body text-muted">{item.body}</p>
                  {index === 0 ? (
                    <div className="svc-visual svc-data-visual">
                      <DataMergeVisual />
                    </div>
                  ) : null}
                </article>
              </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="svc-finale">
        <FinaleAtmosphere />
        <Container className="svc-shell relative">
          <Reveal>
            <p className="eyebrow inline-flex items-center gap-2 text-gold">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                />
                {page.finale.eyebrow}
              </p>
              <h2 className="svc-finale-title font-display text-cream">
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
