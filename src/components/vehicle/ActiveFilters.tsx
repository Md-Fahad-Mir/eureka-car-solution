"use client";

import { useLocale, useTranslations } from "next-intl";
import { Chip } from "@/components/ui/Badge";
import { useFormat } from "@/lib/format/useFormat";
import { countActiveFilters } from "@/lib/search/vehicleQuery";
import type { VehicleFilters } from "@/types";
import { useListing } from "./ListingState";

type ChipItem = { key: string; label: string; patch: Partial<VehicleFilters> };

/** Removable chips for every applied filter, plus "Clear all". */
export function ActiveFilters() {
  const t = useTranslations("listing");
  const tTax = useTranslations("taxonomy");
  const locale = useLocale();
  const f = useFormat();
  const { state, facets, update, clearAll } = useListing();
  const fl = state.filters;
  if (countActiveFilters(fl) === 0) return null;

  const without = <T,>(list: T[] | undefined, value: T) => list?.filter((x) => x !== value);
  const chips: ChipItem[] = [];

  if (fl.q) chips.push({ key: "q", label: t("chipSearch", { q: fl.q }), patch: { q: undefined } });
  fl.brand?.forEach((b) =>
    chips.push({ key: `brand-${b}`, label: facets.brand.find((x) => x.value === b)?.label[locale] ?? b, patch: { brand: without(fl.brand, b) } }),
  );
  fl.model?.forEach((m) => chips.push({ key: `model-${m}`, label: m, patch: { model: without(fl.model, m) } }));
  fl.fuel?.forEach((x) => chips.push({ key: `fuel-${x}`, label: tTax(`fuel.${x}`), patch: { fuel: without(fl.fuel, x) } }));
  fl.condition?.forEach((x) =>
    chips.push({ key: `cond-${x}`, label: tTax(`condition.${x}`), patch: { condition: without(fl.condition, x) } }),
  );
  fl.category?.forEach((x) =>
    chips.push({ key: `cat-${x}`, label: tTax(`category.${x}`), patch: { category: without(fl.category, x) } }),
  );
  fl.body?.forEach((x) => chips.push({ key: `body-${x}`, label: tTax(`body.${x}`), patch: { body: without(fl.body, x) } }));
  fl.transmission?.forEach((x) =>
    chips.push({ key: `tr-${x}`, label: tTax(`transmission.${x}`), patch: { transmission: without(fl.transmission, x) } }),
  );
  fl.availability?.forEach((x) =>
    chips.push({ key: `av-${x}`, label: tTax(`availability.${x}`), patch: { availability: without(fl.availability, x) } }),
  );
  fl.seats?.forEach((x) => chips.push({ key: `seats-${x}`, label: f.unit("seats", x, 0), patch: { seats: without(fl.seats, x) } }));
  if (fl.priceMin !== undefined || fl.priceMax !== undefined) {
    chips.push({
      key: "price",
      label: t("chipPrice", {
        min: fl.priceMin !== undefined ? f.bdtCompact(fl.priceMin) : t("any"),
        max: fl.priceMax !== undefined ? f.bdtCompact(fl.priceMax) : t("any"),
      }),
      patch: { priceMin: undefined, priceMax: undefined },
    });
  }
  if (fl.yearMin !== undefined || fl.yearMax !== undefined) {
    const year = (y?: number) => (y !== undefined ? f.number(y, { useGrouping: false }) : t("any"));
    chips.push({ key: "year", label: t("chipYear", { min: year(fl.yearMin), max: year(fl.yearMax) }), patch: { yearMin: undefined, yearMax: undefined } });
  }
  if (fl.mileageMax !== undefined) {
    chips.push({ key: "mileage", label: t("chipMileage", { value: f.unit("km", fl.mileageMax, 0) }), patch: { mileageMax: undefined } });
  }
  if (fl.rangeMin !== undefined) {
    chips.push({ key: "range", label: t("chipRange", { value: f.unit("km", fl.rangeMin, 0) }), patch: { rangeMin: undefined } });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={t("appliedFilters")} role="group">
      {chips.map((c) => (
        <Chip key={c.key} onRemove={() => update(c.patch)} removeLabel={t("removeFilter", { label: c.label })}>
          {c.label}
        </Chip>
      ))}
      <button type="button" onClick={clearAll} className="px-2 text-sm font-medium text-accent-ink underline-offset-4 hover:underline">
        {t("clearAll")}
      </button>
    </div>
  );
}

/** Empty-state action. */
export function ClearFiltersButton() {
  const t = useTranslations("listing");
  const { clearAll } = useListing();
  return (
    <button
      type="button"
      onClick={clearAll}
      className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg-alt hover:bg-ink/85"
    >
      {t("clearFilters")}
    </button>
  );
}
