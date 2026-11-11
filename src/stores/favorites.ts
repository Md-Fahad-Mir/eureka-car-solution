import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoritesState = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

/** Saved (favourite) vehicle ids, persisted in this browser. */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({ ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id] }),
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    {
      name: "eureka-favorites",
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
    },
  ),
);
