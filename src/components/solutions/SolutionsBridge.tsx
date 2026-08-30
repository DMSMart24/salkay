import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";

export function SolutionsBridge() {
  const { bridge } = getDictionary().solutionsPage;

  return (
    <section className="sl-bridge" aria-labelledby="sl-bridge-title">
      <div className="sl-shell">
        <Reveal>
          <h2 id="sl-bridge-title" className="font-display sl-bridge-title">
            {bridge.title1}
            <br />
            {bridge.title2}
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
