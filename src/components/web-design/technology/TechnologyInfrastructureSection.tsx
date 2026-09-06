import { CloudInfrastructureCore } from "@/components/web-design/technology/CloudInfrastructureCore";
import { SystemConnectionLines } from "@/components/web-design/technology/SystemConnectionLines";
import { TechnologyBenefits } from "@/components/web-design/technology/TechnologyBenefits";
import { TechnologyNodeCard } from "@/components/web-design/technology/TechnologyNodeCard";
import { TechnologyReveal } from "@/components/web-design/technology/TechnologyReveal";
import { WhyTechnologyPanel } from "@/components/web-design/technology/WhyTechnologyPanel";
import { webDesignContent as copy } from "@/components/web-design/content";

export function TechnologyInfrastructureSection() {
  return (
    <section className="ti" aria-labelledby="sl-webpricing-tech-title">
      <span className="ti-dots" aria-hidden />
      <span className="ti-glow" aria-hidden />
      <div className="sl-webpricing-shell">
        <TechnologyReveal>
          <div className="ti-main">
            <header className="ti-copy">
              <p className="ti-eye">
                <span aria-hidden />
                {copy.tech.eyebrow}
              </p>
              <h2 id="sl-webpricing-tech-title" className="font-display">
                <span>Modern Teknoloji.</span>
                <span>
                  Doğru <em>Amaç</em> İçin.
                </span>
              </h2>
              <p className="ti-lead">{copy.tech.body}</p>
              <p className="ti-tag">{copy.tech.tagline}</p>
            </header>

            <div className="ti-arch">
              <SystemConnectionLines />
              {copy.tech.nodes.map((node) => (
                <TechnologyNodeCard
                  key={node.index}
                  index={node.index}
                  label={node.label}
                  items={node.items}
                />
              ))}
              <CloudInfrastructureCore />
            </div>
          </div>

          <TechnologyBenefits />
          <WhyTechnologyPanel />
        </TechnologyReveal>
      </div>
    </section>
  );
}
