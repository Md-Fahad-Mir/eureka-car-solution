type PersistedStore = { persist: { hasHydrated: () => boolean; rehydrate: () => Promise<void> | void } };

/**
 * Persisted stores skip automatic hydration so the server render and the
 * first client render match. This rehydrates one on demand (synchronous for
 * localStorage). A no-op on the server.
 */
export function ensureHydrated(store: PersistedStore) {
  if (typeof window !== "undefined" && !store.persist.hasHydrated()) void store.persist.rehydrate();
}
