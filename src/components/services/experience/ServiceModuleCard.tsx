import Link from "next/link";

export type ServiceModule = {
  id: string;
  index: string;
  title: string;
  body: string;
  href: string;
  icon: "pen" | "code" | "chart" | "chip";
};

function ModuleIcon({ icon }: { icon: ServiceModule["icon"] }) {
  switch (icon) {
    case "pen":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M14.2 5.2 18.8 9.8 9.4 19.2 4.6 20.4 5.8 15.6Z" />
          <path d="M12.7 6.7 17.3 11.3" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M9 8 5 12l4 4M15 8l4 4-4 4" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5 18V8M12 18V5M19 18v-6" />
        </svg>
      );
    case "chip":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        </svg>
      );
    default: {
      const _never: never = icon;
      return _never;
    }
  }
}

export function ServiceModuleCard({
  module,
  className,
}: {
  module: ServiceModule;
  className?: string;
}) {
  return (
    <article className={`svc-dgs-card ${className ?? ""}`.trim()}>
      <header>
        <span>{module.index}</span>
        <ModuleIcon icon={module.icon} />
      </header>
      <h3>{module.title}</h3>
      <p>{module.body}</p>
      <Link href={module.href} className="svc-dgs-more">
        Detayları İncele
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
