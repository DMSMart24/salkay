import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function SolutionsCTA() {
  const { cta } = getDictionary().solutionsPage;

  return (
    <section className="sl-finale" aria-labelledby="sl-finale-title">
      <div className="sl-shell sl-finale-shell">
        <Reveal>
          <p className="sl-eye is-on-blue">{cta.eyebrow}</p>
          <h2 id="sl-finale-title" className="font-display sl-finale-title">
            {cta.title1}
            <br />
            {cta.title2}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="font-display sl-finale-punch">
            {cta.punch1}
            <br />
            {cta.punch2}
          </p>
          <div className="sl-actions">
            <a className="sl-btn is-on-blue" href={routes.contact}>
              {cta.primary}
              <span aria-hidden> →</span>
            </a>
            <a className="sl-btn is-ghost-on-blue" href={routes.contact}>
              {cta.secondary}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
