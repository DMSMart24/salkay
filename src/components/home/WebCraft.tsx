import { ConceptSite } from "@/components/home/ConceptSite";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function WebCraft() {
  const { web } = getDictionary().home.craft;

  return (
    <section id="web-tasarim" className="studio-web">
      <span id="hizmetler" className="studio-anchor" />
      <Container className="studio-web-shell">
        <Reveal className="studio-web-copy">
          <p className="studio-eye">{web.eyebrow}</p>
          <h2 className="studio-title font-display">{web.title}</h2>
          <p className="studio-lead">{web.lead}</p>
          <ul className="studio-web-points">
            {web.points.map((point) => (
              <li key={point.title}>
                <strong>{point.title}</strong>
                <span>{point.body}</span>
              </li>
            ))}
          </ul>
          <Button href={routes.webDesign}>{web.cta}</Button>
        </Reveal>
        <Reveal delay={80} className="studio-web-visual">
          <ConceptSite size="section" label={web.visualLabel} caption={web.visualCaption} />
        </Reveal>
      </Container>
    </section>
  );
}
