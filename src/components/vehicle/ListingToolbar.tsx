"use client";

import { useState } from "react";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Input";
import { useFormat } from "@/lib/format/useFormat";
import { countActiveFilters } from "@/lib/search/vehicleQuery";
import { cn } from "@/lib/utils";
import { SORT_KEYS, type VehicleSort } from "@/types";
import { FilterPanel } from "./FilterPanel";
import { useListing } from "./ListingState";

/** Search, result count, sort, view toggle and (below lg) the filter drawer trigger. */
export function ListingToolbar() {
  const t = useTranslations("listing");
  const f = useFormat();
  const { state, total, pending, update, setView, clearAll } = useListing();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = countActiveFilters(state.filters);

  return (
    <div className="flex flex-col gap-4">
      <SearchBox />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite" aria-atomic>
          {pending ? t("updating") : t("resultCount", { count: total, formatted: f.number(total) })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            icon={<SlidersHorizontal aria-hidden className="size-4" />}
            aria-haspopup="dialog"
          >
            {t("filters")}
            {active ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-bg-alt tabular">
                {f.number(active)}
              </span>
            ) : null}
          </Button>
          <label htmlFor="listing-sort" className="sr-only">
            {t("sortBy")}
          </label>
          <Select
            id="listing-sort"
            value={state.filters.sort ?? "featured"}
            onChange={(e) => update({ sort: e.target.value as VehicleSort })}
            className="h-9 w-auto rounded-full pr-9 text-sm"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`sort.${key}`)}
              </option>
            ))}
          </Select>
          <div role="group" aria-label={t("view")} className="hidden rounded-full border border-line-strong p-0.5 sm:flex">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={state.view === v}
                aria-label={t(v === "grid" ? "gridView" : "listView")}
                onClick={() => setView(v)}
                className={cn(
                  "grid size-8 place-items-center rounded-full transition-colors",
                  state.view === v ? "bg-ink text-bg-alt" : "hover:bg-ink/[0.06]",
                )}
              >
                {v === "grid" ? <LayoutGrid aria-hidden className="size-4" /> : <List aria-hidden className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        side="left"
        title={t("filters")}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={clearAll} disabled={!active}>
              {t("clearAll")}
            </Button>
            <Button className="flex-1" onClick={() => setDrawerOpen(false)} loading={pending}>
              {t("showResults", { count: total, formatted: f.number(total) })}
            </Button>
          </div>
        }
      >
        <FilterPanel />
      </Sheet>
    </div>
  );
}

function SearchBox() {
  const t = useTranslations("listing");
  const { state, update } = useListing();
  const current = state.filters.q ?? "";
  const [value, setValue] = useState(current);
  const [synced, setSynced] = useState(current);
  if (synced !== current) {
    setSynced(current);
    setValue(current);
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        update({ q: value.trim() || undefined });
      }}
      className="relative"
    >
      <label htmlFor="listing-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
      <input
        id="listing-search"
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-12 w-full rounded-full border border-line-strong bg-bg-alt pr-28 pl-11 text-[0.9375rem] placeholder:text-muted/80 focus:border-ink focus:ring-2 focus:ring-accent/35 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              if (current) update({ q: undefined });
            }}
            aria-label={t("clearSearch")}
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
        <Button type="submit" size="sm">
          {t("search")}
        </Button>
      </div>
    </form>
  );
}
