import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function AutomationScene() {
  const { automation } = getDictionary().solutionsPage;

  return (
    <section id="otomasyon" className="sl-auto" aria-labelledby="sl-auto-title">
      <div className="sl-shell sl-auto-grid">
        <Reveal>
          <p className="sl-kicker is-on-blue">
            <span>{automation.index}</span>
            {automation.label}
          </p>
          <h2 id="sl-auto-title" className="font-display sl-scene-title is-on-blue">
            {automation.title1}
            <br />
            {automation.title2}
          </h2>
          <p className="sl-copy is-on-blue">{automation.body}</p>
          <p className="sl-outcome is-on-blue">{automation.outcome}</p>
        </Reveal>
        <Reveal delay={80}>
          <figure className="sl-map" aria-hidden="true">
            <ol className="sl-map-flow">
              {automation.flow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <ul className="sl-map-nodes">
              {automation.nodes.map((node) => (
                <li key={node}>{node}</li>
              ))}
            </ul>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
