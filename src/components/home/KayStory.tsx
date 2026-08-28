import { Mark } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function KayStory() {
  const { kayStory } = getDictionary().home;

  return (
    <section id="kay" className="bg-canvas py-20 lg:py-28">
      <Container className="grid items-center gap-12 min-[920px]:grid-cols-2">
        <Reveal>
          <p className="eyebrow text-cyan">{kayStory.eyebrow}</p>
          <h2 className="mt-4 font-display text-h2">{kayStory.title}</h2>
          <p className="mt-5 max-w-xl text-muted">{kayStory.body}</p>
          <ul className="mt-8 grid gap-3">
            <RoadmapRow tone="now" tag={kayStory.nowTag} body={kayStory.nowBody} />
            <RoadmapRow tone="next" tag={kayStory.nextTag} body={kayStory.nextBody} />
            <RoadmapRow tone="later" tag={kayStory.laterTag} body={kayStory.laterBody} />
          </ul>
        </Reveal>

        <Reveal delay={80}>
          <KayMarkIllustration />
        </Reveal>
      </Container>
    </section>
  );
}

function RoadmapRow({
  tone,
  tag,
  body,
}: {
  tone: "now" | "next" | "later";
  tag: string;
  body: string;
}) {
  const tagClass = roadmapTagClass(tone);

  return (
    <li className="flex items-start gap-4">
      <span className={`label mt-0.5 shrink-0 rounded-full border px-2.5 py-1 ${tagClass}`}>
        {tag}
      </span>
      <p className="text-[0.98rem] text-muted">{body}</p>
    </li>
  );
}

function roadmapTagClass(tone: "now" | "next" | "later") {
  switch (tone) {
    case "now":
      return "border-cyan bg-cyan text-canvas";
    case "next":
      return "border-line bg-transparent text-muted";
    case "later":
      return "border-dashed border-faint bg-transparent text-faint";
    default: {
      const exhaustive: never = tone;
      return exhaustive;
    }
  }
}

function KayMarkIllustration() {
  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-[1.4rem] border border-line bg-surface"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(55,104,255,0.16),transparent_58%)]" />
      <div className="absolute inset-[12%] rounded-full border border-cyan/20" />
      <div className="absolute inset-[22%] rounded-full border border-blue/25" />
      <div className="absolute inset-[32%] rounded-full border border-line" />
      <Mark className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-fg" />
    </div>
  );
}
