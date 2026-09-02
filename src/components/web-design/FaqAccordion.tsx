"use client";

import { useId, useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: readonly FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="sl-webpricing-faq-list">
      {items.map((item, index) => {
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        const expanded = open === index;

        return (
          <div
            key={item.question}
            className={
              expanded ? "sl-webpricing-faq-item is-open" : "sl-webpricing-faq-item"
            }
          >
            <h3 className="sl-webpricing-faq-heading">
              <button
                id={buttonId}
                type="button"
                className="sl-webpricing-faq-trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
              >
                <span className="sl-webpricing-faq-mark" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
                <span className="sl-webpricing-faq-q">{item.question}</span>
                {expanded ? <em>Açık</em> : null}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className="sl-webpricing-faq-panel"
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
