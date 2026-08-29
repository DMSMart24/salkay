import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

type ProjectsProps = {
  showIntro?: boolean;
};

export function Projects({ showIntro = true }: ProjectsProps) {
  const { projects } = getDictionary().home;

  return (
    <section id={showIntro ? "projeler" : undefined} className="bg-canvas">
      <Container className={showIntro ? "py-20 lg:py-28" : "pb-24"}>
        {showIntro ? (
          <>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow inline-flex items-center gap-2 text-gold">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
                  />
                  {projects.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-h2 text-cream">{projects.title}</h2>
                <div className="brand-rule" aria-hidden />
                <p className="mt-5 text-muted">{projects.lead}</p>
              </div>
              <Link
                href={routes.projects}
                className="text-[0.95rem] text-gold underline decoration-gold/30 underline-offset-4 hover:decoration-gold"
              >
                {projects.cta}
              </Link>
            </div>
            <p className="mt-8 max-w-2xl text-sm text-faint">{projects.disclaimer}</p>
          </>
        ) : (
          <p className="mb-8 max-w-2xl text-sm text-faint">{projects.disclaimer}</p>
        )}

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {projects.items.map((item, index) => (
            <article
              key={item.title}
              className="flex min-h-[26rem] flex-col justify-between rounded-[1.3rem] border border-gold/30 bg-navy-mid p-6"
            >
              <div>
                <div className="flex h-40 items-end rounded-xl border border-gold/15 bg-navy p-5 text-fg">
                  <p className="font-display text-4xl tracking-[-0.05em] text-gold">
                    0{index + 1}
                  </p>
                </div>
                <p className="mt-6 label text-gold/80">{item.status}</p>
                <p className="mt-3 text-sm text-cyan">{item.sector}</p>
                <h3 className="mt-2 font-display text-h3 text-cream">{item.title}</h3>
                <p className="mt-3 text-[0.98rem] text-muted">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
