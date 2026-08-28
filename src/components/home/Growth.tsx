import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Growth() {
  const { growth } = getDictionary().home;

  return (
    <section id="buyume" className="bg-paper-bright">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow text-salkay">{growth.eyebrow}</p>
            <h2 className="mt-4 font-display text-h2">{growth.title}</h2>
          </div>
          <p className="max-w-xl text-stone-strong">{growth.body}</p>
        </div>

        <div className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
          {growth.items.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-3 py-7 md:grid-cols-[4rem_16rem_1fr] md:items-baseline"
            >
              <span className="label text-stone">0{index + 1}</span>
              <h3 className="font-display text-[1.4rem] tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="text-stone">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
