import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function AIScene() {
  const { ai } = getDictionary().solutionsPage;

  return (
    <section id="ai" className="sl-ai" aria-labelledby="sl-ai-title">
      <div className="sl-shell sl-ai-grid">
        <Reveal>
          <p className="sl-kicker">
            <span>{ai.index}</span>
            {ai.label}
          </p>
          <h2 id="sl-ai-title" className="font-display sl-scene-title">
            {ai.title1}
            <br />
            {ai.title2}
          </h2>
          <p className="sl-copy">{ai.body}</p>
          <p className="sl-outcome">{ai.outcome}</p>
        </Reveal>
        <Reveal delay={80}>
          <figure className="sl-ai-stage" aria-hidden="true">
            <div className="sl-orb" />
            <article className="sl-ai-card">
              <p>{ai.heading}</p>
              <dl>
                {ai.fields.map((field) => (
                  <div key={field.label}>
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
              <span>{ai.action}</span>
            </article>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
