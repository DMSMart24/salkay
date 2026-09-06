const sparks = [
  "M2 14 C8 13 12 8 18 9 C24 10 28 5 38 4",
  "M2 12 C10 13 14 7 22 8 C30 9 34 5 38 3",
  "M2 13 C8 11 14 14 20 8 C26 3 32 9 38 6",
  "M2 15 C9 14 13 9 20 10 C27 11 32 6 38 5",
] as const;

export function AnalyticsKpiCard({
  label,
  value,
  delta,
  index,
}: {
  label: string;
  value: string;
  delta: string;
  index: number;
}) {
  return (
    <article className="dcr-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>↗ {delta}</em>
      <svg viewBox="0 0 40 18" aria-hidden>
        <path d={sparks[index] ?? sparks[0]} />
      </svg>
    </article>
  );
}
