import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function PlatformScene() {
  const { platform } = getDictionary().solutionsPage;

  return (
    <section id="platformlar" className="sl-platform" aria-labelledby="sl-platform-title">
      <div className="sl-shell sl-platform-grid">
        <Reveal>
          <p className="sl-kicker is-on-dark">
            <span>{platform.index}</span>
            {platform.label}
          </p>
          <h2 id="sl-platform-title" className="font-display sl-scene-title is-on-dark">
            {platform.title1}
            <br />
            {platform.title2}
          </h2>
          <p className="sl-copy is-on-dark">{platform.body}</p>
          <ul className="sl-chips is-on-dark">
            {platform.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="sl-outcome is-on-dark">{platform.outcome}</p>
        </Reveal>
        <Reveal delay={80} className="sl-platform-visual">
          <figure className="sl-dash" aria-hidden="true">
            <aside>
              {platform.nav.map((item, index) => (
                <span key={item} className={index === 0 ? "is-on" : undefined}>
                  {item}
                </span>
              ))}
            </aside>
            <div className="sl-dash-main">
              <p className="sl-dash-hello">{platform.welcome}</p>
              <dl>
                {platform.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.label}</dt>
                    <dd className="font-display">{metric.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="sl-dash-chart">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <p className="sl-dash-note">{platform.activity}</p>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
