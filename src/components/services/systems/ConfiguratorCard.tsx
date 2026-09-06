"use client";

import { useMemo, useState } from "react";
import { ConfiguratorOptions } from "@/components/services/systems/ConfiguratorOptions";
import { ConfiguratorPriceSummary } from "@/components/services/systems/ConfiguratorPriceSummary";
import { ConfiguratorProductPreview } from "@/components/services/systems/ConfiguratorProductPreview";
import {
  CONFIGURATOR_CATALOG,
  CONFIGURATOR_STEPS,
  DEFAULT_CONFIGURATOR_SELECTION,
  getConfiguratorColor,
  getConfiguratorMaterial,
  getConfiguratorModel,
} from "@/components/services/systems/configurator-catalog";
import {
  calculateConfiguratorTotal,
  formatConfiguratorPrice,
} from "@/components/services/systems/configurator-pricing";
import { DsLink } from "@/components/services/systems/DsLink";
import { routes } from "@/lib/routes";

export function ConfiguratorCard() {
  const [selection, setSelection] = useState(DEFAULT_CONFIGURATOR_SELECTION);
  const model = getConfiguratorModel(selection.modelId);
  const color = getConfiguratorColor(selection.colorId);
  const material = getConfiguratorMaterial(selection.materialId);
  const total = useMemo(
    () => formatConfiguratorPrice(calculateConfiguratorTotal(model, material, selection.quantity)),
    [model, material, selection.quantity],
  );

  return (
    <article className="ds-card is-cfg">
      <header>
        <span>02 / ARAÇ</span>
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="5" width="6" height="6" rx="1" />
          <rect x="13" y="5" width="6" height="6" rx="1" />
          <rect x="5" y="13" width="6" height="6" rx="1" />
          <rect x="13" y="13" width="6" height="6" rx="1" />
        </svg>
      </header>
      <h3 className="font-display">Konfigüratörler</h3>
      <p>Ürün seçimi, fiyatlandırma ve teklif süreçlerini kolaylaştıran interaktif sistemler.</p>
      <div className="ds-cfg">
        <ol aria-hidden>
          {CONFIGURATOR_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="ds-cfg-body">
          <ConfiguratorProductPreview
            model={model}
            color={color}
            material={material}
            colors={CONFIGURATOR_CATALOG.colors}
            materials={CONFIGURATOR_CATALOG.materials}
            onSelectColor={(colorId) => setSelection((current) => ({ ...current, colorId }))}
            onSelectMaterial={(materialId) => setSelection((current) => ({ ...current, materialId }))}
          />
          <ConfiguratorOptions selection={selection} onChange={setSelection} />
        </div>
        <ConfiguratorPriceSummary total={total} />
      </div>
      <DsLink href={routes.contact}>Detayları İncele</DsLink>
    </article>
  );
}
