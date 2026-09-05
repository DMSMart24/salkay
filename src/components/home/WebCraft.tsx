import { ConceptSite } from "@/components/home/ConceptSite";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

const pointIcons = ["layout", "devices", "message", "layers"] as const;

export function WebCraft() {
  const { web } = getDictionary().home.craft;

  return (
    <section id="web-tasarim" className="atelier-web">
      <span id="hizmetler" className="studio-anchor" />
      <Container className="atelier-web-shell">
        <Reveal className="atelier-web-copy">
          <p className="studio-eye">{web.eyebrow}</p>
          <h2 className="studio-title font-display">{web.title}</h2>
          <p className="studio-lead">{web.lead}</p>
          <ul className="atelier-web-points">
            {web.points.map((point, index) => (
              <li key={point.title}>
                <span className="atelier-icon" aria-hidden>
                  <Icon name={pointIcons[index] ?? "layout"} />
                </span>
                <div>
                  <strong>{point.title}</strong>
                  <span>{point.body}</span>
                </div>
              </li>
            ))}
          </ul>
          <Button href={routes.webDesign}>
            {web.cta}
            <Icon name="arrow" className="atelier-btn-icon" />
          </Button>
        </Reveal>
        <Reveal delay={80} className="atelier-web-visual">
          <ConceptSite size="section" label={web.visualLabel} caption={web.visualCaption} />
        </Reveal>
      </Container>
    </section>
  );
}
