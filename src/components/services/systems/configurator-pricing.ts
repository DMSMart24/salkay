import type { ProductMaterial, ProductModel } from "@/components/services/systems/configurator-catalog";

export function calculateConfiguratorTotal(
  model: ProductModel,
  material: ProductMaterial,
  quantity: number,
): number {
  const safeQty = Math.min(99, Math.max(1, quantity));
  return (model.basePrice + material.priceDelta) * safeQty;
}

export function formatConfiguratorPrice(amount: number): string {
  return amount.toLocaleString("tr-TR");
}
