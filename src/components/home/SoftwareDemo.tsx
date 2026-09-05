"use client";

import { useEffect, useRef, useState } from "react";

type DemoStep = {
  title: string;
  body: string;
};

type SoftwareDemoProps = {
  label: string;
  steps: DemoStep[];
};

export function SoftwareDemo({ label, steps }: SoftwareDemoProps) {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || steps.length < 2) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    const timer = window.setInterval(() => {
      if (!visibleRef.current) {
        return;
      }

      setActive((current) => (current + 1) % steps.length);
    }, 2600);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [steps.length]);

  const current = steps[active] ?? steps[0];

  return (
    <div ref={rootRef} className="studio-soft-demo">
      <p className="studio-soft-demo-label">{label}</p>
      <ol className="studio-soft-demo-tabs">
        {steps.map((step, index) => (
          <li key={step.title}>
            <button
              type="button"
              className={index === active ? "is-active" : undefined}
              aria-current={index === active ? "step" : undefined}
              onClick={() => setActive(index)}
            >
              {step.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="studio-soft-panel" aria-live="polite">
        <SoftwarePanel step={current} index={active} />
      </div>
    </div>
  );
}

function SoftwarePanel({ step, index }: { step: DemoStep; index: number }) {
  if (index <= 0) {
    return (
      <div className="studio-soft-view">
        <p>{step.body}</p>
        <ul className="studio-soft-choices">
          <li className="is-on">Kurumsal site</li>
          <li>Müşteri portalı</li>
          <li>Konfigüratör</li>
        </ul>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="studio-soft-view">
        <p>{step.body}</p>
        <dl className="studio-soft-summary">
          <div>
            <dt>Seçilen</dt>
            <dd>Kurumsal site</dd>
          </div>
          <div>
            <dt>Kapsam</dt>
            <dd>Tanıtım, hizmetler, iletişim</dd>
          </div>
          <div>
            <dt>Sonraki adım</dt>
            <dd>Talep özeti</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="studio-soft-view">
      <p>{step.body}</p>
      <div className="studio-soft-request">
        <strong>Talep hazır</strong>
        <span>Kurumsal site · tanıtım, hizmetler, iletişim</span>
      </div>
    </div>
  );
}
