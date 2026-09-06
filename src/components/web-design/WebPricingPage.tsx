import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { FaqAccordion } from "@/components/web-design/FaqAccordion";
import { TechnologyInfrastructureSection } from "@/components/web-design/technology/TechnologyInfrastructureSection";
import { webDesignContent as copy } from "@/components/web-design/content";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { siteWhatsAppUrl } from "@/lib/site";

export function WebPricingPage() {
  return (
    <div className="sl-webpricing">
      <Hero />
      <ProjectLevels />
      <Care />
      <TechnologyInfrastructureSection />
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
        <header className="sl-webpricing-levels-intro">
          <p className="sl-webpricing-eye">{copy.intro.eyebrow}</p>
          <h2 id="sl-webpricing-intro-title" className="sl-webpricing-title">
            <span>{copy.intro.titleBefore}</span>
            <span>
              <em>{copy.intro.titleAccent}</em> {copy.intro.titleAfter}
            </span>
          </h2>
          <p className="sl-webpricing-lead sl-webpricing-lead-narrow">{copy.intro.body}</p>
        </header>
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
              {level.badge ? (
                <p className="sl-webpricing-level-badge">{level.badge}</p>
              ) : (
                <span className="sl-webpricing-level-badge-slot" aria-hidden />
              )}
              <header className="sl-webpricing-level-head">
                <h3 className="sl-webpricing-level-name">{level.name}</h3>
                <p className="sl-webpricing-level-desc">{level.descriptor}</p>
              </header>
              <p className="sl-webpricing-level-price">
                <strong>{level.priceAmount}</strong>
                <span>{level.priceUnit}</span>
              </p>
              <p className="sl-webpricing-level-body">{level.body}</p>
              <span className="sl-webpricing-level-rule" aria-hidden />
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
