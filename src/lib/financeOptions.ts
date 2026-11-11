import type { Locale } from "next-intl";
import type { FinanceVehicleOption } from "@/components/finance/types";
import type { Format } from "@/lib/format/useFormat";
import { absoluteUrl } from "@/lib/seo";
import type { VehicleWithBrand } from "@/types";
import { vehicleFullName, vehiclePath } from "./vehicle";

/** Server-side: slim vehicle options for finance pickers (no full vehicle payload sent to the client). */
export function toFinanceOptions(
  vehicles: VehicleWithBrand[],
  locale: Locale,
  f: Format,
  conditionLabel: (c: VehicleWithBrand["condition"]) => string,
): FinanceVehicleOption[] {
  return vehicles.map((v) => ({
    id: v.id,
    slug: v.slug,
    label: vehicleFullName(v, locale),
    hint: `${f.number(v.year, { useGrouping: false })} · ${conditionLabel(v.condition)} · ${f.bdtCompact(v.price.amount)}`,
    price: v.price.amount,
    whatsapp: {
      name: vehicleFullName(v, locale),
      year: String(v.year),
      condition: conditionLabel(v.condition),
      reference: v.reference,
      url: absoluteUrl(locale, vehiclePath(v)),
    },
  }));
}
