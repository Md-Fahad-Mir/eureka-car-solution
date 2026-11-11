"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCompareStore } from "./compare";
import { useFavoritesStore } from "./favorites";

/** Rehydrate persisted stores after mount so server and first client render match. */
export function useRehydrateStores() {
  useEffect(() => {
    void useCompareStore.persist.rehydrate();
    void useFavoritesStore.persist.rehydrate();
  }, []);
}

const noopSubscribe = () => () => {};

/** True on the client after hydration, false during SSR and the hydration render. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
