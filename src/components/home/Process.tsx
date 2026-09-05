import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Process() {
  const { process } = getDictionary().home;

  return (
    <section id="surec" className="atelier-process">
      <Container>
        <Reveal className="atelier-process-head">
          <p className="studio-eye">{process.eyebrow}</p>
          <h2 className="studio-title font-display">{process.title}</h2>
          <p className="studio-lead">{process.lead}</p>
        </Reveal>
        <ol className="atelier-spine">
          {process.steps.map((step, index) => (
            <li key={step.index}>
              <Reveal delay={index * 50}>
                <article className="atelier-spine-step">
                  <p className="atelier-spine-index">{step.index}</p>
                  <div>
                    <h3 className="font-display">{step.title}</h3>
                    <p>{step.body}</p>
                    <p className="atelier-spine-out">{step.outcome}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
