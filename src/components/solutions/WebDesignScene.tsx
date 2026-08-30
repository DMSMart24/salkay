import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function WebDesignScene() {
  const { web } = getDictionary().solutionsPage;

  return (
    <section id="web-design" className="sl-web" aria-labelledby="sl-web-title">
      <div className="sl-shell sl-web-grid">
        <Reveal>
          <p className="sl-kicker">
            <span>{web.index}</span>
            {web.label}
          </p>
          <h2 id="sl-web-title" className="font-display sl-scene-title">
            {web.title1}
            <br />
            {web.title2}
          </h2>
          <ul className="sl-chips">
            {web.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="sl-outcome">{web.outcome}</p>
        </Reveal>
        <Reveal delay={80}>
          <figure className="sl-web-stage" aria-hidden="true">
            <article className="sl-site">
              <header>
                <strong>{web.site.brand}</strong>
                <nav>
                  {web.site.nav.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </nav>
              </header>
              <div className="sl-site-hero">
                <h3 className="font-display">{web.site.headline}</h3>
                <p>{web.site.meta}</p>
              </div>
              <div className="sl-site-band" />
            </article>
            <article className="sl-phone">
              <b />
              <i />
              <i />
            </article>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
