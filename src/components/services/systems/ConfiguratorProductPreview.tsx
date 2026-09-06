"use client";

import { ConfiguratorColorSwatches } from "@/components/services/systems/ConfiguratorColorSwatches";
import { ConfiguratorMaterialSelector } from "@/components/services/systems/ConfiguratorMaterialSelector";
import {
  resolveConfiguratorAsset,
  type ProductColor,
  type ProductMaterial,
  type ProductModel,
} from "@/components/services/systems/configurator-catalog";

type PreviewProps = {
  model: ProductModel;
  color: ProductColor;
  material: ProductMaterial;
  colors: readonly ProductColor[];
  materials: readonly ProductMaterial[];
  onSelectColor: (id: string) => void;
  onSelectMaterial: (id: string) => void;
};

export function ConfiguratorProductPreview({
  model,
  color,
  material,
  colors,
  materials,
  onSelectColor,
  onSelectMaterial,
}: PreviewProps) {
  const asset = resolveConfiguratorAsset(model, color, material);

  return (
    <div
      className={`ds-prod is-${material.finish}`}
      data-asset={asset.kind}
      data-model={model.id}
      data-color={color.id}
      data-material={material.id}
    >
      <div className="ds-prod-well">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={`${asset.src}-${material.id}`} className="ds-prod-photo" src={asset.src} alt={asset.alt ?? model.name} />
      </div>
      <p className="ds-prod-name">{model.name}</p>
      <ConfiguratorColorSwatches colors={colors} value={color.id} onChange={onSelectColor} />
      <ConfiguratorMaterialSelector materials={materials} value={material.id} onChange={onSelectMaterial} />
    </div>
  );
}
