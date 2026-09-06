const values = [
  {
    icon: "stack",
    title: "TEK SİSTEM",
    body: "İhtiyaçlarınıza göre dijital çözümleri tek bir altyapıda bir araya getiriyoruz.",
  },
  {
    icon: "data",
    title: "ENTEGRE VERİ",
    body: "Sistemler arasında daha düzenli ve bağlantılı veri akışları oluşturuyoruz.",
  },
  {
    icon: "bolt",
    title: "OTOMATİK SÜREÇLER",
    body: "Tekrarlayan süreçleri otomasyonlarla daha verimli hale getiriyoruz.",
  },
] as const;

function ValueIcon({ icon }: { icon: (typeof values)[number]["icon"] }) {
  switch (icon) {
    case "stack":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 4.5 4 8.2l8 3.7 8-3.7Z" />
          <path d="M4 12.2 12 16l8-3.8M4 16.1 12 20l8-3.9" />
        </svg>
      );
    case "data":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <ellipse cx="12" cy="7" rx="6" ry="2.3" />
          <path d="M6 7v8c0 1.3 2.7 2.3 6 2.3s6-1 6-2.3V7" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M13 3.5 6.8 13h5.1L11 20.5 17.4 11h-5Z" />
        </svg>
      );
    default: {
      const _never: never = icon;
      return _never;
    }
  }
}

export function ValueStrip() {
  return (
    <ul className="ds-values">
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
