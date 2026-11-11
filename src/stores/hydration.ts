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
