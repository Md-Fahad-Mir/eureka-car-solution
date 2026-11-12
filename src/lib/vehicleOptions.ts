import type { Locale } from "next-intl";
import type { Format } from "@/lib/format/useFormat";
import { absoluteUrl } from "@/lib/seo";
import type { WhatsAppVehicle } from "@/lib/whatsapp";
import type { VehicleWithBrand } from "@/types";
import { vehicleFullName, vehiclePath } from "./vehicle";

/** Slim vehicle option for pickers (finance, test drive, inquiry), built on the server from the API. */
export type VehicleOption = {
  id: string;
  slug: string;
  label: string;
  hint: string;
  price: number;
  availability: VehicleWithBrand["availability"];
  showroomIds: string[];
  whatsapp: WhatsAppVehicle;
};

/** Server-side: slim options so the full vehicle payload is never sent to the client. */
export function toVehicleOptions(
  vehicles: VehicleWithBrand[],
  locale: Locale,
  f: Format,
  conditionLabel: (c: VehicleWithBrand["condition"]) => string,
): VehicleOption[] {
  return vehicles.map((v) => ({
    id: v.id,
    slug: v.slug,
    label: vehicleFullName(v, locale),
    hint: `${f.number(v.year, { useGrouping: false })} · ${conditionLabel(v.condition)} · ${f.bdtCompact(v.price.amount)}`,
    price: v.price.amount,
    availability: v.availability,
    showroomIds: v.showroomIds,
    whatsapp: {
      name: vehicleFullName(v, locale),
      year: String(v.year),
      condition: conditionLabel(v.condition),
      reference: v.reference,
      url: absoluteUrl(locale, vehiclePath(v)),
    },
  }));
}
