import { getDictionary } from "@/i18n/get-dictionary";

export function Marquee() {
  const items = getDictionary().home.marquee;
  const sequence = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-gold/20 bg-navy-soft">
      <div className="marquee-track flex w-max items-center gap-6 py-4 font-mono text-[0.78rem] tracking-[0.16em] text-muted uppercase">
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-6">
            {item}
            <span className="text-gold/80">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
