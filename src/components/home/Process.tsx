import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Process() {
  const { process } = getDictionary().home;

  return (
    <section id="surec" className="studio-process">
      <Container>
        <Reveal className="studio-process-head">
          <p className="studio-eye">{process.eyebrow}</p>
          <h2 className="studio-title font-display">{process.title}</h2>
          <p className="studio-lead">{process.lead}</p>
        </Reveal>
        <ol className="studio-process-list">
          {process.steps.map((step, index) => (
            <li key={step.index}>
              <Reveal delay={index * 50}>
                <article className="studio-process-step">
                  <p className="studio-process-index">{step.index}</p>
                  <h3 className="font-display">{step.title}</h3>
                  <p>{step.body}</p>
                  <p className="studio-process-out">{step.outcome}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
