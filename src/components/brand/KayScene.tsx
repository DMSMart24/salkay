"use client";

import type { ReactNode } from "react";
import { KayMascot } from "@/components/brand/KayMascot";
import { useKayMotion } from "@/components/brand/useKayMotion";
import { cn } from "@/lib/cn";
import type { KayAsset, KayTone, KayVariant } from "@/lib/kay";
import { assertKayVariant } from "@/lib/kay";

type KaySceneProps = {
  variant: KayVariant;
  asset: KayAsset;
  tone?: KayTone;
  label: string;
  hint: string;
  track?: boolean;
  showContext?: boolean;
  className?: string;
};

export function KayScene({
  variant,
  asset,
  tone = "on-dark",
  label,
  hint,
  track = false,
  showContext = true,
  className,
}: KaySceneProps) {
  assertKayVariant(variant);
  const { rootRef } = useKayMotion(track);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "kay-stage kay-scene relative overflow-hidden rounded-[1.35rem]",
        tone === "on-dark"
          ? "border border-white/10 bg-ink-soft"
          : "border border-ink/8 bg-ink",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(420px circle at var(--kay-light-x) var(--kay-light-y), rgba(29,90,170,0.2), transparent 55%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 studio-grid opacity-60" />
      <KayParticles />
      {showContext ? <KayContext variant={variant} /> : null}

      <div className="relative z-[1] mx-auto flex h-full min-h-[16rem] w-[min(100%,20rem)] items-end px-4 pt-10 sm:min-h-[18rem] lg:w-[min(100%,22rem)]">
        <KayMascot variant={variant} asset={asset} tone="on-dark" />
      </div>

      {!asset.available ? (
        <p className="absolute bottom-3 left-3 z-[2] label text-paper/42">
          {label}
        </p>
      ) : (
        <p className="sr-only">{hint}</p>
      )}
    </div>
  );
}

function KayParticles() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className="kay-particle left-[18%] top-[22%]" />
      <span className="kay-particle left-[72%] top-[18%]" />
      <span className="kay-particle left-[64%] top-[58%]" />
      <span className="kay-particle left-[28%] top-[70%]" />
    </div>
  );
}

function KayContext({ variant }: { variant: KayVariant }) {
  let panel: ReactNode;

  switch (variant) {
    case "hero":
      panel = null;
      break;
    case "web":
      panel = (
        <div className="kay-panel right-4 top-5 w-[9.5rem]">
          <p className="label text-salkay-soft">Arayüz</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <span className="col-span-2 h-8 rounded bg-paper/90" />
            <span className="h-8 rounded bg-salkay" />
            <span className="col-span-3 h-5 rounded bg-white/10" />
          </div>
        </div>
      );
      break;
    case "seo":
      panel = (
        <div className="kay-panel left-4 top-5 w-[10.5rem]">
          <p className="label text-salkay-soft">Arama</p>
          <p className="mt-2 text-[0.78rem] text-paper/70">web tasarım</p>
          <div className="mt-3 space-y-1.5">
            <span className="block h-1.5 w-4/5 rounded bg-white/20" />
            <span className="block h-1.5 w-3/5 rounded bg-white/12" />
          </div>
        </div>
      );
      break;
    case "analytics":
      panel = (
        <div className="kay-panel right-4 top-5 w-[9.8rem]">
          <p className="label text-salkay-soft">Demo</p>
          <div className="mt-3 flex h-10 items-end gap-1.5">
            <span className="h-4 w-3 rounded-sm bg-white/18" />
            <span className="h-7 w-3 rounded-sm bg-salkay/80" />
            <span className="h-5 w-3 rounded-sm bg-white/18" />
            <span className="h-9 w-3 rounded-sm bg-salkay" />
          </div>
        </div>
      );
      break;
    case "ai":
      panel = (
        <svg
          viewBox="0 0 120 72"
          className="pointer-events-none absolute left-4 top-6 h-16 w-28 opacity-80"
        >
          <path
            d="M16 36h88M36 16v40M84 16v40"
            stroke="rgba(243,239,231,0.16)"
            strokeWidth="1"
          />
          <circle cx="16" cy="36" r="3.5" fill="#1d5aaa" />
          <circle cx="60" cy="16" r="3.5" fill="#8aa6d4" />
          <circle cx="60" cy="56" r="3.5" fill="#8aa6d4" />
          <circle cx="104" cy="36" r="3.5" fill="#1d5aaa" />
        </svg>
      );
      break;
    case "cta":
      panel = (
        <div className="kay-panel left-4 top-5">
          <p className="label text-salkay-soft">Hazırız</p>
        </div>
      );
      break;
    default: {
      const exhaustive: never = variant;
      panel = exhaustive;
    }
  }

  return <>{panel}</>;
}
