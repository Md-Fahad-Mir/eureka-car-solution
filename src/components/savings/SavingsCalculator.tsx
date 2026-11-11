"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SliderField } from "@/components/calculators/SliderField";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Choice";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { Input, Select } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { costConfig, type DistanceUnit } from "@/config/costs";
import { compareRunningCosts, toAnnualKm } from "@/lib/calc/runningCost";
import { CHART_CATEGORICAL } from "@/lib/chartColors";
import { useFormat } from "@/lib/format/useFormat";
import { FUEL_TYPES, type FuelType } from "@/types";
import type { ChartOption } from "./SavingsCharts";

const SavingsCharts = dynamic(() => import("./SavingsCharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-96 rounded-card" />,
});

/** Slim vehicle for the savings pickers (tractors excluded: they're costed per hour). */
export type SavingsVehicle = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  /** Model only, for chart axes. */
  tickLabel: string;
  fuelType: FuelType;
  kmPerLitre?: number;
  kWhPer100km?: number;
  price: number;
};

type Column = {
  key: string;
  vehicleId: string | null;
  fuelType: FuelType;
  kmPerLitre?: number;
  kWhPer100km?: number;
  maintenance: number;
  price: number;
};

const COLUMN_FUELS = ["ev", "petrol", "diesel", "hybrid"] as const;
/** Which default column a prefilled vehicle replaces (PHEVs take the hybrid column). */
const COLUMN_FOR: Record<FuelType, number> = { ev: 0, petrol: 1, diesel: 2, hybrid: 3, phev: 3 };

const fromVehicle = (key: string, v: SavingsVehicle): Column => ({
  key,
  vehicleId: v.id,
  fuelType: v.fuelType,
  kmPerLitre: v.kmPerLitre,
  kWhPer100km: v.kWhPer100km,
  maintenance: costConfig.annualMaintenance[v.fuelType],
  price: v.price,
});

function sampleColumns(vehicles: SavingsVehicle[], preselectSlug?: string | null): Column[] {
  const columns = COLUMN_FUELS.map((fuel, i) => {
    const v = vehicles.find((x) => x.slug === costConfig.representativeVehicles[fuel]) ?? vehicles.find((x) => x.fuelType === fuel)!;
    return fromVehicle(`c${i + 1}`, v);
  });
  const pre = preselectSlug ? vehicles.find((v) => v.slug === preselectSlug) : undefined;
  if (pre) columns[COLUMN_FOR[pre.fuelType]] = fromVehicle(`c${COLUMN_FOR[pre.fuelType] + 1}`, pre);
  return columns;
}

const SAMPLE_INPUTS = {
  distance: costConfig.distance.defaultValue as number,
  unit: costConfig.distance.defaultUnit as DistanceUnit,
  petrol: costConfig.fuelPricePerLitre.petrol as number,
  diesel: costConfig.fuelPricePerLitre.diesel as number,
  electricity: costConfig.electricityPerKwh as number,
  electricShare: costConfig.phevElectricShare * 100,
  years: costConfig.ownershipYears.default as number,
  includePurchase: false,
};

