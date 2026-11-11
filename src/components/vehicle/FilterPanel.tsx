"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/Choice";
import { Input, Select } from "@/components/ui/Input";
import { RangeSlider, Slider } from "@/components/ui/Slider";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import type { FacetCount } from "@/types";
import { useListing } from "./ListingState";

const PRICE_STEP = 50_000;
const MILEAGE_OPTIONS = [10_000, 30_000, 50_000, 80_000, 120_000];

/** Calls `fn` once `value` has been stable for `delay` ms (sliders commit on settle). */
function useDebouncedCommit<T>(value: T, fn: (v: T) => void, delay = 450) {
  const first = useRef(true);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => fnRef.current(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
}

/** All marketplace filters with facet counts. Used in the desktop sidebar and the mobile drawer. */
export function FilterPanel() {
  const t = useTranslations("filters");
  const tTax = useTranslations("taxonomy");
  const locale = useLocale();
  const f = useFormat();
  const { state, facets, toggle, toggleSeats, update } = useListing();
  const filters = state.filters;
  const showEvRange = filters.fuel?.includes("ev");

  return (
    <div className="flex flex-col">
      <Group title={t("brand")} defaultOpen>
        <CheckList
          options={facets.brand.map((b) => ({ value: b.value, count: b.count, label: b.label[locale] }))}
          selected={filters.brand}
          onToggle={(v) => toggle("brand", v)}
          collapseAfter={6}
        />
      </Group>

      {filters.brand?.length ? (
        <Group title={t("model")} defaultOpen>
          <CheckList
            options={facets.model.map((m) => ({ value: m.value, count: m.count, label: m.value }))}
            selected={filters.model}
            onToggle={(v) => toggle("model", v)}
          />
        </Group>
      ) : null}

      <Group title={t("price")} defaultOpen>
        <PriceRange />
      </Group>

      <Group title={t("fuel")} defaultOpen>
        <CheckList
          options={facets.fuel.map((x) => ({ ...x, label: tTax(`fuel.${x.value}`) }))}
          selected={filters.fuel}
          onToggle={(v) => toggle("fuel", v as (typeof facets.fuel)[number]["value"])}
        />
        {showEvRange ? <EvRange /> : null}
      </Group>

      <Group title={t("condition")} defaultOpen>
        <CheckList
          options={facets.condition.map((x) => ({ ...x, label: tTax(`condition.${x.value}`) }))}
          selected={filters.condition}
          onToggle={(v) => toggle("condition", v as (typeof facets.condition)[number]["value"])}
        />
      </Group>

      <Group title={t("category")}>
        <CheckList
          options={facets.category.map((x) => ({ ...x, label: tTax(`category.${x.value}`) }))}
          selected={filters.category}
          onToggle={(v) => toggle("category", v as (typeof facets.category)[number]["value"])}
        />
      </Group>

      <Group title={t("body")}>
        <CheckList
          options={facets.body.map((x) => ({ ...x, label: tTax(`body.${x.value}`) }))}
          selected={filters.body}
          onToggle={(v) => toggle("body", v as (typeof facets.body)[number]["value"])}
        />
      </Group>

      <Group title={t("year")}>
        <YearRange />
      </Group>

      <Group title={t("transmission")}>
        <CheckList
          options={facets.transmission.map((x) => ({ ...x, label: tTax(`transmission.${x.value}`) }))}
          selected={filters.transmission}
          onToggle={(v) => toggle("transmission", v as (typeof facets.transmission)[number]["value"])}
        />
      </Group>

      <Group title={t("mileage")}>
        <label className="sr-only" htmlFor="filter-mileage">
          {t("mileageMax")}
        </label>
        <Select
          id="filter-mileage"
          value={filters.mileageMax ?? ""}
          onChange={(e) => update({ mileageMax: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">{t("anyMileage")}</option>
          {MILEAGE_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {t("upTo", { value: f.unit("km", km, 0) })}
            </option>
          ))}
        </Select>
      </Group>

      <Group title={t("seats")}>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("seats")}>
          {facets.seats.map((s) => {
            const active = filters.seats?.includes(s.value) ?? false;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={active}
                disabled={!active && s.count === 0}
                onClick={() => toggleSeats(s.value)}
                className={cn(
                  "h-9 min-w-11 rounded-full border px-3 text-sm tabular transition-colors disabled:opacity-40",
                  active ? "border-ink bg-ink text-bg-alt" : "border-line-strong hover:border-ink",
                )}
              >
                {f.number(s.value)}
                <span className="sr-only"> {t("seatsCount", { count: s.count })}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title={t("availability")}>
        <CheckList
          options={facets.availability.map((x) => ({ ...x, label: tTax(`availability.${x.value}`) }))}
          selected={filters.availability}
          onToggle={(v) => toggle("availability", v as (typeof facets.availability)[number]["value"])}
        />
      </Group>
    </div>
  );
}

function Group({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

function CheckList({
  options,
  selected,
  onToggle,
  collapseAfter,
}: {
  options: (FacetCount & { label: string })[];
  selected?: string[];
  onToggle: (value: string) => void;
  collapseAfter?: number;
}) {
  const t = useTranslations("filters");
  const f = useFormat();
  const [expanded, setExpanded] = useState(false);
  const visible = collapseAfter && !expanded ? options.slice(0, collapseAfter) : options;
  const hiddenSelected = collapseAfter && !expanded && options.slice(collapseAfter).some((o) => selected?.includes(o.value));

  return (
    <div className="flex flex-col gap-2.5">
      {(hiddenSelected ? options : visible).map((o) => {
        const checked = selected?.includes(o.value) ?? false;
        return (
          <Checkbox
            key={o.value}
            checked={checked}
            disabled={!checked && o.count === 0}
            onChange={() => onToggle(o.value)}
            label={
              <span className="flex w-full justify-between gap-3">
                <span>{o.label}</span>
                <span className="text-xs text-muted tabular" aria-label={t("resultsCount", { count: o.count })}>
                  {f.number(o.count)}
                </span>
              </span>
            }
            className="[&>span:last-child]:flex-1"
          />
        );
      })}
      {collapseAfter && options.length > collapseAfter && !hiddenSelected ? (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="self-start text-sm font-medium text-accent-ink underline-offset-4 hover:underline">
          {expanded ? t("showFewer") : t("showAll", { count: options.length })}
        </button>
      ) : null}
    </div>
  );
}

function PriceRange() {
  const t = useTranslations("filters");
  const f = useFormat();
  const id = useId();
  const { state, facets, update } = useListing();
  const [min, max] = [
    Math.floor(facets.bounds.price[0] / PRICE_STEP) * PRICE_STEP,
    Math.ceil(facets.bounds.price[1] / PRICE_STEP) * PRICE_STEP,
  ];
  const fromUrl: [number, number] = [state.filters.priceMin ?? min, state.filters.priceMax ?? max];
  const [range, setRange] = useState(fromUrl);
  const [synced, setSynced] = useState(fromUrl.join());
  if (synced !== fromUrl.join()) {
    setSynced(fromUrl.join());
    setRange(fromUrl);
  }

  useDebouncedCommit(range, ([lo, hi]) => {
    if (lo === fromUrl[0] && hi === fromUrl[1]) return;
    update({ priceMin: lo > min ? lo : undefined, priceMax: hi < max ? hi : undefined });
  });

  const setFromInput = (index: 0 | 1, raw: string) => {
    const n = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) return;
    const next: [number, number] = [...range];
    next[index] = Math.min(Math.max(n, min), max);
    if (next[0] > next[1]) next.reverse();
    setRange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <RangeSlider
        min={min}
        max={max}
        step={PRICE_STEP}
        value={range}
        onValueChange={setRange}
        labels={[t("priceMin"), t("priceMax")]}
        valueTexts={[f.bdtCompact(range[0]), f.bdtCompact(range[1])]}
      />
      <div className="grid grid-cols-2 gap-2">
        {([0, 1] as const).map((i) => (
          <div key={i}>
            <label htmlFor={`${id}-${i}`} className="mb-1 block text-xs text-muted">
              {i === 0 ? t("priceMin") : t("priceMax")}
            </label>
            <Input
              id={`${id}-${i}`}
              inputMode="numeric"
              value={range[i]}
              onChange={(e) => setFromInput(i, e.target.value)}
              className="h-10 text-sm"
              aria-describedby={`${id}-${i}-hint`}
            />
            <p id={`${id}-${i}-hint`} className="mt-1 text-xs text-muted tabular">
              {f.bdtCompact(range[i])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function YearRange() {
  const t = useTranslations("filters");
  const f = useFormat();
  const { state, facets, update } = useListing();
  const [lo, hi] = facets.bounds.year;
  const years = Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
  const year = (y: number) => f.number(y, { useGrouping: false });
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label htmlFor="filter-year-min" className="mb-1 block text-xs text-muted">
          {t("yearFrom")}
        </label>
        <Select
          id="filter-year-min"
          value={state.filters.yearMin ?? ""}
          onChange={(e) => update({ yearMin: e.target.value ? Number(e.target.value) : undefined })}
          className="h-10 text-sm"
        >
          <option value="">{t("any")}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {year(y)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="filter-year-max" className="mb-1 block text-xs text-muted">
          {t("yearTo")}
        </label>
        <Select
          id="filter-year-max"
          value={state.filters.yearMax ?? ""}
          onChange={(e) => update({ yearMax: e.target.value ? Number(e.target.value) : undefined })}
          className="h-10 text-sm"
        >
          <option value="">{t("any")}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {year(y)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function EvRange() {
  const t = useTranslations("filters");
  const f = useFormat();
  const { state, facets, update } = useListing();
  const max = Math.ceil(facets.bounds.range[1] / 50) * 50;
  const fromUrl = state.filters.rangeMin ?? 0;
  const [value, setValue] = useState(fromUrl);
  const [synced, setSynced] = useState(fromUrl);
  if (synced !== fromUrl) {
    setSynced(fromUrl);
    setValue(fromUrl);
  }
  useDebouncedCommit(value, (v) => v !== fromUrl && update({ rangeMin: v > 0 ? v : undefined }));

  return (
    <div className="mt-4 rounded-2xl bg-ev-soft/60 p-4">
      <label htmlFor="filter-ev-range" className="flex justify-between text-sm">
        <span className="font-medium text-ev">{t("evRange")}</span>
        <span className="tabular">{value > 0 ? t("atLeast", { value: f.unit("km", value, 0) }) : t("any")}</span>
      </label>
      <Slider
        id="filter-ev-range"
        min={0}
        max={max}
        step={50}
        value={value}
        onValueChange={setValue}
        valueText={f.unit("km", value, 0)}
        className="mt-2"
      />
    </div>
  );
}
