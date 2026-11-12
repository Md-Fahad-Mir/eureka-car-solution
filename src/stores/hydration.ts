"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCompareStore } from "./compare";
import { useDemoSessionStore } from "./demoSession";
import { useFavoritesStore } from "./favorites";
import { ensureHydrated } from "./persist";

/** Rehydrate UI-facing persisted stores after mount. */
export function useRehydrateStores() {
  useEffect(() => {
    ensureHydrated(useCompareStore);
    ensureHydrated(useFavoritesStore);
    ensureHydrated(useDemoSessionStore);
  }, []);
}

const noopSubscribe = () => () => {};

/** True on the client after hydration, false during SSR and the hydration render. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const sessionStore = useDemoSessionStore;
const subscribeHydration = (onChange: () => void) => sessionStore.persist.onFinishHydration(onChange);

/**
 * The demo session, plus whether it has been read from storage yet (so a
 * guard never redirects before it knows). Not authentication.
 */
export function useDemoSession() {
  useEffect(() => ensureHydrated(sessionStore), []);
  const session = sessionStore((s) => s.session);
  const ready = useSyncExternalStore(subscribeHydration, () => sessionStore.persist.hasHydrated(), () => false);
  return { ready, session };
}
