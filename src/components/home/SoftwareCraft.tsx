import { SoftwareDemo } from "@/components/home/SoftwareDemo";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function SoftwareCraft() {
  const { software } = getDictionary().home.craft;

  return (
    <section id="yazilim" className="studio-soft">
      <Container className="studio-soft-shell">
        <Reveal className="studio-soft-copy">
          <p className="studio-eye">{software.eyebrow}</p>
          <h2 className="studio-title font-display">{software.title}</h2>
          <p className="studio-lead">{software.lead}</p>
          <ul className="studio-soft-items">
            {software.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
          <Button href={routes.solutions} className="studio-soft-cta">
            {software.cta}
          </Button>
        </Reveal>
        <Reveal delay={80}>
          <SoftwareDemo label={software.demoLabel} steps={software.demoSteps} />
        </Reveal>
      </Container>
    </section>
  );
}
