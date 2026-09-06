const steps = [
  { id: "konsept", label: "Konsept" },
  { id: "prod", label: "Prodüksiyon" },
  { id: "yayin", label: "Yayın", current: true },
  { id: "perf", label: "Performans" },
] as const;

export function CampaignTimeline() {
  return (
    <div className="ccs-time">
      <p>KAMPANYA SÜRECİ</p>
      <ol>
        {steps.map((step, index) => (
          <li key={step.id} className={"current" in step ? "is-now" : ""}>
            <i aria-hidden />
            <strong>{step.label}</strong>
            {index < steps.length - 1 ? <em aria-hidden>→</em> : null}
          </li>
        ))}
      </ol>
      <span>Stratejiden performansa, uçtan uca yanınızdayız.</span>
    </div>
  );
}
