"use client";

import {
  CONFIGURATOR_CATALOG,
  type ConfiguratorSelection,
} from "@/components/services/systems/configurator-catalog";

type OptionsProps = {
  selection: ConfiguratorSelection;
  onChange: (next: ConfiguratorSelection) => void;
};

export function ConfiguratorOptions({ selection, onChange }: OptionsProps) {
  const model = CONFIGURATOR_CATALOG.models.find((item) => item.id === selection.modelId);
  const color = CONFIGURATOR_CATALOG.colors.find((item) => item.id === selection.colorId);
  const material = CONFIGURATOR_CATALOG.materials.find((item) => item.id === selection.materialId);

  return (
    <div className="ds-cfg-fields">
      <label className="ds-cfg-field">
        <span>Model</span>
        <select
          value={selection.modelId}
          onChange={(event) => onChange({ ...selection, modelId: event.target.value })}
        >
          {CONFIGURATOR_CATALOG.models.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <strong>{model?.name}</strong>
      </label>

      <label className="ds-cfg-field">
        <span>Renk</span>
        <select
          value={selection.colorId}
          onChange={(event) => onChange({ ...selection, colorId: event.target.value })}
        >
          {CONFIGURATOR_CATALOG.colors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <strong className="is-accent">{color?.name}</strong>
      </label>

      <label className="ds-cfg-field">
        <span>Malzeme</span>
        <select
          value={selection.materialId}
          onChange={(event) => onChange({ ...selection, materialId: event.target.value })}
        >
          {CONFIGURATOR_CATALOG.materials.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <strong>{material?.name}</strong>
      </label>

      <div className="ds-cfg-field">
        <span>Adet</span>
        <div className="ds-stepper">
          <button
            type="button"
            aria-label="Azalt"
            onClick={() => onChange({ ...selection, quantity: Math.max(1, selection.quantity - 1) })}
          >
            −
          </button>
          <b>{selection.quantity}</b>
          <button
            type="button"
            aria-label="Artır"
            onClick={() => onChange({ ...selection, quantity: Math.min(99, selection.quantity + 1) })}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
