const paths = [
  "M16 14 C30 24 40 34 50 42",
  "M84 14 C70 24 60 34 50 42",
  "M16 88 C30 76 40 54 50 42",
  "M84 88 C70 76 60 54 50 42",
] as const;

export function SystemConnectionLines() {
  return (
    <svg className="ti-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {paths.map((d) => (
        <g key={d}>
          <path className="ti-path" d={d} />
          <circle className="ti-path-dot" r="1.15" style={{ offsetPath: `path("${d}")` }} />
        </g>
      ))}
      <circle className="ti-hub" cx="50" cy="42" r="1.5" />
    </svg>
  );
}
