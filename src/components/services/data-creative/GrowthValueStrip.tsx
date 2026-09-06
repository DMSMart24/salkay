const values = [
  {
    title: "DOĞRU KİTLE",
    body: "Markanızın doğru hedef kitleyle buluşmasına odaklanıyoruz.",
  },
  {
    title: "ÖLÇÜLEBİLİR SONUÇLAR",
    body: "Veriye dayalı analizlerle performansı takip ediyoruz.",
  },
  {
    title: "SÜRDÜRÜLEBİLİR BÜYÜME",
    body: "Kısa vadeli sonuçların yanında uzun vadeli gelişimi gözetiyoruz.",
  },
  {
    title: "STRATEJİK İŞ ORTAKLIĞI",
    body: "Dijital büyüme sürecinde markanızla birlikte hareket ediyoruz.",
  },
] as const;

export function GrowthValueStrip() {
  return (
    <ul className="dcr-values">
      {values.map((item) => (
        <li key={item.title}>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
