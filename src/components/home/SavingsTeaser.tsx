"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SliderField } from "@/components/calculators/SliderField";
import { ButtonLink } from "@/components/ui/Button";
import { costConfig } from "@/config/costs";
import { evConfig } from "@/config/ev";
import { energyCostPerKm } from "@/lib/calc/runningCost";
import { useFormat } from "@/lib/format/useFormat";

const DAYS_PER_MONTH = 365 / 12;
const prices = { petrolPerLitre: costConfig.fuelPricePerLitre.petrol, dieselPerLitre: costConfig.fuelPricePerLitre.diesel, electricityPerKwh: costConfig.electricityPerKwh };
const EV = energyCostPerKm({ id: "ev", fuelType: "ev", kWhPer100km: evConfig.consumptionKwhPer100Km, annualMaintenance: 0 }, prices) ?? 0;
const PETROL = energyCostPerKm({ id: "petrol", fuelType: "petrol", kmPerLitre: costConfig.comparisonBaseline.petrol.kmPerLitre, annualMaintenance: 0 }, prices) ?? 0;

/** Mini savings estimate: one slider, live monthly energy cost of an EV vs a typical petrol car. */
export function SavingsTeaser() {
  const t = useTranslations("home.savings");
  const f = useFormat();
  const [km, setKm] = useState<number>(costConfig.distance.defaultValue);
  const month = km * DAYS_PER_MONTH;
  const petrol = month * PETROL;
  const ev = month * EV;

  return (
    <section aria-labelledby="savings-teaser" className="container-page mt-24">
      <div className="grid overflow-hidden rounded-card border border-line lg:grid-cols-2">
        <div className="flex flex-col gap-6 bg-bg-alt p-7 sm:p-10">
          <div>
            <p className="eyebrow text-accent-ink">{t("eyebrow")}</p>
            <h2 id="savings-teaser" className="display-md mt-2">{t("title")}</h2>
            <p className="mt-3 text-muted">{t("lead")}</p>
          </div>
          <SliderField label={t("distance")} value={km} min={10} max={150} step={5} onChange={setKm} display={f.unit("km", km, 0)} suffix={t("unit")} />
          <p className="text-xs text-muted">
            {t("assumptions", { kmpl: f.number(costConfig.comparisonBaseline.petrol.kmPerLitre), kwh: f.number(evConfig.consumptionKwhPer100Km), petrol: f.bdt(costConfig.fuelPricePerLitre.petrol), electricity: f.bdt(costConfig.electricityPerKwh) })}
          </p>
        </div>
        <div className="on-dark flex flex-col gap-5 bg-graphite p-7 text-on-dark sm:p-10" aria-live="polite">
          <p className="text-sm text-muted-on-dark">{t("saving")}</p>
          <p className="text-5xl font-light tabular">{f.bdt(petrol - ev)}</p>
          <p className="text-sm text-muted-on-dark">{t("perYear", { amount: f.bdt((petrol - ev) * 12) })}</p>
          <dl className="grid grid-cols-2 gap-4 border-t border-line-on-dark pt-5 text-sm">
            <div>
              <dt className="text-muted-on-dark">{t("petrolMonth")}</dt>
              <dd className="mt-0.5 font-medium tabular">{f.bdt(petrol)}</dd>
            </div>
            <div>
              <dt className="text-muted-on-dark">{t("evMonth")}</dt>
              <dd className="mt-0.5 font-medium tabular">{f.bdt(ev)}</dd>
            </div>
          </dl>
          <ButtonLink href="/savings-calculator" variant="light" className="mt-auto self-start">
            {t("cta")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
