import { InquiryForm } from "@/components/contact/InquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteMailto, siteWhatsAppUrl } from "@/lib/site";

export function HomeContact() {
  const { homeContact } = getDictionary().home;

  return (
    <section id="iletisim" className="studio-contact">
      <Container className="studio-contact-shell">
        <Reveal>
          <p className="studio-eye">{homeContact.eyebrow}</p>
          <h2 className="studio-title font-display">{homeContact.title}</h2>
          <p className="studio-lead">{homeContact.body}</p>
          <div className="studio-contact-meta">
            <p>{homeContact.locationLabel}</p>
            <a href={siteMailto()}>{homeContact.mailLabel}</a>
            <a
              href={siteWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-contact-wa"
            >
              {homeContact.whatsappCta}
            </a>
          </div>
        </Reveal>
        <Reveal delay={80} className="studio-contact-form">
          <InquiryForm compact tone="on-light" />
        </Reveal>
      </Container>
    </section>
  );
}
