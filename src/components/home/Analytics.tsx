import { KayScene } from "@/components/brand/KayScene";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { getKayAsset } from "@/lib/kay-assets";

export function Analytics() {
  const dictionary = getDictionary();
  const { analytics } = dictionary.home;

  return (
    <section id="analitik" className="bg-ink text-paper">
      <Container className="grid items-start gap-12 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:py-28">
        <div>
          <p className="eyebrow text-salkay-soft">{analytics.eyebrow}</p>
          <h2 className="mt-4 font-display text-h2">{analytics.title}</h2>
          <p className="mt-5 max-w-lg text-paper/64">{analytics.body}</p>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-paper/70">
            {analytics.points.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="h-px w-4 bg-salkay" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <KayScene
            variant="analytics"
            asset={getKayAsset("analytics")}
            label={dictionary.kay.placeholder}
            hint={dictionary.kay.hint}
            className="min-h-[17rem] lg:min-h-[18rem]"
          />
          <figure className="rounded-[1.35rem] border border-white/10 bg-ink-soft p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <figcaption className="label text-paper/40">
              {analytics.disclaimer}
            </figcaption>
            <span className="label text-salkay-soft">Demo</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {analytics.metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl bg-white/4 p-4">
                <p className="label text-paper/36">{metric.label}</p>
                <p className="mt-3 font-display text-3xl tracking-[-0.04em]">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-paper/42">{metric.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {analytics.sources.map((source) => (
              <div key={source.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-paper/70">{source.label}</span>
                  <span className="text-paper/40">{source.share}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="metric-bar h-full rounded-full bg-salkay"
                    style={{ width: `${source.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          </figure>
        </div>
      </Container>
    </section>
  );
}
