"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { applyDeadZone, kayLookRig } from "@/lib/kay-look";

export type KayLookTarget = {
  x: number;
  y: number;
  inside: boolean;
};

const KayLookContext = createContext<RefObject<KayLookTarget> | null>(null);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveTrackRoot(rootRef: RefObject<HTMLElement | null>) {
  const node = rootRef.current;
  if (!node) {
    return null;
  }

  if (node.hasAttribute("data-salkay-hero")) {
    return node;
  }

  const hero = node.closest("[data-salkay-hero]");
  return hero instanceof HTMLElement ? hero : node;
}

function isInsideRect(x: number, y: number, bounds: DOMRect) {
  return (
    x >= bounds.left &&
    x <= bounds.right &&
    y >= bounds.top &&
    y <= bounds.bottom
  );
}

export function KayLookProvider({
  value,
  children,
}: {
  value: RefObject<KayLookTarget>;
  children: ReactNode;
}) {
  return (
    <KayLookContext.Provider value={value}>{children}</KayLookContext.Provider>
  );
}

export function useOptionalKayLook(): RefObject<KayLookTarget> | null {
  return useContext(KayLookContext);
}

export function useKayLook(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const target = useRef<KayLookTarget>({
    x: 0,
    y: 0,
    inside: false,
  });

  useEffect(() => {
    const root = resolveTrackRoot(rootRef);
    if (!root || !enabled) {
      target.current = { x: 0, y: 0, inside: false };
      return;
    }

    const rest = () => {
      target.current = { x: 0, y: 0, inside: false };
    };

    const onMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) {
        return;
      }

      if (!isInsideRect(event.clientX, event.clientY, bounds)) {
        rest();
        return;
      }

      const nx = applyDeadZone(
        clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
        kayLookRig.deadZone,
      );
      const ny = applyDeadZone(
        clamp(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1), -1, 1),
        kayLookRig.deadZone,
      );

      target.current = {
        x: nx,
        y: ny,
        inside: true,
      };
    };

    const onDocumentOut = (event: MouseEvent) => {
      if (event.relatedTarget === null) {
        rest();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", rest);
    document.addEventListener("mouseout", onDocumentOut);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", rest);
      document.removeEventListener("mouseout", onDocumentOut);
      rest();
    };
  }, [enabled, rootRef]);

  return target;
}
