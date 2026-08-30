import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function SolutionsHero() {
  const { hero } = getDictionary().solutionsPage;

  return (
    <section className="sl-hero" aria-labelledby="sl-hero-title">
      <div className="sl-shell sl-hero-grid">
        <div className="sl-hero-copy">
          <p className="sl-eye">{hero.eyebrow}</p>
          <h1 id="sl-hero-title" className="font-display sl-hero-title">
            {hero.line1}
            <br />
            {hero.line2}
            <br />
            <em>{hero.accent}</em>
          </h1>
          <p className="sl-hero-support">{hero.support}</p>
          <div className="sl-actions">
            <a className="sl-btn" href="#web-design">
              {hero.primaryCta}
            </a>
            <a className="sl-btn is-ghost" href={routes.contact}>
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="sl-universe" aria-hidden="true">
          <article className="sl-layer sl-layer-browser">
            <div className="sl-chrome">
              <span />
              <span />
              <span />
            </div>
            <div className="sl-browser-ui">
              <div className="sl-browser-bar" />
              <div className="sl-browser-hero">
                <b />
                <i />
              </div>
              <div className="sl-browser-tiles">
                <em />
                <em />
                <em />
              </div>
            </div>
          </article>
          <article className="sl-layer sl-layer-dash">
            <p>Portal</p>
            <strong>3</strong>
            <span>Aktif işlem</span>
          </article>
          <article className="sl-layer sl-layer-phone">
            <b />
            <i />
            <i />
          </article>
          <article className="sl-layer sl-layer-ai">
            <span>AI</span>
            <em>Talep analizi</em>
          </article>
          <article className="sl-layer sl-layer-flow">
            <span>Talep</span>
            <span>CRM</span>
            <span>Takip</span>
          </article>
        </div>
      </div>
    </section>
  );
}
