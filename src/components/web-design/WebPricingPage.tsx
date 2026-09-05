import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { FaqAccordion } from "@/components/web-design/FaqAccordion";
import { webDesignContent as copy } from "@/components/web-design/content";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { siteWhatsAppUrl } from "@/lib/site";

export function WebPricingPage() {
  return (
    <div className="sl-webpricing studio-public">
      <Hero />
      <ProjectLevels />
      <Care />
      <Technology />
      <Faq />
      <Finale />
    </div>
  );
}

function Hero() {
  return (
    <section className="sl-webpricing-hero" aria-labelledby="sl-webpricing-hero-title">
      <div className="sl-webpricing-shell">
        <p className="sl-webpricing-eye">{copy.hero.eyebrow}</p>
        <h1 id="sl-webpricing-hero-title" className="sl-webpricing-hero-title font-display">
          <span>{copy.hero.titleBefore}</span>
          <span>
            <em>{copy.hero.titleAccent}</em> {copy.hero.titleAfter}
          </span>
        </h1>
        <p className="sl-webpricing-lead">{copy.hero.lead}</p>
        <div className="sl-webpricing-actions">
          <Button href={copy.hero.primaryHref}>{copy.hero.primaryCta}</Button>
          <a href={copy.hero.secondaryHref} className="sl-webpricing-jump">
            {copy.hero.secondaryCta}
            <span aria-hidden>↓</span>
          </a>
        </div>
        <p className="sl-webpricing-trust">
          {copy.hero.trust.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

function ProjectLevels() {
  return (
    <section
      id="paketler"
      className="sl-webpricing-levels"
      aria-labelledby="sl-webpricing-intro-title"
    >
      <div className="sl-webpricing-shell">
        <Reveal>
          <p className="sl-webpricing-eye">{copy.intro.eyebrow}</p>
          <h2 id="sl-webpricing-intro-title" className="sl-webpricing-title font-display">
            İhtiyacınıza Göre Değil, <em>Hedefinize</em> Göre Başlayın.
          </h2>
          <p className="sl-webpricing-lead sl-webpricing-lead-narrow">{copy.intro.body}</p>
        </Reveal>
        <div className="sl-webpricing-level-grid">
          {copy.levels.map((level) => (
            <article
              key={level.id}
              className={
                level.featured
                  ? "sl-webpricing-level is-featured"
                  : "sl-webpricing-level"
              }
            >
              <span className="sl-webpricing-level-bg" aria-hidden>
                {level.index}
              </span>
              <header className="sl-webpricing-level-head">
                <p className="sl-webpricing-level-index">
                  {level.index} / {level.name}
                </p>
                {level.badge ? (
                  <p className="sl-webpricing-level-badge">
                    <LevelStar />
                    {level.badge}
                  </p>
                ) : null}
                <h3 className="sl-webpricing-level-name font-display">{level.name}</h3>
                <p className="sl-webpricing-level-desc">{level.descriptor}</p>
              </header>
              <p className="sl-webpricing-level-price">
                <strong>{level.priceAmount}</strong>
                <span>{level.priceUnit}</span>
              </p>
              <p className="sl-webpricing-level-caption">{level.priceCaption}</p>
              <p className="sl-webpricing-level-body">{level.body}</p>
              <ul className="sl-webpricing-level-features">
                {level.features.map((feature) => (
                  <li key={feature}>
                    <LevelCheck />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={level.href as Route}
                className={
                  level.featured
                    ? "sl-webpricing-level-cta is-solid"
                    : "sl-webpricing-level-cta is-ghost"
                }
              >
                {level.cta}
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
        <div className="sl-webpricing-level-band">
          <p>
            <i aria-hidden>i</i>
            {copy.note.primary}
          </p>
          <span className="sl-webpricing-level-band-rule" aria-hidden />
          <p>{copy.note.secondary}</p>
        </div>
        <div className="sl-webpricing-panel-grid">
          <SignaturePanel />
          <CustomPanel />
        </div>
      </div>
    </section>
  );
}

function SignaturePanel() {
  return (
    <article className="sl-webpricing-panel is-signature" aria-labelledby="sl-webpricing-sig-title">
      <span className="sl-webpricing-level-bg" aria-hidden>
        {copy.signature.index}
      </span>
      <SignatureGeometry />
      <div className="sl-webpricing-panel-copy">
        <p className="sl-webpricing-level-index">
          {copy.signature.index} / <span lang="en">{copy.signature.eyebrow}</span>
        </p>
        <h3 id="sl-webpricing-sig-title" className="sl-webpricing-panel-title font-display">
          <span>{copy.signature.titleBefore}</span>
          <em>{copy.signature.titleAccent}</em>
        </h3>
        <p className="sl-webpricing-panel-price">{copy.signature.price}</p>
        <p className="sl-webpricing-panel-body">{copy.signature.body}</p>
      </div>
      <ul className="sl-webpricing-panel-caps">
        {copy.signature.features.map((item) => (
          <li key={item}>
            <LevelCheck />
            {item}
          </li>
        ))}
      </ul>
      <Link href={copy.signature.href as Route} className="sl-webpricing-level-cta is-solid">
        {copy.signature.cta}
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

function CustomPanel() {
  return (
    <article className="sl-webpricing-panel is-custom" aria-labelledby="sl-webpricing-custom-title">
      <span className="sl-webpricing-level-bg" aria-hidden>
        {copy.custom.index}
      </span>
      <CustomGeometry />
      <div className="sl-webpricing-panel-copy">
        <p className="sl-webpricing-level-index">
          {copy.custom.index} / <span lang="tr">{copy.custom.eyebrow}</span>
        </p>
        <h3 id="sl-webpricing-custom-title" className="sl-webpricing-panel-title font-display">
          <span>{copy.custom.titleBefore}</span>
          <em>{copy.custom.titleAccent}</em>
        </h3>
        <p className="sl-webpricing-panel-price">{copy.custom.price}</p>
        <p className="sl-webpricing-panel-body">{copy.custom.body}</p>
      </div>
      <ul className="sl-webpricing-panel-caps">
        {copy.custom.capabilities.map((item) => (
          <li key={item}>
            <LevelCheck />
            {item}
          </li>
        ))}
      </ul>
      <Link href={copy.custom.href as Route} className="sl-webpricing-level-cta is-solid">
        {copy.custom.cta}
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

function Care() {
  return (
    <section className="sl-webpricing-care" aria-labelledby="sl-webpricing-care-title">
      <span className="sl-webpricing-care-dots" aria-hidden />
      <Image
        src="/brand/salkay-a-mark.png"
        alt=""
        width={532}
        height={400}
        sizes="42vw"
        className="sl-webpricing-care-mark"
      />
      <div className="sl-webpricing-shell">
        <Reveal>
          <p className="sl-webpricing-eye">{copy.care.eyebrow}</p>
          <h2 id="sl-webpricing-care-title" className="sl-webpricing-title font-display">
            {copy.care.titleBefore} <em>{copy.care.titleAccent}</em>
          </h2>
          <p className="sl-webpricing-lead sl-webpricing-lead-narrow">{copy.care.intro}</p>
        </Reveal>
        <div className="sl-webpricing-care-grid">
          {copy.care.plans.map((plan) => (
            <article
              key={plan.id}
              className={
                plan.kind === "pro"
                  ? "sl-webpricing-care-plan is-pro"
                  : "sl-webpricing-care-plan"
              }
            >
              <span className="sl-webpricing-care-num" aria-hidden>
                {plan.index}
              </span>
              <p className="sl-webpricing-care-label">
                {plan.index} / {plan.name}
              </p>
              <CareIcon kind={plan.kind} />
              <h3 className="sl-webpricing-care-name font-display">{plan.name}</h3>
              <p className="sl-webpricing-care-price">
                <strong>{plan.priceAmount}</strong>
                <span>{plan.priceUnit}</span>
              </p>
              <span className="sl-webpricing-care-rule" aria-hidden />
              <ul className="sl-webpricing-care-features">
                {plan.items.map((item) => (
                  <li key={item}>
                    <LevelCheck />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href as Route}
                className={
                  plan.kind === "pro"
                    ? "sl-webpricing-level-cta is-solid"
                    : "sl-webpricing-level-cta is-ghost"
                }
              >
                {plan.cta}
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
        <div className="sl-webpricing-care-band">
          <p>
            <i aria-hidden>i</i>
            {copy.care.scope}
          </p>
        </div>
        <Link href={copy.care.href as Route} className="sl-webpricing-level-cta is-solid sl-webpricing-care-cta">
          {copy.care.cta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function CareIcon({ kind }: { kind: "care" | "pro" }) {
  switch (kind) {
    case "care":
      return (
        <span className="sl-webpricing-care-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              d="M12 3.4 5.2 6.1v5.3c0 4.2 2.8 7.9 6.8 9.2 4-1.3 6.8-5 6.8-9.2V6.1Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    case "pro":
      return (
        <span className="sl-webpricing-care-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              d="M4.8 9.2 8.2 11.4 12 6.6l3.8 4.8 3.4-2.2-.8 8.2H5.6Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M6.2 19.4h11.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

type TechCapIndex = (typeof copy.tech.capabilities)[number]["index"];
type TechWhyIndex = (typeof copy.tech.why.principles)[number]["index"];
type TechItemName = (typeof copy.tech.nodes)[number]["items"][number];

function Technology() {
  return (
    <section className="sl-webpricing-tech" aria-labelledby="sl-webpricing-tech-title">
      <span className="sl-webpricing-tech-dots" aria-hidden />
      <div className="sl-webpricing-shell">
        <div className="sl-webpricing-tech-main">
          <Reveal>
            <p className="sl-webpricing-eye">{copy.tech.eyebrow}</p>
            <h2 id="sl-webpricing-tech-title" className="sl-webpricing-tech-title font-display">
              <span>Modern Teknoloji.</span>
              <span>
                Doğru <em>Amaç</em> İçin.
              </span>
            </h2>
            <span className="sl-webpricing-tech-rule" aria-hidden />
            <p className="sl-webpricing-lead sl-webpricing-lead-narrow">{copy.tech.body}</p>
          </Reveal>
          <TechArchitecture />
        </div>
        <ul className="sl-webpricing-tech-caps">
          {copy.tech.capabilities.map((item) => (
            <li key={item.index}>
              <TechCapIcon index={item.index} />
              <b>{item.index}</b>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </li>
          ))}
        </ul>
        <div className="sl-webpricing-tech-why">
          <div>
            <p className="sl-webpricing-eye">{copy.tech.why.eyebrow}</p>
            <p>{copy.tech.why.body}</p>
          </div>
          <ul>
            {copy.tech.why.principles.map((item) => (
              <li key={item.index}>
                <TechWhyIcon index={item.index} />
                <b>{item.index}</b>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TechArchitecture() {
  return (
    <div className="sl-webpricing-tech-arch">
      <span className="sl-webpricing-tech-radar" aria-hidden />
      <svg
        className="sl-webpricing-tech-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M20 18H50V50" />
        <path d="M80 18H50V50" />
        <path d="M20 82H50V50" />
        <path d="M80 82H50V50" />
        <circle cx="50" cy="50" r="1.35" />
        <circle cx="20" cy="18" r="1.05" />
        <circle cx="80" cy="18" r="1.05" />
        <circle cx="20" cy="82" r="1.05" />
        <circle cx="80" cy="82" r="1.05" />
      </svg>
      {copy.tech.nodes.map((node) => (
        <article key={node.index} className={`sl-webpricing-tech-node is-${node.index}`}>
          <p>
            {node.index} / {node.label}
          </p>
          <ul>
            {node.items.map((item) => (
              <li key={item}>
                <TechItemMark name={item} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
      <div className="sl-webpricing-tech-core">
        <span className="sl-webpricing-tech-cube">
          <svg viewBox="0 0 64 64" width="42" height="42" aria-hidden>
            <path d="M32 8 54 20v24L32 56 10 44V20Z" />
            <path d="M32 8v48M10 20l22 12 22-12" />
          </svg>
        </span>
        <p>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path d="M5 16.2c0-1.3 1-2.3 2.3-2.4.3-2 2.1-3.5 4.2-3.5 1.8 0 3.3 1.1 4 2.6 1.6.2 2.9 1.6 2.9 3.3 0 1.8-1.5 3.3-3.3 3.3H8.1C6.4 19.5 5 18 5 16.2Z" />
          </svg>
          {copy.tech.core}
        </p>
      </div>
    </div>
  );
}

function TechItemMark({ name }: { name: TechItemName }) {
  switch (name) {
    case "Next.js":
      return <b aria-hidden>N</b>;
    case "React":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.4" />
        </svg>
      );
    case "Vercel":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <path d="M12 5.5 20 18.5H4Z" />
        </svg>
      );
    case "Modern Cloud":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <path d="M6.2 16.4c-1.2 0-2.2-1-2.2-2.2 0-1.1.8-2 1.9-2.2.4-1.8 2-3.1 3.9-3.1 1.6 0 3 .9 3.6 2.3.3-.1.6-.1.9-.1 1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1H6.2Z" />
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <ellipse cx="12" cy="7" rx="6" ry="2.4" />
          <path d="M6 7v7c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V7" />
        </svg>
      );
    case "Neon":
      return <b aria-hidden>N</b>;
    case "API":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="18" cy="17" r="2" />
          <path d="M8 12h8M8 12l8-4.2M8 12l8 4.2" />
        </svg>
      );
    case "Automation":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <path d="M8 7H6v10h2M16 7h2v10h-2" />
        </svg>
      );
    case "Secure Architecture":
      return (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
          <rect x="7" y="11" width="10" height="8" rx="1.2" />
          <path d="M9 11V8.6a3 3 0 0 1 6 0V11" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

function TechCapIcon({ index }: { index: TechCapIndex }) {
  switch (index) {
    case "01":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M12 3.5 5.4 6.1v5.2c0 4.1 2.8 7.8 6.6 9.1 3.8-1.3 6.6-5 6.6-9.1V6.1Z" />
        </svg>
      );
    case "02":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M5 16.6 12 7.4l7 9.2" />
          <path d="M8.1 16.6h7.8" />
          <circle cx="12" cy="13.6" r="1.1" />
        </svg>
      );
    case "03":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M7 7h10v10H7Z" />
          <path d="M10 4h4v3h-4ZM10 17h4v3h-4Z" />
        </svg>
      );
    case "04":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M5.2 15.8c0-1.3 1-2.4 2.3-2.5.3-2 2.1-3.5 4.2-3.5 1.8 0 3.4 1.1 4.1 2.7 1.6.2 2.9 1.6 2.9 3.3 0 1.8-1.5 3.3-3.3 3.3H8.4c-1.8 0-3.2-1.4-3.2-3.3Z" />
        </svg>
      );
    default: {
      const _never: never = index;
      return _never;
    }
  }
}

function TechWhyIcon({ index }: { index: TechWhyIndex }) {
  switch (index) {
    case "01":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M12 4.5 19 8.4v7.2L12 19.5 5 15.6V8.4Z" />
          <path d="M12 4.5v15M5 8.4l7 3.9 7-3.9" />
        </svg>
      );
    case "02":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M9 6.5H7v11h2M15 6.5h2v11h-2" />
        </svg>
      );
    case "03":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M5 18.5h14" />
          <path d="M7 18.5V12h3v6.5M11.5 18.5V8h3v10.5M16 18.5V10h3v8.5" />
        </svg>
      );
    default: {
      const _never: never = index;
      return _never;
    }
  }
}

function Faq() {
  return (
    <section className="sl-webpricing-faq" aria-labelledby="sl-webpricing-faq-title">
      <div className="sl-webpricing-shell sl-webpricing-faq-layout">
        <div className="sl-webpricing-faq-copy">
          <p className="sl-webpricing-faq-index">
            {copy.faq.index} / {copy.faq.section}
          </p>
          <p className="sl-webpricing-eye">{copy.faq.eyebrow}</p>
          <h2 id="sl-webpricing-faq-title" className="sl-webpricing-title font-display">
            <span>Projenize</span>
            <span>Başlamadan</span>
            <em>Önce.</em>
          </h2>
          <span className="sl-webpricing-faq-rule" aria-hidden />
          <p className="sl-webpricing-lead sl-webpricing-lead-narrow">{copy.faq.body}</p>
          <Image
            src="/brand/salkay-a-mark.png"
            alt=""
            width={532}
            height={400}
            sizes="28vw"
            className="sl-webpricing-faq-mark"
          />
        </div>
        <FaqAccordion items={copy.faq.items} />
        <aside className="sl-webpricing-faq-support">
          <span className="sl-webpricing-faq-support-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M6.4 16.6 5 19.4l3.6-1.3c.9.4 1.9.6 3 .6 4.2 0 7.6-3 7.6-6.8S15.8 5.1 11.6 5.1 4 8.1 4 11.9c0 1.6.6 3.1 1.7 4.3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p>{copy.faq.supportTitle}</p>
            <span>{copy.faq.supportBody}</span>
          </div>
          <Link href={copy.faq.supportHref as Route} className="sl-webpricing-level-cta is-solid">
            {copy.faq.supportCta}
            <span aria-hidden>→</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}

function LevelCheck() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
      <circle cx="8" cy="8" r="7.1" fill="currentColor" />
      <path
        d="M4.5 8.15 7 10.55 11.55 5.7"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LevelStar() {
  return (
    <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden>
      <path
        d="M6 1.1 7.15 4.2 10.5 4.4 8 6.55 8.75 9.85 6 8.2 3.25 9.85 4 6.55 1.5 4.4 4.85 4.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SignatureGeometry() {
  return (
    <div className="sl-webpricing-panel-art" aria-hidden>
      <Image
        src="/brand/salkay-a-mark.png"
        alt=""
        width={532}
        height={400}
        sizes="28vw"
        className="sl-webpricing-panel-mark"
      />
      <svg className="sl-webpricing-panel-shards" viewBox="0 0 320 280" fill="none">
        <path d="M210 28 286 92 238 168 168 104Z" stroke="rgba(36,107,253,0.28)" />
        <path d="M248 118 304 156 268 228 206 176Z" fill="rgba(36,107,253,0.08)" />
        <path d="M176 148 232 198 188 256 132 198Z" stroke="rgba(19,200,244,0.16)" />
      </svg>
    </div>
  );
}

function CustomGeometry() {
  return (
    <div className="sl-webpricing-panel-art" aria-hidden>
      <svg className="sl-webpricing-panel-system" viewBox="0 0 320 280" fill="none">
        <path d="M20 40H300M20 88H300M20 136H300M20 184H300M20 232H300" stroke="rgba(255,255,255,0.04)" />
        <path d="M52 16V264M108 16V264M164 16V264M220 16V264M276 16V264" stroke="rgba(255,255,255,0.035)" />
        <circle cx="108" cy="88" r="3.2" fill="#1554F0" />
        <circle cx="220" cy="136" r="3.2" fill="#38BDF8" />
        <circle cx="164" cy="184" r="3.2" fill="#1554F0" />
        <path d="M108 88H220V136H164V184" stroke="rgba(21,84,240,0.35)" />
        <rect x="246" y="52" width="22" height="22" rx="2" transform="rotate(18 257 63)" stroke="rgba(21,84,240,0.35)" />
        <rect x="250" y="196" width="18" height="18" rx="2" transform="rotate(-14 259 205)" stroke="rgba(56,189,248,0.28)" />
      </svg>
    </div>
  );
}

function Finale() {
  return (
    <section className="sl-webpricing-finale" aria-labelledby="sl-webpricing-finale-title">
      <div className="sl-webpricing-shell">
        <Reveal>
          <p className="sl-webpricing-eye is-dark">{copy.finale.eyebrow}</p>
          <h2 id="sl-webpricing-finale-title" className="sl-webpricing-title font-display">
            <span>{copy.finale.titleBefore}</span>
            <em>{copy.finale.titleAccent}</em>
          </h2>
          <p className="sl-webpricing-lead sl-webpricing-lead-narrow">{copy.finale.body}</p>
          <div className="sl-webpricing-actions">
            <Button href={copy.finale.primaryHref}>{copy.finale.primaryCta}</Button>
            <a
              href={siteWhatsAppUrl()}
              className="sl-webpricing-jump is-dark"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.finale.secondaryCta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
