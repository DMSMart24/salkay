import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Services() {
  const { services } = getDictionary().home;

  return (
    <section id="hizmetler" className="bg-paper">
      <Container className="py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-salkay">{services.eyebrow}</p>
          <h2 className="mt-4 font-display text-h2">{services.title}</h2>
          <p className="mt-5 text-stone-strong">{services.lead}</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {services.featured.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={
                index === 0
                  ? "group rounded-[1.3rem] bg-ink p-8 text-paper lg:col-span-3"
                  : "group rounded-[1.3rem] border border-ink/10 bg-paper-bright p-8 text-ink lg:col-span-2"
              }
            >
              <p className="label opacity-50">0{index + 1}</p>
              <h3 className="mt-16 font-display text-h3">{item.title}</h3>
              <p
                className={
                  index === 0
                    ? "mt-4 max-w-md text-paper/64"
                    : "mt-4 max-w-md text-stone"
                }
              >
                {item.body}
              </p>
            </Link>
          ))}
        </div>

        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {services.list.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="group grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr_1.4fr] sm:items-baseline"
              >
                <span className="label text-stone">{item.index}</span>
                <h3 className="font-display text-[1.35rem] tracking-[-0.03em] text-ink transition-colors group-hover:text-salkay">
                  {item.title}
                </h3>
                <p className="text-[0.98rem] text-stone">{item.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
