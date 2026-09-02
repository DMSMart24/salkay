import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HOME_STAGE_CUE } from "@/lib/home-stage";
import { sections } from "@/lib/routes";

type HomeStageCtaProps = {
  label: string;
  support?: string;
};

export function HomeStageCta({ label, support }: HomeStageCtaProps) {
  return (
    <Reveal delay={HOME_STAGE_CUE.cta} className="stage-cta">
      <Button href={sections.contact} className="stage-cta-btn">
        {label}
      </Button>
      {support ? <p className="stage-cta-support text-muted">{support}</p> : null}
    </Reveal>
  );
}
