import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function CommerceScene() {
  const { commerce } = getDictionary().solutionsPage;

  return (
    <section id="ticaret" className="sl-shop" aria-labelledby="sl-shop-title">
      <div className="sl-shell sl-shop-grid">
        <Reveal>
          <p className="sl-kicker">
            <span>{commerce.index}</span>
            {commerce.label}
          </p>
          <h2 id="sl-shop-title" className="font-display sl-scene-title">
            {commerce.title1}
            <br />
            {commerce.title2}
          </h2>
          <ul className="sl-chips">
            {commerce.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="sl-outcome">{commerce.outcome}</p>
        </Reveal>
        <Reveal delay={80}>
          <figure className="sl-shop-stage" aria-hidden="true">
            <article className="sl-product">
              <div className="sl-product-media" />
              <p>{commerce.product}</p>
              <strong>{commerce.plan}</strong>
              <ul>
                {commerce.variants.map((item, index) => (
                  <li key={item} className={index === 0 ? "is-on" : undefined}>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="sl-product-pay">
                <span>{commerce.totalLabel}</span>
                <b>{commerce.total}</b>
              </div>
              <em>{commerce.pay}</em>
            </article>
            <article className="sl-pay-phone">
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
