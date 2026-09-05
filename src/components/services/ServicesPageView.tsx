import { ConceptSite } from "@/components/home/ConceptSite";
import { AdsMark, AnalyticsMark, SeoMark } from "@/components/illustrations/ServiceMarks";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function ServicesPageView() {
  const page = getDictionary().servicesPage;

  return (
    <div className="atelier-page">
      <header className="page-hero">
        <Container>
          <p className="studio-eye">{page.hero.eyebrow}</p>
          <h1 className="page-hero-title font-display">
            {page.hero.titleLine} {page.hero.titleBefore}
            <span className="text-blue">{page.hero.titleAccent}</span>
          </h1>
          <p className="studio-lead">{page.hero.lead}</p>
          <div className="atelier-hero-actions">
            <Button href={routes.contact}>{page.hero.primaryCta}</Button>
            <Button href="#hizmetler" variant="ghost">
              {page.hero.secondaryCta}
            </Button>
          </div>
        </Container>
      </header>

      <section className="atelier-section">
        <Container>
          <p className="studio-eye">{page.approach.eyebrow}</p>
          <h2 className="studio-title font-display">
            {page.approach.titleLine} {page.approach.titleAfter}
          </h2>
          <p className="studio-lead">{page.approach.lead}</p>
          <ul className="atelier-chips">
            {page.approach.disciplines.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="hizmetler" className="atelier-section atelier-section-split">
        <Container className="atelier-web-shell">
          <Reveal>
            <p className="studio-eye">{page.experience.eyebrow}</p>
            <h2 className="studio-title font-display">{page.experience.featureTitle}</h2>
            <p className="studio-lead">{page.experience.featureBody}</p>
            <p className="atelier-support">{page.experience.supportBody}</p>
            <Button href={routes.webDesign}>Paketleri İncele</Button>
          </Reveal>
          <ConceptSite
            size="section"
            label="Konsept görünüm"
            caption="Aynı tasarımın masaüstü ve telefon hali."
          />
        </Container>
      </section>

      <section id="yazilim" className="atelier-soft atelier-soft-page">
        <Container>
          <p className="studio-eye">{page.systems.eyebrow}</p>
          <h2 className="studio-title font-display">{page.systems.title}</h2>
          <p className="studio-lead">{page.systems.intro}</p>
          <ul className="atelier-soft-grid">
            {page.systems.items.map((item, index) => {
              const icons = ["portal", "layers", "flow"] as const;
              return (
                <li key={item.title}>
                  <span className="atelier-icon is-on-dark" aria-hidden>
                    <Icon name={icons[index] ?? "portal"} />
                  </span>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="atelier-section atelier-statement">
        <Container>
          <p className="atelier-statement-lines font-display">
            {page.statement.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="studio-lead">
            {page.statement.closeBefore}
            <strong>{page.statement.closeAccent}</strong>
            {page.statement.closeAfter}
          </p>
        </Container>
      </section>

      <section id="buyume" className="atelier-section">
        <Container>
          <p className="studio-eye">{page.growth.eyebrow}</p>
          <h2 className="studio-title font-display">
            {page.growth.titleLine1} {page.growth.titleLine2}
          </h2>
          <p className="studio-lead">{page.growth.intro}</p>
          <ol className="atelier-path">
            {page.growth.items.map((item, index) => {
              const Mark = index === 0 ? SeoMark : index === 1 ? AdsMark : AnalyticsMark;
              return (
                <li key={item.title}>
                  <article className="atelier-path-item">
                    <Mark />
                    <h3 className="font-display">{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section id="veri" className="atelier-section atelier-section-paper">
        <Container>
          <p className="studio-eye">{page.data.eyebrow}</p>
          <h2 className="studio-title font-display">
            {page.data.titleBefore} {page.data.titleAfter}
          </h2>
          <ul className="atelier-data-list">
            {page.data.items.map((item) => (
              <li key={item.title}>
                <h3 className="font-display">{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="atelier-section atelier-finale">
        <Container>
          <p className="studio-eye">{page.finale.eyebrow}</p>
          <h2 className="studio-title font-display">
            {page.finale.titleLine} {page.finale.titleAfter}
          </h2>
          <p className="studio-lead">{page.finale.lead}</p>
          <div className="atelier-hero-actions">
            <Button href={routes.contact}>{page.finale.primaryCta}</Button>
            <Button href={routes.contact} variant="ghost">
              {page.finale.secondaryCta}
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
