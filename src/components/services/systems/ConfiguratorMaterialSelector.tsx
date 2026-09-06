"use client";

import type { ProductMaterial } from "@/components/services/systems/configurator-catalog";

export function ConfiguratorMaterialSelector({
  materials,
  value,
  onChange,
}: {
  materials: readonly ProductMaterial[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="ds-mats" role="radiogroup" aria-label="Malzeme">
      {materials.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          className={item.id === value ? "is-on" : undefined}
          aria-checked={item.id === value}
          onClick={() => onChange(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
