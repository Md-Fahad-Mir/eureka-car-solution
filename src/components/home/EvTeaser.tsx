import { BatteryCharging, PiggyBank, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { costConfig } from "@/config/costs";
import { evConfig } from "@/config/ev";
import { energyCostPerKm } from "@/lib/calc/runningCost";
import { getFormat } from "@/lib/format/getFormat";

const prices = { petrolPerLitre: costConfig.fuelPricePerLitre.petrol, dieselPerLitre: costConfig.fuelPricePerLitre.diesel, electricityPerKwh: costConfig.electricityPerKwh };

/** EV education teaser: three key facts and a way into the EV Centre. */
export async function EvTeaser() {
  const [t, f] = await Promise.all([getTranslations("home.ev"), getFormat()]);
  const ev = energyCostPerKm({ id: "ev", fuelType: "ev", kWhPer100km: evConfig.consumptionKwhPer100Km, annualMaintenance: 0 }, prices) ?? 0;
  const petrol = energyCostPerKm({ id: "p", fuelType: "petrol", kmPerLitre: costConfig.comparisonBaseline.petrol.kmPerLitre, annualMaintenance: 0 }, prices) ?? 0;
  const facts = [
    { key: "cost", Icon: PiggyBank, value: t("facts.cost.value", { ev: f.bdt(ev, 1), petrol: f.bdt(petrol, 1) }) },
    { key: "service", Icon: Wrench, value: t("facts.service.value") },
    { key: "charge", Icon: BatteryCharging, value: t("facts.charge.value") },
  ] as const;
  return (
    <section aria-labelledby="ev-teaser" className="container-page mt-24">
      <div className="grid gap-10 rounded-card bg-ev-soft p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow text-ev">{t("eyebrow")}</p>
          <h2 id="ev-teaser" className="display-md mt-2">{t("title")}</h2>
          <p className="mt-3 text-ink/80">{t("lead")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/ev">{t("cta")}</ButtonLink>
            <ButtonLink href="/vehicles?fuel=ev" variant="outline">{t("listings")}</ButtonLink>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
          {facts.map(({ key, Icon, value }) => (
            <li key={key} className="flex flex-col gap-3 rounded-2xl bg-bg-alt p-5">
              <Icon aria-hidden className="size-6 text-ev" />
              <p className="text-lg leading-snug font-medium">{value}</p>
              <p className="text-sm text-muted">{t(`facts.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
