import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const MAX_COMPARE = 4;

type CompareState = {
  ids: string[];
  add: (id: string) => boolean;
  remove: (id: string) => void;
  toggle: (id: string) => boolean;
  setAll: (ids: string[]) => void;
  clear: () => void;
};

/** Vehicles selected for comparison (max 4), persisted in this browser. */
export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const { ids } = get();
        if (ids.includes(id)) return true;
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      toggle: (id) => (get().ids.includes(id) ? (get().remove(id), true) : get().add(id)),
      setAll: (ids) => set({ ids: [...new Set(ids)].slice(0, MAX_COMPARE) }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "eureka-compare",
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
    },
  ),
);
