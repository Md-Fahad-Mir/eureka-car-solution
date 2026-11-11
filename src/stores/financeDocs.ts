import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { EmploymentType } from "@/types";

type FinanceDocsState = {
  employment: EmploymentType;
  checked: string[];
  setEmployment: (employment: EmploymentType) => void;
  toggle: (doc: string) => void;
  reset: () => void;
};

/** The customer's personal document checklist on /finance (this browser only). */
export const useFinanceDocsStore = create<FinanceDocsState>()(
  persist(
    (set, get) => ({
      employment: "salaried",
      checked: [],
      setEmployment: (employment) => set({ employment }),
      toggle: (doc) =>
        set({ checked: get().checked.includes(doc) ? get().checked.filter((d) => d !== doc) : [...get().checked, doc] }),
      reset: () => set({ checked: [] }),
    }),
    { name: "eureka-finance-docs", storage: createJSONStorage(() => window.localStorage), skipHydration: true },
  ),
);
