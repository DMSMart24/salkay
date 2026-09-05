import { SoftwareDemo } from "@/components/home/SoftwareDemo";
import { AutomationMark } from "@/components/illustrations/ServiceMarks";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

const itemIcons = ["portal", "layers", "flow"] as const;

export function SoftwareCraft() {
  const { software } = getDictionary().home.craft;

  return (
    <section id="yazilim" className="atelier-soft">
      <Container className="atelier-soft-shell">
        <Reveal className="atelier-soft-copy">
          <p className="studio-eye">{software.eyebrow}</p>
          <h2 className="studio-title font-display">{software.title}</h2>
          <p className="studio-lead">{software.lead}</p>
          <ul className="atelier-soft-items">
            {software.items.map((item, index) => (
              <li key={item.title}>
                <span className="atelier-icon is-on-dark" aria-hidden>
                  <Icon name={itemIcons[index] ?? "portal"} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </div>
              </li>
            ))}
          </ul>
          <Button href={routes.solutions} className="studio-soft-cta">
            {software.cta}
            <Icon name="arrow" className="atelier-btn-icon" />
          </Button>
        </Reveal>
        <Reveal delay={80} className="atelier-soft-stage">
          <AutomationMark />
          <SoftwareDemo label={software.demoLabel} steps={software.demoSteps} />
        </Reveal>
      </Container>
    </section>
  );
}
