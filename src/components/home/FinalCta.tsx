import { KayScene } from "@/components/brand/KayScene";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { getKayAsset } from "@/lib/kay-assets";
import { routes } from "@/lib/routes";

export function FinalCta() {
  const dictionary = getDictionary();
  const { cta } = dictionary.home;

  return (
    <section id="teklif" className="bg-ink text-paper">
      <Container className="grid items-center gap-12 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-32">
        <div className="max-w-3xl">
          <h2 className="font-display text-h1">{cta.title}</h2>
          <p className="mt-6 max-w-xl text-[1.08rem] leading-8 text-paper/64">
            {cta.body}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href={routes.contact} tone="on-dark">
              {cta.primary}
            </Button>
            <Button href={routes.services} variant="secondary" tone="on-dark">
              {cta.secondary}
            </Button>
          </div>
        </div>
        <KayScene
          variant="cta"
          asset={getKayAsset("cta")}
          label={dictionary.kay.placeholder}
          hint={dictionary.kay.hint}
          className="min-h-[16rem] lg:min-h-[20rem]"
        />
      </Container>
    </section>
  );
}
