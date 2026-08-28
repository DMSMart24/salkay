import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";

export function Introduction() {
  const { intro } = getDictionary().home;

  return (
    <section id="giris" className="bg-paper">
      <Container className="grid gap-10 py-20 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16 lg:py-28">
        <p className="eyebrow text-salkay">{intro.eyebrow}</p>
        <div>
          <p className="max-w-3xl font-display text-h2 text-ink">{intro.statement}</p>
          <p className="mt-8 max-w-xl text-stone">{intro.aside}</p>
        </div>
      </Container>
    </section>
  );
}
