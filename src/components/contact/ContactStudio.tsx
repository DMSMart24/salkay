import Image from "next/image";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveContactPackageSurface } from "@/lib/contact/package-surface";
import { site, siteMailto, siteWhatsAppUrl } from "@/lib/site";

function contactChannel(kind: "email" | "whatsapp" | "web") {
  switch (kind) {
    case "email":
      return { value: site.email, href: siteMailto(), external: false };
    case "whatsapp":
      return { value: site.whatsappDisplay, href: siteWhatsAppUrl(), external: true };
    case "web":
      return { value: site.domain, href: site.url, external: true };
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function ContactStudio({ packageSlug }: { packageSlug?: string }) {
  const page = getDictionary().contactPage;
  const selectedPackage = resolveContactPackageSurface(packageSlug);

  return (
    <section className="sl-contact studio-public" aria-labelledby="sl-contact-title">
      <span className="sl-contact-grid" aria-hidden />
      <span className="sl-contact-haze" aria-hidden />
      <Image
        src="/brand/salkay-a-mark.png"
        alt=""
        width={532}
        height={400}
        sizes="36vw"
        className="sl-contact-mark"
      />

      <div className="sl-contact-shell">
        <div className="sl-contact-layout">
          <Reveal className="sl-contact-intro">
            <p className="sl-contact-eye">
              {page.eyebrow}
              <i>/</i>
              {page.index}
            </p>
            <h1 id="sl-contact-title" className="sl-contact-title font-display">
              {page.headline[0]}
              <br />
              <em>{page.headline[1]}</em>
            </h1>
            <div className="sl-contact-copy">
              <p>{page.intro[0]}</p>
              <p>{page.intro[1]}</p>
            </div>

            <ul className="sl-contact-channels">
              {page.channels.map((channel, index) => {
                const item = contactChannel(channel.value);
                return (
                  <li key={channel.label}>
                    <Reveal delay={80 + index * 40}>
                      <a
                        href={item.href}
                        className="sl-contact-channel"
                        {...(item.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <span>{channel.label}</span>
                        <strong>{item.value}</strong>
                        <i aria-hidden>→</i>
                      </a>
                    </Reveal>
                  </li>
                );
              })}
            </ul>

            <p className="sl-contact-ready">
              <i aria-hidden />
              {page.availability}
            </p>
            <p className="sl-contact-meta">
              <span>{page.location}</span>
              <span>{page.role}</span>
            </p>
          </Reveal>

          <Reveal delay={90} className="sl-contact-aside">
            <div className="sl-contact-panel">
              <header className="sl-contact-panel-head">
                <p className="sl-contact-kicker">
                  <span>{page.formKicker}</span>
                  <b>{page.formIndex}</b>
                </p>
                <h2 className="sl-contact-panel-title font-display">{page.formTitle}</h2>
                <p className="sl-contact-panel-sub">{page.formSub}</p>
              </header>
              {selectedPackage ? (
                <aside id="sl-contact-selected" className="sl-contact-selected">
                  <p className="sl-contact-selected-eye">Seçilen paket</p>
                  <p className="sl-contact-selected-name">{selectedPackage.displayName}</p>
                  <p className="sl-contact-selected-price">{selectedPackage.priceLabel}</p>
                  <p className="sl-contact-selected-lead">{selectedPackage.lead}</p>
                </aside>
              ) : null}
              <InquiryForm variant="studio" packageSlug={packageSlug} />
              <p className="sl-contact-trust">
                {page.trust.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
