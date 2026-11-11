import { Check, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { VehicleWithBrand } from "@/types";

export function FeatureLists({ vehicle }: { vehicle: VehicleWithBrand }) {
  const t = useTranslations("vehicleDetail");
  const locale = useLocale();
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <h3 className="text-lg font-medium">{t("features")}</h3>
        <ul className="mt-4 grid gap-2.5">
          {vehicle.features.map((item) => (
            <li key={item.en} className="flex items-start gap-3 text-[0.9375rem]">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
              {item[locale]}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-medium">{t("safety")}</h3>
        <ul className="mt-4 grid gap-2.5">
          {vehicle.safety.map((item) => (
            <li key={item.en} className="flex items-start gap-3 text-[0.9375rem]">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
              {item[locale]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
