import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function SolutionsOutcomes() {
  const { outcomes } = getDictionary().solutionsPage;

  return (
    <section className="sl-results" aria-labelledby="sl-results-title">
      <div className="sl-shell">
        <Reveal>
          <h2 id="sl-results-title" className="font-display sl-results-title">
            {outcomes.headline1}
            <br />
            {outcomes.headline2}
          </h2>
        </Reveal>
        <ol className="sl-results-grid">
          {outcomes.items.map((item) => (
            <li key={item.index}>
              <Reveal>
                <span>{item.index}</span>
                <h3 className="font-display">{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
