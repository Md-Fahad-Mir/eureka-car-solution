import type { Locale } from "next-intl";
import type { Unit, VehicleWithBrand } from "@/types";

/** "Toyota Corolla Cross" */
export const vehicleName = (v: VehicleWithBrand, locale: Locale) => `${v.brand.name[locale]} ${v.model}`;

/** "Toyota Corolla Cross Hybrid Z" */
export const vehicleFullName = (v: VehicleWithBrand, locale: Locale) => `${vehicleName(v, locale)} ${v.variant}`;

/** Brand initial for placeholder artwork (Latin, from the brand id). */
export const brandInitial = (v: Pick<VehicleWithBrand, "brand">) => v.brand.name.en.charAt(0).toUpperCase();

/**
 * The single efficiency figure customers compare for this vehicle:
 * EV range, tractor fuel per hour, otherwise km/L (PHEVs in fuel mode).
 */
export function headlineEfficiency(v: VehicleWithBrand): { unit: Unit; value: number } | null {
  if (v.fuelType === "ev" && v.battery) return { unit: "km", value: v.battery.rangeKm };
  if (v.efficiency.litresPerHour) return { unit: "lPerHour", value: v.efficiency.litresPerHour };
  if (v.efficiency.kmPerLitre) return { unit: "kmPerL", value: v.efficiency.kmPerLitre };
  return null;
}

/** Most powerful output in hp (engine hp, or motor kW converted). */
export function powerHp(v: VehicleWithBrand): number | null {
  const motorHp = v.motor ? v.motor.powerKw * 1.341 : 0;
  const engineHp = v.engine?.powerHp ?? 0;
  const best = Math.max(motorHp, engineHp);
  return best > 0 ? best : null;
}

export const vehiclePath = (v: Pick<VehicleWithBrand, "slug">) => `/vehicles/${v.slug}`;
