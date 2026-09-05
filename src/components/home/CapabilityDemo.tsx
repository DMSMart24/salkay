import { ConceptSite } from "@/components/home/ConceptSite";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function CapabilityDemo() {
  const { demo } = getDictionary().home.craft;

  return (
    <section className="atelier-demo" aria-labelledby="atelier-demo-title">
      <Container>
        <Reveal className="atelier-demo-head">
          <p className="studio-eye">{demo.eyebrow}</p>
          <h2 id="atelier-demo-title" className="studio-title font-display">
            {demo.title}
          </h2>
          <p className="studio-lead">{demo.lead}</p>
        </Reveal>
        <Reveal delay={60}>
          <ConceptSite size="wide" label={demo.label} caption={demo.caption} />
        </Reveal>
      </Container>
    </section>
  );
}
