const values = [
  {
    icon: "person",
    title: "DOĞRU KİTLE",
    body: "Markanızın doğru hedef kitleyle daha güçlü şekilde buluşmasına odaklanıyoruz.",
  },
  {
    icon: "bars",
    title: "ÖLÇÜLEBİLİR SONUÇLAR",
    body: "Veriye dayalı analizlerle performansı takip ediyor ve kararları güçlendiriyoruz.",
  },
  {
    icon: "leaf",
    title: "SÜRDÜRÜLEBİLİR BÜYÜME",
    body: "Kısa vadeli sonuçların yanında uzun vadeli dijital gelişimi gözetiyoruz.",
  },
  {
    icon: "pair",
    title: "STRATEJİK İŞ ORTAKLIĞI",
    body: "Dijital büyüme sürecinde markanızla birlikte hareket ediyoruz.",
  },
] as const;

function ValueIcon({ icon }: { icon: (typeof values)[number]["icon"] }) {
  switch (icon) {
    case "person":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="8.2" r="2.6" />
          <path d="M6.6 18.5c.8-3.2 2.8-4.8 5.4-4.8s4.6 1.6 5.4 4.8" />
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5 18.5h14M7 18.5V12h3v6.5M11.5 18.5V8h3v10.5M16 18.5V10h3v8.5" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 20.2c0-7.4 4.2-12.6 8-14.4-1.2 6.4-4.8 10.6-8 12.2C8.8 16.4 5.2 12.2 4 5.8 7.8 7.6 12 12.8 12 20.2Z" />
          <path d="M12 20.2V9.4" />
        </svg>
      );
    case "pair":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="9" cy="8.4" r="2.2" />
          <circle cx="15.4" cy="9.2" r="1.8" />
          <path d="M4.8 18c.6-2.8 2.2-4.2 4.2-4.2s3.6 1.4 4.2 4.2" />
          <path d="M13.4 18c.4-2 1.6-3 3-3s2.5 1 2.9 3" />
        </svg>
      );
    default: {
      const _never: never = icon;
      return _never;
    }
  }
}

export function GrowthValues() {
  return (
    <ul className="gx-values">
      {values.map((item) => (
        <li key={item.title}>
          <ValueIcon icon={item.icon} />
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </li>
      ))}
    </ul>
  );
}
