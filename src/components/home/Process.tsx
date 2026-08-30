import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Process() {
  const { process } = getDictionary().home;

  return (
    <section id="surec" className="home-process">
      <Container>
        <Reveal>
          <p className="eyebrow text-cyan">{process.eyebrow}</p>
          <h2 className="mt-4 font-display text-h2">{process.title}</h2>
        </Reveal>

        <div className="relative mt-14 grid gap-8 min-[920px]:grid-cols-4 min-[920px]:gap-6">
          <div
            aria-hidden
            className="absolute top-[1.15rem] right-[8%] left-[8%] hidden h-px bg-line min-[920px]:block"
          />
          {process.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 60}>
              <article className="relative">
                <span className="relative z-[1] grid h-9 w-9 place-items-center rounded-full bg-cyan font-mono text-[0.72rem] font-medium text-canvas">
                  {step.index}
                </span>
                <h3 className="mt-5 font-display text-h3">{step.title}</h3>
                <p className="mt-3 text-[0.98rem] text-muted">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
