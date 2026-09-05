import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BarChart3,
  MonitorSmartphone,
  Search,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { IconWell } from "@/components/ui/IconWell";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import type { LucideIcon } from "lucide-react";

const serviceIcons = [
  MonitorSmartphone,
  Settings2,
  Search,
  Target,
  BarChart3,
  Sparkles,
] as const satisfies readonly LucideIcon[];

function AutomationMark() {
  return (
    <svg viewBox="0 0 168 72" className="apple-automation-mark" aria-hidden>
      <rect x="6" y="20" width="34" height="32" rx="7" />
      <path d="M40 36 H68" />
      <circle cx="82" cy="36" r="11" />
      <path d="M93 36 H120" />
      <rect x="120" y="20" width="42" height="32" rx="7" />
      <path d="M76 25 V16" />
      <path d="M82 16 H92" />
    </svg>
  );
}

export function ServicesBento() {
  const { bento } = getDictionary().home;
  const cards = [
    {
      title: bento.coreTitle,
      body: bento.coreBody,
      href: bento.coreHref,
      cta: bento.coreCta,
    },
    ...bento.items,
  ];

  return (
    <section id="hizmetler" className="apple-services">
      <Container>
        <Reveal className="apple-services-head">
          <p className="studio-eye">{bento.eyebrow}</p>
          <h2 className="studio-title font-display">{bento.title}</h2>
          <p className="studio-lead">{bento.lead}</p>
        </Reveal>

        <RevealGroup as="ul" className="apple-services-grid">
          {cards.map((card, index) => {
            const Icon = serviceIcons[index] ?? Sparkles;
            const number = String(index + 1).padStart(2, "0");

            return (
              <RevealItem key={card.title}>
                <Link href={card.href as Route} className="apple-card">
                  <span className="apple-card-index" aria-hidden>
                    {number}
                  </span>
                  <IconWell icon={Icon} />
                  <h3 className="font-display">{card.title}</h3>
                  <p>{card.body}</p>
                  {index === 5 ? <AutomationMark /> : null}
                  <span className="apple-card-cta">
                    {card.cta}
                    <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={120} className="mt-10">
          <Link href={routes.services} className="apple-text-link">
            Tüm hizmetleri görün
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
