import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Capabilities() {
  const { capabilities } = getDictionary().home;

  return (
    <section id="yetenekler" className="bg-ink text-paper">
      <Container className="py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-salkay-soft">{capabilities.eyebrow}</p>
          <h2 className="mt-4 font-display text-h2">{capabilities.title}</h2>
        </div>

        <div className="mt-14 grid gap-0 border-t border-white/10 lg:grid-cols-3">
          {capabilities.items.map((item) => (
            <article
              key={item.model}
              className="relative border-white/10 py-10 lg:border-l lg:px-8 lg:py-12 lg:first:border-l-0 lg:first:pl-0"
            >
              <p className="label text-paper/32">
                {item.index} / {item.model}
              </p>
              <h3 className="mt-16 font-display text-h3 lg:mt-24">{item.title}</h3>
              <p className="mt-4 max-w-sm text-paper/62">{item.body}</p>
              <ul className="mt-8 space-y-2 text-sm text-paper/48">
                {item.points.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <span className="h-px w-4 bg-salkay" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
