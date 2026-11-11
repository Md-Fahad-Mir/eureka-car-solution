"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Segmented } from "@/components/ui/Segmented";
import { costConfig, type DistanceUnit } from "@/config/costs";
import { Link } from "@/i18n/navigation";
import { compareRunningCosts, toAnnualKm, tractorFuelCost, type CostOption } from "@/lib/calc/runningCost";
import { useFormat } from "@/lib/format/useFormat";
import type { FuelType, Vehicle } from "@/types";
import { SliderField } from "./SliderField";

type Props = {
  fuelType: FuelType;
  efficiency: Vehicle["efficiency"];
  /** Link to the full multi-fuel savings calculator. */
  savingsHref?: string;
};

/**
 * Running-cost estimate prefilled with one vehicle's efficiency. Tractors are
 * costed per working hour; everything else per km, compared against a
 * "typical" baseline car from config (illustrative).
 */
export function RunningCostCalculator(props: Props) {
  return props.efficiency.litresPerHour ? (
    <TractorCost litresPerHour={props.efficiency.litresPerHour} />
  ) : (
    <RoadCost {...props} />
  );
}

function RoadCost({ fuelType, efficiency, savingsHref = "/savings-calculator" }: Props) {
  const t = useTranslations("runningCost");
  const tTax = useTranslations("taxonomy.fuel");
  const f = useFormat();
  const cfg = costConfig;

  const [distance, setDistance] = useState<number>(cfg.distance.defaultValue);
  const [unit, setUnit] = useState<DistanceUnit>(cfg.distance.defaultUnit);
  const [petrol, setPetrol] = useState<number>(cfg.fuelPricePerLitre.petrol);
  const [diesel, setDiesel] = useState<number>(cfg.fuelPricePerLitre.diesel);
  const [electricity, setElectricity] = useState<number>(cfg.electricityPerKwh);
  const [electricShare, setElectricShare] = useState<number>(cfg.phevElectricShare * 100);
  const [years, setYears] = useState<number>(cfg.ownershipYears.default);

  const usesFuel = fuelType !== "ev";
  const usesElectricity = fuelType === "ev" || fuelType === "phev";
  const baselineKind: "petrol" | "hybrid" = fuelType === "petrol" ? "hybrid" : "petrol";
  const baseline = cfg.comparisonBaseline[baselineKind];

  const options: CostOption[] = [
    {
      id: "this",
      fuelType,
      kmPerLitre: efficiency.kmPerLitre,
      kWhPer100km: efficiency.kWhPer100km,
      annualMaintenance: cfg.annualMaintenance[fuelType],
      electricShare: electricShare / 100,
    },
    { id: "baseline", fuelType: baselineKind, kmPerLitre: baseline.kmPerLitre, annualMaintenance: baseline.annualMaintenance },
  ];
  const result = compareRunningCosts({
    options,
    prices: { petrolPerLitre: petrol, dieselPerLitre: diesel, electricityPerKwh: electricity },
    annualKm: toAnnualKm(distance, unit),
    years,
    includePurchase: false,
  });
  const mine = result.results.find((r) => r.id === "this");
  const base = result.results.find((r) => r.id === "baseline");
  const annualDiff = mine && base ? base.annualTotal - mine.annualTotal : 0;

  const unitLabel = { day: t("perDay"), month: t("perMonth"), year: t("perYear") }[unit];

  return (
    <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-[1.25fr_1fr]">
      <div className="flex flex-col gap-6 bg-bg-alt p-5 sm:p-7">
        <SliderField
          label={t("distance")}
          aside={
            <Segmented
              label={t("distanceUnit")}
              value={unit}
              onValueChange={(u) => {
                // Keep the same yearly distance when switching unit.
                const annual = toAnnualKm(distance, unit);
                setDistance(Math.round(u === "day" ? annual / 365 : u === "month" ? annual / 12 : annual));
                setUnit(u);
              }}
              options={[
                { value: "day", label: t("day") },
                { value: "month", label: t("month") },
                { value: "year", label: t("year") },
              ]}
            />
          }
          value={distance}
          min={0}
          max={unit === "day" ? 300 : unit === "month" ? 9_000 : 100_000}
          step={unit === "day" ? 5 : unit === "month" ? 100 : 1_000}
          onChange={setDistance}
          suffix="km"
          display={t("distanceDisplay", { value: f.unit("km", distance, 0), unit: unitLabel, annual: f.unit("km", result.annualKm, 0) })}
        />
        {usesFuel && fuelType !== "diesel" ? (
          <SliderField
            label={t("petrolPrice")}
            value={petrol}
            min={50}
            max={250}
            step={1}
            onChange={setPetrol}
            suffix="৳/L"
            display={t("perLitre", { value: f.bdt(petrol) })}
          />
        ) : null}
        {fuelType === "diesel" ? (
          <SliderField
            label={t("dieselPrice")}
            value={diesel}
            min={50}
            max={250}
            step={1}
            onChange={setDiesel}
            suffix="৳/L"
            display={t("perLitre", { value: f.bdt(diesel) })}
          />
        ) : null}
        {usesElectricity ? (
          <SliderField
            label={t("electricityPrice")}
            value={electricity}
            min={2}
            max={40}
            step={0.5}
            onChange={setElectricity}
            suffix="৳"
            display={t("perKwh", { value: f.bdt(electricity, 1) })}
          />
        ) : null}
        {fuelType === "phev" ? (
          <SliderField
            label={t("electricShare")}
            value={electricShare}
            min={0}
            max={100}
            step={5}
            onChange={setElectricShare}
            suffix="%"
            display={t("electricShareDisplay", { percent: f.number(electricShare) })}
          />
        ) : null}
        <SliderField
          label={t("years")}
          value={years}
          min={cfg.ownershipYears.min}
          max={cfg.ownershipYears.max}
          step={1}
          onChange={(v) => setYears(Math.round(v))}
          display={f.unit("years", years, 0)}
          inputWidth="w-20"
        />
      </div>

      <div className="on-dark flex flex-col gap-6 bg-graphite p-5 text-on-dark sm:p-7">
        {mine ? (
          <>
            <div aria-live="polite" aria-atomic>
              <p className="eyebrow text-accent-2">{t("monthly")}</p>
              <p className="mt-2 text-4xl font-light tracking-tight tabular sm:text-5xl">{f.bdt(mine.monthlyTotal)}</p>
              <p className="mt-1 text-sm text-muted-on-dark">
                {t("perKm", { value: f.bdt(mine.costPerKm, 2) })} · {t("energyPerKm", { value: f.bdt(mine.energyPerKm, 2) })}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-line-on-dark pt-5 text-sm">
              <div>
                <dt className="text-muted-on-dark">{t("annual")}</dt>
                <dd className="mt-0.5 font-medium tabular">{f.bdt(mine.annualTotal)}</dd>
              </div>
              <div>
                <dt className="text-muted-on-dark">{t("overYears", { years: f.number(years) })}</dt>
                <dd className="mt-0.5 font-medium tabular">{f.bdt(mine.periodTotal)}</dd>
              </div>
            </dl>
            {base ? (
              <p className="rounded-2xl bg-white/[0.05] p-4 text-sm leading-relaxed">
                {annualDiff >= 0
                  ? t("savesVs", {
                      amount: f.bdt(annualDiff),
                      period: f.bdt(annualDiff * years),
                      years: f.number(years),
                      baseline: t(`baseline.${baselineKind}`, { economy: f.unit("kmPerL", baseline.kmPerLitre) }),
                    })
                  : t("costsMoreVs", {
                      amount: f.bdt(-annualDiff),
                      baseline: t(`baseline.${baselineKind}`, { economy: f.unit("kmPerL", baseline.kmPerLitre) }),
                    })}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-on-dark">{t("noEfficiency", { fuel: tTax(fuelType) })}</p>
        )}
        <p className="text-xs leading-relaxed text-muted-on-dark">
          {t("disclaimer", { maintenance: f.bdt(cfg.annualMaintenance[fuelType]) })}
        </p>
        <Link
          href={savingsHref}
          className="group mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-on-dark px-5 text-sm font-medium hover:border-on-dark"
        >
          {t("compareAllFuels")}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function TractorCost({ litresPerHour }: { litresPerHour: number }) {
  const t = useTranslations("runningCost");
  const f = useFormat();
  const [diesel, setDiesel] = useState<number>(costConfig.fuelPricePerLitre.diesel);
  const [hours, setHours] = useState<number>(costConfig.tractorUsage.hoursPerDay);
  const [days, setDays] = useState<number>(costConfig.tractorUsage.daysPerMonth);
  const cost = tractorFuelCost({ litresPerHour, dieselPerLitre: diesel, hoursPerDay: hours, daysPerMonth: days });

  return (
    <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-[1.25fr_1fr]">
      <div className="flex flex-col gap-6 bg-bg-alt p-5 sm:p-7">
        <SliderField label={t("hoursPerDay")} value={hours} min={1} max={16} step={0.5} onChange={setHours} display={t("hoursDisplay", { value: f.number(hours) })} inputWidth="w-20" />
        <SliderField label={t("daysPerMonth")} value={days} min={1} max={31} step={1} onChange={(v) => setDays(Math.round(v))} display={t("daysDisplay", { value: f.number(days) })} inputWidth="w-20" />
        <SliderField label={t("dieselPrice")} value={diesel} min={50} max={250} step={1} onChange={setDiesel} suffix="৳/L" display={t("perLitre", { value: f.bdt(diesel) })} />
      </div>
      <div className="on-dark flex flex-col gap-6 bg-graphite p-5 text-on-dark sm:p-7">
        <div aria-live="polite" aria-atomic>
          <p className="eyebrow text-accent-2">{t("monthlyFuel")}</p>
          <p className="mt-2 text-4xl font-light tracking-tight tabular sm:text-5xl">{f.bdt(cost.monthly)}</p>
          <p className="mt-1 text-sm text-muted-on-dark">
            {t("perHour", { value: f.bdt(cost.perHour), usage: f.unit("lPerHour", litresPerHour) })}
          </p>
        </div>
        <dl className="border-t border-line-on-dark pt-5 text-sm">
          <dt className="text-muted-on-dark">{t("annualFuel")}</dt>
          <dd className="mt-0.5 font-medium tabular">{f.bdt(cost.annual)}</dd>
        </dl>
        <p className="text-xs leading-relaxed text-muted-on-dark">{t("tractorDisclaimer")}</p>
      </div>
    </div>
  );
}
