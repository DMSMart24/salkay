export type ProductAsset =
  | { kind: "procedural" }
  | { kind: "image"; src: string; alt?: string }
  | { kind: "model"; src: string; poster?: string };

export type ProductFinish = "woven" | "gloss" | "pile";

export type ProductModel = {
  id: string;
  name: string;
  basePrice: number;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type ProductMaterial = {
  id: string;
  name: string;
  finish: ProductFinish;
  priceDelta: number;
};

export type ConfiguratorSelection = {
  modelId: string;
  colorId: string;
  materialId: string;
  quantity: number;
};

export const CONFIGURATOR_STEPS = ["01 ÜRÜN", "02 ÖZELLEŞTİRME", "03 FİYAT", "04 TEKLİF"] as const;

export const CONFIGURATOR_CATALOG = {
  models: [{ id: "luna", name: "Luna Sandalye", basePrice: 2490 }] as const satisfies readonly ProductModel[],
  colors: [
    { id: "ocean", name: "Okyanus Mavisi", hex: "#1d4f9c" },
    { id: "anthracite", name: "Antrasit", hex: "#2b3038" },
    { id: "pearl", name: "Açık Gri", hex: "#c8ccd3" },
  ] as const satisfies readonly ProductColor[],
  materials: [
    { id: "fabric", name: "Kumaş", finish: "woven", priceDelta: 0 },
    { id: "leather", name: "Deri", finish: "gloss", priceDelta: 610 },
    { id: "velvet", name: "Kadife", finish: "pile", priceDelta: 310 },
  ] as const satisfies readonly ProductMaterial[],
};

export const DEFAULT_CONFIGURATOR_SELECTION: ConfiguratorSelection = {
  modelId: "luna",
  colorId: "ocean",
  materialId: "fabric",
  quantity: 10,
};

const PRODUCT_IMAGES: Record<string, Partial<Record<string, string>>> = {
  "luna-ocean": {
    fabric: "/products/luna/ocean-fabric.png",
    leather: "/products/luna/ocean-fabric.png",
    velvet: "/products/luna/ocean-fabric.png",
  },
  "luna-anthracite": {
    fabric: "/products/luna/anthracite-fabric.png",
    leather: "/products/luna/anthracite-fabric.png",
    velvet: "/products/luna/anthracite-fabric.png",
  },
  "luna-pearl": {
    fabric: "/products/luna/pearl-fabric.png",
    leather: "/products/luna/pearl-fabric.png",
    velvet: "/products/luna/pearl-fabric.png",
  },
};

export function getConfiguratorModel(id: string): ProductModel {
  return CONFIGURATOR_CATALOG.models.find((item) => item.id === id) ?? CONFIGURATOR_CATALOG.models[0];
}

export function getConfiguratorColor(id: string): ProductColor {
  return CONFIGURATOR_CATALOG.colors.find((item) => item.id === id) ?? CONFIGURATOR_CATALOG.colors[0];
}

export function getConfiguratorMaterial(id: string): ProductMaterial {
  return CONFIGURATOR_CATALOG.materials.find((item) => item.id === id) ?? CONFIGURATOR_CATALOG.materials[0];
}

export function resolveConfiguratorAsset(
  model: ProductModel,
  color: ProductColor,
  material: ProductMaterial,
): Extract<ProductAsset, { kind: "image" }> {
  const variants = PRODUCT_IMAGES[`${model.id}-${color.id}`];
  const src = variants?.[material.id] ?? variants?.fabric ?? "/products/luna/ocean-fabric.png";
  return {
    kind: "image",
    src,
    alt: `${model.name}, ${color.name}, ${material.name}`,
  };
}
