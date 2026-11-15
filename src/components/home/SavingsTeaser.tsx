"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SliderField } from "@/components/calculators/SliderField";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ButtonLink } from "@/components/ui/Button";
import { costConfig } from "@/config/costs";
import { evConfig } from "@/config/ev";
import { energyCostPerKm } from "@/lib/calc/runningCost";
import { useFormat } from "@/lib/format/useFormat";
import { stagger } from "@/lib/motion";
import { SectionHeading } from "./SectionHeading";

const DAYS_PER_MONTH = 365 / 12;
const prices = { petrolPerLitre: costConfig.fuelPricePerLitre.petrol, dieselPerLitre: costConfig.fuelPricePerLitre.diesel, electricityPerKwh: costConfig.electricityPerKwh };
const EV = energyCostPerKm({ id: "ev", fuelType: "ev", kWhPer100km: evConfig.consumptionKwhPer100Km, annualMaintenance: 0 }, prices) ?? 0;
const PETROL = energyCostPerKm({ id: "petrol", fuelType: "petrol", kmPerLitre: costConfig.comparisonBaseline.petrol.kmPerLitre, annualMaintenance: 0 }, prices) ?? 0;

/**
 * Mini savings estimate: one slider, the monthly energy cost of an EV vs a
 * typical petrol car. The saving rolls to each new value and the two bars
 * resize live as the distance changes.
 */
export function SavingsTeaser({ index }: { index: number }) {
  const t = useTranslations("home.savings");
  const f = useFormat();
  const [km, setKm] = useState<number>(costConfig.distance.defaultValue);
  const month = km * DAYS_PER_MONTH;
  const petrol = month * PETROL;
  const ev = month * EV;
  const bars = [
    { key: "petrolMonth", value: petrol, className: "bg-on-dark/35" },
    { key: "evMonth", value: ev, className: "bg-accent-2" },
  ] as const;

  return (
    <section aria-labelledby="savings-teaser" className="container-page section-gap">
      <div className="grid overflow-hidden rounded-[28px] border border-line lg:grid-cols-2">
        <div className="flex flex-col gap-8 bg-bg-alt p-6 sm:p-10">
          <SectionHeading id="savings-teaser" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} layout="stack" className="mb-0 md:mb-0" />
          <div data-reveal style={stagger(0, 300)} className="flex flex-col gap-4">
            <SliderField label={t("distance")} value={km} min={10} max={150} step={5} onChange={setKm} display={f.unit("km", km, 0)} suffix={t("unit")} />
            <p className="text-xs text-muted">
              {t("assumptions", { kmpl: f.number(costConfig.comparisonBaseline.petrol.kmPerLitre), kwh: f.number(evConfig.consumptionKwhPer100Km), petrol: f.bdt(costConfig.fuelPricePerLitre.petrol), electricity: f.bdt(costConfig.electricityPerKwh) })}
            </p>
          </div>
        </div>
        <div className="on-dark relative isolate flex flex-col gap-6 overflow-hidden bg-graphite p-6 text-on-dark sm:p-10">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1/3 -right-1/4 -z-10 h-[120%] w-3/4 rounded-full bg-[radial-gradient(closest-side,rgb(200_176_124/0.18),transparent)] motion-safe:animate-[light-drift_16s_var(--ease-in-out-soft)_infinite]"
          />
          <div aria-live="polite" className="flex flex-col gap-2">
            <p className="text-sm text-muted-on-dark">{t("saving")}</p>
            <AnimatedNumber value={petrol - ev} kind="bdt" className="text-5xl font-light tracking-tight sm:text-6xl" />
            <p className="text-sm text-muted-on-dark">{t("perYear", { amount: f.bdt((petrol - ev) * 12) })}</p>
          </div>
          <dl className="flex flex-col gap-4 border-t border-line-on-dark pt-6 text-sm">
            {bars.map((b) => (
              <div key={b.key} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
                <dt className="text-muted-on-dark">{t(b.key)}</dt>
                <dd className="contents">
                  <AnimatedNumber value={b.value} kind="bdt" className="font-medium" />
                  <span aria-hidden className="col-span-2 h-2 overflow-hidden rounded-full bg-on-dark/10">
                    <span
                      className={`block h-full rounded-full transition-[width] duration-700 ease-(--ease-cinema) ${b.className}`}
                      style={{ width: `${(b.value / Math.max(petrol, ev, 1)) * 100}%` }}
                    />
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="/savings-calculator" variant="light" className="sheen mt-auto self-start">
            {t("cta")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
