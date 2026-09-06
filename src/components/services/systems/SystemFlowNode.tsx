type NodeIcon = "stack" | "gear" | "spark";

export function SystemFlowNode({
  title,
  meta,
  icon,
  className,
}: {
  title: string;
  meta: string;
  icon: NodeIcon;
  className?: string;
}) {
  return (
    <article className={`ds-node ${className ?? ""}`.trim()}>
      <header>
        <NodeIcon name={icon} />
        <h3>{title}</h3>
      </header>
      <p>{meta}</p>
    </article>
  );
}

function NodeIcon({ name }: { name: NodeIcon }) {
  switch (name) {
    case "stack":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 4.5 4 8.2l8 3.7 8-3.7Z" />
          <path d="M4 12.2 12 16l8-3.8" />
          <path d="M4 16.1 12 20l8-3.9" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 5.2V3.4M12 20.6v-1.8M5.2 12H3.4M20.6 12h-1.8M7.2 7.2 6 6M18 18l-1.2-1.2M16.8 7.2 18 6M6 18l1.2-1.2" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3.5 13.4 9H19l-4.4 3.4L16.2 18 12 14.8 7.8 18l1.6-5.6L5 9h5.6Z" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}
