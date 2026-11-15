import { ArrowRight, Cog, Gauge, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { VehicleImage } from "@/components/media/VehicleImage";
import { CompareButton, FavoriteButton } from "@/components/vehicle/VehicleActions";
import { ConditionBadge, FuelBadge } from "@/components/vehicle/VehicleBadges";
import { Link } from "@/i18n/navigation";
import { emiFrom } from "@/lib/calc/emi";
import { useFormat } from "@/lib/format/useFormat";
import { cn } from "@/lib/utils";
import { brandInitial, headlineEfficiency, vehicleName, vehiclePath } from "@/lib/vehicle";
import type { VehicleWithBrand } from "@/types";

/**
 * The lead vehicle of "Hand-picked this week": a large editorial card. The
 * studio image drifts with the scroll and settles in closer on hover; the
 * dark panel carries the name, key specs, price and EMI-from. The whole card
 * links to the vehicle; save/compare sit above the link.
 */
export function FeaturedSpotlight({ vehicle: v }: { vehicle: VehicleWithBrand }) {
  const t = useTranslations("home.shelves");
  const tCard = useTranslations("vehicleCard");
  const tTax = useTranslations("taxonomy");
  const locale = useLocale();
  const f = useFormat();
  const name = vehicleName(v, locale);
  const efficiency = headlineEfficiency(v);
  const photo = Boolean(v.images[0]?.src);
  const specs = [
    { Icon: Gauge, label: tCard("mileage"), value: f.unit("km", v.mileageKm, 0) },
    { Icon: Cog, label: tCard("transmission"), value: tTax(`transmission.${v.transmission}`) },
    ...(efficiency ? [{ Icon: Zap, label: efficiency.unit === "km" ? tCard("range") : tCard("economy"), value: f.unit(efficiency.unit, efficiency.value) }] : []),
  ];

  return (
    <article className="group on-dark relative flex h-full flex-col overflow-hidden rounded-[28px] bg-graphite text-on-dark">
      {/* The image area takes whatever height the grid gives the card. A photo fills it;
          the drawn studio placeholder keeps its proportions, standing on the bottom edge
          over a backdrop of its own top colour, so there is no seam. */}
      <div className={cn("relative flex min-h-72 flex-1 flex-col justify-end overflow-hidden", !photo && "bg-[#f3f2ee]")}>
        <div className={cn("scroll-parallax [--parallax:14px]", photo && "absolute -inset-y-6 inset-x-0")}>
          <VehicleImage
            media={v.images[0]}
            placeholder={{ bodyType: v.bodyType, paint: v.colors[0]?.hex ?? "#cfd0c9", initial: brandInitial(v) }}
            rounded={false}
            priority={false}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn("origin-bottom transition-transform duration-[1400ms] ease-(--ease-cinema) group-hover:scale-[1.05]", photo && "aspect-auto h-full")}
          />
        </div>
        <div className="pointer-events-none absolute top-5 left-5 flex gap-1.5">
          <ConditionBadge condition={v.condition} />
        </div>
        <div className="absolute top-5 right-5 z-10 flex gap-1.5">
          <FavoriteButton vehicleId={v.id} name={name} />
          <CompareButton vehicleId={v.id} name={name} />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div>
          <p className="eyebrow flex items-center gap-3 text-accent-2">
            {v.brand.name[locale]}
            <span aria-hidden className="h-px w-6 bg-accent-2/60" />
            {t("spotlight")}
          </p>
          <h3 className="display-md mt-3">
            <Link
              href={vehiclePath(v)}
              className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-[28px] after:focus-visible:outline-2 after:focus-visible:outline-accent-2"
            >
              {v.model} <span className="text-muted-on-dark">{v.variant}</span>
            </Link>
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-on-dark">
            <span className="tabular">{f.number(v.year, { useGrouping: false })}</span>
            <span aria-hidden>·</span>
            <FuelBadge fuel={v.fuelType} />
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-4 border-y border-line-on-dark py-4 text-sm">
          {specs.map(({ Icon, label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-xs text-muted-on-dark">
                <Icon aria-hidden className="size-3.5" />
                <span className="truncate">{label}</span>
              </dt>
              <dd className="mt-1 truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-light tracking-tight tabular">{f.bdtCompact(v.price.amount)}</p>
            <p className="mt-1 text-xs text-muted-on-dark">
              {tCard("emiFrom", { amount: f.bdt(emiFrom(v.price.amount)) })}
              <span className="sr-only"> {tCard("emiFromNote")}</span>
            </p>
          </div>
          <span aria-hidden className="inline-flex items-center gap-2 text-sm font-medium text-accent-2">
            {t("details")}
            <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-cinema) group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
