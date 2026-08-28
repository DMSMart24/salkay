"use client";

/**
 * KAY 3D archived for future reactivation.
 * Do not import this module from the production homepage.
 * See src/components/brand/archived-3d/README.md
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import { KayPlaceholder } from "@/components/brand/KayPlaceholder";
import { cn } from "@/lib/cn";
import type { KayAsset, KayTone, KayVariant } from "@/lib/kay";
import { assertKayVariant } from "@/lib/kay";

const Kay3D = dynamic(
  () => import("@/components/brand/Kay3D").then((module) => module.Kay3D),
  { ssr: false },
);

type KayMascotProps = {
  variant: KayVariant;
  asset: KayAsset;
  tone?: KayTone;
  priority?: boolean;
  className?: string;
};

export function KayMascot({
  variant,
  asset,
  tone = "on-dark",
  priority = false,
  className,
}: KayMascotProps) {
  assertKayVariant(variant);

  const fallback = <KayPlaceholder tone={tone} />;

  switch (asset.renderer) {
    case "gltf":
      return (
        <div className={cn("relative h-full w-full", className)}>
          <Kay3D fallback={fallback} />
        </div>
      );
    case "image":
      return (
        <div className={cn("kay-figure relative h-full w-full", className)}>
          {asset.available ? (
            <Image
              src={asset.src}
              alt=""
              width={asset.width}
              height={asset.height}
              priority={priority}
              sizes={
                variant === "hero"
                  ? "(max-width: 1023px) 70vw, 28vw"
                  : "(max-width: 1023px) 50vw, 22vw"
              }
              className="h-full w-full object-contain object-bottom"
            />
          ) : (
            fallback
          )}
        </div>
      );
    case "placeholder":
    case "rive":
    case "lottie":
      return (
        <div className={cn("kay-figure relative h-full w-full", className)}>
          {fallback}
        </div>
      );
    default: {
      const exhaustive: never = asset.renderer;
      return exhaustive;
    }
  }
}
