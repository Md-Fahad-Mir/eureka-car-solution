import { ArrowUpRight, Droplets, Fuel, Leaf, PlugZap, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllVehicles } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FUEL_TYPES, type FuelType } from "@/types";
import { SectionHeading } from "./SectionHeading";

const FUEL_ICON: Record<FuelType, typeof Zap> = { ev: Zap, hybrid: Leaf, phev: PlugZap, petrol: Fuel, diesel: Droplets };

/**
 * Browse by fuel type, with live counts. Tiles rise in one after another; on
 * hover the card lifts, its icon turns and a gold line sweeps along the base.
 * The electric tile carries a slow charging pulse.
 */
export async function BrowseBy({ index }: { index: number }) {
  const [t, tTax, f, vehicles] = await Promise.all([getTranslations("home.browse"), getTranslations("taxonomy"), getFormat(), getAllVehicles()]);
  const forSale = vehicles.filter((v) => v.availability !== "sold");

  return (
    <section aria-labelledby="browse" className="container-page section-gap">
      <SectionHeading id="browse" index={index} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} link={{ href: "/vehicles", label: t("all") }} />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {FUEL_TYPES.map((fuel, i) => {
          const Icon = FUEL_ICON[fuel];
          const n = forSale.filter((v) => v.fuelType === fuel).length;
          const ev = fuel === "ev";
          return (
            <li key={fuel} data-reveal style={stagger(i)}>
              <Link
                href={`/vehicles?fuel=${fuel}`}
                className="group relative flex h-full min-h-44 flex-col justify-between gap-8 overflow-hidden rounded-card border border-line bg-bg-alt p-5 transition-[transform,box-shadow,border-color] duration-500 ease-(--ease-cinema) hover:-translate-y-1 hover:border-transparent hover:shadow-(--shadow-lift) sm:p-6"
              >
                <span className="flex items-start justify-between">
                  <span className={cn("relative grid size-12 place-items-center rounded-full", ev ? "bg-ev-soft text-ev" : "bg-bg text-accent-ink")}>
                    {ev ? <span aria-hidden className="absolute inset-0 rounded-full bg-ev/25 motion-safe:animate-[pulse-ring_2.6s_var(--ease-cinema)_infinite]" /> : null}
                    <Icon aria-hidden className="relative size-5 transition-transform duration-500 ease-(--ease-cinema) group-hover:scale-115 group-hover:-rotate-12" />
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 -translate-x-1 translate-y-1 text-muted opacity-0 transition-[opacity,transform] duration-500 ease-(--ease-cinema) group-hover:translate-0 group-hover:opacity-100"
                  />
                </span>
                <span>
                  <span className="block text-lg font-medium sm:text-xl">{tTax(`fuel.${fuel}`)}</span>
                  <span className="mt-1 block text-sm text-muted">{t("count", { count: n, n: f.number(n) })}</span>
                </span>
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-(image:--gold) transition-transform duration-700 ease-(--ease-cinema) group-hover:scale-x-100" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
