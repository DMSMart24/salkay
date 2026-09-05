import { InquiryForm } from "@/components/contact/InquiryForm";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteMailto } from "@/lib/site";

export function HomeContact() {
  const { homeContact } = getDictionary().home;

  return (
    <section id="iletisim" className="home-contact">
      <Container className="grid gap-12 min-[920px]:grid-cols-2">
        <div>
          <p className="eyebrow text-cyan">{homeContact.eyebrow}</p>
          <h2 className="mt-4 font-display text-h2">{homeContact.title}</h2>
          <p className="mt-5 max-w-xl text-muted">{homeContact.body}</p>
          <div className="mt-8 grid gap-2 font-mono text-[0.78rem] tracking-[0.08em] text-muted uppercase">
            <p>{homeContact.locationLabel}</p>
            <a href={siteMailto()} className="transition-colors hover:text-fg">
              {homeContact.mailLabel}
            </a>
          </div>
        </div>
        <InquiryForm compact tone="on-light" variant="studio" />
      </Container>
    </section>
  );
}
