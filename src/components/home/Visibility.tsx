import Link from "next/link";
import { AdsMark, AnalyticsMark, SeoMark } from "@/components/illustrations/ServiceMarks";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

const marks = [SeoMark, AdsMark, AnalyticsMark] as const;

export function Visibility() {
  const { visibility } = getDictionary().home.craft;

  return (
    <section id="gorunurluk" className="atelier-vis">
      <Container>
        <Reveal className="atelier-vis-head">
          <p className="studio-eye">{visibility.eyebrow}</p>
          <h2 className="studio-title font-display">{visibility.title}</h2>
          <p className="studio-lead">{visibility.lead}</p>
        </Reveal>
        <ol className="atelier-path">
          {visibility.items.map((item, index) => {
            const Mark = marks[index] ?? SeoMark;
            return (
              <li key={item.title}>
                <Reveal delay={index * 70}>
                  <article className="atelier-path-item">
                    <Mark />
                    <p className="studio-vis-index">0{index + 1}</p>
                    <h3 className="font-display">{item.title}</h3>
                    <p className="studio-vis-q">{item.question}</p>
                    <p>{item.body}</p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
        <p className="studio-vis-more">
          <Link href={`${routes.services}#buyume`}>SEO, reklam ve analitiği ayrıntılı görün</Link>
        </p>
      </Container>
    </section>
  );
}
