import { BatteryCharging, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { costConfig } from "@/config/costs";
import { evConfig } from "@/config/ev";
import { energyCostPerKm } from "@/lib/calc/runningCost";
import { getFormat } from "@/lib/format/getFormat";
import { stagger } from "@/lib/motion";
import { SectionHeading } from "./SectionHeading";

/** Decorative charging cable along the bottom of the panel, behind the buttons (SVG units, stretched to the panel). */
const CHARGE_PATH = "M-10 190 C 260 190 420 110 640 130 S 940 40 1210 70";
const prices = { petrolPerLitre: costConfig.fuelPricePerLitre.petrol, dieselPerLitre: costConfig.fuelPricePerLitre.diesel, electricityPerKwh: costConfig.electricityPerKwh };

/**
 * EV Centre teaser. The teal panel opens left to right while a charging line
 * draws across it; the energy cost per km is shown as two bars (EV vs petrol,
 * at the sample prices in config) that grow when the panel arrives.
 */
export async function EvTeaser({ index }: { index: number }) {
  const [t, f] = await Promise.all([getTranslations("home.ev"), getFormat()]);
  const ev = energyCostPerKm({ id: "ev", fuelType: "ev", kWhPer100km: evConfig.consumptionKwhPer100Km, annualMaintenance: 0 }, prices) ?? 0;
  const petrol = energyCostPerKm({ id: "p", fuelType: "petrol", kmPerLitre: costConfig.comparisonBaseline.petrol.kmPerLitre, annualMaintenance: 0 }, prices) ?? 0;
  const max = Math.max(ev, petrol) || 1;
  const bars = [
    { key: "ev", value: ev, className: "bg-ev" },
    { key: "petrol", value: petrol, className: "bg-ink/35" },
  ] as const;
  const facts = [
    { key: "service", Icon: Wrench, hover: "group-hover:rotate-[-25deg]" },
    { key: "charge", Icon: BatteryCharging, hover: "group-hover:scale-115" },
  ] as const;

  return (
    <section aria-labelledby="ev-teaser" className="container-page section-gap">
      <div data-reveal="wipe" className="relative isolate overflow-hidden rounded-[28px] bg-ev-soft px-6 pt-10 pb-6 sm:px-10 sm:pt-14 sm:pb-10">
        {/* Charging line: draws in, then a pulse travels along it. */}
        <svg
          aria-hidden
          data-reveal="draw"
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full text-ev/35"
        >
          <path id="ev-charge-path" className="draw" pathLength={1} d={CHARGE_PATH} fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle r="4" className="fill-ev max-lg:hidden motion-reduce:hidden">
            <animateMotion dur="7s" begin="2s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.65 0 0.35 1">
              <mpath href="#ev-charge-path" />
            </animateMotion>
          </circle>
        </svg>
        <SectionHeading
          id="ev-teaser"
          index={index}
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
          tone="ev"
        />
        <div className="grid gap-4 lg:grid-cols-12">
          <figure data-reveal style={stagger(0)} className="flex flex-col gap-5 rounded-2xl bg-bg-alt p-6 lg:col-span-6">
            <figcaption>
              <p className="text-lg font-medium">{t("facts.cost.value", { ev: f.bdt(ev, 1), petrol: f.bdt(petrol, 1) })}</p>
              <p className="mt-1 text-sm text-muted">{t("facts.cost.body")}</p>
            </figcaption>
            <dl className="flex flex-col gap-3">
              {bars.map((b, i) => (
                <div key={b.key} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[6.5rem_1fr_4rem]">
                  <dt className="text-muted">{t(`bars.${b.key}`)}</dt>
                  <dd className="contents">
                    <span aria-hidden className="h-3 overflow-hidden rounded-full bg-ink/[0.06]">
                      <span className={`grow-x block h-full rounded-full ${b.className}`} style={{ width: `${(b.value / max) * 100}%`, ["--i" as string]: i }} />
                    </span>
                    <span className="text-right font-medium tabular">{f.bdt(b.value, 1)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </figure>
          {facts.map(({ key, Icon, hover }, i) => (
            <div key={key} data-reveal style={stagger(i + 1)} className="group flex flex-col gap-3 rounded-2xl bg-bg-alt p-6 lg:col-span-3">
              <Icon aria-hidden className={`size-6 text-ev transition-transform duration-500 ease-(--ease-cinema) ${hover}`} />
              <p className="text-lg leading-snug font-medium">{t(`facts.${key}.value`)}</p>
              <p className="text-sm text-muted">{t(`facts.${key}.body`)}</p>
            </div>
          ))}
        </div>
        <div data-reveal style={stagger(3)} className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/ev" className="sheen">{t("cta")}</ButtonLink>
          <ButtonLink href="/vehicles?fuel=ev" variant="outline">{t("listings")}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
