import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { HOME_STAGE_CARD_HREFS, HOME_STAGE_CUE } from "@/lib/home-stage";

type StageCard = {
  index: string;
  title: string;
  body: string;
};

type HomeStageCardsProps = {
  cards: [StageCard, StageCard, StageCard];
};

export function HomeStageCards({ cards }: HomeStageCardsProps) {
  return (
    <div className="stage-cards">
      {cards.map((card, index) => {
        const href = HOME_STAGE_CARD_HREFS[index] ?? "/hizmetler";
        return (
          <Reveal
            key={card.index}
            delay={HOME_STAGE_CUE.cards + index * HOME_STAGE_CUE.cardStagger}
            className="stage-card-reveal"
          >
            <Link href={href} className="stage-card">
              <span className="stage-card-index font-mono">{card.index}</span>
              <h3 className="stage-card-title font-display">{card.title}</h3>
              <p className="stage-card-body text-muted">{card.body}</p>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
