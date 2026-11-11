import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { onRoadEstimate } from "@/lib/calc/onRoad";
import { useFormat } from "@/lib/format/useFormat";
import type { VehicleWithBrand } from "@/types";

/** Vehicle price + illustrative registration, insurance and documentation = on-road estimate. */
export function PriceBreakdown({ vehicle }: { vehicle: VehicleWithBrand }) {
  const t = useTranslations("vehicleDetail.price");
  const f = useFormat();
  const e = onRoadEstimate(vehicle);

  const rows = [
    { label: t("vehiclePrice"), value: e.vehiclePrice },
    { label: e.isTransfer ? t("transfer") : t("registration"), value: e.registration },
    { label: t("insurance"), value: e.insurance },
    { label: t("documentation"), value: e.documentation },
  ];

  return (
    <div className="rounded-card border border-line bg-bg-alt p-5 sm:p-7">
      <dl className="flex flex-col">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
            <dt className="text-muted">{r.label}</dt>
            <dd className="font-medium tabular">{f.bdt(r.value)}</dd>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <dt className="flex items-center gap-2 font-medium">
            {t("onRoad")}
            <Badge tone="warning">{t("estimate")}</Badge>
          </dt>
          <dd className="text-2xl font-semibold tracking-tight tabular">{f.bdt(e.total)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t("note")}</p>
    </div>
  );
}
