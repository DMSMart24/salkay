const icons = {
  strategy: "M9 18h6M10 21h4M12 3.8a5.4 5.4 0 0 0-2.7 9.9c.4.6.8 1.4.9 2.1h3.6c.1-.7.5-1.5.9-2.1A5.4 5.4 0 0 0 12 3.8z",
  camera: "M4.4 8.4h3.2l1.5-1.7h5.8l1.5 1.7h3.2v8.8H4.4zm7.6 2.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2z",
  launch: "M5.2 10.2v3.6h2.6l5.6 2.8V7.4L7.8 10.2zm10.6-1.4c1.1.8 1.7 1.9 1.7 3.2s-.6 2.4-1.7 3.2",
} as const;

const steps = [
  {
    index: "01",
    title: "Strateji & Konsept",
    body: "Hedefe uygun yaratıcı yaklaşım",
    icon: icons.strategy,
  },
  {
    index: "02",
    title: "Prodüksiyon",
    body: "Profesyonel çekim & kurgu",
    icon: icons.camera,
  },
  {
    index: "03",
    title: "Yayın & Performans",
    body: "Doğru platformda etkili yayılım",
    icon: icons.launch,
  },
] as const;

export function ProductionSteps() {
  return (
    <ol className="dcr-steps">
      {steps.map((step) => (
        <li key={step.index}>
          <i aria-hidden />
          <article>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={step.icon} />
            </svg>
            <div>
              <strong>{step.title}</strong>
              <span>{step.body}</span>
            </div>
            <em aria-hidden>→</em>
            <b>{step.index}</b>
          </article>
        </li>
      ))}
    </ol>
  );
}
