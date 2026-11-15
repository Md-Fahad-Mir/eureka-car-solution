import { Droplets, Fuel, Leaf, PlugZap, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllVehicles } from "@/lib/api/vehicles";
import { getFormat } from "@/lib/format/getFormat";
import { FUEL_TYPES, type FuelType } from "@/types";
import { SectionHeading } from "./SectionHeading";

const FUEL_ICON: Record<FuelType, typeof Zap> = { ev: Zap, hybrid: Leaf, phev: PlugZap, petrol: Fuel, diesel: Droplets };
/** Browse by fuel type, with live counts. */
export async function BrowseBy() {
  const [t, tTax, f, vehicles] = await Promise.all([getTranslations("home.browse"), getTranslations("taxonomy"), getFormat(), getAllVehicles()]);
  const forSale = vehicles.filter((v) => v.availability !== "sold");
  const count = (pred: (v: (typeof forSale)[number]) => boolean) => forSale.filter(pred).length;
  const tile = "group flex flex-col gap-3 rounded-card border border-line bg-bg-alt p-5 transition-colors hover:border-ink/40";

  return (
    <section aria-labelledby="browse" className="container-page mt-20">
      <SectionHeading id="browse" eyebrow={t("eyebrow")} title={t("title")} link={{ href: "/vehicles", label: t("all") }} />
      <h3 className="mb-3 text-sm font-medium text-muted">{t("byFuel")}</h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FUEL_TYPES.map((fuel) => {
          const Icon = FUEL_ICON[fuel];
          return (
            <li key={fuel}>
              <Link href={`/vehicles?fuel=${fuel}`} className={tile}>
                <Icon aria-hidden className={fuel === "ev" ? "size-6 text-ev" : "size-6 text-accent-ink"} />
                <span className="font-medium">{tTax(`fuel.${fuel}`)}</span>
                <span className="text-xs text-muted">{t("count", { count: count((v) => v.fuelType === fuel), n: f.number(count((v) => v.fuelType === fuel)) })}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
