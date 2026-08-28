"use client";

import { useSyncExternalStore } from "react";
import { kay3dArchived } from "@/lib/kay";

export type KayDeviceProfile = {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
  reducedMotion: boolean;
  webgl: boolean;
};

const QUERY_DESKTOP = "(min-width: 1025px)";
const QUERY_TABLET = "(min-width: 768px)";
const QUERY_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const serverSnapshot: KayDeviceProfile = {
  desktop: false,
  tablet: false,
  mobile: true,
  reducedMotion: true,
  webgl: false,
};

let clientSnapshot: KayDeviceProfile | null = null;
let webglCapability: boolean | null = null;
let mediaCleanup: (() => void) | null = null;
const subscribers = new Set<() => void>();

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

function getWebGLCapability(): boolean {
  // KAY 3D archived for future reactivation — do not create a WebGL context
  // just to probe support while the homepage is on the 2D still.
  if (kay3dArchived) {
    return false;
  }

  if (webglCapability === null) {
    webglCapability = detectWebGL();
  }

  return webglCapability;
}

function readProfile(): KayDeviceProfile {
  const desktop = window.matchMedia(QUERY_DESKTOP).matches;
  const tablet = !desktop && window.matchMedia(QUERY_TABLET).matches;

  return {
    desktop,
    tablet,
    mobile: !desktop && !tablet,
    reducedMotion: window.matchMedia(QUERY_REDUCED_MOTION).matches,
    webgl: getWebGLCapability(),
  };
}

function profilesEqual(
  left: KayDeviceProfile,
  right: KayDeviceProfile,
): boolean {
  return (
    left.desktop === right.desktop &&
    left.tablet === right.tablet &&
    left.mobile === right.mobile &&
    left.reducedMotion === right.reducedMotion &&
    left.webgl === right.webgl
  );
}

function syncClientSnapshot(): boolean {
  const next = readProfile();

  if (clientSnapshot && profilesEqual(clientSnapshot, next)) {
    return false;
  }

  clientSnapshot = next;
  return true;
}

function notifySubscribers() {
  if (!syncClientSnapshot()) {
    return;
  }

  for (const subscriber of subscribers) {
    subscriber();
  }
}

function ensureMediaListeners() {
  if (mediaCleanup) {
    return;
  }

  const queries = [
    window.matchMedia(QUERY_DESKTOP),
    window.matchMedia(QUERY_TABLET),
    window.matchMedia(QUERY_REDUCED_MOTION),
  ];

  for (const query of queries) {
    query.addEventListener("change", notifySubscribers);
  }

  mediaCleanup = () => {
    for (const query of queries) {
      query.removeEventListener("change", notifySubscribers);
    }
    mediaCleanup = null;
  };
}

function subscribe(onStoreChange: () => void) {
  subscribers.add(onStoreChange);
  ensureMediaListeners();
  syncClientSnapshot();

  return () => {
    subscribers.delete(onStoreChange);
    if (subscribers.size === 0) {
      mediaCleanup?.();
    }
  };
}

function getSnapshot(): KayDeviceProfile {
  if (!clientSnapshot) {
    syncClientSnapshot();
  }

  return clientSnapshot ?? serverSnapshot;
}

function getServerSnapshot(): KayDeviceProfile {
  return serverSnapshot;
}

export function useKayDevice(): KayDeviceProfile {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function isKayDebugEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("kay-debug")
  );
}
