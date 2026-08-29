import { InquiryForm } from "@/components/contact/InquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function HomeContact() {
  const { homeContact } = getDictionary().home;

  return (
    <section id="iletisim" className="bg-navy-soft py-20 lg:py-28">
      <Container className="grid gap-12 min-[920px]:grid-cols-2">
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-2 text-gold">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
            />
            {homeContact.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-h2 text-cream">{homeContact.title}</h2>
          <div className="brand-rule" aria-hidden />
          <p className="mt-5 max-w-xl text-muted">{homeContact.body}</p>
          <div className="mt-8 grid gap-2 font-mono text-[0.78rem] tracking-[0.08em] text-muted uppercase">
            <p>{homeContact.locationLabel}</p>
            <p>{homeContact.mailLabel}</p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="rounded-[1.3rem] border border-gold/30 bg-navy p-6 sm:p-8">
            <InquiryForm compact />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
