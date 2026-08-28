import { KayScene } from "@/components/brand/KayScene";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { getKayAsset } from "@/lib/kay-assets";

export function WebDesignFocus() {
  const dictionary = getDictionary();
  const { webFocus } = dictionary.home;

  return (
    <section id="web-tasarim" className="bg-paper-bright">
      <Container className="grid items-start gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <p className="eyebrow text-salkay">{webFocus.eyebrow}</p>
          <h2 className="mt-4 max-w-xl font-display text-h2 text-ink">
            {webFocus.title}
          </h2>
          <p className="mt-6 max-w-xl text-stone-strong">{webFocus.body}</p>

          <div className="mt-10 grid gap-px bg-line sm:grid-cols-2">
            {webFocus.points.map((point) => (
              <article key={point.title} className="bg-paper-bright p-5">
                <h3 className="font-display text-[1.15rem] tracking-[-0.02em] text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-stone">{point.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <figure className="overflow-hidden rounded-[1.35rem] border border-ink/8 bg-ink text-paper shadow-lift">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
              <p className="label text-paper/40">{webFocus.canvasLabel}</p>
              <p className="label text-salkay-soft">TR</p>
            </div>
            <div className="grid gap-0 lg:grid-rows-[auto_16rem]">
              <div className="p-6 sm:px-8 sm:pt-7 sm:pb-4">
                <p className="font-display text-[2.1rem] leading-none tracking-[-0.045em]">
                  Atölye
                </p>
                <p className="mt-3 max-w-xs text-sm leading-6 text-paper/58">
                  Mimari bir markanın sade, geniş ve güven veren dijital yüzü —
                  örnek kompozisyon.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-14 rounded-lg bg-white/8" />
                  <div className="h-14 rounded-lg bg-salkay/70" />
                </div>
                <p className="mt-4 text-sm text-paper/48">{webFocus.canvasMeta}</p>
              </div>
              <KayScene
                variant="web"
                asset={getKayAsset("web")}
                label={dictionary.kay.placeholder}
                hint={dictionary.kay.hint}
                showContext={false}
                className="rounded-none border-0 border-t border-white/8"
              />
            </div>
          </figure>
        </aside>
      </Container>
    </section>
  );
}
