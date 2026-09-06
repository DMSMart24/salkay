"use client";

import type { ProductColor } from "@/components/services/systems/configurator-catalog";

export function ConfiguratorColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: readonly ProductColor[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="ds-swatches" role="radiogroup" aria-label="Renk">
      {colors.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          className={item.id === value ? "is-on" : undefined}
          aria-checked={item.id === value}
          aria-label={item.name}
          style={{ background: item.hex }}
          onClick={() => onChange(item.id)}
        />
      ))}
    </div>
  );
}
