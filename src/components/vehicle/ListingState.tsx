"use client";

import { createContext, use, useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { clearedFilters, listingHref, type ListingState, type ListingView } from "@/lib/search/vehicleQuery";
import type { VehicleFacets, VehicleFilters } from "@/types";

type ListKey = "brand" | "model" | "fuel" | "condition" | "category" | "body" | "transmission" | "availability";

type ListingContextValue = {
  /** Optimistic state: reflects clicks immediately, before the server responds. */
  state: ListingState;
  facets: VehicleFacets;
  total: number;
  pending: boolean;
  /** Merge a filter patch; page resets to 1 unless the patch sets it. */
  update: (patch: Partial<VehicleFilters>) => void;
  toggle: <K extends ListKey>(key: K, value: NonNullable<VehicleFilters[K]>[number]) => void;
  toggleSeats: (seats: number) => void;
  setView: (view: ListingView) => void;
  clearAll: () => void;
};

const ListingContext = createContext<ListingContextValue | null>(null);

export function useListing() {
  const ctx = use(ListingContext);
  if (!ctx) throw new Error("useListing must be used inside <ListingStateProvider>");
  return ctx;
}

/**
 * Owns marketplace navigation. The URL stays the source of truth: every
 * change pushes a new URL inside a transition, and `useOptimistic` lets rapid
 * clicks build on each other instead of racing the server render.
 */
export function ListingStateProvider({
  state,
  facets,
  total,
  children,
}: {
  state: ListingState;
  facets: VehicleFacets;
  total: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(state);
  const [pending, startTransition] = useTransition();

  const navigate = (next: ListingState) =>
    startTransition(() => {
      setOptimistic(next);
      router.push(listingHref(next), { scroll: false });
    });

  const update: ListingContextValue["update"] = (patch) => {
    const filters: VehicleFilters = { ...optimistic.filters, page: undefined, ...patch };
    for (const key of Object.keys(filters) as (keyof VehicleFilters)[]) {
      const value = filters[key];
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) delete filters[key];
    }
    navigate({ ...optimistic, filters });
  };

  const value: ListingContextValue = {
    state: optimistic,
    facets,
    total,
    pending,
    update,
    toggle: (key, item) => {
      const current = (optimistic.filters[key] ?? []) as string[];
      const next = current.includes(item as string) ? current.filter((x) => x !== item) : [...current, item as string];
      const patch: Partial<VehicleFilters> = { [key]: next };
      // Models depend on brands: drop models whose brand was deselected.
      if (key === "brand") {
        patch.model = optimistic.filters.model?.filter((m) =>
          facets.model.some((f) => f.value === m && next.includes(f.brandId)),
        );
      }
      update(patch);
    },
    toggleSeats: (seats) => {
      const current = optimistic.filters.seats ?? [];
      update({ seats: current.includes(seats) ? current.filter((s) => s !== seats) : [...current, seats] });
    },
    setView: (view) => navigate({ ...optimistic, view }),
    clearAll: () => navigate({ view: optimistic.view, filters: clearedFilters(optimistic.filters) }),
  };

  return <ListingContext value={value}>{children}</ListingContext>;
}

/** Dims results while a new listing is loading, and announces the count. */
export function ListingResults({ children }: { children: ReactNode }) {
  const { pending } = useListing();
  return (
    <div aria-busy={pending} className={pending ? "pointer-events-none opacity-55 transition-opacity" : "transition-opacity"}>
      {children}
    </div>
  );
}
