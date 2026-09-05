import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function Visibility() {
  const { visibility } = getDictionary().home.craft;

  return (
    <section id="gorunurluk" className="studio-vis">
      <Container>
        <Reveal className="studio-vis-head">
          <p className="studio-eye">{visibility.eyebrow}</p>
          <h2 className="studio-title font-display">{visibility.title}</h2>
          <p className="studio-lead">{visibility.lead}</p>
        </Reveal>
        <ol className="studio-vis-list">
          {visibility.items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 60}>
                <article className="studio-vis-card">
                  <p className="studio-vis-index">0{index + 1}</p>
                  <h3 className="font-display">{item.title}</h3>
                  <p className="studio-vis-q">{item.question}</p>
                  <p>{item.body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="studio-vis-more">
          <Link href={`${routes.services}#buyume`}>SEO, reklam ve analitiği ayrıntılı görün</Link>
        </p>
      </Container>
    </section>
  );
}
