import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Process() {
  const { process } = getDictionary().home;

  return (
    <section id="surec" className="bg-navy-soft py-20 lg:py-28">
      <Container>
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-2 text-gold">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
            />
            {process.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-h2 text-cream">{process.title}</h2>
          <div className="brand-rule" aria-hidden />
        </Reveal>

        <div className="relative mt-14 grid gap-8 min-[920px]:grid-cols-4 min-[920px]:gap-6">
          <div
            aria-hidden
            className="absolute top-[1.15rem] right-[8%] left-[8%] hidden h-px bg-gold/25 min-[920px]:block"
          />
          {process.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 60}>
              <article className="relative">
                <span className="relative z-[1] grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-navy font-mono text-[0.72rem] font-medium text-gold">
                  {step.index}
                </span>
                <h3 className="mt-5 font-display text-h3 text-cream">{step.title}</h3>
                <p className="mt-3 text-[0.98rem] text-muted">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
