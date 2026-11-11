import { useLocale, useTranslations } from "next-intl";
import { useFormat } from "@/lib/format/useFormat";
import type { VehicleWithBrand } from "@/types";

/** Overview & key specs as numbered callouts (the hero's leader-line language). */
export function KeySpecs({ vehicle: v }: { vehicle: VehicleWithBrand }) {
  const t = useTranslations("vehicleDetail.keySpecs");
  const tTax = useTranslations("taxonomy");
  const locale = useLocale();
  const f = useFormat();

  const items: { label: string; value: string }[] = [
    { label: t("brandModel"), value: `${v.brand.name[locale]} ${v.model}` },
    { label: t("year"), value: f.number(v.year, { useGrouping: false }) },
    { label: t("fuel"), value: tTax(`fuel.${v.fuelType}`) },
    ...(v.engine
      ? [{ label: t("engine"), value: `${f.unit("cc", v.engine.displacementCc, 0)} · ${f.unit("hp", v.engine.powerHp, 0)}` }]
      : []),
    ...(v.motor ? [{ label: t("motor"), value: `${f.unit("kW", v.motor.powerKw)} · ${f.unit("Nm", v.motor.torqueNm, 0)}` }] : []),
    ...(v.battery
      ? [
          {
            label: v.fuelType === "phev" ? t("batteryPhev") : t("battery"),
            value: `${f.unit("kWh", v.battery.capacityKwh)} · ${f.unit("km", v.battery.rangeKm, 0)}`,
          },
        ]
      : []),
    { label: t("mileage"), value: f.unit("km", v.mileageKm, 0) },
    { label: t("transmission"), value: tTax(`transmission.${v.transmission}`) },
    { label: t("drivetrain"), value: tTax(`drivetrain.${v.drivetrain}`) },
    { label: t("condition"), value: tTax(`condition.${v.condition}`) },
    ...(v.auctionGrade ? [{ label: t("auctionGrade"), value: f.digits(v.auctionGrade) }] : []),
    ...(v.history
      ? [
          { label: t("owners"), value: f.number(v.history.owners) },
          { label: t("registered"), value: f.number(v.history.registrationYear, { useGrouping: false }) },
        ]
      : []),
    ...(v.warranty
      ? [
          {
            label: t("warranty"),
            value: v.warranty.km
              ? t("warrantyValue", { months: f.number(v.warranty.months), km: f.unit("km", v.warranty.km, 0) })
              : t("warrantyMonths", { months: f.number(v.warranty.months) }),
          },
        ]
      : []),
  ];

  return (
    <ol className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.label} className="flex items-start gap-4 border-t border-line py-4">
          <span className="mt-0.5 text-xs text-accent-ink tabular">{f.number(i + 1, { minimumIntegerDigits: 2 })}</span>
          <div className="min-w-0">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-0.5 font-medium">{item.value}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
