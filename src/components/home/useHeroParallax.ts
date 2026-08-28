"use client";

import { useEffect, useRef, type RefObject } from "react";

export type HeroParallaxPoint = {
  x: number;
  y: number;
  inside: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function applyDeadZone(value: number, zone: number) {
  return Math.abs(value) < zone ? 0 : value;
}

function isInsideRect(x: number, y: number, bounds: DOMRect) {
  return (
    x >= bounds.left &&
    x <= bounds.right &&
    y >= bounds.top &&
    y <= bounds.bottom
  );
}

export function useHeroParallax(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const target = useRef<HeroParallaxPoint>({
    x: 0,
    y: 0,
    inside: false,
  });

  useEffect(() => {
    const root = rootRef.current;
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

      target.current = {
        x: applyDeadZone(
          clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
          0.04,
        ),
        y: applyDeadZone(
          clamp(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1), -1, 1),
          0.04,
        ),
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
