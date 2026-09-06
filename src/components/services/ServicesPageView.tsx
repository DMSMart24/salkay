import { Reveal } from "@/components/motion/Reveal";
import { DataCreativeSection } from "@/components/services/data-creative/DataCreativeSection";
import { DigitalGrowthSystem } from "@/components/services/experience/DigitalGrowthSystem";
import { HeroSection } from "@/components/services/experience/HeroSection";
import { GrowthSection } from "@/components/services/growth/GrowthSection";
import { FinaleAtmosphere } from "@/components/services/ServicesVisuals";
import { DigitalSystemsSection } from "@/components/services/systems/DigitalSystemsSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function ServicesPageView() {
  const page = getDictionary().servicesPage;

  return (
    <div className="svc-page">
      <HeroSection />
      <DigitalGrowthSystem />

      <DigitalSystemsSection />

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

      <GrowthSection />

      <DataCreativeSection />

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
