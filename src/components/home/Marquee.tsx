import { getDictionary } from "@/i18n/get-dictionary";

export function Marquee() {
  const items = getDictionary().home.marquee;
  const sequence = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-line bg-canvas-soft">
      <div className="marquee-track flex w-max items-center gap-6 py-4 font-mono text-[0.78rem] tracking-[0.16em] text-muted uppercase">
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-6">
            {item}
            <span className="text-cyan/70">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
