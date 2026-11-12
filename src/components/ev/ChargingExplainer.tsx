"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SliderField } from "@/components/calculators/SliderField";
import { RadioCard } from "@/components/ui/Choice";
import { Segmented } from "@/components/ui/Segmented";
import { RangeSlider } from "@/components/ui/Slider";
import { costConfig } from "@/config/costs";
import { evConfig, type ChargerId } from "@/config/ev";
import { chargingTime } from "@/lib/calc/chargingTime";
import { useFormat } from "@/lib/format/useFormat";
import { formatDuration } from "./duration";

/** Home chargers are billed at the household tariff; public ones set their own prices. */
const HOME: ChargerId[] = ["socket", "wallbox"];

/** Interactive charging-time explainer (EV charging guide). Estimates only. */
export function ChargingExplainer() {
  const t = useTranslations("ev");
  const f = useFormat();
  const b = evConfig.battery;
  const [batteryKwh, setBatteryKwh] = useState<number>(b.defaultKwh);
  const [chargerId, setChargerId] = useState<ChargerId>("wallbox");
  const [onboard, setOnboard] = useState<number>(evConfig.defaultOnboardKw);
  const [soc, setSoc] = useState<[number, number]>([evConfig.soc.defaultFrom, evConfig.soc.defaultTo]);

  const charger = evConfig.chargers.find((c) => c.id === chargerId)!;
  const r = chargingTime({ batteryKwh, chargerKw: charger.kw, kind: charger.kind, fromPct: soc[0], toPct: soc[1], onboardAcKw: onboard });
  const capped = charger.kind === "ac" && onboard < charger.kw;
  const pct = (n: number) => `${f.number(n)}%`;

  return (
    <div className="grid gap-6 rounded-card border border-line bg-bg-alt p-5 sm:p-6 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3">
        <SliderField
          label={t("explainer.battery")}
          value={batteryKwh}
          min={b.minKwh}
          max={b.maxKwh}
          step={b.stepKwh}
          onChange={setBatteryKwh}
          display={f.unit("kWh", batteryKwh, 0)}
          suffix="kWh"
          inputWidth="w-32"
        />
        <fieldset>
          <legend className="mb-3 text-sm font-medium">{t("explainer.charger")}</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {evConfig.chargers.map((c) => (
              <RadioCard
                key={c.id}
                name="ev-charger"
                value={c.id}
                checked={chargerId === c.id}
                onChange={() => setChargerId(c.id)}
                label={t(`chargers.${c.id}`)}
                description={`${c.kind.toUpperCase()} · ${f.unit("kW", c.kw)}`}
              />
            ))}
          </div>
        </fieldset>
        {charger.kind === "ac" ? (
          <div className="flex flex-col gap-2">
            <Segmented
              label={t("explainer.onboard")}
              value={String(onboard)}
              onValueChange={(v) => setOnboard(Number(v))}
              options={evConfig.onboardChargerKw.map((kw) => ({ value: String(kw), label: f.unit("kW", kw) }))}
            />
            <p className="text-xs text-muted">{t("explainer.onboardHint")}</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          <p className="flex justify-between text-sm font-medium">
            {t("explainer.soc")}
            <span className="tabular">
              {pct(soc[0])} → {pct(soc[1])}
            </span>
          </p>
          <RangeSlider
            value={soc}
            min={0}
            max={100}
            step={5}
            onValueChange={setSoc}
            labels={[t("explainer.from"), t("explainer.to")]}
            valueTexts={[pct(soc[0]), pct(soc[1])]}
          />
        </div>
      </div>

      <div className="on-dark flex flex-col gap-4 rounded-2xl bg-graphite p-5 text-on-dark lg:col-span-2" aria-live="polite">
        <p className="eyebrow text-accent-2">{t("explainer.result")}</p>
        <div>
          <p className="text-sm text-muted-on-dark">{t("explainer.time")}</p>
          <p className="mt-1 text-3xl font-light tabular">{r.hours > 0 ? formatDuration(r.hours, f, t) : "—"}</p>
        </div>
        <dl className="grid gap-3 border-t border-line-on-dark pt-4 text-sm">
          <Row label={t("explainer.energy")} value={f.unit("kWh", r.batteryKwh)} />
          <Row label={t("explainer.range")} value={t("explainer.rangeValue", { km: f.unit("km", r.rangeKm, 0) })} />
          <Row
            label={t("explainer.cost")}
            value={HOME.includes(chargerId) ? f.bdt(r.gridKwh * costConfig.electricityPerKwh) : t("explainer.publicPrice")}
          />
        </dl>
        {capped ? <p className="text-xs text-accent-2">{t("explainer.capped", { kw: f.unit("kW", onboard) })}</p> : null}
        {charger.kind === "dc" && soc[1] > evConfig.dcTaperFromSoc ? <p className="text-xs text-accent-2">{t("explainer.taper")}</p> : null}
        <p className="mt-auto text-xs leading-relaxed text-muted-on-dark">
          {t("explainer.note", { price: f.bdt(costConfig.electricityPerKwh), consumption: f.number(evConfig.consumptionKwhPer100Km) })}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-on-dark">{label}</dt>
      <dd className="text-right font-medium tabular">{value}</dd>
    </div>
  );
}
