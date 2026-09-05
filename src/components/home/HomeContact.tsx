import { Mail, MapPin, Phone } from "lucide-react";
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
            <p className="apple-footer-line">
              <MapPin size={16} strokeWidth={1.5} aria-hidden />
              {homeContact.locationLabel}
            </p>
            <a href={siteMailto()} className="apple-footer-line">
              <Mail size={16} strokeWidth={1.5} aria-hidden />
              {homeContact.mailLabel}
            </a>
            <a
              href={siteWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-contact-wa apple-footer-line"
            >
              <Phone size={16} strokeWidth={1.5} aria-hidden />
              {homeContact.whatsappCta}
            </a>
          </div>
        </Reveal>
        <Reveal delay={80} className="studio-contact-form">
          <InquiryForm compact tone="on-light" variant="studio" />
        </Reveal>
      </Container>
    </section>
  );
}
