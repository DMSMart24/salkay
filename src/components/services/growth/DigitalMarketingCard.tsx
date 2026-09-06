import { GrowthLink } from "@/components/services/growth/GrowthLink";

const steps = [
  { name: "Farkındalık", wide: "100%" },
  { name: "İlgi", wide: "82%" },
  { name: "Değerlendirme", wide: "64%" },
  { name: "Dönüşüm", wide: "46%" },
] as const;

const chips = [
  { label: "Görüntüleme", value: "+%120" },
  { label: "Etkileşim", value: "+%86" },
  { label: "Talep", value: "+%74" },
  { label: "Dönüşüm", value: "+%58" },
] as const;

export function DigitalMarketingCard() {
  return (
    <article className="gx-card is-mkt">
      <header>
        <span>03</span>
        <p>• TALEP</p>
      </header>
      <h3>Dijital Pazarlama</h3>
      <p>
        İçerik, görünürlük ve talep yaratmayı tek bir büyüme stratejisinde
        birleştiriyoruz.
      </p>
      <div className="gx-funnel" aria-hidden>
        <ol>
          {steps.map((step) => (
            <li key={step.name} style={{ width: step.wide }}>
              {step.name}
            </li>
          ))}
        </ol>
        <ul>
          {chips.map((chip) => (
            <li key={chip.label}>
              <em>{chip.value}</em>
              {chip.label}
            </li>
          ))}
        </ul>
      </div>
      <GrowthLink>Talebi büyütün</GrowthLink>
    </article>
  );
}
