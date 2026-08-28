"use client";

import { useSyncExternalStore } from "react";
import {
  heroMedia,
  heroPresentationFromMatches,
  type HeroPresentation,
} from "@/lib/hero-video";

const serverSnapshot: HeroPresentation = {
  desktop: false,
  tablet: false,
  tabletLandscape: false,
  tabletPortrait: false,
  mobile: true,
  stacked: true,
  reducedMotion: true,
  playVideo: false,
  variant: "mobile",
};

let clientSnapshot: HeroPresentation | null = null;
let mediaCleanup: (() => void) | null = null;
const subscribers = new Set<() => void>();

function readPresentation(): HeroPresentation {
  return heroPresentationFromMatches((query) =>
    window.matchMedia(query).matches,
  );
}

function presentationsEqual(
  left: HeroPresentation,
  right: HeroPresentation,
): boolean {
  return (
    left.desktop === right.desktop &&
    left.tablet === right.tablet &&
    left.tabletLandscape === right.tabletLandscape &&
    left.tabletPortrait === right.tabletPortrait &&
    left.mobile === right.mobile &&
    left.stacked === right.stacked &&
    left.reducedMotion === right.reducedMotion &&
    left.playVideo === right.playVideo &&
    left.variant === right.variant
  );
}

function syncClientSnapshot(): boolean {
  const next = readPresentation();

  if (clientSnapshot && presentationsEqual(clientSnapshot, next)) {
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
    window.matchMedia(heroMedia.desktop),
    window.matchMedia(heroMedia.tablet),
    window.matchMedia(heroMedia.tabletLandscape),
    window.matchMedia(heroMedia.tabletPortrait),
    window.matchMedia(heroMedia.mobile),
    window.matchMedia(heroMedia.reducedMotion),
    window.matchMedia("(orientation: landscape)"),
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

function getSnapshot(): HeroPresentation {
  if (!clientSnapshot) {
    syncClientSnapshot();
  }

  return clientSnapshot ?? serverSnapshot;
}

export function useHeroMedia(): HeroPresentation {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
