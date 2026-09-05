import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

function AccentLead({ text, accent }: { text: string; accent: string }) {
  const index = text.indexOf(accent);
  if (index < 0) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <em>{accent}</em>
      {text.slice(index + accent.length)}
    </>
  );
}

export function AboutStudio() {
  const dictionary = getDictionary();
  const page = dictionary.aboutPage;

  return (
    <section className="sl-about studio-public" aria-labelledby="sl-about-title">
      <span className="sl-about-grid" aria-hidden />
      <span className="sl-about-haze" aria-hidden />
      <Image
        src="/brand/salkay-a-mark.png"
        alt=""
        width={532}
        height={400}
        sizes="40vw"
        className="sl-about-mark"
      />

      <div className="sl-about-shell">
        <div className="sl-about-top">
          <Reveal className="sl-about-left">
            <p className="sl-about-eye">
              {page.eyebrow}
              <i>/</i>
              {page.index}
            </p>
            <h1 id="sl-about-title" className="sl-about-title font-display">
              {page.headline[0]}
              <br />
              <em>{page.headline[1]}</em>
            </h1>
            <div className="sl-about-studio">
              <strong>{page.studio}</strong>
              <span>{page.location}</span>
            </div>
            <ul className="sl-about-disciplines">
              {page.disciplines.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>

          <div className="sl-about-right">
            <Reveal delay={80}>
              <p className="sl-about-lead font-display">
                <AccentLead text={page.lead} accent={page.leadAccent} />
              </p>
              <p className="sl-about-story">{page.body[0]}</p>
            </Reveal>

            <ul className="sl-about-caps">
              {page.capabilities.map((item, index) => (
                <li key={item.index}>
                  <Reveal delay={120 + index * 40}>
                    <b>{item.index}</b>
                    <strong>{item.title}</strong>
                    <small>{item.body}</small>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Reveal delay={80} className="sl-about-system">
          <ul>
            {page.system.map((item) => (
              <li key={item.index}>
                <span>{item.title}</span>
                <b>{item.index}</b>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="sl-about-close">
          <p className="sl-about-audience">{page.audience}</p>
          <p className="sl-about-traits font-display">
            <span>{page.traits[0]}</span>
            <span>{page.traits[1]}</span>
            <em>{page.traits[2]}</em>
          </p>
        </Reveal>

        <p className="sl-about-meta">
          {page.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
        <div className="mt-8">
          <Button href={routes.contact}>{dictionary.nav.primaryCta}</Button>
        </div>
      </div>
    </section>
  );
}
