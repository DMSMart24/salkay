import { HomeStageCards } from "@/components/home/HomeStageCards";
import { HomeStageCta } from "@/components/home/HomeStageCta";
import { HomeStageMedia } from "@/components/home/HomeStageMedia";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { HOME_STAGE_CUE } from "@/lib/home-stage";

export function HomeStage() {
  const { stage } = getDictionary().home;

  return (
    <section data-salkay-stage aria-label={stage.ariaLabel} className="bg-canvas text-fg">
      <Container className="stage-shell">
        <div className="stage-top">
          <div className="stage-copy">
            <Reveal delay={HOME_STAGE_CUE.eyebrow}>
              <p className="eyebrow inline-flex items-center gap-2 text-cyan">
                <span className="h-1.5 w-1.5 bg-cyan shadow-[0_0_12px_var(--c-cyan)]" />
                {stage.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={HOME_STAGE_CUE.headline}>
              <h1 className="stage-title font-display font-bold text-fg">
                <span className="stage-title-segment">{stage.titleBefore}</span>{" "}
                <span className="stage-title-accent text-blue">{stage.titleAccent}</span>{" "}
                <span className="stage-title-segment">{stage.titleAfter}</span>
              </h1>
            </Reveal>
            <Reveal delay={HOME_STAGE_CUE.copy}>
              <p className="stage-lead text-muted">{stage.lead}</p>
            </Reveal>
          </div>
          <HomeStageCta label={stage.cta} support={stage.ctaSupport} />
        </div>

        <HomeStageMedia label={stage.mediaLabel} />

        <HomeStageCards cards={stage.cards} />
      </Container>
    </section>
  );
}
