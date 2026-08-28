"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

type MotionOffset = {
  x: number;
  y: number;
};

const EMPTY: MotionOffset = { x: 0, y: 0 };

function subscribeMotionMedia(onStoreChange: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)");

  reduce.addEventListener("change", onStoreChange);
  desktop.addEventListener("change", onStoreChange);

  return () => {
    reduce.removeEventListener("change", onStoreChange);
    desktop.removeEventListener("change", onStoreChange);
  };
}

function getMotionMedia() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches
  );
}

export function useKayMotion(enabled: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const target = useRef<MotionOffset>(EMPTY);
  const current = useRef<MotionOffset>(EMPTY);
  const desktopMotion = useSyncExternalStore(
    subscribeMotionMedia,
    getMotionMedia,
    () => false,
  );
  const active = enabled && desktopMotion;

  useEffect(() => {
    if (!active) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    let visible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.15 },
    );

    observer.observe(root);

    const onMove = (event: PointerEvent) => {
      if (!visible) {
        return;
      }

      const bounds = root.getBoundingClientRect();
      const nx = (event.clientX - bounds.left) / bounds.width - 0.5;
      const ny = (event.clientY - bounds.top) / bounds.height - 0.5;
      target.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
    };

    const tick = () => {
      const nextX = current.current.x + (target.current.x - current.current.x) * 0.08;
      const nextY = current.current.y + (target.current.y - current.current.y) * 0.08;
      current.current = { x: nextX, y: nextY };
      root.style.setProperty("--kay-x", `${nextX * 8}px`);
      root.style.setProperty("--kay-y", `${nextY * 6}px`);
      root.style.setProperty("--kay-light-x", `${50 + nextX * 18}%`);
      root.style.setProperty("--kay-light-y", `${32 + nextY * 12}%`);
      frame.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame.current = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(frame.current);
    };
  }, [active]);

  return { rootRef, active };
}
