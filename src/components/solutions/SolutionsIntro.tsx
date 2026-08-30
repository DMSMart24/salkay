import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function SolutionsIntro() {
  const { intro } = getDictionary().solutionsPage;

  return (
    <section className="sl-intro" aria-labelledby="sl-intro-title">
      <div className="sl-shell sl-intro-grid">
        <Reveal>
          <p className="sl-eye">{intro.eyebrow}</p>
          <h2 id="sl-intro-title" className="font-display sl-intro-title">
            {intro.title1}
            <br />
            {intro.title2}
          </h2>
          <p className="sl-intro-body">{intro.body}</p>
        </Reveal>
        <Reveal delay={80}>
          <p className="sl-intro-count">
            <strong className="font-display">{intro.count}</strong>
            <span>{intro.countLabel}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
