import { KayScene } from "@/components/brand/KayScene";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { getKayAsset } from "@/lib/kay-assets";

export function Software() {
  const dictionary = getDictionary();
  const { software } = dictionary.home;

  return (
    <section id="yazilim" className="bg-paper">
      <Container className="py-20 lg:py-28">
        <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl">
            <p className="eyebrow text-salkay">{software.eyebrow}</p>
            <h2 className="mt-4 font-display text-h2">{software.title}</h2>
            <p className="mt-5 text-stone-strong">{software.body}</p>
          </div>
          <KayScene
            variant="ai"
            asset={getKayAsset("ai")}
            label={dictionary.kay.placeholder}
            hint={dictionary.kay.hint}
            className="min-h-[16rem] lg:min-h-[18rem]"
          />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {software.items.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[1.2rem] border border-ink/8 p-6"
            >
              <p className="label text-stone">0{index + 1}</p>
              <h3 className="mt-8 font-display text-[1.35rem] tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="mt-3 text-stone">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
