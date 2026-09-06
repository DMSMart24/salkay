import { webDesignContent as copy } from "@/components/web-design/content";

type TechNode = (typeof copy.tech.nodes)[number];
type TechItem = TechNode["items"][number];

const icons: Record<TechItem, string> = {
  "Next.js": "N",
  React: "atom",
  Vercel: "tri",
  "Modern Cloud": "cloud",
  PostgreSQL: "db",
  Neon: "bolt",
  API: "api",
  Automation: "auto",
  "Secure Architecture": "lock",
};

export function TechnologyNodeCard({
  index,
  label,
  items,
}: {
  index: string;
  label: string;
  items: TechNode["items"];
}) {
  return (
    <article className={`ti-node is-${index}`}>
      <header>
        <p>
          {index} / {label}
        </p>
        <span aria-hidden>↗</span>
      </header>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <TechMark name={item} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function TechMark({ name }: { name: TechItem }) {
  const kind = icons[name];

  if (kind === "N") {
    return <b aria-hidden>N</b>;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      {kind === "atom" ? (
        <>
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.4" />
        </>
      ) : null}
      {kind === "tri" ? <path d="M12 5.5 20 18.5H4Z" /> : null}
      {kind === "cloud" ? (
        <path d="M6.2 16.4c-1.2 0-2.2-1-2.2-2.2 0-1.1.8-2 1.9-2.2.4-1.8 2-3.1 3.9-3.1 1.6 0 3 .9 3.6 2.3.3-.1.6-.1.9-.1 1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1H6.2Z" />
      ) : null}
      {kind === "db" ? (
        <>
          <ellipse cx="12" cy="7" rx="6" ry="2.4" />
          <path d="M6 7v7c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V7" />
        </>
      ) : null}
      {kind === "bolt" ? <path d="M13 4 7 13h5l-1 7 6-9h-5Z" /> : null}
      {kind === "api" ? (
        <>
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="18" cy="17" r="2" />
          <path d="M8 12h8M8 12l8-4.2M8 12l8 4.2" />
        </>
      ) : null}
      {kind === "auto" ? <path d="M8 7H6v10h2M16 7h2v10h-2" /> : null}
      {kind === "lock" ? (
        <>
          <rect x="7" y="11" width="10" height="8" rx="1.2" />
          <path d="M9 11V8.6a3 3 0 0 1 6 0V11" />
        </>
      ) : null}
    </svg>
  );
}
