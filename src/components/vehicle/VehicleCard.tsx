import { Cog, Gauge, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { VehicleImage } from "@/components/media/VehicleImage";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { Link } from "@/i18n/navigation";
import { emiFrom } from "@/lib/calc/emi";
import { useFormat } from "@/lib/format/useFormat";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { brandInitial, headlineEfficiency, vehicleName, vehiclePath } from "@/lib/vehicle";
import type { VehicleWithBrand } from "@/types";
import { CompareButton, FavoriteButton } from "./VehicleActions";
import { AvailabilityBadge, ConditionBadge, FuelBadge } from "./VehicleBadges";

/**
 * Marketplace card: image, name, year, condition, fuel, key specs, price in
 * lakh, EMI-from, and favourite / compare / WhatsApp actions. The whole card
 * links to the detail page; action buttons sit above the stretched link.
 */
export function VehicleCard({
  vehicle: v,
  view = "grid",
  priority,
  headingLevel = 3,
}: {
  vehicle: VehicleWithBrand;
  view?: "grid" | "list";
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const t = useTranslations("vehicleCard");
  const tTax = useTranslations("taxonomy");
  const locale = useLocale();
  const f = useFormat();
  const name = vehicleName(v, locale);
  const efficiency = headlineEfficiency(v);
  const Heading = `h${headingLevel}` as const;
  const isList = view === "list";

  return (
    <article
      className={cn(
        "group relative flex w-full overflow-hidden rounded-card border border-line bg-bg-alt transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(22,26,22,0.35)]",
        isList ? "flex-col sm:flex-row" : "flex-col",
      )}
    >
      <div className={cn("relative p-2", isList && "sm:w-[42%] sm:shrink-0")}>
        <VehicleImage
          media={v.images[0]}
          placeholder={{ bodyType: v.bodyType, paint: v.colors[0]?.hex ?? "#cfd0c9", initial: brandInitial(v) }}
          priority={priority}
          sizes={isList ? "(min-width: 640px) 40vw, 100vw" : undefined}
          className="transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-1.5">
          <ConditionBadge condition={v.condition} />
          <AvailabilityBadge availability={v.availability} hideInStock />
        </div>
        <div className="absolute top-4 right-4 z-10 flex gap-1.5">
          <FavoriteButton vehicleId={v.id} name={name} />
          <CompareButton vehicleId={v.id} name={name} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-5">
        <div>
          <p className="eyebrow text-muted">{v.brand.name[locale]}</p>
          <Heading className="mt-1.5 text-lg leading-snug font-medium">
            <Link href={vehiclePath(v)} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-card after:focus-visible:outline-2 after:focus-visible:outline-accent-ink">
              {v.model} <span className="font-normal text-muted">{v.variant}</span>
            </Link>
          </Heading>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="tabular">{f.number(v.year, { useGrouping: false })}</span>
            <span aria-hidden>·</span>
            <FuelBadge fuel={v.fuelType} />
            {v.auctionGrade ? (
              <span className="text-xs">{t("grade", { grade: f.digits(v.auctionGrade) })}</span>
            ) : null}
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 border-y border-line py-3 text-xs">
          <Spec icon={<Gauge aria-hidden className="size-3.5" />} label={t("mileage")} value={f.unit("km", v.mileageKm, 0)} />
          <Spec icon={<Cog aria-hidden className="size-3.5" />} label={t("transmission")} value={tTax(`transmission.${v.transmission}`)} />
          {efficiency ? (
            <Spec
              icon={<Zap aria-hidden className="size-3.5" />}
              label={efficiency.unit === "km" ? t("range") : t("economy")}
              value={f.unit(efficiency.unit, efficiency.value)}
            />
          ) : null}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-semibold tracking-tight tabular">{f.bdtCompact(v.price.amount)}</p>
            <p className="text-xs text-muted">
              {t("emiFrom", { amount: f.bdt(emiFrom(v.price.amount)) })}
              <span className="sr-only"> {t("emiFromNote")}</span>
            </p>
          </div>
          <div className="relative z-10">
            <WhatsAppButton
              display="icon"
              size="sm"
              tone="outline"
              context={{
                kind: "vehicleInquiry",
                vehicle: {
                  name: `${name} ${v.variant}`,
                  year: String(v.year),
                  condition: tTax(`condition.${v.condition}`),
                  reference: v.reference,
                  url: absoluteUrl(locale, vehiclePath(v)),
                },
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-muted">
        {icon}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}