export function SavingsCalculator({ vehicles }: { vehicles: SavingsVehicle[] }) {
  const t = useTranslations("savings");
  const tFuel = useTranslations("taxonomy.fuel");
  const f = useFormat();
  const params = useSearchParams();

  const [columns, setColumns] = useState<Column[]>(() => sampleColumns(vehicles, params.get("vehicle")));
  const [inputs, setInputs] = useState(SAMPLE_INPUTS);
  const set = <K extends keyof typeof SAMPLE_INPUTS>(key: K, value: (typeof SAMPLE_INPUTS)[K]) =>
    setInputs((s) => ({ ...s, [key]: value }));
  const patchColumn = (key: string, patch: Partial<Column>) =>
    setColumns((cols) => cols.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const labelFor = (c: Column) => vehicles.find((v) => v.id === c.vehicleId)?.shortLabel ?? t("custom", { fuel: tFuel(c.fuelType) });
  const tickFor = (c: Column) => vehicles.find((v) => v.id === c.vehicleId)?.tickLabel ?? t("custom", { fuel: tFuel(c.fuelType) });
  const annualKm = toAnnualKm(inputs.distance, inputs.unit);
  const comparison = compareRunningCosts({
    options: columns.map((c) => ({
      id: c.key,
      fuelType: c.fuelType,
      kmPerLitre: c.kmPerLitre,
      kWhPer100km: c.kWhPer100km,
      annualMaintenance: c.maintenance,
      purchasePrice: c.price,
      electricShare: inputs.electricShare / 100,
    })),
    prices: { petrolPerLitre: inputs.petrol, dieselPerLitre: inputs.diesel, electricityPerKwh: inputs.electricity },
    annualKm,
    years: inputs.years,
    includePurchase: inputs.includePurchase,
  });
  const resultFor = (key: string) => comparison.results.find((r) => r.id === key);
  const hasPhev = columns.some((c) => c.fuelType === "phev");
  const cheapest = columns.find((c) => c.key === comparison.cheapestId);
  const priciest = columns.find((c) => c.key === comparison.mostExpensiveId);
  const bestSaving = cheapest ? resultFor(cheapest.key)?.savingsVsMostExpensive ?? 0 : 0;

  const chartOptions: ChartOption[] = columns.flatMap((c, i) => {
    const r = resultFor(c.key);
    return r
      ? [{ id: c.key, label: labelFor(c), tickLabel: tickFor(c), color: CHART_CATEGORICAL[i], annualEnergy: r.annualEnergy, annualMaintenance: r.annualMaintenance, cumulative: r.cumulative }]
      : [];
  });

  const breakEvenText = (key: string) => {
    const r = resultFor(key);
    if (!r) return "—";
    if (key === comparison.mostExpensiveId) return t("breakEven.baseline");
    if (r.breakEvenYears === null) return t("breakEven.never");
    if (r.breakEvenYears === 0) return t("breakEven.immediate");
    const totalMonths = Math.round(r.breakEvenYears * 12);
    return t("breakEven.after", { years: f.number(Math.floor(totalMonths / 12)), months: f.number(totalMonths % 12) });
  };

  const vehiclesByFuel = FUEL_TYPES.map((fuel) => ({ fuel, items: vehicles.filter((v) => v.fuelType === fuel) })).filter((g) => g.items.length);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DemoNotice message={t("estimatesNote")} className="flex-1" />
        <Button
          variant="outline"
          icon={<RotateCcw aria-hidden className="size-4" />}
          onClick={() => {
            setColumns(sampleColumns(vehicles));
            setInputs(SAMPLE_INPUTS);
          }}
        >
          {t("reset")}
        </Button>
      </div>

      {/* Shared assumptions */}
      <section aria-labelledby="savings-inputs" className="rounded-card border border-line bg-bg-alt p-5 sm:p-7">
        <h2 id="savings-inputs" className="text-lg font-medium">
          {t("inputsTitle")}
        </h2>
        <div className="mt-6 grid gap-x-10 gap-y-7 md:grid-cols-2 xl:grid-cols-3">
          <SliderField
            label={t("distance")}
            aside={
              <Segmented
                label={t("distanceUnit")}
                value={inputs.unit}
                onValueChange={(u) => {
                  const annual = toAnnualKm(inputs.distance, inputs.unit);
                  setInputs((s) => ({ ...s, unit: u, distance: Math.round(u === "day" ? annual / 365 : u === "month" ? annual / 12 : annual) }));
                }}
                options={[
                  { value: "day", label: t("day") },
                  { value: "month", label: t("month") },
                  { value: "year", label: t("year") },
                ]}
              />
            }
            value={inputs.distance}
            min={0}
            max={inputs.unit === "day" ? 300 : inputs.unit === "month" ? 9_000 : 100_000}
            step={inputs.unit === "day" ? 5 : inputs.unit === "month" ? 100 : 1_000}
            onChange={(v) => set("distance", v)}
            suffix="km"
            display={t("annualKm", { km: f.unit("km", annualKm, 0) })}
          />
          <SliderField label={t("years")} value={inputs.years} min={costConfig.ownershipYears.min} max={costConfig.ownershipYears.max} step={1} onChange={(v) => set("years", Math.round(v))} display={f.unit("years", inputs.years, 0)} inputWidth="w-20" />
          <SliderField label={t("petrol")} value={inputs.petrol} min={50} max={250} step={1} onChange={(v) => set("petrol", v)} suffix="৳/L" display={t("perLitre", { value: f.bdt(inputs.petrol) })} />
          <SliderField label={t("diesel")} value={inputs.diesel} min={50} max={250} step={1} onChange={(v) => set("diesel", v)} suffix="৳/L" display={t("perLitre", { value: f.bdt(inputs.diesel) })} />
          <SliderField label={t("electricity")} value={inputs.electricity} min={2} max={40} step={0.5} onChange={(v) => set("electricity", v)} suffix="৳" display={t("perKwh", { value: f.bdt(inputs.electricity, 1) })} />
          {hasPhev ? (
            <SliderField label={t("electricShare")} value={inputs.electricShare} min={0} max={100} step={5} onChange={(v) => set("electricShare", v)} suffix="%" display={t("electricShareDisplay", { percent: f.number(inputs.electricShare) })} />
          ) : null}
        </div>
        <div className="mt-7 border-t border-line pt-5">
          <Checkbox
            checked={inputs.includePurchase}
            onChange={(e) => set("includePurchase", e.target.checked)}
            label={t("includePurchase")}
            description={t("includePurchaseHint")}
          />
        </div>
      </section>

      {/* Columns */}
      <section aria-labelledby="savings-vehicles">
        <h2 id="savings-vehicles" className="mb-4 text-lg font-medium">
          {t("vehiclesTitle")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {columns.map((c, i) => {
            const idp = `sv-${c.key}`;
            const usesFuel = c.fuelType !== "ev";
            const usesElectric = c.fuelType === "ev" || c.fuelType === "phev";
            return (
              <li key={c.key} className="flex flex-col gap-4 rounded-card border border-line bg-bg-alt p-5">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="h-1 w-6 rounded-full" style={{ background: CHART_CATEGORICAL[i] }} />
                  <span className="text-xs text-muted">{t("option", { n: f.number(i + 1) })}</span>
                  <Badge tone={c.fuelType === "ev" ? "ev" : "neutral"} className="ml-auto">
                    {tFuel(c.fuelType)}
                  </Badge>
                </div>
                <div>
                  <label htmlFor={`${idp}-vehicle`} className="mb-1 block text-xs text-muted">
                    {t("vehicle")}
                  </label>
                  <Select
                    id={`${idp}-vehicle`}
                    value={c.vehicleId ?? `custom:${c.fuelType}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.startsWith("custom:")) {
                        const fuel = value.slice(7) as FuelType;
                        patchColumn(c.key, { vehicleId: null, fuelType: fuel, maintenance: costConfig.annualMaintenance[fuel] });
                      } else {
                        const v = vehicles.find((x) => x.id === value);
                        if (v) setColumns((cols) => cols.map((col) => (col.key === c.key ? fromVehicle(c.key, v) : col)));
                      }
                    }}
                    className="h-10 text-sm"
                  >
                    {vehiclesByFuel.map((g) => (
                      <optgroup key={g.fuel} label={tFuel(g.fuel)}>
                        {g.items.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                        <option value={`custom:${g.fuel}`}>{t("custom", { fuel: tFuel(g.fuel) })}</option>
                      </optgroup>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {usesFuel ? (
                    <NumberInput id={`${idp}-kmpl`} label={t("kmPerL")} value={c.kmPerLitre} step={0.5} onChange={(v) => patchColumn(c.key, { kmPerLitre: v })} />
                  ) : null}
                  {usesElectric ? (
                    <NumberInput id={`${idp}-kwh`} label={t("kWhPer100km")} value={c.kWhPer100km} step={0.5} onChange={(v) => patchColumn(c.key, { kWhPer100km: v })} />
                  ) : null}
                  <NumberInput id={`${idp}-maint`} label={t("maintenance")} value={c.maintenance} step={1000} onChange={(v) => patchColumn(c.key, { maintenance: v ?? 0 })} />
                  {inputs.includePurchase ? (
                    <NumberInput id={`${idp}-price`} label={t("price")} value={c.price} step={50_000} onChange={(v) => patchColumn(c.key, { price: v ?? 0 })} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Results */}
      <section aria-labelledby="savings-results" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="savings-results" className="display-md">
            {t("resultsTitle", { years: f.number(inputs.years) })}
          </h2>
          {cheapest && priciest && cheapest.key !== priciest.key ? (
            <p aria-live="polite" className="max-w-3xl text-muted">
              {t("summary", {
                cheapest: labelFor(cheapest),
                priciest: labelFor(priciest),
                amount: f.bdt(bestSaving),
                years: f.number(inputs.years),
              })}
            </p>
          ) : null}
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[44rem] border-separate border-spacing-0 rounded-card border border-line bg-bg-alt text-sm">
            <caption className="sr-only">{t("tableCaption")}</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 rounded-tl-card bg-bg-alt px-4 py-4 text-left font-normal text-muted">
                  <span className="sr-only">{t("measure")}</span>
                </th>
                {columns.map((c, i) => (
                  <th key={c.key} scope="col" className="px-4 py-4 text-left align-bottom font-medium">
                    <span aria-hidden className="mb-2 block h-1 w-6 rounded-full" style={{ background: CHART_CATEGORICAL[i] }} />
                    {labelFor(c)}
                    <span className="mt-1 flex flex-wrap gap-1">
                      {c.key === comparison.cheapestId ? <Badge tone="success">{t("cheapest")}</Badge> : null}
                      {c.key === comparison.mostExpensiveId ? <Badge tone="warning">{t("priciest")}</Badge> : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ResultRow label={t("rows.costPerKm")} cells={columns.map((c) => (resultFor(c.key) ? f.bdt(resultFor(c.key)!.costPerKm, 2) : "—"))} />
              <ResultRow label={t("rows.monthly")} cells={columns.map((c) => (resultFor(c.key) ? f.bdt(resultFor(c.key)!.monthlyTotal) : "—"))} />
              <ResultRow label={t("rows.annual")} cells={columns.map((c) => (resultFor(c.key) ? f.bdt(resultFor(c.key)!.annualTotal) : "—"))} />
              <ResultRow label={t("rows.period", { years: f.number(inputs.years) })} cells={columns.map((c) => (resultFor(c.key) ? f.bdt(resultFor(c.key)!.periodTotal) : "—"))} strong />
              <ResultRow
                label={t("rows.savings")}
                cells={columns.map((c) => {
                  const r = resultFor(c.key);
                  return !r ? "—" : c.key === comparison.mostExpensiveId ? t("baseline") : f.bdt(r.savingsVsMostExpensive);
                })}
              />
              {inputs.includePurchase ? (
                <>
                  <ResultRow
                    label={t("rows.ownership", { years: f.number(inputs.years) })}
                    cells={columns.map((c) => (resultFor(c.key) ? f.bdt(resultFor(c.key)!.cumulative.at(-1)!) : "—"))}
                  />
                  <ResultRow label={t("rows.breakEven")} cells={columns.map((c) => breakEvenText(c.key))} />
                </>
              ) : null}
            </tbody>
          </table>
        </div>
        {comparison.results.length < columns.length ? <p className="text-sm text-warning-ink">{t("missingEfficiency")}</p> : null}

        <SavingsCharts options={chartOptions} includePurchase={inputs.includePurchase} />

        <div className="flex flex-col gap-3 rounded-card border border-line bg-bg-alt p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">{t("ctaLead")}</p>
          <WhatsAppButton
            context={{
              kind: "savings",
              savings:
                cheapest && priciest && cheapest.key !== priciest.key
                  ? t("whatsappSavings", { cheapest: labelFor(cheapest), amount: f.bdt(bestSaving), years: f.number(inputs.years), priciest: labelFor(priciest) })
                  : undefined,
            }}
          />
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, cells, strong }: { label: string; cells: string[]; strong?: boolean }) {
  return (
    <tr>
      <th scope="row" className="sticky left-0 border-t border-line bg-bg-alt px-4 py-3 text-left font-normal text-muted">
        {label}
      </th>
      {cells.map((c, i) => (
        <td key={i} className={`border-t border-line px-4 py-3 tabular ${strong ? "font-semibold" : ""}`}>
          {c}
        </td>
      ))}
    </tr>
  );
}

function NumberInput({
  id,
  label,
  value,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number | undefined;
  step: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        min={0}
        step={step}
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => onChange(Number.isFinite(e.target.valueAsNumber) ? Math.max(0, e.target.valueAsNumber) : undefined)}
        className="h-10 text-sm tabular"
      />
    </div>
  );
}
